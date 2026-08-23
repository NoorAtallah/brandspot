'use client';
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader, Panel, Button, Field, Input, Select, Toggle, Drawer, Empty, muted } from "../../ui";
import { Uploader } from "../uploader";
import { createRow, updateRow, deleteRow, setLookItems } from "../actions";
import { CAMEL, INK, glassLight } from "../../../lib/glass";

type P = { id: string; name_en: string; name_ar: string; price: number };
type Pin = { product_id: string; x: number; y: number };
type Look = {
  id: string; slug: string; title_ar: string; title_en: string;
  image_url: string | null; sort_order: number; active: boolean;
  look_items: { id: string; product_id: string; x: number; y: number; sort_order: number; products: P | null }[];
};

const blank = { slug: "", title_en: "", title_ar: "", sort_order: "0", active: true };

export default function LooksClient({ looks, products }: { looks: Look[]; products: P[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Look | null>(null);
  const [form, setForm] = React.useState({ ...blank });
  const [image, setImage] = React.useState<string>("");
  const [pins, setPins] = React.useState<Pin[]>([]);
  const [nextProduct, setNextProduct] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof blank, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setEditing(null); setForm({ ...blank }); setImage(""); setPins([]);
    setNextProduct(""); setError(null); setOpen(true);
  };

  const startEdit = (l: Look) => {
    setEditing(l);
    setForm({ slug: l.slug, title_en: l.title_en, title_ar: l.title_ar, sort_order: String(l.sort_order), active: l.active });
    setImage(l.image_url ?? "");
    setPins([...l.look_items].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ product_id: i.product_id, x: Number(i.x), y: Number(i.y) })));
    setNextProduct(""); setError(null); setOpen(true);
  };

  /** Click the photo to drop the selected product's pin where you clicked. */
  const placePin = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!nextProduct) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setPins((p) => [...p.filter((i) => i.product_id !== nextProduct), { product_id: nextProduct, x, y }]);
    setNextProduct("");
  };

  const save = async () => {
    setBusy(true); setError(null);
    const values = {
      slug: form.slug || form.title_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
      title_en: form.title_en, title_ar: form.title_ar,
      image_url: image || null, sort_order: Number(form.sort_order || 0), active: form.active,
    };
    const res = editing ? await updateRow("looks", editing.id, values) : await createRow("looks", values);
    if ("error" in res && res.error) { setError(res.error); setBusy(false); return; }
    const id = editing ? editing.id : (res as { id: string }).id;
    const pinRes = await setLookItems(id, pins);
    if (pinRes.error) setError(pinRes.error);
    setBusy(false); setOpen(false); router.refresh();
  };

  const remove = async (l: Look) => {
    if (!confirm(`Delete "${l.title_en}"?`)) return;
    await deleteRow("looks", l.id);
    router.refresh();
  };

  const nameOf = (id: string) => products.find((p) => p.id === id)?.name_en ?? "—";

  return (
    <>
      <PageHeader
        title="Looks"
        subtitle="Outfits with tappable hotspots on the storefront"
        action={<Button onClick={startNew}><Plus size={16} strokeWidth={2.6} /> New look</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {looks.length ? looks.map((l) => (
          <Panel key={l.id}>
            <div className="relative aspect-[4/5]" style={{ background: "rgba(20,20,20,0.06)" }}>
              {l.image_url ? <Image src={l.image_url} alt="" fill sizes="300px" className="object-cover" /> : null}
              {l.look_items.map((it) => (
                <span key={it.id} className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ insetInlineStart: `${it.x}%`, top: `${it.y}%`, background: CAMEL, border: "2px solid #fff" }} />
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-extrabold" style={{ color: INK }}>{l.title_en}</p>
                <p className="text-[12px] font-bold" style={{ color: muted }}>{l.look_items.length} pieces · {l.active ? "live" : "hidden"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(l)} aria-label="Edit" className="rounded-full p-2" style={{ color: INK }}><Pencil size={15} strokeWidth={2.3} /></button>
                <button onClick={() => remove(l)} aria-label="Delete" className="rounded-full p-2" style={{ color: "#a02020" }}><Trash2 size={15} strokeWidth={2.3} /></button>
              </div>
            </div>
          </Panel>
        )) : <Panel className="sm:col-span-2 lg:col-span-3"><Empty label="No looks yet." /></Panel>}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title={editing ? "Edit look" : "New look"}>
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title (EN)"><Input value={form.title_en} onChange={(e) => set("title_en", e.target.value)} /></Field>
            <Field label="Title (AR)"><Input value={form.title_ar} onChange={(e) => set("title_ar", e.target.value)} dir="rtl" /></Field>
          </div>

          <Field label="Photo"><Uploader folder="looks" urls={image ? [image] : []} onChange={(u) => setImage(u[0] ?? "")} /></Field>

          {image ? (
            <Field label={nextProduct ? "Now click the photo to place the pin" : "Pick a product, then click the photo"}>
              <div className="flex flex-col gap-2">
                <Select value={nextProduct} onChange={(e) => setNextProduct(e.target.value)}>
                  <option value="">Choose a product…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name_en} — {Number(p.price).toFixed(2)} JD</option>)}
                </Select>

                <div
                  onClick={placePin}
                  className="relative aspect-[4/5] overflow-hidden rounded-2xl"
                  style={{ cursor: nextProduct ? "crosshair" : "default", border: "1px solid rgba(20,20,20,0.08)" }}
                >
                  <Image src={image} alt="" fill sizes="380px" className="object-cover" />
                  {pins.map((pin) => (
                    <span key={pin.product_id}
                      className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-extrabold"
                      style={{ insetInlineStart: `${pin.x}%`, top: `${pin.y}%`, background: CAMEL, color: INK, border: "2px solid #fff" }}>
                      •
                    </span>
                  ))}
                </div>

                {pins.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {pins.map((pin) => (
                      <li key={pin.product_id} className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2" style={glassLight}>
                        <span className="min-w-0 truncate text-[13px] font-bold" style={{ color: INK }}>{nameOf(pin.product_id)}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-[11px] font-bold" style={{ color: muted }}>{pin.x}% / {pin.y}%</span>
                          <button type="button" onClick={() => setPins((p) => p.filter((i) => i.product_id !== pin.product_id))} aria-label="Remove pin" style={{ color: "#a02020" }}>
                            <X size={14} strokeWidth={3} />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Field>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Slug"><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
            <Field label="Sort order"><Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></Field>
          </div>

          <Toggle on={form.active} onChange={(v) => set("active", v)} label="Live on the store" />

          {error ? <p className="rounded-2xl px-4 py-2.5 text-[13px] font-bold" style={{ background: "rgba(190,40,40,0.10)", color: "#a02020" }}>{error}</p> : null}

          <div className="mt-2 flex gap-2">
            <Button onClick={save} disabled={busy} className="flex-1">{busy ? "Saving…" : "Save look"}</Button>
            <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
