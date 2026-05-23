import { NextResponse } from "next/server";
import { getFreeBusy } from "@/lib/google-calendar";
import { getAvailableSlots } from "@/lib/slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid date format, expected YYYY-MM-DD" },
      { status: 400 },
    );
  }

  try {
    const timeMin = new Date(`${date}T00:00:00.000Z`).toISOString();
    const timeMax = new Date(`${date}T23:59:59.999Z`).toISOString();
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
