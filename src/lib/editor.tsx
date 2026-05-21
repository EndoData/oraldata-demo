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
import { usePathname, useSearchParams } from "next/navigation";

type Deltas = Record<string, string>;

type EditorContextValue = {
  isEditing: boolean;
  token: string | null;
  getValue: (path: string, fallback: string) => string;
  setValue: (path: string, value: string) => void;
  pending: Deltas;
  reset: () => void;
  save: () => Promise<{ ok: boolean; error?: string }>;
  saving: boolean;
};

const EditorContext = createContext<EditorContextValue | null>(null);

const STORAGE_KEY = "oraldata-pending-edits";

export function EditorProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const token = params.get("edit");
  const isEditing = Boolean(token);

  const [pending, setPending] = useState<Deltas>({});
  const [saving, setSaving] = useState(false);

  // Load any unsaved drafts from sessionStorage on mount
  useEffect(() => {
    if (!isEditing) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPending(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, [isEditing]);

  // Persist drafts as user types
  useEffect(() => {
    if (!isEditing) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    } catch {
      // ignore
    }
  }, [pending, isEditing]);

  const getValue = useCallback(
    (path: string, fallback: string) => {
      return pending[path] ?? fallback;
    },
    [pending],
  );

  const setValue = useCallback((path: string, value: string) => {
    setPending((prev) => {
      const next = { ...prev };
      next[path] = value;
      return next;
    });
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
    if (!token) return { ok: false, error: "no-token" };
    if (Object.keys(pending).length === 0) {
      return { ok: false, error: "no-changes" };
    }
    setSaving(true);
    try {
      const res = await fetch("/api/save-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, deltas: pending }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
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
  }, [token, pending, reset]);

  const value = useMemo<EditorContextValue>(
    () => ({ isEditing, token, getValue, setValue, pending, reset, save, saving }),
    [isEditing, token, getValue, setValue, pending, reset, save, saving],
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
      token: null,
      getValue: (_p, fallback) => fallback,
      setValue: () => {},
      pending: {},
      reset: () => {},
      save: async () => ({ ok: false, error: "no-provider" }),
      saving: false,
    };
  }
  return ctx;
}

// Avoid circular import — bar component is in a different file.
import { EditorBar } from "@/components/editor/EditorBar";
function EditorBarMount() {
  return <EditorBar />;
}
