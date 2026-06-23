"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

const COOKIE_NAME = "oraldata_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 6 months

type ConsentChoice = "granted" | "denied";

function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!m) return null;
  const v = m.split("=")[1];
  if (v === "granted" || v === "denied") return v;
  return null;
}

function writeConsent(choice: ConsentChoice): void {
  document.cookie = `${COOKIE_NAME}=${choice}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure`;
}

function pushConsentUpdate(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  // Consent Mode v2 only recognises gtag()'s `arguments` object — pushing a plain
  // array (the previous implementation) is silently ignored, so consent never
  // actually updated. Reuse the global gtag() shim defined in layout.tsx.
  window.gtag?.("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
  window.dataLayer.push({ event: "consent_update", consent: choice });
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
    } else {
      pushConsentUpdate(existing);
    }
  }, []);

  function handleChoice(choice: ConsentChoice) {
    writeConsent(choice);
    pushConsentUpdate(choice);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[60]"
          role="dialog"
          aria-live="polite"
          aria-label="Préférences de cookies"
        >
          <div className="rounded-2xl bg-surface border hairline border-[color:var(--color-line)] shadow-[var(--shadow-card)] p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                <Cookie className="w-4 h-4 text-brand-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-base text-ink tracking-tight mb-1">
                  Cookies & confidentialité
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Nous utilisons des cookies pour mesurer l&apos;audience et
                  améliorer notre service. Vous pouvez accepter ou refuser à
                  tout moment.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleChoice("granted")}
                    className="btn-primary px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChoice("denied")}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:text-ink border border-[color:var(--color-line)] hover:border-[color:var(--color-line-strong)] transition-colors cursor-pointer"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
