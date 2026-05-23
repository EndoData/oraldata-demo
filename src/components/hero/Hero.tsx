"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { copy } from "@/lib/copy";
import { CalendarMock } from "./CalendarMock";
import { fadeUp, easeOut } from "@/lib/motion";
import { E } from "@/components/editor/EditableText";
import { useBooking } from "@/components/booking/BookingProvider";
import { track } from "@/lib/analytics";

const nfFR = new Intl.NumberFormat("fr-FR");
function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    })} M`;
  }
  if (value >= 1_000) {
    return nfFR.format(value);
  }
  return String(value);
}

export function Hero() {
  const h = copy.hero;
  const { openBooking } = useBooking();
  const cabinets = copy.stats[0];
  const docs = copy.stats[1];
  const socialProof = cabinets && docs
    ? `+${formatCompact(cabinets.value)} cabinets équipés · +${formatCompact(docs.value)} documents générés`
    : null;

  return (
    <section
      id="top"
      className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden"
    >
      {/* Soft radial background (sereno) */}
      <div className="absolute inset-0 bg-radial-soft opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        {/* Left: headline */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="eyebrow inline-flex items-center gap-2"
          >
            <span className="inline-block w-6 h-px bg-brand-600" />
            <E path="hero.eyebrow" multiline={false}>{h.eyebrow}</E>
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="headline mt-6 text-[clamp(2.75rem,6vw,5.25rem)] text-ink whitespace-pre-line"
          >
            <E path="hero.headline">{h.headline}</E>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
            className="mt-7 text-lg text-ink-soft max-w-xl leading-relaxed"
          >
            <E path="hero.sub">{h.sub}</E>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Spécialités couvertes"
          >
            {h.specialties.map((s, i) => (
              <span
                key={`${i}-${s}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-50 border hairline border-[color:var(--color-brand-100)] text-xs font-medium text-brand-800 tracking-wide"
              >
                <E path={`hero.specialties[${i}]`} multiline={false}>{s}</E>
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: easeOut }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => {
                track("cta_click", { location: "hero" });
                openBooking();
              }}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium cursor-pointer"
            >
              <E path="hero.primaryCta" multiline={false}>{h.primaryCta}</E>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium text-ink hover:text-brand-700 transition-colors"
            >
              <E path="hero.secondaryCta" multiline={false}>{h.secondaryCta}</E>
            </a>
          </motion.div>

          {socialProof ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32, ease: easeOut }}
              className="mt-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border hairline border-[color:var(--color-brand-100)] text-xs text-brand-800"
              aria-label="Preuves sociales"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" strokeWidth={1.8} />
              <span className="font-medium tracking-tight">{socialProof}</span>
            </motion.div>
          ) : null}

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: easeOut }}
            className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft"
          >
            {h.badges.map((b, i) => (
              <li key={`${i}-${b}`} className="inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-100">
                  <Check className="w-3 h-3 text-brand-700" strokeWidth={3} />
                </span>
                <E path={`hero.badges[${i}]`} multiline={false}>{b}</E>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right: calendar */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: easeOut }}
          className="relative lg:justify-self-end w-full max-w-md"
        >
          <div className="absolute -inset-6 bg-brand-100/60 blur-3xl rounded-full -z-10" />
          <CalendarMock variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
