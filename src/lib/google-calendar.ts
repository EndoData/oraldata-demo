import { google, type calendar_v3 } from "googleapis";

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
      const start = e.start?.dateTime ?? e.start?.date;
      const end = e.end?.dateTime ?? e.end?.date;
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

export async function deleteEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();
  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId,
    sendUpdates: "all",
  });
}
