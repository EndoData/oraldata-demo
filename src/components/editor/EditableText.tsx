"use client";

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { useEditor } from "@/lib/editor";

type Props = {
  path: string;
  as?: ElementType;
  className?: string;
  /**
   * Raw text from copy.json. Used as fallback when there's no pending edit.
   * If you need to display formatted text (e.g. headlines with line breaks),
   * pass the raw string here — the component renders it with whitespace
   * preserved via the parent's className.
   */
  children: string;
  /**
   * If true (default), preserves newlines using innerText. If false,
   * the value is treated as a single line.
   */
  multiline?: boolean;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * <E path="hero.headline" as="h1" className="...">
 *   {copy.hero.headline}
 * </E>
 *
 * In normal mode: renders as a regular element with the text.
 * In edit mode (?edit=TOKEN): renders contentEditable with a dashed outline,
 * captures changes on blur via useEditor().setValue.
 */
export function E({
  path,
  as: Tag = "span",
  className = "",
  children,
  multiline = true,
}: Props) {
  const { isEditing, getValue, setValue } = useEditor();
  const ref = useRef<HTMLElement | null>(null);
  const value = getValue(path, children);

  if (!isEditing) {
    return createElement(Tag, { className }, value);
  }

  const editingClass = [
    className,
    "relative outline-1 outline-dashed outline-amber-400 outline-offset-4 rounded-sm hover:outline-amber-500 focus:outline-amber-500 focus:outline-2",
    "cursor-text",
  ]
    .filter(Boolean)
    .join(" ");

  // dangerouslySetInnerHTML is used once on mount; React doesn't re-render
  // contentEditable nodes, so we keep cursor stable.
  const html = multiline
    ? escapeHtml(value).replace(/\n/g, "<br/>")
    : escapeHtml(value);

  return createElement(Tag, {
    ref,
    className: editingClass,
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: false,
    "data-edit-path": path,
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const text = multiline
        ? e.currentTarget.innerText
        : e.currentTarget.textContent ?? "";
      setValue(path, text);
    },
    dangerouslySetInnerHTML: { __html: html },
  });
}

/**
 * Renders the same text but doesn't make it editable. Useful when a string
 * is used inside non-text props (e.g. aria-label) and we want a single source
 * with the editor.
 */
export function useEditableValue(path: string, fallback: string): string {
  const { getValue } = useEditor();
  return getValue(path, fallback);
}

type ChildrenFragmentProps = {
  parts: ReactNode[];
};

export function Fragment({ parts }: ChildrenFragmentProps) {
  return <>{parts}</>;
}
