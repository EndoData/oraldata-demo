"use client";

import { useState } from "react";
import { Loader2, Save, Undo2, X } from "lucide-react";
import { useEditor } from "@/lib/editor";

export function EditorBar() {
  const { pending, reset, save, saving } = useEditor();
  const count = Object.keys(pending).length;
  const [status, setStatus] = useState<
    null | { kind: "ok" } | { kind: "error"; message: string }
  >(null);

  if (count === 0 && !status) {
    return <EditorIndicator />;
  }

  async function handleSave() {
    setStatus(null);
    const res = await save();
    if (res.ok) {
      setStatus({ kind: "ok" });
      setTimeout(() => setStatus(null), 6000);
    } else {
      setStatus({ kind: "error", message: res.error ?? "Erreur inconnue" });
    }
  }

  return (
    <>
      <EditorIndicator />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-3 py-2 rounded-full bg-ink text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <span className="text-xs px-2 py-1 rounded-full bg-white/10">
          {count} {count === 1 ? "champ modifié" : "champs modifiés"}
        </span>

        <button
          type="button"
          onClick={() => {
            reset();
            setStatus(null);
          }}
          disabled={saving || count === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Annuler
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || count === 0}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Sauvegarder
            </>
          )}
        </button>

        {status?.kind === "ok" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-emerald-500/15 text-emerald-300">
            Enregistré · redéploiement en cours (~1 min)
          </span>
        ) : null}
        {status?.kind === "error" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-red-500/20 text-red-200">
            <X className="w-3.5 h-3.5" />
            {status.message}
          </span>
        ) : null}
      </div>
    </>
  );
}

function EditorIndicator() {
  return (
    <div className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-medium shadow-sm">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      Mode édition · cliquez sur un texte pour le modifier
    </div>
  );
}
