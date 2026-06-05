"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Deltas = Record<string, unknown>;

type EditorContextValue = {
  isEditing: boolean;
  getValue: <T = unknown>(path: string, fallback: T) => T;
  setValue: (path: string, value: unknown) => void;
  pending: Deltas;
  reset: () => void;
  save: () => Promise<{ ok: boolean; error?: string }>;
  saving: boolean;
};

const EditorContext = createContext<EditorContextValue | null>(null);

const STORAGE_KEY = "oraldata-pending-edits";
const MARKER_COOKIE = "oraldata_editor_active";

function hasEditorMarker(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${MARKER_COOKIE}=`));
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const urlToken = params.get("edit");

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [pending, setPending] = useState<Deltas>({});
  const [saving, setSaving] = useState(false);

  // Initial marker check (post-hydration)
  useEffect(() => {
    setIsEditing(hasEditorMarker());
  }, []);

  // Exchange ?edit=TOKEN for a httpOnly cookie session, then clean the URL
  useEffect(() => {
    if (!urlToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/editor/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: urlToken }),
          credentials: "same-origin",
        });
        if (cancelled) return;
        if (res.ok) {
          setIsEditing(true);
        }
      } catch {
        // ignore
      } finally {
        if (cancelled) return;
        const cleanParams = new URLSearchParams(params.toString());
        cleanParams.delete("edit");
        const qs = cleanParams.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [urlToken, params, pathname, router]);

  useEffect(() => {
    if (!isEditing) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setPending(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    } catch {
      // ignore
    }
  }, [pending, isEditing]);

  const getValue = useCallback(
    <T,>(path: string, fallback: T): T =>
      (pending[path] as T | undefined) ?? fallback,
    [pending],
  );

  const setValue = useCallback((path: string, value: unknown) => {
    setPending((prev) => ({ ...prev, [path]: value }));
  }, []);

  const reset = useCallback(() => {
    setPending({});
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback(async () => {
    if (Object.keys(pending).length === 0) {
      return { ok: false, error: "no-changes" };
    }
    setSaving(true);
    try {
      const res = await fetch("/api/save-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deltas: pending }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, error: body.error ?? `http-${res.status}` };
      }
      reset();
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      };
    } finally {
      setSaving(false);
    }
  }, [pending, reset]);

  const value = useMemo<EditorContextValue>(
    () => ({ isEditing, getValue, setValue, pending, reset, save, saving }),
    [isEditing, getValue, setValue, pending, reset, save, saving],
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
      {isEditing ? <EditorBarMount /> : null}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    return {
      isEditing: false,
      getValue: <T,>(_p: string, fallback: T): T => fallback,
      setValue: () => {},
      pending: {},
      reset: () => {},
      save: async () => ({ ok: false, error: "no-provider" }),
      saving: false,
    };
  }
  return ctx;
}

import { EditorBar } from "@/components/editor/EditorBar";
function EditorBarMount() {
  return <EditorBar />;
}

export type AccentTheme = { base: string; light: string; dark: string };

export function useList<T>(path: string, fallback: T[]): T[] {
  const { getValue } = useEditor();
  return getValue<T[]>(path, fallback);
}

export function useImage(path: string, fallback: string): string {
  const { getValue } = useEditor();
  return getValue<string>(path, fallback);
}

export function useAccentTheme(fallback: AccentTheme): AccentTheme {
  const { getValue } = useEditor();
  return getValue<AccentTheme>("theme.accent", fallback);
}
