import { addMinutes, addDays, startOfDay, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { BusyRange } from "./google-calendar";

const TZ = "Europe/Paris";
const SLOT_MINUTES = 30;
const SLOT_HOURS = [
  { startHour: 9, endHour: 12 },
  { startHour: 14, endHour: 19 },
];
const MIN_ADVANCE_HOURS = 24;
const MAX_ADVANCE_DAYS = 14;

export type Slot = {
  startISO: string;
  endISO: string;
  label: string;
};

function isBusinessDay(date: Date): boolean {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}

function generateDaySlots(dateYMD: string): Slot[] {
  const slots: Slot[] = [];
  for (const range of SLOT_HOURS) {
    let cursorParis = fromZonedTime(
      `${dateYMD}T${String(range.startHour).padStart(2, "0")}:00:00`,
      TZ,
    );
    const endParis = fromZonedTime(
      `${dateYMD}T${String(range.endHour).padStart(2, "0")}:00:00`,
      TZ,
    );
    while (cursorParis.getTime() + SLOT_MINUTES * 60 * 1000 <= endParis.getTime()) {
      const slotEnd = addMinutes(cursorParis, SLOT_MINUTES);
      const labelDate = toZonedTime(cursorParis, TZ);
      const hh = String(labelDate.getHours()).padStart(2, "0");
      const mm = String(labelDate.getMinutes()).padStart(2, "0");
      slots.push({
        startISO: cursorParis.toISOString(),
        endISO: slotEnd.toISOString(),
        label: `${hh}h${mm}`,
      });
      cursorParis = slotEnd;
    }
  }
  return slots;
}

function overlapsBusy(slot: Slot, busy: BusyRange[]): boolean {
  const slotStart = new Date(slot.startISO).getTime();
  const slotEnd = new Date(slot.endISO).getTime();
  return busy.some((b) => {
    const bStart = new Date(b.start).getTime();
    const bEnd = new Date(b.end).getTime();
    return slotStart < bEnd && slotEnd > bStart;
  });
}

export function getAvailableSlots(
  dateYMD: string,
  busy: BusyRange[],
  now: Date = new Date(),
): Slot[] {
  const [year, month, day] = dateYMD.split("-").map(Number);
  const refDate = new Date(Date.UTC(year, month - 1, day));
  if (!isBusinessDay(refDate)) return [];

  const minBookable = addMinutes(now, MIN_ADVANCE_HOURS * 60);
  const maxBookable = addDays(startOfDay(now), MAX_ADVANCE_DAYS);

  return generateDaySlots(dateYMD).filter((slot) => {
    const slotDate = new Date(slot.startISO);
    if (isBefore(slotDate, minBookable)) return false;
    if (isBefore(maxBookable, slotDate)) return false;
    if (overlapsBusy(slot, busy)) return false;
    return true;
  });
}

export function getBookableDateRange(now: Date = new Date()): {
  minDate: string;
  maxDate: string;
} {
  const minDate = addDays(startOfDay(now), 1);
  const maxDate = addDays(startOfDay(now), MAX_ADVANCE_DAYS);
  return {
    minDate: minDate.toISOString().slice(0, 10),
    maxDate: maxDate.toISOString().slice(0, 10),
  };
}
