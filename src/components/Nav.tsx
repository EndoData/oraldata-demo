"use client";

import Image from "next/image";
import { copy } from "@/lib/copy";
import { motion } from "framer-motion";
import { E } from "@/components/editor/EditableText";
import { useBooking } from "@/components/booking/BookingProvider";
import { track } from "@/lib/analytics";

export function Nav() {
  const { openBooking } = useBooking();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-canvas/75 border-b hairline border-b-[color:var(--color-line)]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center" aria-label="OralData — accueil">
          <Image
            src="/brand/oraldata-logo.png"
            alt="OralData"
            width={160}
            height={64}
            priority
            className="h-9 w-auto"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {copy.nav.links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft hover:text-ink transition-colors"
            >
              <E path={`nav.links[${i}].label`} multiline={false}>{link.label}</E>
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            track("cta_click", { location: "nav" });
            openBooking();
          }}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer"
        >
          <E path="nav.primary" multiline={false}>{copy.nav.primary}</E>
        </button>
      </div>
    </motion.header>
  );
}
