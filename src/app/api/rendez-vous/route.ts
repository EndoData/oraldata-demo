import { NextResponse, after } from "next/server";
import { bookingSchema } from "@/lib/booking-schema";
import {
  createEvent,
  deleteEventWithRetry,
  isSlotStillAvailable,
} from "@/lib/google-calendar";
import { createLead, hasRecentLeadByEmail } from "@/lib/airtable";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { notifyNewLead } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`rdv:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessayez dans 1 minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (input.website) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const startDate = new Date(input.slotStartISO);
  if (startDate.getTime() < Date.now() + 23 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Le créneau doit être au moins 24h dans le futur" },
      { status: 400 },
    );
  }

  try {
    const recentLead = await hasRecentLeadByEmail(input.email, 24);
    if (recentLead) {
      return NextResponse.json(
        { error: "Vous avez déjà réservé une démo dans les dernières 24h." },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error("[rendez-vous] dedupe check failed (continuing):", error);
  }

  try {
    const stillAvailable = await isSlotStillAvailable(
      input.slotStartISO,
      input.slotEndISO,
    );
    if (!stillAvailable) {
      return NextResponse.json(
        { error: "Ce créneau vient d'être pris, veuillez en choisir un autre." },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error("[rendez-vous] slot recheck failed:", error);
    return NextResponse.json(
      { error: "Impossible de vérifier la disponibilité, réessayez." },
      { status: 502 },
    );
  }

  let eventResult: Awaited<ReturnType<typeof createEvent>> | null = null;
  try {
    eventResult = await createEvent({
      summary: `Démo OralData — ${input.prenom} ${input.nom.toUpperCase()} (${input.specialite})`,
      description: [
        `Démo demandée depuis la landing page.`,
        ``,
        `👤 ${input.prenom} ${input.nom.toUpperCase()}`,
        `📧 ${input.email}`,
        `📱 ${input.telephone}`,
        input.cabinet ? `🏥 Cabinet: ${input.cabinet}` : null,
        input.ville ? `📍 Ville: ${input.ville}` : null,
        `🦷 Spécialité: ${input.specialite}`,
        input.message ? `\n💬 Message:\n${input.message}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      startISO: input.slotStartISO,
      endISO: input.slotEndISO,
      attendeeEmail: input.email,
      attendeeName: `${input.prenom} ${input.nom}`,
    });
  } catch (error) {
    console.error("[rendez-vous] calendar error:", error);
    return NextResponse.json(
      { error: "Could not create calendar event" },
      { status: 502 },
    );
  }

  let leadResult: Awaited<ReturnType<typeof createLead>> | null = null;
  try {
    leadResult = await createLead({
      nom: input.nom,
      prenom: input.prenom,
      email: input.email,
      telephone: input.telephone,
      ville: input.ville || undefined,
      cabinet: input.cabinet || undefined,
      specialiteLP: input.specialite,
      message: input.message || undefined,
      rgpdConsent: input.rgpdConsent,
      demoStartISO: input.slotStartISO,
      demoEndISO: input.slotEndISO,
      meetLink: eventResult.meetLink,
    });
  } catch (error) {
    const rollbackOk = await deleteEventWithRetry(eventResult.eventId);
    console.error(
      JSON.stringify({
        level: "error",
        source: "rendez-vous",
        airtable_error: error instanceof Error ? error.message : String(error),
        rollback_ok: rollbackOk,
        orphan_event_id: rollbackOk ? null : eventResult.eventId,
        lead_payload: {
          email: input.email,
          nom: input.nom,
          prenom: input.prenom,
          slot: input.slotStartISO,
        },
      }),
    );
    return NextResponse.json(
      { error: "Could not save lead, please retry" },
      { status: 502 },
    );
  }

  after(() =>
    notifyNewLead({
      prenom: input.prenom,
      nom: input.nom,
      email: input.email,
      telephone: input.telephone,
      specialite: input.specialite,
      cabinet: input.cabinet || undefined,
      ville: input.ville || undefined,
      message: input.message || undefined,
      slotStartISO: input.slotStartISO,
      meetLink: eventResult.meetLink,
      airtableRecordId: leadResult?.recordId ?? null,
    }),
  );

  return NextResponse.json({
    success: true,
    meetLink: eventResult.meetLink,
    eventId: eventResult.eventId,
  });
}
