export type LeadNotificationPayload = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  specialite: string;
  cabinet?: string;
  ville?: string;
  message?: string;
  slotStartISO: string;
  meetLink: string | null;
  airtableRecordId: string | null;
};

const TIMEOUT_MS = 5_000;

export async function notifyNewLead(
  payload: LeadNotificationPayload,
): Promise<void> {
  const url = process.env.ORALDATA_NOTIFICATION_WEBHOOK_URL;
  if (!url) {
    console.warn(
      "[notifications] ORALDATA_NOTIFICATION_WEBHOOK_URL not set — skipping",
    );
    return;
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const airtableUrl =
    payload.airtableRecordId && baseId && tableId
      ? `https://airtable.com/${baseId}/${tableId}/${payload.airtableRecordId}`
      : null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, airtableUrl }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error(
        JSON.stringify({
          level: "error",
          source: "notifyNewLead",
          status: response.status,
          email: payload.email,
        }),
      );
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        source: "notifyNewLead",
        error: error instanceof Error ? error.message : String(error),
        email: payload.email,
      }),
    );
  } finally {
    clearTimeout(timer);
  }
}
