"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { copy } from "@/lib/copy";
import { ToothFallback } from "./ToothFallback";

// Each specialty is revealed in 4 stages. These progress targets are aligned
// with the opacity transforms in every scene (see ToothScene / ImplantScene /
// OmniScene / PedoScene):
//   0.00 → outer shell fully visible
//   0.42 → outer gone, middle shell full
//   0.72 → middle dimming, core emerging
//   1.00 → core + glow full
const STAGE_PROGRESS = [0.0, 0.42, 0.72, 1.0] as const;

const STAGE_AUTO_ADVANCE_MS = 2400;
const STAGE_TRANSITION_S = 1.1;

const ToothScene = dynamic(() => import("./ToothScene").then((m) => m.ToothScene), {
  ssr: false,
  loading: () => <ToothFallback specialty="endo" active={0} />,
});
const ImplantScene = dynamic(
  () => import("./ImplantScene").then((m) => m.ImplantScene),
  { ssr: false, loading: () => <ToothFallback specialty="implanto" /> }
);
const OmniScene = dynamic(() => import("./OmniScene").then((m) => m.OmniScene), {
  ssr: false,
  loading: () => <ToothFallback specialty="omni" />,
});
const PedoScene = dynamic(() => import("./PedoScene").then((m) => m.PedoScene), {
  ssr: false,
  loading: () => <ToothFallback specialty="pedo" />,
});

type SpecialtyId = "endo" | "implanto" | "omni" | "pedo";

export function SpecialtiesSection() {
  const s = copy.specialties;
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [userControlled, setUserControlled] = useState(false);
  const [inView, setInView] = useState(false);

  const progress = useMotionValue(0);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // IntersectionObserver to pause auto-advance when offscreen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // When tab changes: reset to stage 0, allow auto-advance again
  useEffect(() => {
    setActiveStage(0);
    setUserControlled(false);
    // Snap progress to 0 instantly (the stage effect below will animate from there)
    progress.set(STAGE_PROGRESS[0]);
  }, [activeTab, progress]);

  // Animate progress toward the active stage's target value
  useEffect(() => {
    const target = STAGE_PROGRESS[activeStage];
    if (prefersReducedMotion) {
      progress.set(target);
      return;
    }
    const controls = animate(progress, target, {
      duration: STAGE_TRANSITION_S,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [activeStage, progress, prefersReducedMotion]);

  // Auto-advance stages inside the current specialty (first view only)
  useEffect(() => {
    if (userControlled || !inView || prefersReducedMotion) return;
    const activeTabStages = s.tabs[activeTab].stages.length;
    if (activeStage >= activeTabStages - 1) return;
    const id = window.setTimeout(() => {
      setActiveStage((i) => Math.min(i + 1, activeTabStages - 1));
    }, STAGE_AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [activeStage, activeTab, userControlled, inView, prefersReducedMotion, s.tabs]);

  const handleTabClick = useCallback((i: number) => {
    setActiveTab(i);
  }, []);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, i: number) => {
      const total = s.tabs.length;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveTab((i + 1) % total);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveTab((i - 1 + total) % total);
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveTab(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveTab(total - 1);
      }
    },
    [s.tabs.length]
  );

  const handleStageClick = useCallback((i: number) => {
    setUserControlled(true);
    setActiveStage(i);
  }, []);

  const active = s.tabs[activeTab];
  const specialtyId = active.id as SpecialtyId;
  const showFallback = !mounted || isMobile || prefersReducedMotion;
  const currentStage = active.stages[activeStage];

  return (
    <section
      id="specialties"
      ref={rootRef}
      className="relative bg-brand-900 text-white min-h-screen py-24 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(46,122,153,0.25),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black,transparent_75%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <span className="eyebrow !text-brand-200">{s.eyebrow}</span>
          <h2 className="headline mt-5 text-[clamp(2rem,4.5vw,3.75rem)] text-white whitespace-pre-line">
            {s.title}
          </h2>
          <p className="mt-5 text-white/70 leading-relaxed text-lg">{s.sub}</p>
        </div>

        {/* Tabs — specialty selector */}
        <div
          role="tablist"
          aria-label="Spécialités"
          className="flex flex-wrap justify-center gap-2 mb-10 lg:mb-14"
        >
          {s.tabs.map((tab, i) => {
            const selected = activeTab === i;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`specialty-panel-${tab.id}`}
                id={`specialty-tab-${tab.id}`}
                onClick={() => handleTabClick(i)}
                onKeyDown={(e) => handleTabKeyDown(e, i)}
                tabIndex={selected ? 0 : -1}
                className={`relative px-4 py-2.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900 ${
                  selected
                    ? "text-accent-500"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-white/5 border border-white/10"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* 3D scene */}
          <div className="relative aspect-square w-full max-h-[min(60vh,520px)] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`scene-${specialtyId}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {showFallback ? (
                  <ToothFallback specialty={specialtyId} active={activeStage} />
                ) : (
                  <>
                    {specialtyId === "endo" && <ToothScene progress={progress} />}
                    {specialtyId === "implanto" && <ImplantScene progress={progress} />}
                    {specialtyId === "omni" && <OmniScene progress={progress} />}
                    {specialtyId === "pedo" && <PedoScene progress={progress} />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Stage label pill (bottom-left of scene) */}
            <motion.div
              key={`stage-pill-${specialtyId}-${activeStage}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs uppercase tracking-[0.18em] text-white/90"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
              {currentStage.label}
            </motion.div>
          </div>

          {/* Copy panel */}
          <div
            role="tabpanel"
            id={`specialty-panel-${specialtyId}`}
            aria-labelledby={`specialty-tab-${specialtyId}`}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${specialtyId}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-xs uppercase tracking-[0.18em] text-brand-200 mb-3">
                  {active.label}
                </div>
                <h3 className="font-serif text-3xl lg:text-4xl tracking-tight text-white">
                  {active.title}
                </h3>
                <p className="mt-5 text-white/75 leading-relaxed text-base max-w-lg">
                  {active.body}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Current stage hint */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`hint-${specialtyId}-${activeStage}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 text-sm text-accent-500 font-medium"
              >
                {currentStage.hint}
              </motion.div>
            </AnimatePresence>

            {/* Stage indicators — click to scrub */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {active.stages.map((stage, i) => {
                const isActive = activeStage === i;
                const isPast = activeStage > i;
                return (
                  <button
                    key={`${specialtyId}-stage-${i}`}
                    type="button"
                    onClick={() => handleStageClick(i)}
                    aria-label={`Étape ${i + 1} : ${stage.label}`}
                    aria-pressed={isActive}
                    className="group flex items-center gap-2"
                  >
                    <span
                      className={`inline-block h-px transition-all ${
                        isActive
                          ? "w-10 bg-accent-500"
                          : isPast
                            ? "w-7 bg-accent-500/40"
                            : "w-6 bg-white/20 group-hover:bg-white/40"
                      }`}
                    />
                    <span
                      className={`text-[10px] uppercase tracking-[0.18em] transition-colors ${
                        isActive
                          ? "text-accent-500"
                          : isPast
                            ? "text-accent-500/60"
                            : "text-white/40 group-hover:text-white/70"
                      }`}
                    >
                      0{i + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
