'use client';
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, Panel, Button, Field, Input, Select, Toggle, Drawer, Empty, TableWrap, muted } from "../ui";
import { Uploader } from "./uploader";
import { createRow, updateRow, deleteRow, type Table } from "./actions";
import { CAMEL, INK } from "../../lib/glass";

export type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "image" | "toggle";
  dir?: "rtl" | "ltr";
  options?: { value: string; label: string }[];
  folder?: "categories" | "brands" | "looks" | "products";
  /** shown as a column in the table */
  column?: boolean;
  default?: string | boolean;
};

type Row = Record<string, unknown> & { id: string };

/** One table + drawer form, driven by a field spec. Used by categories and brands. */
export default function SimpleResource({
  table, title, subtitle, rows, fields, titleKey,
}: {
  table: Table;
  title: string;
  subtitle?: string;
  rows: Row[];
  fields: FieldSpec[];
  titleKey: string;
}) {
  const router = useRouter();
  const blank = React.useMemo(
    () => Object.fromEntries(fields.map((f) => [f.key, f.default ?? (f.type === "toggle" ? true : "")])),
    [fields]
  );

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [form, setForm] = React.useState<Record<string, unknown>>(blank);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => { setEditing(null); setForm(blank); setError(null); setOpen(true); };
  const startEdit = (r: Row) => {
    setEditing(r);
    setForm(Object.fromEntries(fields.map((f) => [f.key, r[f.key] ?? blank[f.key]])));
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    const values: Record<string, unknown> = {};
    fields.forEach((f) => {
      const v = form[f.key];
      values[f.key] =
        f.type === "number" ? Number(v || 0)
        : f.type === "toggle" ? !!v
        : v === "" ? null
        : v;
    });
    const res = editing ? await updateRow(table, editing.id, values) : await createRow(table, values);
    setBusy(false);
    if ("error" in res && res.error) { setError(res.error); return; }
    setOpen(false);
    router.refresh();
  };

  const remove = async (r: Row) => {
    if (!confirm(`Delete "${String(r[titleKey])}"?`)) return;
    await deleteRow(table, r.id);
    router.refresh();
  };

  const columns = fields.filter((f) => f.column);

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle ?? `${rows.length} total`}
        action={<Button onClick={startNew}><Plus size={16} strokeWidth={2.6} /> New</Button>}
      />

      <Panel>
        {rows.length ? (
          <TableWrap>
          <table className="w-full min-w-[34rem]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(20,20,20,0.08)" }}>
                {columns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-4 py-3 text-start text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: muted }}>{c.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(20,20,20,0.05)" }}>
                  {columns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-2.5 text-[13px] font-bold" style={{ color: INK }}>
                      {c.type === "image" ? (
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg" style={{ background: "rgba(20,20,20,0.06)" }}>
                          {r[c.key] ? <Image src={String(r[c.key])} alt="" fill sizes="44px" className="object-cover" /> : null}
                        </div>
                      ) : c.type === "toggle" ? (
                        <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: r[c.key] ? CAMEL : "rgba(20,20,20,0.10)" }}>
                          {r[c.key] ? "live" : "hidden"}
                        </span>
                      ) : (
                        String(r[c.key] ?? "—")
                      )}
                    </td>
                  ))}
                  <td className="pe-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => startEdit(r)} aria-label="Edit" className="rounded-full p-2" style={{ color: INK }}><Pencil size={15} strokeWidth={2.3} /></button>
                      <button onClick={() => remove(r)} aria-label="Delete" className="rounded-full p-2" style={{ color: "#a02020" }}><Trash2 size={15} strokeWidth={2.3} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        ) : (
          <Empty label="Nothing here yet." />
        )}
      </Panel>

      <Drawer open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${title.toLowerCase()}` : `New ${title.toLowerCase()}`}>
        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.type === "image" ? (
                <Uploader
                  folder={f.folder ?? "products"}
                  urls={form[f.key] ? [String(form[f.key])] : []}
                  onChange={(u) => set(f.key, u[0] ?? "")}
                />
              ) : f.type === "toggle" ? (
                <Toggle on={!!form[f.key]} onChange={(v) => set(f.key, v)} />
              ) : f.type === "select" ? (
                <Select value={String(form[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)}>
                  <option value="">—</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              ) : (
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  dir={f.dir}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </Field>
          ))}

          {error ? <p className="rounded-2xl px-4 py-2.5 text-[13px] font-bold" style={{ background: "rgba(190,40,40,0.10)", color: "#a02020" }}>{error}</p> : null}

          <div className="mt-2 flex gap-2">
            <Button onClick={save} disabled={busy} className="flex-1">{busy ? "Saving…" : "Save"}</Button>
            <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
