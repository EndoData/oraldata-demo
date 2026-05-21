"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { copy } from "@/lib/copy";

type Props = {
  variant?: "hero" | "cta";
};

/**
 * Builds a month grid starting on Monday. Days outside the month are rendered
 * as null placeholders.
 */
function buildMonthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // JS getDay: 0=Sun..6=Sat. Convert to Mon-first: (getDay() + 6) % 7
  const leading = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarMock({ variant = "hero" }: Props) {
  const c = copy.hero.calendar;
  const [day, setDay] = useState<number>(c.selectedDay);
  const [slot, setSlot] = useState<string>(c.selectedSlot);

  const grid = useMemo(() => buildMonthGrid(c.year, c.month), [c.year, c.month]);

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
        <span className="text-sm font-medium text-ink">{c.monthLabel}</span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Mois précédent"
            className="p-1.5 rounded-md hover:bg-brand-50 text-ink-soft"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Mois suivant"
            className="p-1.5 rounded-md hover:bg-brand-50 text-ink-soft"
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
          if (d === null) {
            return <div key={`e-${i}`} aria-hidden />;
          }
          const selected = d === day;
          return (
            <button
              key={d}
              type="button"
              aria-label={`${d} ${c.monthShort}`}
              aria-pressed={selected}
              onClick={() => setDay(d)}
              className={`aspect-square text-sm rounded-md transition-colors ${
                selected
                  ? "bg-brand-700 text-white font-medium"
                  : "text-ink-soft hover:bg-brand-50 hover:text-ink"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-ink-soft mb-2">
        Heure — {day} {c.monthShort}.
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5" role="radiogroup" aria-label="Créneaux disponibles">
        {c.slots.map((s) => {
          const selected = s === slot;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSlot(s)}
              className={`text-sm py-2 rounded-md border transition-colors ${
                selected
                  ? "border-brand-600 bg-brand-50 text-brand-800 font-medium"
                  : "border-[color:var(--color-line)] text-ink-soft hover:border-brand-300 hover:text-ink"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-primary w-full py-3 rounded-xl text-sm font-medium"
      >
        {c.confirm}
      </button>
    </div>
  );
}
