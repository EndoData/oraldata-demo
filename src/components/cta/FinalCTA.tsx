"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { copy } from "@/lib/copy";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function FinalCTA() {
  const c = copy.finalCta;
  return (
    <section
      id="demo"
      className="relative py-28 lg:py-40 overflow-hidden bg-gradient-to-b from-canvas via-surface-2 to-canvas"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl aspect-square rounded-full bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.06),transparent_60%)] pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger(0.1)}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <motion.div
          variants={fadeUp}
          className="mx-auto w-12 h-px bg-gradient-to-r from-transparent via-[color:var(--color-accent-500)] to-transparent mb-6"
          aria-hidden
        />

        <motion.span variants={fadeUp} className="eyebrow">
          {c.eyebrow}
        </motion.span>

        <motion.h2
          variants={fadeUp}
          className="headline mt-6 text-[clamp(2.5rem,5.5vw,4.5rem)] text-ink whitespace-pre-line"
        >
          {c.title}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-7 text-lg text-ink-soft leading-relaxed max-w-xl mx-auto"
        >
          {c.sub}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#top"
            className="btn-accent inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold"
          >
            {c.primary}
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium text-ink hover:text-brand-700 transition-colors"
          >
            {c.secondary}
          </a>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mt-10 inline-flex items-start gap-2 text-xs text-ink-mute max-w-lg text-left"
        >
          <Calendar className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" />
          <span>{c.small}</span>
        </motion.p>
      </motion.div>
    </section>
  );
}
