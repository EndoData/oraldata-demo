import { NextResponse } from "next/server";
import { fromZonedTime } from "date-fns-tz";
import { getFreeBusy } from "@/lib/google-calendar";
import { getAvailableSlots } from "@/lib/slots";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`avail:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid date format, expected YYYY-MM-DD" },
      { status: 400 },
    );
  }

  try {
    // Boundary respects Europe/Paris timezone (handles CET/CEST transitions)
    const timeMin = fromZonedTime(`${date}T00:00:00`, "Europe/Paris").toISOString();
    const nextDay = new Date(`${date}T00:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const nextDayYMD = nextDay.toISOString().slice(0, 10);
    const timeMax = fromZonedTime(`${nextDayYMD}T00:00:00`, "Europe/Paris").toISOString();

    const busy = await getFreeBusy(timeMin, timeMax);
    const slots = getAvailableSlots(date, busy);

    return NextResponse.json({ date, slots });
  } catch (error) {
    console.error("[availability] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}
