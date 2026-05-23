import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/booking-schema";
import { createEvent, deleteEvent } from "@/lib/google-calendar";
import { createLead } from "@/lib/airtable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  const startDate = new Date(input.slotStartISO);
  if (startDate.getTime() < Date.now() + 23 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Slot must be at least 24h in the future" },
      { status: 400 },
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

  try {
    await createLead({
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
    console.error("[rendez-vous] airtable error, rolling back event:", error);
    if (eventResult.eventId) {
      await deleteEvent(eventResult.eventId).catch((e) =>
        console.error("[rendez-vous] rollback failed:", e),
      );
    }
    return NextResponse.json(
      { error: "Could not save lead, please retry" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    meetLink: eventResult.meetLink,
    eventId: eventResult.eventId,
  });
}
