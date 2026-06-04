"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, ChevronLeft, Loader2, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fr } from "date-fns/locale";
import {
  bookingSchema,
  SPECIALTIES,
  type BookingInput,
} from "@/lib/booking-schema";
import { MAX_ADVANCE_DAYS } from "@/lib/slots";
import { useBooking } from "./BookingProvider";
import { track } from "@/lib/analytics";

type Slot = { startISO: string; endISO: string; label: string };
type Step = "date" | "slot" | "form" | "success";

export function BookingModal() {
  const { isOpen, closeBooking, prefilledSlot, prefilledDateYMD } =
    useBooking();
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("date");
      setDate(undefined);
      setSlots([]);
      setSelectedSlot(null);
      setMeetLink(null);
      return;
    }
    if (prefilledSlot) {
      setSelectedSlot(prefilledSlot);
      setDate(new Date(prefilledSlot.startISO));
      setStep("form");
    } else if (prefilledDateYMD) {
      const [y, m, d] = prefilledDateYMD.split("-").map(Number);
      setDate(new Date(y, m - 1, d));
      setStep("slot");
    }
  }, [isOpen, prefilledSlot, prefilledDateYMD]);

  useEffect(() => {
    if (!date) return;
    const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setSlotsLoading(true);
    setSlotsError(null);
    setSlots([]);
    const ctrl = new AbortController();
    fetch(`/api/availability?date=${ymd}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSlots(data.slots ?? []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setSlotsError(err.message || "Erreur de chargement");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setSlotsLoading(false);
      });
    return () => ctrl.abort();
  }, [date]);

  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_DAYS);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && closeBooking()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(95vw,640px)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-surface shadow-[0_25px_70px_-12px_rgb(15_26_34/0.35)] border border-[color:var(--color-line)] focus:outline-none">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[color:var(--color-line)]">
            <div className="flex items-center gap-3">
              {step !== "date" && step !== "success" && (
                <button
                  type="button"
                  onClick={() =>
                    setStep(step === "form" ? "slot" : "date")
                  }
                  className="p-1.5 rounded-full hover:bg-brand-50 text-ink-soft hover:text-ink transition-colors"
                  aria-label="Retour"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <Dialog.Title className="font-serif text-xl text-ink tracking-tight">
                {step === "date" && "Choisissez une date"}
                {step === "slot" && "Choisissez un créneau"}
                {step === "form" && "Vos informations"}
                {step === "success" && "Démo confirmée"}
              </Dialog.Title>
            </div>
            <Dialog.Close
              className="p-1.5 rounded-full hover:bg-brand-50 text-ink-soft hover:text-ink transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="overflow-y-auto max-h-[calc(92vh-64px)]">
            <AnimatePresence mode="wait">
              {step === "date" && (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <p className="text-sm text-ink-soft mb-5">
                    Sélectionnez un jour ouvré dans les 14 prochains jours.
                  </p>
                  <div className="flex justify-center">
                    <DayPicker
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d);
                        if (d) {
                          const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                          track("booking_date_selected", { date: ymd });
                          setStep("slot");
                        }
                      }}
                      locale={fr}
                      disabled={[
                        { before: minDate },
                        { after: maxDate },
                        { dayOfWeek: [0, 6] },
                      ]}
                      className="rdp-oraldata"
                      classNames={{
                        selected: "rdp-day-selected",
                        today: "rdp-day-today",
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {step === "slot" && (
                <motion.div
                  key="slot"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <p className="text-sm text-ink-soft mb-5">
                    {date?.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    · Demo de 30 minutes
                  </p>
                  {slotsLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    </div>
                  )}
                  {slotsError && (
                    <p className="text-sm text-red-600 text-center py-8">
                      {slotsError}
                    </p>
                  )}
                  {!slotsLoading && !slotsError && slots.length === 0 && (
                    <p className="text-sm text-ink-mute text-center py-8">
                      Aucun créneau disponible ce jour-là. Choisissez un autre
                      jour.
                    </p>
                  )}
                  {!slotsLoading && slots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2.5">
                      {slots.map((s) => (
                        <button
                          key={s.startISO}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(s);
                            track("booking_slot_selected", {
                              slot: s.label,
                              startISO: s.startISO,
                            });
                            setStep("form");
                          }}
                          className="min-h-[44px] px-3 py-3 rounded-lg border border-[color:var(--color-line)] text-sm text-ink hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === "form" && selectedSlot && (
                <BookingFormStep
                  slot={selectedSlot}
                  onSuccess={(link) => {
                    setMeetLink(link);
                    setStep("success");
                  }}
                />
              )}

              {step === "success" && selectedSlot && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center"
                >
                  <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="font-serif text-2xl text-ink mb-2 tracking-tight">
                    Votre démo est confirmée
                  </p>
                  <p className="text-sm text-ink-soft mb-6 leading-relaxed">
                    Un email avec l&apos;invitation Google Calendar vient
                    d&apos;être envoyé à votre adresse.
                    <br />
                    À très vite&nbsp;!
                  </p>
                  <div className="rounded-lg bg-brand-50 p-4 text-left mb-6">
                    <div className="flex items-center gap-2 text-sm text-ink mb-1">
                      <Calendar className="w-4 h-4 text-brand-700" />
                      <span className="font-medium">
                        {new Date(selectedSlot.startISO).toLocaleString(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Europe/Paris",
                          },
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-ink-mute">
                      Heure de Paris · 30 minutes
                    </p>
                  </div>
                  {meetLink && (
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium"
                    >
                      Ouvrir le lien Google Meet
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BookingFormStep({
  slot,
  onSuccess,
}: {
  slot: Slot;
  onSuccess: (meetLink: string | null) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      slotStartISO: slot.startISO,
      slotEndISO: slot.endISO,
      rgpdConsent: false,
    },
  });

  const onSubmit = async (data: BookingInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/rendez-vous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Erreur lors de la réservation");
      }
      track("booking_completed", {
        specialite: data.specialite,
        ville: data.ville || null,
        cabinet: data.cabinet || null,
        slot: slot.label,
        slotStartISO: data.slotStartISO,
        rgpd_consent: data.rgpdConsent,
      });
      onSuccess(json.meetLink);
    } catch (err) {
      track("booking_failed", {
        error: err instanceof Error ? err.message : "unknown",
      });
      setSubmitError(
        err instanceof Error ? err.message : "Erreur lors de la réservation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      key="form"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-4"
    >
      <input type="hidden" {...register("slotStartISO")} />
      <input type="hidden" {...register("slotEndISO")} />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="hp-website">Website</label>
        <input
          id="hp-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="rounded-lg bg-brand-50 px-4 py-2.5 flex items-center gap-2 text-sm text-ink">
        <Calendar className="w-4 h-4 text-brand-700" />
        <span className="font-medium">
          {new Date(slot.startISO).toLocaleString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Paris",
          })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" error={errors.prenom?.message}>
          <input
            type="text"
            {...register("prenom")}
            className="form-input"
            placeholder="Jean"
          />
        </Field>
        <Field label="Nom" error={errors.nom?.message}>
          <input
            type="text"
            {...register("nom")}
            className="form-input"
            placeholder="Dupont"
          />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <input
          type="email"
          {...register("email")}
          className="form-input"
          placeholder="jean@cabinet.fr"
          autoComplete="email"
        />
      </Field>

      <Field label="Téléphone" error={errors.telephone?.message}>
        <input
          type="tel"
          {...register("telephone")}
          className="form-input"
          placeholder="+33 6 12 34 56 78"
          autoComplete="tel"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cabinet" error={errors.cabinet?.message} optional>
          <input
            type="text"
            {...register("cabinet")}
            className="form-input"
            placeholder="Cabinet Dr Dupont"
          />
        </Field>
        <Field label="Ville" error={errors.ville?.message} optional>
          <input
            type="text"
            {...register("ville")}
            className="form-input"
            placeholder="Paris"
          />
        </Field>
      </div>

      <Field label="Spécialité" error={errors.specialite?.message}>
        <select {...register("specialite")} className="form-input" defaultValue="">
          <option value="" disabled>
            Sélectionner...
          </option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" error={errors.message?.message} optional>
        <textarea
          {...register("message")}
          className="form-input min-h-[80px] resize-y"
          placeholder="Une question particulière avant la démo ?"
          rows={3}
        />
      </Field>

      <label className="flex items-start gap-2.5 text-xs text-ink-soft cursor-pointer">
        <input
          type="checkbox"
          {...register("rgpdConsent")}
          className="mt-0.5 w-4 h-4 rounded border-[color:var(--color-line-strong)] text-brand-700 focus:ring-brand-500"
        />
        <span>
          J&apos;accepte que mes données soient utilisées pour me recontacter
          au sujet de cette démo. Conforme RGPD et HDS.
        </span>
      </label>
      {errors.rgpdConsent && (
        <p className="text-xs text-red-600 -mt-2">
          {errors.rgpdConsent.message}
        </p>
      )}

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full px-5 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Confirmation...
          </>
        ) : (
          "Confirmer la démo"
        )}
      </button>
    </motion.form>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-soft mb-1.5">
        {label}
        {optional && <span className="text-ink-mute ml-1">(optionnel)</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
