import Image from "next/image";
import { copy } from "@/lib/copy";
import { E } from "@/components/editor/EditableText";

export function Footer() {
  const f = copy.footer;
  return (
    <footer className="bg-surface-2 border-t hairline border-t-[color:var(--color-line)] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center text-center gap-5">
          <Image
            src="/brand/oraldata-logo.png"
            alt="OralData"
            width={200}
            height={80}
            className="h-12 w-auto"
          />
          <p className="font-serif text-lg lg:text-xl text-ink-soft max-w-md leading-snug tracking-tight">
            <E path="footer.tagline">{f.tagline}</E>
          </p>
        </div>

        <div className="mt-10 pt-6 border-t hairline border-t-[color:var(--color-line)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-ink-mute">
          <span>
            <E path="footer.copyright" multiline={false}>{f.copyright}</E>
          </span>
          <span>Pitch conçu par KRATA.</span>
        </div>
      </div>
    </footer>
  );
}
