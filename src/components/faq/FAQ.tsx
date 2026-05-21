"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { copy } from "@/lib/copy";
import { fadeUp, stagger, viewportOnce, easeOut } from "@/lib/motion";
import { E } from "@/components/editor/EditableText";

export function FAQ() {
  const f = copy.faq;
  const reducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionId = useId();

  function toggle(i: number) {
    setOpenIndex((current) => (current === i ? null : i));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const total = f.items.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      buttonRefs.current[(i + 1) % total]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      buttonRefs.current[(i - 1 + total) % total]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      buttonRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      buttonRefs.current[total - 1]?.focus();
    }
  }

  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="text-center mb-12 lg:mb-14"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            <E path="faq.eyebrow" multiline={false}>{f.eyebrow}</E>
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="headline mt-5 text-[clamp(2rem,4.5vw,3.5rem)] text-ink whitespace-pre-line"
          >
            <E path="faq.title">{f.title}</E>
          </motion.h2>
          {f.sub ? (
            <motion.p
              variants={fadeUp}
              className="mt-5 text-ink-soft text-base lg:text-lg leading-relaxed max-w-xl mx-auto"
            >
              <E path="faq.sub">{f.sub}</E>
            </motion.p>
          ) : null}
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.06)}
          className="space-y-3"
        >
          {f.items.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `${sectionId}-panel-${i}`;
            const buttonId = `${sectionId}-button-${i}`;
            return (
              <motion.li
                key={`${i}-${item.question.slice(0, 24)}`}
                variants={fadeUp}
                className={`rounded-2xl border hairline transition-colors ${
                  isOpen
                    ? "bg-surface border-brand-200 shadow-[var(--shadow-soft)]"
                    : "bg-surface-2 border-[color:var(--color-line)] hover:bg-brand-50/60"
                }`}
              >
                <button
                  type="button"
                  ref={(el) => {
                    buttonRefs.current[i] = el;
                  }}
                  onClick={() => toggle(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={buttonId}
                  className="w-full flex items-center justify-between gap-6 px-5 lg:px-6 py-4 lg:py-5 text-left"
                >
                  <span className="text-sm lg:text-base font-medium text-ink leading-snug">
                    <E
                      path={`faq.items[${i}].question`}
                      multiline={false}
                    >
                      {item.question}
                    </E>
                  </span>
                  <motion.span
                    animate={
                      reducedMotion
                        ? undefined
                        : { rotate: isOpen ? 45 : 0 }
                    }
                    transition={
                      reducedMotion
                        ? undefined
                        : { duration: 0.25, ease: easeOut }
                    }
                    className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      isOpen
                        ? "bg-brand-700 text-white"
                        : "bg-white text-ink-soft border hairline border-[color:var(--color-line)]"
                    }`}
                    aria-hidden
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="answer"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={
                        reducedMotion
                          ? { opacity: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      animate={
                        reducedMotion
                          ? { opacity: 1 }
                          : {
                              height: "auto",
                              opacity: 1,
                              transition: { duration: 0.32, ease: easeOut },
                            }
                      }
                      exit={
                        reducedMotion
                          ? { opacity: 0 }
                          : {
                              height: 0,
                              opacity: 0,
                              transition: { duration: 0.22, ease: easeOut },
                            }
                      }
                      className="overflow-hidden"
                    >
                      <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-1 text-sm lg:text-base text-ink-soft leading-relaxed">
                        <E path={`faq.items[${i}].answer`}>{item.answer}</E>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
