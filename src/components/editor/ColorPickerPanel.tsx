"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette, X } from "lucide-react";
import {
  useAccentTheme,
  useEditor,
  type AccentTheme,
} from "@/lib/editor";
import { copy } from "@/lib/copy";

const OVERRIDE_STYLE_ID = "oraldata-accent-override";

const PRESETS: { label: string; base: string }[] = [
  { label: "OralData (or)", base: "#c9a227" },
  { label: "Bleu", base: "#1a73e8" },
  { label: "Vert", base: "#0f9d58" },
  { label: "Rose", base: "#e91e63" },
];

function hexToHsl(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const intVal = parseInt(m[1], 16);
  const r = ((intVal >> 16) & 255) / 255;
  const g = ((intVal >> 8) & 255) / 255;
  const b = (intVal & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function deriveTheme(base: string): AccentTheme | null {
  const hsl = hexToHsl(base);
  if (!hsl) return null;
  const [h, s, l] = hsl;
  return {
    base,
    light: hslToHex(h, Math.max(s - 10, 0), Math.min(l + 14, 92)),
    dark: hslToHex(h, Math.min(s + 5, 100), Math.max(l - 22, 8)),
  };
}

function relativeLuminance(hex: string): number {
  const rgb = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!rgb) return 0;
  const intVal = parseInt(rgb[1], 16);
  const channels = [
    ((intVal >> 16) & 255) / 255,
    ((intVal >> 8) & 255) / 255,
    (intVal & 255) / 255,
  ].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastVsWhite(hex: string): number {
  const l = relativeLuminance(hex);
  return (1.05) / (l + 0.05);
}

function applyOverride(theme: AccentTheme | null) {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(OVERRIDE_STYLE_ID);
  if (!theme) {
    existing?.remove();
    return;
  }
  const css = `:root{--color-accent-300:${theme.light};--color-accent-500:${theme.base};--color-accent-700:${theme.dark};}`;
  if (existing) {
    existing.textContent = css;
    return;
  }
  const tag = document.createElement("style");
  tag.id = OVERRIDE_STYLE_ID;
  tag.textContent = css;
  document.head.appendChild(tag);
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ColorPickerPanel({ open, onClose }: Props) {
  const { setValue } = useEditor();
  const committed = useAccentTheme(copy.theme.accent as AccentTheme);
  const [draftBase, setDraftBase] = useState<string>(committed.base);

  const draftTheme = useMemo(() => deriveTheme(draftBase), [draftBase]);
  const contrast = useMemo(() => contrastVsWhite(draftBase), [draftBase]);
  const contrastOk = contrast >= 4.5;

  // Live preview while open
  useEffect(() => {
    if (!open) return;
    applyOverride(draftTheme);
  }, [open, draftTheme]);

  // Reset draft when reopening
  useEffect(() => {
    if (open) setDraftBase(committed.base);
  }, [open, committed.base]);

  function handleConfirm() {
    if (!draftTheme) return;
    setValue("theme.accent", draftTheme);
    onClose();
  }

  function handleCancel() {
    applyOverride(committed);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Choisir une couleur d'accent"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] w-[min(380px,calc(100vw-2rem))] rounded-2xl bg-white border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.18)] p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleur d&apos;accent
        </h3>
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Fermer"
          className="text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="color"
          aria-label="Code couleur"
          value={draftBase}
          onChange={(e) => setDraftBase(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200"
        />
        <input
          type="text"
          value={draftBase}
          onChange={(e) => setDraftBase(e.target.value)}
          spellCheck={false}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.base}
            type="button"
            onClick={() => setDraftBase(p.base)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <span
              className="w-7 h-7 rounded-full border border-slate-200"
              style={{ background: p.base }}
            />
            <span className="text-[10px] text-slate-600 leading-tight text-center">
              {p.label}
            </span>
          </button>
        ))}
      </div>

      {draftTheme ? (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-md font-mono" style={{ background: draftTheme.light }}>
            light
          </span>
          <span
            className="px-2 py-1 rounded-md font-mono text-white"
            style={{ background: draftTheme.base }}
          >
            base
          </span>
          <span
            className="px-2 py-1 rounded-md font-mono text-white"
            style={{ background: draftTheme.dark }}
          >
            dark
          </span>
        </div>
      ) : (
        <p className="mt-4 text-xs text-red-600">Code couleur invalide</p>
      )}

      {draftTheme ? (
        <p
          className={`mt-3 text-xs ${
            contrastOk ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          Contraste sur fond blanc : {contrast.toFixed(2)} :1
          {contrastOk ? " ✓" : " — peut nuire à la lisibilité des boutons"}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1.5 rounded-full text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!draftTheme}
          className="px-4 py-1.5 rounded-full text-xs font-medium bg-ink text-white hover:bg-ink/85 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}
