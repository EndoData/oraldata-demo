"use client";

import { type ReactNode } from "react";
import { ArrowUp, ArrowDown, X, Plus } from "lucide-react";
import { useEditor, useList } from "@/lib/editor";

type Primitive = string | number | boolean | null;
type JsonValue = Primitive | JsonValue[] | { [key: string]: JsonValue };

const STRUCTURAL_KEY_HINTS = [
  "icon",
  "tint",
  "image",
  "href",
  "id",
  "image_url",
  "imageUrl",
];

function looksStructural(key: string): boolean {
  return STRUCTURAL_KEY_HINTS.includes(key);
}

function cloneWithEmptyText<T extends JsonValue>(value: T): T {
  if (value === null) return value;
  if (Array.isArray(value)) {
    return value.map((v) => cloneWithEmptyText(v as JsonValue)) as T;
  }
  if (typeof value === "object") {
    const out: Record<string, JsonValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, JsonValue>)) {
      if (typeof v === "string" && !looksStructural(k)) {
        out[k] = "";
      } else {
        out[k] = cloneWithEmptyText(v);
      }
    }
    return out as T;
  }
  if (typeof value === "string") return "" as T;
  return value;
}

type Props<T extends JsonValue> = {
  path: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Container wrapper around all items (e.g. <ul className="grid ...">) */
  containerClassName?: string;
  containerAs?: "ul" | "ol" | "div";
  /** Wrapper around each item (defaults to <li> if container is ul/ol, else <div>) */
  itemAs?: "li" | "div";
  itemClassName?: string;
  /** Override the "clone last" behaviour for adding new items */
  newItemTemplate?: (last: T | undefined, items: T[]) => T;
  /** Hide the "Add" button (e.g. for fixed-size lists) */
  hideAdd?: boolean;
};

export function EditableList<T extends JsonValue>({
  path,
  items: initial,
  renderItem,
  containerClassName,
  containerAs,
  itemAs,
  itemClassName,
  newItemTemplate,
  hideAdd,
}: Props<T>) {
  const { isEditing, setValue } = useEditor();
  const items = useList<T>(path, initial);

  const Container = containerAs ?? "ul";
  const Item = itemAs ?? (Container === "div" ? "div" : "li");

  if (!isEditing) {
    return (
      <Container className={containerClassName}>
        {items.map((item, i) => (
          <Item key={i} className={itemClassName}>
            {renderItem(item, i)}
          </Item>
        ))}
      </Container>
    );
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setValue(path, next);
  }

  function remove(i: number) {
    const isLast = items.length === 1;
    const msg = isLast
      ? "Cette liste sera vide. Confirmer ?"
      : "Supprimer cet élément ?";
    if (typeof window !== "undefined" && !window.confirm(msg)) return;
    const next = items.slice();
    next.splice(i, 1);
    setValue(path, next);
  }

  function add() {
    const last = items[items.length - 1];
    const tpl = newItemTemplate
      ? newItemTemplate(last, items)
      : last !== undefined
        ? cloneWithEmptyText(last)
        : (("" as unknown) as T);
    setValue(path, [...items, tpl]);
  }

  return (
    <>
      <Container className={containerClassName}>
        {items.map((item, i) => (
          <Item
            key={i}
            className={`relative ${itemClassName ?? ""}`}
          >
            {renderItem(item, i)}
            <div className="absolute top-1 right-1 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                aria-label="Monter"
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
                className="w-7 h-7 rounded-full bg-ink/90 text-white flex items-center justify-center hover:bg-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Descendre"
                disabled={i === items.length - 1}
                onClick={() => move(i, i + 1)}
                className="w-7 h-7 rounded-full bg-ink/90 text-white flex items-center justify-center hover:bg-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => remove(i)}
                className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </Item>
        ))}
      </Container>
      {!hideAdd ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-medium hover:bg-amber-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un élément
          </button>
        </div>
      ) : null}
    </>
  );
}
