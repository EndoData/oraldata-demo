"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { copy } from "@/lib/copy";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type Member = (typeof copy.team.members)[number];

export function FoundersGrid() {
  const t = copy.team;
  return (
    <section id="team" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            {t.eyebrow}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="headline mt-5 text-[clamp(2rem,4.5vw,3.75rem)] text-ink whitespace-pre-line"
          >
            {t.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-ink-soft text-lg leading-relaxed"
          >
            {t.sub}
          </motion.p>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {t.members.map((m) => (
            <motion.li
              key={m.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="group text-center"
            >
              <div className="relative mx-auto w-28 h-28 lg:w-32 lg:h-32">
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${m.tint} group-hover:scale-[1.03] transition-transform`}
                />
                <div className="absolute inset-[3px] rounded-full bg-surface overflow-hidden flex items-end justify-center">
                  <MemberAvatar member={m} />
                </div>
                <div className="absolute -bottom-1 right-1 w-7 h-7 rounded-full bg-brand-700 text-white text-[10px] font-medium flex items-center justify-center shadow-[var(--shadow-soft)]">
                  {m.initials}
                </div>
              </div>
              <div className="mt-4 font-medium text-ink text-sm">{m.name}</div>
              <div className="mt-1 text-xs text-ink-mute">{m.role}</div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

function MemberAvatar({ member }: { member: Member }) {
  if ("image" in member && member.image) {
    return (
      <Image
        src={member.image}
        alt={member.name}
        width={256}
        height={256}
        className="w-full h-full object-cover"
        sizes="(min-width: 1024px) 128px, 112px"
      />
    );
  }
  return (
    <svg
      viewBox="0 0 96 96"
      className="w-full h-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="48" cy="38" r="15" fill="var(--color-brand-500)" fillOpacity="0.28" />
      <path
        d="M16 98 C 20 70 32 58 48 58 C 64 58 76 70 80 98 Z"
        fill="var(--color-brand-500)"
        fillOpacity="0.28"
      />
    </svg>
  );
}
