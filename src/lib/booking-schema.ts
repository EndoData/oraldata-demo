import { z } from "zod";

export const SPECIALTIES = [
  "Endodontie",
  "Implantologie",
  "Omnipratique",
  "Pédodontie",
] as const;

export const bookingSchema = z.object({
  nom: z.string().trim().min(2, "Nom requis"),
  prenom: z.string().trim().min(2, "Prénom requis"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  telephone: z
    .string()
    .trim()
    .min(8, "Téléphone requis")
    .regex(/^[+0-9\s().-]+$/, "Format de téléphone invalide"),
  cabinet: z.string().trim().max(120).optional().or(z.literal("")),
  ville: z.string().trim().max(80).optional().or(z.literal("")),
  specialite: z.enum(SPECIALTIES),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  rgpdConsent: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter pour continuer",
  }),
  slotStartISO: z.string().datetime(),
  slotEndISO: z.string().datetime(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
