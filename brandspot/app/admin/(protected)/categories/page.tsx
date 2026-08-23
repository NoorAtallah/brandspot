import { createClient } from "../../../lib/supabase/server";
import SimpleResource, { type FieldSpec } from "../simple-resource";

const FIELDS: FieldSpec[] = [
  { key: "image_url", label: "Image", type: "image", folder: "categories", column: true },
  { key: "name_en", label: "Name (EN)", column: true },
  { key: "name_ar", label: "Name (AR)", dir: "rtl", column: true },
  { key: "slug", label: "Slug" },
  { key: "dept", label: "Department", type: "select", column: true,
    options: [{ value: "women", label: "Women" }, { value: "men", label: "Men" }, { value: "kids", label: "Kids" }] },
  { key: "sort_order", label: "Sort order", type: "number", default: "0", column: true },
  { key: "active", label: "Live on the store", type: "toggle", default: true, column: true },
];

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return <SimpleResource table="categories" title="Categories" rows={data ?? []} fields={FIELDS} titleKey="name_en" />;
}
