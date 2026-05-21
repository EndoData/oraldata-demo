"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Mic,
  ShieldCheck,
  Check,
  ChevronRight,
  BookOpen,
  Hammer,
  Hand,
  Activity,
  Snowflake,
  Flame,
  Thermometer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { copy } from "@/lib/copy";
import { fadeUp, stagger, viewportOnce, easeOut } from "@/lib/motion";
import { E } from "@/components/editor/EditableText";

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
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            <E path="process.eyebrow" multiline={false}>{p.eyebrow}</E>
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="headline mt-5 text-[clamp(2rem,4.5vw,3.75rem)] text-ink whitespace-pre-line"
          >
            <E path="process.title">{p.title}</E>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-ink-soft text-lg leading-relaxed"
          >
            <E path="process.sub">{p.sub}</E>
          </motion.p>
        </motion.div>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {p.steps.map((step, i) =>
            hasVariants(step) ? (
              <SplitStepWithToggle key={step.number} step={step} index={i} />
            ) : (
              <SimpleStep key={step.number} step={step} index={i} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function SimpleStep({ step, index }: { step: StepBase; index: number }) {
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
          <E path={`process.steps[${index}].title`} multiline={false}>{step.title}</E>
        </h3>
        <p className="mt-3 text-base text-ink-soft leading-relaxed max-w-2xl">
          <E path={`process.steps[${index}].body`}>{step.body}</E>
        </p>
      </motion.div>
    </motion.div>
  );
}

function SplitStepWithToggle({
  step,
  index,
}: {
  step: StepWithVariants;
  index: number;
}) {
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
          {step.number} —{" "}
          <E path={`process.steps[${index}].title`} multiline={false}>
            {step.title}
          </E>
        </h3>
        {active?.tagline ? (
          <p className="mt-3 text-base text-ink-soft leading-relaxed max-w-xl mx-auto">
            <E
              path={`process.steps[${index}].variants[${activeIndex}].tagline`}
            >
              {active.tagline}
            </E>
          </p>
        ) : null}

        <div
          role="tablist"
          aria-label="Type de compte rendu"
          onKeyDown={onKeyDown}
          className="mt-6 inline-flex items-center gap-1 p-1 rounded-full bg-surface border hairline border-[color:var(--color-line)] shadow-[var(--shadow-soft)]"
          id={tablistId}
        >
          {variants.map((variant, vIdx) => {
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
                <E
                  path={`process.steps[${index}].variants[${vIdx}].label`}
                  multiline={false}
                >
                  {variant.label}
                </E>
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-14 items-center"
      >
        <div className="relative min-w-0 min-h-[20rem] lg:min-h-[28rem] flex items-center justify-center">
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
              className="relative pl-10 lg:pl-12 space-y-7 before:absolute before:left-[18px] lg:before:left-[22px] before:top-3 before:bottom-3 before:w-px before:bg-[color:var(--color-line)]"
            >
              {active?.steps.map((sub, k) => (
                <li key={sub.number} className="relative">
                  <span className="absolute -left-10 lg:-left-12 top-0.5 w-9 h-9 rounded-full bg-surface border hairline border-[color:var(--color-line)] flex items-center justify-center font-serif text-sm text-brand-700 shadow-[var(--shadow-soft)]">
                    {sub.number}
                  </span>
                  <h4 className="font-medium text-ink text-base lg:text-lg leading-snug">
                    <E
                      path={`process.steps[${index}].variants[${activeIndex}].steps[${k}].title`}
                      multiline={false}
                    >
                      {sub.title}
                    </E>
                  </h4>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                    <E
                      path={`process.steps[${index}].variants[${activeIndex}].steps[${k}].body`}
                    >
                      {sub.body}
                    </E>
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

type ExamenRow = {
  label: string;
  withBook?: boolean;
  highlight?: boolean;
};

const EXAMEN_ROWS: ExamenRow[] = [
  { label: "Lésion carieuse", withBook: true },
  { label: "Lésion non carieuse" },
  { label: "Restauration" },
  { label: "Perte de substance non restaurée" },
  { label: "Fracture", highlight: true },
  { label: "Fêlure" },
  { label: "Dyschromie" },
  { label: "Occlusion" },
  { label: "Anomalie de position" },
];

type TestRow = {
  name: string;
  icon: LucideIcon;
  cells: string[];
};

const TEST_ROWS: TestRow[] = [
  { name: "Percussion", icon: Hammer, cells: ["Oc", "V", "L", "Son clair", "-"] },
  { name: "Palpation V", icon: Hand, cells: ["Apicale", "Cervicale", "-"] },
  { name: "Palpation L", icon: Hand, cells: ["Apicale", "Cervicale", "-"] },
  { name: "Pression", icon: Activity, cells: ["Oc", "V", "L", "-"] },
  { name: "Test électrique", icon: Activity, cells: ["slider"] },
  {
    name: "Test au froid",
    icon: Snowflake,
    cells: ["+ Sans Rémanence", "+ Avec Rémanence", "+ Retard", "-"],
  },
  { name: "Test au chaud", icon: Flame, cells: ["+", "-"] },
  { name: "Hyperesthésie dentinaire", icon: Thermometer, cells: ["+", "-"] },
];

function ChecklistMock() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="absolute -inset-8 bg-brand-100/40 blur-3xl rounded-[2rem] -z-10" />
      <div className="relative rounded-2xl bg-white border hairline border-[color:var(--color-line)] shadow-[var(--shadow-card)] p-6 lg:p-8">
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.7fr)] gap-6 lg:gap-10">
          <div className="min-w-0">
            <h4 className="font-medium text-ink text-lg lg:text-xl mb-4">
              Examen dentaire
            </h4>
            <ul className="space-y-2">
              {EXAMEN_ROWS.map((row) => (
                <li
                  key={row.label}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] lg:text-sm leading-tight ${
                    row.highlight
                      ? "bg-emerald-100/90 border border-emerald-200 text-ink"
                      : "bg-emerald-50/70 border border-emerald-100/80 text-ink-soft"
                  }`}
                >
                  <span
                    className={`shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full ${
                      row.highlight ? "bg-emerald-500" : "bg-white border border-emerald-300"
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 ${
                        row.highlight ? "text-white" : "text-emerald-500"
                      }`}
                      strokeWidth={3}
                    />
                  </span>
                  <span className="flex-1 truncate font-medium">{row.label}</span>
                  {row.withBook ? (
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2} />
                  ) : null}
                  <ChevronRight className="w-3.5 h-3.5 text-ink-mute shrink-0" />
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0">
            <h4 className="font-medium text-ink text-lg lg:text-xl mb-4">
              Tests
            </h4>
            <ul className="space-y-2">
              {TEST_ROWS.map((t) => {
                const TestIcon = t.icon;
                const isElectrique = t.cells[0] === "slider";
                return (
                  <li
                    key={t.name}
                    className="grid grid-cols-[11rem_minmax(0,1fr)] gap-3 items-center bg-sky-50/70 border border-sky-100/80 rounded-lg px-3 py-2.5 text-[13px] lg:text-sm leading-tight"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TestIcon
                        className="w-4 h-4 text-brand-700 shrink-0"
                        strokeWidth={2}
                      />
                      <span className="font-medium text-ink truncate">
                        {t.name}
                      </span>
                    </div>
                    {isElectrique ? (
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 h-1.5 rounded-full bg-white border border-sky-200">
                          <div className="absolute top-1/2 -translate-y-1/2 left-[60%] w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_0_3px_rgba(46,122,153,0.18)]" />
                        </div>
                        <span className="text-ink-soft">−</span>
                      </div>
                    ) : (
                      <div className="grid auto-cols-fr grid-flow-col gap-1.5">
                        {t.cells.map((c, j) => (
                          <span
                            key={`${t.name}-${j}`}
                            className="bg-white text-ink-soft border border-sky-100 rounded-md px-2.5 py-1 text-center whitespace-nowrap"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Popover "Type" — flutua sobre a linha Pression, com seta apontando pra esquerda */}
            <div className="absolute top-[7.5rem] left-2 lg:-left-8 z-10 hidden md:block">
              <div className="relative bg-white rounded-xl border border-sky-200 shadow-[0_18px_40px_-12px_rgba(15,26,34,0.25)] px-4 py-3">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                  <span className="font-medium text-ink text-sm">Type</span>
                  <div className="grid grid-cols-2 gap-2 text-xs lg:text-[13px]">
                    <span className="bg-sky-50 text-ink rounded-md px-3 py-1.5 whitespace-nowrap border border-sky-100">
                      Coronaire simple
                    </span>
                    <span className="bg-sky-50 text-ink rounded-md px-3 py-1.5 whitespace-nowrap border border-sky-100">
                      Coronaire compliquée
                    </span>
                    <span className="bg-sky-50 text-ink rounded-md px-3 py-1.5 whitespace-nowrap border border-sky-100">
                      Corono-radiculaire
                    </span>
                    <span className="bg-sky-50 text-ink rounded-md px-3 py-1.5 whitespace-nowrap border border-sky-100">
                      Radiculaire
                    </span>
                  </div>
                </div>
                {/* Seta apontando pra esquerda */}
                <span
                  aria-hidden
                  className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-white border-l border-b border-sky-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
