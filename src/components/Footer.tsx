import { copy } from "@/lib/copy";

export function Footer() {
  const f = copy.footer;
  return (
    <footer className="bg-brand-900 text-white/80 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 lg:gap-16">
          <div>
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
                <rect x="1" y="1" width="26" height="26" rx="6" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" />
                <path d="M14 6.2c-2.8 0-4.6 1.7-4.6 4.3 0 1.4.5 2.7 1.2 4.2.7 1.5 1.4 3.1 1.4 4.9 0 1.6.8 2.5 2 2.5s2-0.9 2-2.5c0-1.8.7-3.4 1.4-4.9.7-1.5 1.2-2.8 1.2-4.2 0-2.6-1.8-4.3-4.6-4.3Z" fill="white" />
              </svg>
              <span className="font-serif text-2xl tracking-tight text-white">
                OralData
              </span>
            </div>
            <p className="mt-5 font-serif text-lg text-white/70 max-w-xs leading-snug tracking-tight">
              {f.tagline}
            </p>
          </div>

          {f.columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-[0.16em] text-white/50 mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="text-sm text-white/70 cursor-default">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-white/50">
          <span>{f.copyright}</span>
          <span>Pitch conçu par KRATA.</span>
        </div>
      </div>
    </footer>
  );
}
