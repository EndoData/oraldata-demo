import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

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
    .refine((v) => isValidPhoneNumber(v, "FR"), {
      message: "Numéro de téléphone invalide",
    }),
  cabinet: z.string().trim().max(120).optional().or(z.literal("")),
  ville: z.string().trim().max(80).optional().or(z.literal("")),
  specialite: z.enum(SPECIALTIES),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  rgpdConsent: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter pour continuer",
  }),
  slotStartISO: z.string().datetime(),
  slotEndISO: z.string().datetime(),
  // Honeypot — accept any string at schema level so bot doesn't see validation error
  website: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
