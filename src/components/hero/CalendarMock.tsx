"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { copy } from "@/lib/copy";
import { useBooking, type PrefilledSlot } from "@/components/booking/BookingProvider";

type Props = {
  variant?: "hero" | "cta";
};

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_SHORT_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

const MAX_VISIBLE_SLOTS = 6;

export function CalendarMock({ variant = "hero" }: Props) {
  const c = copy.hero.calendar;
  const { openBooking } = useBooking();

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const minDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 14);
    return d;
  }, [today]);

  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [slots, setSlots] = useState<PrefilledSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PrefilledSlot | null>(null);
  const [loading, setLoading] = useState(false);

  const grid = useMemo(
    () => buildMonthGrid(view.year, view.month),
    [view.year, view.month],
  );

  const selectedDateYMD =
    selectedDay !== null
      ? `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
      : null;

  useEffect(() => {
    if (!selectedDateYMD) return;
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    const ctrl = new AbortController();
    fetch(`/api/availability?date=${selectedDateYMD}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch((err) => {
        if (err.name !== "AbortError") setSlots([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [selectedDateYMD]);

  function isBookable(day: number): boolean {
    const d = new Date(view.year, view.month, day);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return false;
    if (d < minDate) return false;
    if (d > maxDate) return false;
    return true;
  }

  function navigateMonth(delta: -1 | 1) {
    let m = view.month + delta;
    let y = view.year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setView({ year: y, month: m });
    setSelectedDay(null);
    setSlots([]);
    setSelectedSlot(null);
  }

  const canGoPrev = new Date(view.year, view.month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoNext = new Date(view.year, view.month, 1) < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const visibleSlots = slots.slice(0, MAX_VISIBLE_SLOTS);
  const hiddenCount = slots.length - visibleSlots.length;

  function handleConfirm() {
    if (selectedSlot) {
      openBooking({ slot: selectedSlot });
    } else if (selectedDateYMD) {
      openBooking({ dateYMD: selectedDateYMD });
    } else {
      openBooking();
    }
  }

  return (
    <div
      className={`relative rounded-2xl bg-surface p-5 sm:p-6 border hairline border-[color:var(--color-line)] ${
        variant === "hero" ? "shadow-[var(--shadow-card)]" : "shadow-[var(--shadow-soft)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-5">
        <CalendarIcon className="w-4 h-4 text-brand-600" aria-hidden />
        <h3 className="text-sm font-medium text-ink">{c.title}</h3>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-ink">
          {MONTH_NAMES_FR[view.month]} {view.year}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Mois précédent"
            onClick={() => navigateMonth(-1)}
            disabled={!canGoPrev}
            className="p-1.5 rounded-md hover:bg-brand-50 text-ink-soft disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Mois suivant"
            onClick={() => navigateMonth(1)}
            disabled={!canGoNext}
            className="p-1.5 rounded-md hover:bg-brand-50 text-ink-soft disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2" role="row">
        {c.days.map((d) => (
          <div
            key={d}
            className="text-[10px] font-medium text-ink-mute text-center py-1 tracking-wider"
            aria-hidden
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-5">
        {grid.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} aria-hidden />;
          const selected = d === selectedDay;
          const bookable = isBookable(d);
          return (
            <button
              key={d}
              type="button"
              aria-label={`${d} ${MONTH_SHORT_FR[view.month]}`}
              aria-pressed={selected}
              onClick={() => bookable && setSelectedDay(d)}
              disabled={!bookable}
              className={`aspect-square min-w-[44px] min-h-[44px] text-sm rounded-md transition-colors cursor-pointer ${
                selected
                  ? "bg-brand-700 text-white font-medium"
                  : bookable
                  ? "text-ink-soft hover:bg-brand-50 hover:text-ink"
                  : "text-ink-mute opacity-40 cursor-not-allowed"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {selectedDay !== null && (
        <>
          <div className="text-xs text-ink-soft mb-2">
            Heure — {selectedDay} {MONTH_SHORT_FR[view.month]}.
          </div>

          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            </div>
          )}

          {!loading && slots.length === 0 && (
            <p className="text-xs text-ink-mute py-4 text-center">
              Aucun créneau ce jour. Choisissez un autre jour.
            </p>
          )}

          {!loading && visibleSlots.length > 0 && (
            <div
              className="grid grid-cols-3 gap-2 mb-3"
              role="radiogroup"
              aria-label="Créneaux disponibles"
            >
              {visibleSlots.map((s) => {
                const selected = selectedSlot?.startISO === s.startISO;
                return (
                  <button
                    key={s.startISO}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedSlot(s)}
                    className={`min-h-[44px] text-sm py-2 rounded-md border transition-colors cursor-pointer ${
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-800 font-medium"
                        : "border-[color:var(--color-line)] text-ink-soft hover:border-brand-300 hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => selectedDateYMD && openBooking({ dateYMD: selectedDateYMD })}
              className="block w-full text-xs text-brand-700 hover:text-brand-800 mb-4 transition-colors text-left cursor-pointer"
            >
              + {hiddenCount} autre{hiddenCount > 1 ? "s" : ""} créneau{hiddenCount > 1 ? "x" : ""} disponible{hiddenCount > 1 ? "s" : ""} →
            </button>
          )}
        </>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={selectedDay === null}
        className="btn-primary w-full py-3 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {c.confirm}
      </button>
    </div>
  );
}
