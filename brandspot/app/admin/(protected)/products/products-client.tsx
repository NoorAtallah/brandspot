'use client';
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, Panel, Button, Field, Input, Textarea, Select, Toggle, Drawer, Empty, TableWrap, muted } from "../../ui";
import { Uploader } from "../uploader";
import { createRow, updateRow, deleteRow, setProductImages } from "../actions";
import { CAMEL, INK } from "../../../lib/glass";

type Img = { url: string; sort_order: number };
type Product = {
  id: string; slug: string; name_ar: string; name_en: string;
  description_ar: string | null; description_en: string | null;
  brand_id: string | null; category_id: string | null; dept: "women" | "men" | "kids";
  price: number; was_price: number | null; stock: number; active: boolean;
  brands: { name: string } | null;
  categories: { name_en: string } | null;
  product_images: Img[];
};

const blank = {
  slug: "", name_ar: "", name_en: "", description_ar: "", description_en: "",
  brand_id: "", category_id: "", dept: "women" as const, price: "", was_price: "", stock: "0", active: true,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);

export default function ProductsClient({
  products, brands, categories,
}: {
  products: Product[];
  brands: { id: string; name: string }[];
  categories: { id: string; name_en: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState({ ...blank });
  const [images, setImages] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof blank, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setEditing(null);
    setForm({ ...blank });
    setImages([]);
    setError(null);
    setOpen(true);
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      slug: p.slug, name_ar: p.name_ar, name_en: p.name_en,
      description_ar: p.description_ar ?? "", description_en: p.description_en ?? "",
      brand_id: p.brand_id ?? "", category_id: p.category_id ?? "", dept: p.dept,
      price: String(p.price), was_price: p.was_price == null ? "" : String(p.was_price),
      stock: String(p.stock), active: p.active,
    });
    setImages([...p.product_images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url));
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError(null);

    const values = {
      slug: form.slug || slugify(form.name_en || form.name_ar),
      name_ar: form.name_ar,
      name_en: form.name_en,
      description_ar: form.description_ar || null,
      description_en: form.description_en || null,
      brand_id: form.brand_id || null,
      category_id: form.category_id || null,
      dept: form.dept,
      price: Number(form.price || 0),
      was_price: form.was_price ? Number(form.was_price) : null,
      stock: Number(form.stock || 0),
      active: form.active,
    };

    const res = editing
      ? await updateRow("products", editing.id, values)
      : await createRow("products", values);

    if ("error" in res && res.error) {
      setError(res.error);
      setBusy(false);
      return;
    }

    const id = editing ? editing.id : (res as { id: string }).id;
    const imgRes = await setProductImages(id, images);
    if (imgRes.error) setError(imgRes.error);

    setBusy(false);
    setOpen(false);
    router.refresh();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name_en}"? This cannot be undone.`)) return;
    await deleteRow("products", p.id);
    router.refresh();
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} in the catalogue`}
        action={<Button onClick={startNew}><Plus size={16} strokeWidth={2.6} /> New product</Button>}
      />

      <Panel>
        {products.length ? (
          <TableWrap>
          <table className="w-full min-w-[46rem] text-start">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(20,20,20,0.08)" }}>
                {[
                  { h: "", cls: "" },
                  { h: "Name", cls: "" },
                  { h: "Brand", cls: "hidden lg:table-cell" },
                  { h: "Dept", cls: "hidden lg:table-cell" },
                  { h: "Price", cls: "" },
                  { h: "Stock", cls: "hidden sm:table-cell" },
                  { h: "Live", cls: "hidden sm:table-cell" },
                  { h: "", cls: "" },
                ].map(({ h, cls }, i) => (
                  <th key={i} className={`whitespace-nowrap px-4 py-3 text-start text-[11px] font-extrabold uppercase tracking-[0.12em] ${cls}`} style={{ color: muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cover = [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(20,20,20,0.05)" }}>
                    <td className="py-2.5 ps-4">
                      <div className="relative h-12 w-10 overflow-hidden rounded-lg" style={{ background: "rgba(20,20,20,0.06)" }}>
                        {cover ? <Image src={cover} alt="" fill sizes="40px" className="object-cover" /> : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[13.5px] font-extrabold" style={{ color: INK }}>{p.name_en}</p>
                      <p className="text-[12px] font-bold" style={{ color: muted }}>{p.name_ar}</p>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-2.5 text-[13px] font-bold lg:table-cell" style={{ color: muted }}>{p.brands?.name ?? "—"}</td>
                    <td className="hidden whitespace-nowrap px-4 py-2.5 text-[13px] font-bold lg:table-cell" style={{ color: muted }}>{p.dept}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[13px] font-extrabold" style={{ color: INK }}>
                      {Number(p.price).toFixed(2)}
                      {p.was_price ? <span className="ms-1.5 text-[11px] font-bold line-through" style={{ color: muted }}>{Number(p.was_price).toFixed(2)}</span> : null}
                    </td>
                    <td className="hidden px-4 py-2.5 text-[13px] font-bold sm:table-cell" style={{ color: p.stock ? muted : "#a02020" }}>{p.stock}</td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                        style={{ background: p.active ? CAMEL : "rgba(20,20,20,0.10)", color: INK }}>
                        {p.active ? "live" : "hidden"}
                      </span>
                    </td>
                    <td className="pe-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => startEdit(p)} aria-label="Edit" className="rounded-full p-2" style={{ color: INK }}><Pencil size={15} strokeWidth={2.3} /></button>
                        <button onClick={() => remove(p)} aria-label="Delete" className="rounded-full p-2" style={{ color: "#a02020" }}><Trash2 size={15} strokeWidth={2.3} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </TableWrap>
        ) : (
          <Empty label="No products yet. Add the first one." />
        )}
      </Panel>

      <Drawer open={open} onClose={() => setOpen(false)} title={editing ? "Edit product" : "New product"}>
        <div className="flex flex-col gap-4">
          <Field label="Images"><Uploader folder="products" urls={images} onChange={setImages} multiple /></Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name (EN)"><Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} /></Field>
            <Field label="Name (AR)"><Input value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} dir="rtl" /></Field>
          </div>

          <Field label="Slug (leave blank to generate)">
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(form.name_en)} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Brand">
              <Select value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
                <option value="">—</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">—</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Department">
              <Select value={form.dept} onChange={(e) => set("dept", e.target.value)}>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
              </Select>
            </Field>
            <Field label="Price (JD)"><Input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} /></Field>
            <Field label="Was (JD)"><Input type="number" step="0.01" value={form.was_price} onChange={(e) => set("was_price", e.target.value)} /></Field>
          </div>

          <Field label="Stock"><Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></Field>

          <Field label="Description (EN)"><Textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)} /></Field>
          <Field label="Description (AR)"><Textarea value={form.description_ar} onChange={(e) => set("description_ar", e.target.value)} dir="rtl" /></Field>

          <Toggle on={form.active} onChange={(v) => set("active", v)} label="Visible on the store" />

          {error ? <p className="rounded-2xl px-4 py-2.5 text-[13px] font-bold" style={{ background: "rgba(190,40,40,0.10)", color: "#a02020" }}>{error}</p> : null}

          <div className="mt-2 flex gap-2">
            <Button onClick={save} disabled={busy} className="flex-1">{busy ? "Saving…" : "Save product"}</Button>
            <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
