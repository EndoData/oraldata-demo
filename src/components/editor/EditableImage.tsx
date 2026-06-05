"use client";

import Image, { type ImageProps } from "next/image";
import { useRef, useState } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { useEditor, useImage } from "@/lib/editor";

type Props = Omit<ImageProps, "src"> & {
  path: string;
  fallback: string;
};

export function EditableImage({ path, fallback, alt, className, ...rest }: Props) {
  const { isEditing, setValue } = useEditor();
  const src = useImage(path, fallback);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isEditing) {
    return <Image src={src} alt={alt} className={className} {...rest} />;
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        path?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.path) {
        setError(body.error ?? `Erreur ${res.status}`);
        return;
      }
      setValue(path, body.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`relative group ${className ?? ""}`}>
      <Image src={src} alt={alt} className={className} {...rest} />
      <div className="absolute inset-0 rounded-[inherit] outline-1 outline-dashed outline-amber-400 outline-offset-2 pointer-events-none" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 flex items-center justify-center gap-2 rounded-[inherit] bg-black/0 hover:bg-black/55 text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait disabled:opacity-100 disabled:bg-black/55"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Téléversement…
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4" />
            Changer la photo
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
      {error ? (
        <div
          role="alert"
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-red-600 text-white text-xs whitespace-nowrap z-10"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
