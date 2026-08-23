import { createClient } from "../../../lib/supabase/server";
import SimpleResource, { type FieldSpec } from "../simple-resource";

const FIELDS: FieldSpec[] = [
  { key: "logo_url", label: "Logo", type: "image", folder: "brands", column: true },
  { key: "name", label: "Wordmark", column: true },
  { key: "name_ar", label: "Name (AR)", dir: "rtl", column: true },
  { key: "slug", label: "Slug" },
  { key: "note_en", label: "Note (EN)" },
  { key: "note_ar", label: "Note (AR)", dir: "rtl" },
  { key: "sort_order", label: "Sort order", type: "number", default: "0", column: true },
  { key: "active", label: "Live on the store", type: "toggle", default: true, column: true },
];

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("sort_order");
  return <SimpleResource table="brands" title="Brands" rows={data ?? []} fields={FIELDS} titleKey="name" />;
}
