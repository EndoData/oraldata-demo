"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { copy } from "@/lib/copy";
import { fadeUp, stagger, viewportOnce, easeOut } from "@/lib/motion";
import { E } from "@/components/editor/EditableText";

const PER_PAGE = 3;

export function Testimonials() {
  const t = copy.testimonials;
  const reducedMotion = useReducedMotion();
  const sectionId = useId();
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(t.items.length / PER_PAGE));
  const start = page * PER_PAGE;
  const visible = t.items.slice(start, start + PER_PAGE);

  function go(delta: number) {
    setPage((p) => (p + delta + pageCount) % pageCount);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setPage(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPage(pageCount - 1);
    }
  }

  return (
    <section
      id="testimonials"
      className="py-24 lg:py-32 bg-surface-2 border-y hairline border-y-[color:var(--color-line)]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            <E path="testimonials.eyebrow" multiline={false}>{t.eyebrow}</E>
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="headline mt-5 text-[clamp(2rem,4.5vw,3.75rem)] text-ink whitespace-pre-line"
          >
            <E path="testimonials.title">{t.title}</E>
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="mt-4 inline-flex items-center gap-2 text-sm text-ink-mute"
          >
            <InstagramIcon />
            <E path="testimonials.handle" multiline={false}>{t.handle}</E>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: easeOut }}
          className="mt-16 relative"
          role="region"
          aria-roledescription="carousel"
          aria-label="Témoignages"
          aria-live="polite"
          tabIndex={0}
          onKeyDown={onKeyDown}
          id={sectionId}
        >
          <div className="absolute -top-14 right-0 hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Page précédente"
              className="w-10 h-10 rounded-full border hairline border-[color:var(--color-line)] bg-surface text-ink-soft hover:text-ink hover:border-brand-300 transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Page suivante"
              className="w-10 h-10 rounded-full border hairline border-[color:var(--color-line)] bg-surface text-ink-soft hover:text-ink hover:border-brand-300 transition-colors flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative min-h-[18rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={page}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                animate={
                  reducedMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.5, ease: easeOut },
                      }
                }
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: -24,
                        transition: { duration: 0.3, ease: easeOut },
                      }
                }
                className="grid md:grid-cols-3 gap-6"
              >
                {visible.map((item, index) => {
                  const globalIndex = start + index;
                  return (
                    <li
                      key={`${page}-${index}`}
                      className="relative rounded-2xl bg-surface p-8 border hairline border-[color:var(--color-line)] shadow-[var(--shadow-soft)]"
                    >
                      <Quote
                        className="w-7 h-7 text-brand-300 mb-4"
                        strokeWidth={1.5}
                      />
                      <p className="font-serif text-lg text-ink leading-relaxed tracking-tight">
                        {"« "}
                        <E path={`testimonials.items[${globalIndex}].quote`}>
                          {item.quote}
                        </E>
                        {" »"}
                      </p>
                      <div className="mt-6 pt-6 border-t hairline border-t-[color:var(--color-line)]">
                        <div className="font-medium text-ink text-sm">
                          <E
                            path={`testimonials.items[${globalIndex}].author`}
                            multiline={false}
                          >
                            {item.author}
                          </E>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </motion.ul>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Page précédente"
              className="md:hidden w-9 h-9 rounded-full border hairline border-[color:var(--color-line)] bg-surface text-ink-soft hover:text-ink transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div
              role="tablist"
              aria-label="Choisir une page de témoignages"
              className="flex items-center gap-2"
            >
              {Array.from({ length: pageCount }).map((_, i) => {
                const selected = i === page;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={`Page ${i + 1} sur ${pageCount}`}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                      selected
                        ? "bg-brand-700 text-white shadow-[var(--shadow-soft)]"
                        : "text-ink-soft hover:bg-brand-50 hover:text-ink"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Page suivante"
              className="md:hidden w-9 h-9 rounded-full border hairline border-[color:var(--color-line)] bg-surface text-ink-soft hover:text-ink transition-colors flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
