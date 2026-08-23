import { createClient } from "./supabase/server";

export type ProductRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  dept: "women" | "men" | "kids";
  price: number;
  was_price: number | null;
  stock: number;
  brands: { name: string } | null;
  product_images: { url: string; sort_order: number }[];
};

export type BrandRow = {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  note_ar: string | null;
  note_en: string | null;
  product_count: number;
};

export type LookRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  image_url: string | null;
  look_items: {
    id: string;
    x: number;
    y: number;
    sort_order: number;
    products: { id: string; name_ar: string; name_en: string; price: number; brands: { name: string } | null } | null;
  }[];
};

/** Newest live products for the arrivals rail. */
export async function getNewArrivals(limit = 12): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name_ar, name_en, dept, price, was_price, stock, brands(name), product_images(url, sort_order)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as ProductRow[]);
}

/** Live brands, each with a count of the live products behind it. */
export async function getBrands(): Promise<BrandRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, slug, name, name_ar, note_ar, note_en, products(count)")
    .eq("active", true)
    .order("sort_order");

  type Raw = Omit<BrandRow, "product_count"> & { products: { count: number }[] };
  return (((data ?? []) as unknown as Raw[])).map((b) => ({
    id: b.id, slug: b.slug, name: b.name, name_ar: b.name_ar,
    note_ar: b.note_ar, note_en: b.note_en,
    product_count: b.products?.[0]?.count ?? 0,
  }));
}

/** Live looks with their hotspots and the product behind each pin. */
export async function getLooks(): Promise<LookRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("looks")
    .select("id, slug, title_ar, title_en, image_url, look_items(id, x, y, sort_order, products(id, name_ar, name_en, price, brands(name)))")
    .eq("active", true)
    .order("sort_order");
  return ((data ?? []) as unknown as LookRow[]);
}
