"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mic, ShieldCheck, ListChecks } from "lucide-react";
import { copy } from "@/lib/copy";
import { fadeUp, stagger, viewportOnce, easeOut } from "@/lib/motion";

type ProcessStep = (typeof copy.process.steps)[number];

type VariantStep = {
  readonly number: string;
  readonly title: string;
  readonly body: string;
};

type StepVariant = {
  readonly id: string;
  readonly label: string;
  readonly subtitle: string;
  readonly tagline?: string;
  readonly steps: ReadonlyArray<VariantStep>;
};

type StepBase = {
  readonly number: string;
  readonly title: string;
  readonly body: string;
};

type StepWithVariants = StepBase & {
  readonly variants: ReadonlyArray<StepVariant>;
};

function hasVariants(step: ProcessStep): step is ProcessStep & StepWithVariants {
  return "variants" in step && Array.isArray((step as StepWithVariants).variants);
}

export function HowItWorks() {
  const p = copy.process;

  return (
    <section
      id="process"
      className="py-24 lg:py-32 bg-surface-2 border-y hairline border-y-[color:var(--color-line)]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            {p.eyebrow}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="headline mt-5 text-[clamp(2rem,4.5vw,3.75rem)] text-ink whitespace-pre-line"
          >
            {p.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-ink-soft text-lg leading-relaxed"
          >
            {p.sub}
          </motion.p>
        </motion.div>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {p.steps.map((step) =>
            hasVariants(step) ? (
              <SplitStepWithToggle key={step.number} step={step} />
            ) : (
              <SimpleStep key={step.number} step={step} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function SimpleStep({ step }: { step: StepBase }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(0.08)}
      className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <div className="w-14 h-14 rounded-full bg-surface border hairline border-[color:var(--color-line)] flex items-center justify-center font-serif text-xl text-brand-700 shadow-[var(--shadow-soft)]">
          {step.number}
        </div>
      </motion.div>
      <motion.div variants={fadeUp} className="lg:col-span-10">
        <h3 className="font-serif text-2xl lg:text-3xl text-ink tracking-tight">
          {step.title}
        </h3>
        <p className="mt-3 text-base text-ink-soft leading-relaxed max-w-2xl">
          {step.body}
        </p>
      </motion.div>
    </motion.div>
  );
}

function SplitStepWithToggle({ step }: { step: StepWithVariants }) {
  const variants = step.variants;
  const [activeId, setActiveId] = useState<string>(variants[0]?.id ?? "simple");
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const reducedMotion = useReducedMotion();
  const tablistId = useId();

  const activeIndex = variants.findIndex((v) => v.id === activeId);
  const active = variants[activeIndex] ?? variants[0];

  function focusVariant(index: number) {
    const safe = ((index % variants.length) + variants.length) % variants.length;
    const target = variants[safe];
    if (!target) return;
    setActiveId(target.id);
    buttonRefs.current[target.id]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusVariant(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusVariant(activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusVariant(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusVariant(variants.length - 1);
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(0.1)}
    >
      <motion.div variants={fadeUp} className="text-center mb-8">
        <h3 className="font-serif text-2xl lg:text-3xl text-ink tracking-tight">
          {step.number} — {step.title}
        </h3>
        {active?.tagline ? (
          <p className="mt-3 text-base text-ink-soft leading-relaxed max-w-xl mx-auto">
            {active.tagline}
          </p>
        ) : null}

        <div
          role="tablist"
          aria-label="Type de compte rendu"
          onKeyDown={onKeyDown}
          className="mt-6 inline-flex items-center gap-1 p-1 rounded-full bg-surface border hairline border-[color:var(--color-line)] shadow-[var(--shadow-soft)]"
          id={tablistId}
        >
          {variants.map((variant) => {
            const selected = variant.id === active?.id;
            return (
              <button
                key={variant.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${tablistId}-${variant.id}-panel`}
                id={`${tablistId}-${variant.id}-tab`}
                tabIndex={selected ? 0 : -1}
                ref={(el) => {
                  buttonRefs.current[variant.id] = el;
                }}
                onClick={() => setActiveId(variant.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-colors ${
                  selected
                    ? "bg-brand-900 text-white shadow-[var(--shadow-soft)]"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {variant.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
        data-step-toggle-grid
      >
        <div className="relative min-h-[20rem] lg:min-h-[26rem] flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active?.id ?? "empty"}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.5, ease: easeOut },
                    }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.96,
                      transition: { duration: 0.25, ease: easeOut },
                    }
              }
              className="w-full flex items-center justify-center"
            >
              {active?.id === "simple" ? <MicMock /> : <ChecklistMock />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          role="tabpanel"
          id={`${tablistId}-${active?.id}-panel`}
          aria-labelledby={`${tablistId}-${active?.id}-tab`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.ol
              key={active?.id ?? "empty-list"}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.45, ease: easeOut, staggerChildren: 0.08 },
                    }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: -8,
                      transition: { duration: 0.2, ease: easeOut },
                    }
              }
              className="relative pl-8 lg:pl-10 space-y-8 before:absolute before:left-[14px] lg:before:left-[18px] before:top-2 before:bottom-2 before:w-px before:bg-[color:var(--color-line)]"
            >
              {active?.steps.map((sub) => (
                <li key={sub.number} className="relative">
                  <span className="absolute -left-8 lg:-left-10 top-1 w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-surface border hairline border-[color:var(--color-line)] flex items-center justify-center font-serif text-xs lg:text-sm text-brand-700">
                    {sub.number}
                  </span>
                  <h4 className="font-medium text-ink text-base lg:text-lg leading-snug">
                    {sub.title}
                  </h4>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed max-w-md">
                    {sub.body}
                  </p>
                </li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="mt-14 text-center font-serif text-lg lg:text-xl text-ink-soft tracking-tight"
      >
        Le tout en moins d&apos;une minute.
      </motion.p>
    </motion.div>
  );
}

function MicMock() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-brand-200/40 via-brand-400/40 to-brand-600/40 blur-3xl" />
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : { scale: [1, 1.04, 1] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative w-56 h-56 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center shadow-[0_30px_90px_-20px_rgba(23,74,98,0.55)]"
      >
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/15 to-transparent" />
        <Mic className="relative w-20 h-20 lg:w-24 lg:h-24 text-white" strokeWidth={1.5} />
      </motion.div>
      <div className="absolute top-4 right-4 lg:top-8 lg:right-8 w-12 h-12 rounded-full bg-white border hairline border-[color:var(--color-line)] shadow-[var(--shadow-soft)] flex items-center justify-center">
        <ShieldCheck className="w-6 h-6 text-emerald-500" strokeWidth={1.8} />
      </div>
    </div>
  );
}

function ChecklistMock() {
  const rows = [
    { label: "Lésion carieuse", highlight: false, badge: "→" },
    { label: "Lésion non carieuse", highlight: false, badge: "→" },
    { label: "Restauration", highlight: false, badge: "→" },
    { label: "Fracture", highlight: true, badge: "→" },
    { label: "Fêlure", highlight: false, badge: "→" },
    { label: "Occlusion", highlight: false, badge: "→" },
  ];
  const tests = [
    { name: "Percussion", values: "Oc · V · L" },
    { name: "Palpation V", values: "Apicale · Cervicale" },
    { name: "Test au froid", values: "+ Sans rémanence" },
    { name: "Test au chaud", values: "+" },
  ];
  return (
    <div className="relative w-full max-w-lg">
      <div className="absolute -inset-6 bg-brand-100/40 blur-2xl rounded-3xl -z-10" />
      <div className="rounded-2xl bg-white border hairline border-[color:var(--color-line)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="grid grid-cols-[1fr_1.1fr] divide-x divide-[color:var(--color-line)]">
          <div>
            <div className="px-4 py-3 border-b hairline border-b-[color:var(--color-line)] flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-brand-600" strokeWidth={1.75} />
              <span className="text-xs font-medium text-ink">Examen dentaire</span>
            </div>
            <ul className="divide-y divide-[color:var(--color-line)]">
              {rows.map((row) => (
                <li
                  key={row.label}
                  className={`flex items-center justify-between px-4 py-2.5 text-[11px] lg:text-xs ${
                    row.highlight
                      ? "bg-emerald-50 text-ink"
                      : "text-ink-soft"
                  }`}
                >
                  <span className="truncate pr-2">{row.label}</span>
                  <span className="text-ink-mute">{row.badge}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="px-4 py-3 border-b hairline border-b-[color:var(--color-line)]">
              <span className="text-xs font-medium text-ink">Tests</span>
            </div>
            <ul className="divide-y divide-[color:var(--color-line)]">
              {tests.map((t) => (
                <li
                  key={t.name}
                  className="grid grid-cols-[auto_1fr] gap-3 px-4 py-2.5 text-[11px] lg:text-xs"
                >
                  <span className="font-medium text-ink whitespace-nowrap">
                    {t.name}
                  </span>
                  <span className="text-ink-soft truncate">{t.values}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white border hairline border-[color:var(--color-line)] shadow-[var(--shadow-soft)] flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-brand-700 font-medium">
          Type
        </span>
        <span className="text-xs text-ink">Coronaire simple</span>
      </div>
    </div>
  );
}
