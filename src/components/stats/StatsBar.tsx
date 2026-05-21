"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { copy } from "@/lib/copy";
import { easeOut, stagger, fadeUp, viewportOnce } from "@/lib/motion";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => formatNumber(Math.floor(v)) + suffix);

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, value, {
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
      });
      return () => controls.stop();
    }
  }, [inView, mv, value]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {rounded}
    </motion.span>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function StatsBar() {
  return (
    <section className="py-16 lg:py-20 border-y hairline border-y-[color:var(--color-line)] bg-surface-2">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger(0.12)}
        className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-6"
      >
        {copy.stats.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="text-left md:text-center"
          >
            <div className="font-serif text-3xl md:text-4xl lg:text-5xl text-brand-700 tracking-tight">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-xs md:text-sm uppercase tracking-[0.14em] text-ink-mute font-medium">
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
