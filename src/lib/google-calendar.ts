import { google, type calendar_v3 } from "googleapis";
import { fromZonedTime } from "date-fns-tz";

const TZ = "Europe/Paris";

function normalizeBoundary(
  raw: string | null | undefined,
  edge: "start" | "end",
): string | null {
  if (!raw) return null;
  // dateTime is RFC3339 (already absolute); date-only is "YYYY-MM-DD" (all-day)
  if (raw.length === 10) {
    const iso = `${raw}T00:00:00`;
    const zoned = fromZonedTime(iso, TZ);
    if (edge === "end") return zoned.toISOString();
    return zoned.toISOString();
  }
  return new Date(raw).toISOString();
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;

function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export type BusyRange = { start: string; end: string };

export async function getFreeBusy(
  timeMin: string,
  timeMax: string,
): Promise<BusyRange[]> {
  const calendar = getCalendarClient();
  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });
  const events = response.data.items ?? [];
  return events
    .filter((e) => e.status !== "cancelled")
    .map((e) => {
      const start = normalizeBoundary(
        e.start?.dateTime ?? e.start?.date,
        "start",
      );
      const end = normalizeBoundary(e.end?.dateTime ?? e.end?.date, "end");
      return start && end ? { start, end } : null;
    })
    .filter((b): b is BusyRange => b !== null);
}

export type CreateEventInput = {
  summary: string;
  description: string;
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  attendeeName: string;
};

export type CreateEventResult = {
  eventId: string;
  meetLink: string | null;
  htmlLink: string | null;
};

export async function createEvent(
  input: CreateEventInput,
): Promise<CreateEventResult> {
  const calendar = getCalendarClient();
  const requestId = `oraldata-lp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const event: calendar_v3.Schema$Event = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.startISO, timeZone: "Europe/Paris" },
    end: { dateTime: input.endISO, timeZone: "Europe/Paris" },
    attendees: [{ email: input.attendeeEmail, displayName: input.attendeeName }],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 * 24 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: event,
  });

  return {
    eventId: response.data.id ?? "",
    meetLink: response.data.hangoutLink ?? null,
    htmlLink: response.data.htmlLink ?? null,
  };
}

export async function isSlotStillAvailable(
  startISO: string,
  endISO: string,
): Promise<boolean> {
  const calendar = getCalendarClient();
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: startISO,
    timeMax: endISO,
    singleEvents: true,
    maxResults: 10,
  });
  const events = response.data.items ?? [];
  return !events.some((e) => {
    if (e.status === "cancelled") return false;
    const eStart = normalizeBoundary(
      e.start?.dateTime ?? e.start?.date,
      "start",
    );
    const eEnd = normalizeBoundary(e.end?.dateTime ?? e.end?.date, "end");
    if (!eStart || !eEnd) return false;
    const eStartMs = new Date(eStart).getTime();
    const eEndMs = new Date(eEnd).getTime();
    return start < eEndMs && end > eStartMs;
  });
}

export async function deleteEventWithRetry(
  eventId: string,
  attempts: number = 3,
): Promise<boolean> {
  const delays = [200, 1000, 5000];
  for (let i = 0; i < attempts; i++) {
    try {
      await deleteEvent(eventId);
      return true;
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "warn",
          source: "deleteEventWithRetry",
          attempt: i + 1,
          eventId,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delays[i] ?? 1000));
      }
    }
  }
  return false;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();
  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId,
    sendUpdates: "all",
  });
}
