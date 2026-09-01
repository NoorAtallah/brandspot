'use client';
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, Panel, Button, Field, Input, Textarea, Select, Toggle, Drawer, Empty, TableWrap, muted } from "../../ui";
import { Uploader } from "../uploader";
import { createRow, updateRow, deleteRow, setProductImages, setProductVariants } from "../actions";
import { CAMEL, INK } from "../../../lib/glass";

type Img = { url: string; sort_order: number };
type Variant = { id: string; size: string; stock: number; sort_order: number };
type Row = { size: string; stock: number };

/* Adults get sizes, kids get ages — same table, different vocabulary. */
const SIZE_PRESETS: Record<"women" | "men" | "kids", string[]> = {
  women: ["XS", "S", "M", "L", "XL", "XXL"],
  men: ["S", "M", "L", "XL", "XXL"],
  // Months stay as ranges; years are single ages (1Y, 2Y, ...) — no ranges.
  kids: [
    "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M",
    "1Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y",
    "9Y", "10Y", "11Y", "12Y", "13Y", "14Y",
  ],
};
type Product = {
  id: string; slug: string; name_ar: string; name_en: string;
  description_ar: string | null; description_en: string | null;
  brand_id: string | null; category_id: string | null; dept: "women" | "men" | "kids";
  price: number; was_price: number | null; stock: number; active: boolean;
  brands: { name: string } | null;
  categories: { name_en: string } | null;
  product_images: Img[];
  product_variants: Variant[];
};

const blank = {
  slug: "", name_ar: "", name_en: "", description_ar: "", description_en: "",
  brand_id: "", category_id: "", dept: "women" as Product["dept"], price: "", was_price: "", stock: "0", active: true,
};

// Keeps letters/digits from ANY script (Arabic included) so an Arabic-only
// name still produces a usable slug instead of an empty string.
const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** A slug that is never empty and never collides with an existing product. */
const uniqueSlug = (base: string, taken: Set<string>) => {
  const root = slugify(base) || `product-${Date.now().toString(36)}`;
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
};

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
  const [variants, setVariants] = React.useState<Row[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof blank, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setEditing(null);
    setForm({ ...blank });
    setImages([]);
    setVariants([]);
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
    setVariants(
      [...(p.product_variants ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((v) => ({ size: v.size, stock: v.stock }))
    );
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError(null);

    const values = {
      slug: uniqueSlug(
        form.slug || form.name_en || form.name_ar,
        new Set(products.filter((p) => p.id !== editing?.id).map((p) => p.slug)),
      ),
      name_ar: form.name_ar,
      name_en: form.name_en,
      description_ar: form.description_ar || null,
      description_en: form.description_en || null,
      brand_id: form.brand_id || null,
      category_id: form.category_id || null,
      dept: form.dept,
      price: Number(form.price || 0),
      was_price: form.was_price ? Number(form.was_price) : null,
      stock: variants.length ? variants.reduce((n, v) => n + v.stock, 0) : Number(form.stock || 0),
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

    const varRes = await setProductVariants(id, variants);
    if (varRes.error) setError(varRes.error);

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
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              onBlur={(e) => set("slug", slugify(e.target.value))}
              placeholder={slugify(form.name_en)}
            />
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

          <Field label={form.dept === "kids" ? "Ages" : "Sizes"}>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-1.5">
                {SIZE_PRESETS[form.dept].map((size) => {
                  const on = variants.some((v) => v.size === size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setVariants((prev) =>
                          on ? prev.filter((v) => v.size !== size) : [...prev, { size, stock: 0 }]
                        )
                      }
                      className="rounded-full px-3 py-1.5 text-[12px] font-extrabold"
                      style={{ background: on ? CAMEL : "rgba(20,20,20,0.07)", color: INK }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {variants.length ? (
                <ul className="flex flex-col gap-1.5">
                  {variants.map((v, i) => (
                    <li key={v.size} className="flex items-center gap-2">
                      <span className="w-16 text-[13px] font-extrabold" style={{ color: INK }}>{v.size}</span>
                      <Input
                        type="number"
                        value={String(v.stock)}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, xi) => (xi === i ? { ...x, stock: Number(e.target.value || 0) } : x))
                          )
                        }
                      />
                      <span className="text-[11px] font-bold" style={{ color: muted }}>in stock</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="text-[12px] font-bold" style={{ color: muted }}>
                    No {form.dept === "kids" ? "ages" : "sizes"} picked — the piece sells as one option.
                  </p>
                  <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="Stock" />
                </>
              )}
            </div>
          </Field>

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
