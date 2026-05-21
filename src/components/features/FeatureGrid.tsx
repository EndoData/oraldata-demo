"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Cloud,
  Mic,
  Users,
  Package,
  BarChart3,
  Workflow,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { copy } from "@/lib/copy";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Cloud,
  Mic,
  Users,
  Package,
  BarChart3,
  Workflow,
  Calendar,
};

export function FeatureGrid() {
  const f = copy.features;
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="max-w-3xl"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            {f.eyebrow}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="headline mt-5 text-[clamp(2rem,4.5vw,3.75rem)] text-ink whitespace-pre-line"
          >
            {f.title}
          </motion.h2>
          {f.subtitle ? (
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-ink-soft leading-relaxed max-w-2xl"
            >
              {f.subtitle}
            </motion.p>
          ) : null}
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.06)}
          className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {f.items.map((item) => {
            const Icon = iconMap[item.icon] ?? FileText;
            return (
              <motion.li
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl bg-surface p-7 border hairline border-[color:var(--color-line)] hover:border-brand-300 hover:shadow-[var(--shadow-card)] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-5 group-hover:bg-brand-100 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-5 h-5 text-brand-700" strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-xl text-ink tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {item.body}
                </p>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
