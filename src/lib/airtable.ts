const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID!;

const LP_TO_CRM_SPECIALTY: Record<string, string> = {
  Endodontie: "Endodontiste",
  Implantologie: "Implantologue",
  Omnipratique: "Omnipraticien",
  Pédodontie: "Pédodontiste",
};

export type LeadPayload = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville?: string;
  cabinet?: string;
  specialiteLP: keyof typeof LP_TO_CRM_SPECIALTY;
  message?: string;
  rgpdConsent: boolean;
  demoStartISO: string;
  demoEndISO: string;
  meetLink: string | null;
};

export type CreateLeadResult = {
  recordId: string;
};

export async function createLead(
  payload: LeadPayload,
): Promise<CreateLeadResult> {
  const specialiteCRM = LP_TO_CRM_SPECIALTY[payload.specialiteLP];
  const demoStart = new Date(payload.demoStartISO);
  const dateLabel = demoStart.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "full",
    timeStyle: "short",
  });

  const infosDiverses = [
    `📅 Démo demandée: ${dateLabel}`,
    payload.cabinet ? `🏥 Cabinet: ${payload.cabinet}` : null,
    payload.ville ? `📍 Ville: ${payload.ville}` : null,
    payload.message ? `💬 Message: ${payload.message}` : null,
    payload.meetLink ? `🎥 Meet: ${payload.meetLink}` : null,
    `🌐 Source: Landing Page (try.oraldata.ai)`,
  ]
    .filter(Boolean)
    .join("\n");

  const fields: Record<string, unknown> = {
    NOM: payload.nom.toUpperCase(),
    PRENOM: payload.prenom,
    "NOM Prénom": `${payload.nom.toUpperCase()} ${payload.prenom}`,
    "Adresse mail": payload.email,
    Portable: payload.telephone,
    Pays: "France",
    Spécialité: [specialiteCRM],
    Statut: "Prospect",
    NIVEAU: "LEAD",
    FROM: "LANDING PAGE",
    PROVENANCE: ["Landing Page web"],
    "Communication marketing": payload.rgpdConsent ? "Oui" : "Non",
    "Informations diverses": infosDiverses,
  };

  if (payload.ville) fields.Ville = payload.ville;
  if (payload.cabinet) fields["Cabinet copy"] = payload.cabinet;

  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as {
    records: { id: string }[];
  };
  return { recordId: data.records[0].id };
}

export async function deleteLead(recordId: string): Promise<void> {
  await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    },
  );
}
