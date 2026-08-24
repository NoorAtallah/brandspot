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
  product_variants: { id: string; size: string; stock: number; sort_order: number }[];
};

export type BrandRow = {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  note_ar: string | null;
  note_en: string | null;
  logo_url: string | null;
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
    products: {
      id: string; name_ar: string; name_en: string; price: number;
      brands: { name: string } | null;
      product_variants: { size: string; stock: number; sort_order: number }[];
    } | null;
  }[];
};

/** Newest live products for the arrivals rail. */
export async function getNewArrivals(limit = 12): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name_ar, name_en, dept, price, was_price, stock, brands(name), product_images(url, sort_order), product_variants(id, size, stock, sort_order)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Same idea on the arrivals rail: in stock first, newest within that.
  return ((data ?? []) as unknown as ProductRow[]).sort((a, b) =>
    (a.stock > 0) === (b.stock > 0) ? 0 : a.stock > 0 ? -1 : 1
  );
}

export type ProductDetail = ProductRow & {
  description_ar: string | null;
  description_en: string | null;
  category_id: string | null;
  categories: { name_ar: string; name_en: string } | null;
};

const DETAIL_SELECT =
  "id, slug, name_ar, name_en, description_ar, description_en, dept, price, was_price, stock, category_id, brands(name), categories(name_ar, name_en), product_images(url, sort_order), product_variants(id, size, stock, sort_order)";

/** One product, addressable by slug or by uuid. */
export async function getProduct(handle: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const isUuid = /^[0-9a-f-]{36}$/i.test(handle);

  const { data } = await supabase
    .from("products")
    .select(DETAIL_SELECT)
    .eq(isUuid ? "id" : "slug", handle)
    .eq("active", true)
    .maybeSingle();

  return (data as unknown as ProductDetail) ?? null;
}

/** More from the same category, falling back to the same department. */
export async function getRelated(product: ProductDetail, limit = 6): Promise<ProductRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, slug, name_ar, name_en, dept, price, was_price, stock, brands(name), product_images(url, sort_order), product_variants(id, size, stock, sort_order)")
    .eq("active", true)
    .neq("id", product.id)
    .limit(limit);

  query = product.category_id ? query.eq("category_id", product.category_id) : query.eq("dept", product.dept);

  const { data } = await query;
  return ((data ?? []) as unknown as ProductRow[]);
}

export type ProductFilters = {
  dept?: string;
  brand?: string;   // brand slug
  category?: string; // category slug
  q?: string;
  sort?: "new" | "price-asc" | "price-desc";
  sale?: boolean;
};

const LIST_SELECT =
  "id, slug, name_ar, name_en, dept, price, was_price, stock, brands!inner(name, slug), categories(slug), product_images(url, sort_order), product_variants(id, size, stock, sort_order)";

/** The full catalogue, filtered and sorted for the shop page. */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductRow[]> {
  const supabase = await createClient();

  // brands!inner would drop brandless products, so only join strictly when
  // filtering by brand.
  const select = filters.brand
    ? LIST_SELECT
    : LIST_SELECT.replace("brands!inner", "brands");

  let query = supabase.from("products").select(select).eq("active", true);

  if (filters.dept) query = query.eq("dept", filters.dept);
  if (filters.sale) query = query.not("was_price", "is", null);
  if (filters.brand) query = query.eq("brands.slug", filters.brand);
  if (filters.category) query = query.eq("categories.slug", filters.category);
  if (filters.q) {
    const term = `%${filters.q}%`;
    query = query.or(`name_en.ilike.${term},name_ar.ilike.${term}`);
  }

  query =
    filters.sort === "price-asc" ? query.order("price", { ascending: true })
    : filters.sort === "price-desc" ? query.order("price", { ascending: false })
    : query.order("created_at", { ascending: false });

  const { data } = await query.limit(120);
  return ((data ?? []) as unknown as ProductRow[]);
}

/** Brand and category lists for the shop filters. */
export async function getFilterOptions() {
  const supabase = await createClient();
  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("slug, name, name_ar").eq("active", true).order("sort_order"),
    supabase.from("categories").select("slug, name_en, name_ar, dept").eq("active", true).order("sort_order"),
  ]);
  return {
    brands: (brands ?? []) as { slug: string; name: string; name_ar: string | null }[],
    categories: (categories ?? []) as { slug: string; name_en: string; name_ar: string; dept: string | null }[],
  };
}

/** Live brands, each with a count of the live products behind it. */
export async function getBrands(): Promise<BrandRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, slug, name, name_ar, note_ar, note_en, logo_url, products(count)")
    .eq("active", true)
    .order("sort_order");

  type Raw = Omit<BrandRow, "product_count"> & { products: { count: number }[] };
  return (((data ?? []) as unknown as Raw[])).map((b) => ({
    id: b.id, slug: b.slug, name: b.name, name_ar: b.name_ar,
    note_ar: b.note_ar, note_en: b.note_en, logo_url: b.logo_url,
    product_count: b.products?.[0]?.count ?? 0,
  }));
}

export type CategoryRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  dept: "women" | "men" | "kids" | null;
  image_url: string | null;
  product_count: number;
};

/** Live categories with a count of the live products in each. */
export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name_ar, name_en, dept, image_url, products(count)")
    .eq("active", true)
    .order("sort_order");

  type Raw = Omit<CategoryRow, "product_count"> & { products: { count: number }[] };
  return ((data ?? []) as unknown as Raw[]).map((k) => ({
    id: k.id, slug: k.slug, name_ar: k.name_ar, name_en: k.name_en,
    dept: k.dept, image_url: k.image_url,
    product_count: k.products?.[0]?.count ?? 0,
  }));
}

/** Everything currently marked down, biggest saving first. */
export async function getOnSale(limit = 12): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name_ar, name_en, dept, price, was_price, stock, brands(name), product_images(url, sort_order), product_variants(id, size, stock, sort_order)")
    .eq("active", true)
    .not("was_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = ((data ?? []) as unknown as ProductRow[]).filter(
    (p) => p.was_price != null && Number(p.was_price) > Number(p.price)
  );

  // Sorting by percentage has to happen here: it is a ratio of two columns,
  // not something the query can order by. Sold-out pieces sink to the end so
  // the rail leads with what someone can actually buy.
  const off = (p: ProductRow) => 1 - Number(p.price) / Number(p.was_price!);
  return rows.sort((a, b) => {
    if ((a.stock > 0) !== (b.stock > 0)) return a.stock > 0 ? -1 : 1;
    return off(b) - off(a);
  });
}

/** One brand by slug, with the count of live products behind it. */
export async function getBrand(slug: string): Promise<BrandRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, slug, name, name_ar, note_ar, note_en, logo_url, products(count)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;
  const raw = data as unknown as Omit<BrandRow, "product_count"> & { products: { count: number }[] };
  return { ...raw, product_count: raw.products?.[0]?.count ?? 0 };
}

/** Live looks with their hotspots and the product behind each pin. */
export async function getLooks(): Promise<LookRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("looks")
    .select("id, slug, title_ar, title_en, image_url, look_items(id, x, y, sort_order, products(id, name_ar, name_en, price, brands(name), product_variants(size, stock, sort_order)))")
    .eq("active", true)
    .order("sort_order");
  return ((data ?? []) as unknown as LookRow[]);
}
