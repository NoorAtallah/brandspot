'use client';
import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, X, LoaderCircle } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { muted } from "../ui";

/**
 * Uploads straight to the `media` bucket from the browser. The storage policy
 * only lets an admin write, so the session is doing the authorising.
 */
export function Uploader({
  folder,
  urls,
  onChange,
  multiple = false,
}: {
  folder: "products" | "looks" | "categories" | "brands";
  urls: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const next: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const name = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(name, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (upErr) {
        setError(upErr.message);
        break;
      }
      const { data } = supabase.storage.from("media").getPublicUrl(name);
      next.push(data.publicUrl);
    }

    onChange(multiple ? [...urls, ...next] : next.slice(-1));
    setBusy(false);
  };

  const remove = (url: string) => onChange(urls.filter((u) => u !== url));

  // First image is the card image, so order matters.
  const move = (from: number, to: number) => {
    if (to < 0 || to >= urls.length) return;
    const copy = [...urls];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item!);
    onChange(copy);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <label
        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[13px] font-extrabold"
        style={{ ...glassLight, color: INK }}
      >
        {busy ? (
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} className="flex">
            <LoaderCircle size={16} strokeWidth={2.6} />
          </motion.span>
        ) : (
          <Upload size={16} strokeWidth={2.4} style={{ color: CAMEL }} />
        )}
        {busy ? "Uploading…" : multiple ? "Upload images" : "Upload image"}
        <input type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
      </label>

      {error ? <p className="text-[12px] font-bold" style={{ color: "#a02020" }}>{error}</p> : null}

      {urls.length ? (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url, i) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(20,20,20,0.08)" }}>
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.9)", color: INK }}
                aria-label="Remove image"
              >
                <X size={13} strokeWidth={3} />
              </button>
              {multiple ? (
                <div className="absolute inset-x-1 bottom-1 flex justify-between">
                  <button type="button" onClick={() => move(i, i - 1)} className="rounded-full px-1.5 text-[11px] font-extrabold" style={{ background: "rgba(255,255,255,0.9)" }}>←</button>
                  {i === 0 ? <span className="rounded-full px-1.5 text-[10px] font-extrabold" style={{ background: CAMEL }}>main</span> : null}
                  <button type="button" onClick={() => move(i, i + 1)} className="rounded-full px-1.5 text-[11px] font-extrabold" style={{ background: "rgba(255,255,255,0.9)" }}>→</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] font-bold" style={{ color: muted }}>No image yet.</p>
      )}
    </div>
  );
}
