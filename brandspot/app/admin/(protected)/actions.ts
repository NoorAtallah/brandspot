'use server';
import { revalidatePath } from "next/cache";
import { getAdmin } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";

export type Table = "products" | "categories" | "brands" | "looks" | "look_items" | "product_images" | "product_variants" | "orders";

/** Every mutation re-checks the admin flag: never trust the caller. */
async function guard() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised");
  return createAdminClient();
}

const PATHS: Record<string, string[]> = {
  products: ["/admin/products", "/"],
  categories: ["/admin/categories", "/"],
  brands: ["/admin/brands", "/"],
  looks: ["/admin/looks", "/"],
  look_items: ["/admin/looks", "/"],
  product_images: ["/admin/products", "/"],
  product_variants: ["/admin/products", "/"],
  orders: ["/admin/orders"],
};

function bust(table: Table) {
  (PATHS[table] ?? []).forEach((p) => revalidatePath(p));
}

export async function createRow(table: Table, values: Record<string, unknown>) {
  const db = await guard();
  const { data, error } = await db.from(table).insert(values).select("id").single();
  if (error) return { error: error.message };
  bust(table);
  return { id: data.id as string };
}

export async function updateRow(table: Table, id: string, values: Record<string, unknown>) {
  const db = await guard();
  const { error } = await db.from(table).update(values).eq("id", id);
  if (error) return { error: error.message };
  bust(table);
  return {};
}

export async function deleteRow(table: Table, id: string) {
  const db = await guard();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  bust(table);
  return {};
}

/** Replaces a product's image list in one shot, keeping the given order. */
export async function setProductImages(productId: string, urls: string[]) {
  const db = await guard();
  await db.from("product_images").delete().eq("product_id", productId);
  if (urls.length) {
    const { error } = await db
      .from("product_images")
      .insert(urls.map((url, i) => ({ product_id: productId, url, sort_order: i })));
    if (error) return { error: error.message };
  }
  bust("products");
  return {};
}

/** Replaces a product's sizes (ages, for kids) in one shot. */
export async function setProductVariants(
  productId: string,
  rows: { size: string; stock: number }[]
) {
  const db = await guard();
  await db.from("product_variants").delete().eq("product_id", productId);
  if (rows.length) {
    const { error } = await db.from("product_variants").insert(
      rows.map((r, i) => ({ product_id: productId, size: r.size, stock: r.stock, sort_order: i }))
    );
    if (error) return { error: error.message };
  }
  bust("products");
  return {};
}

/** Replaces a look's pins in one shot. */
export async function setLookItems(
  lookId: string,
  items: { product_id: string; x: number; y: number }[]
) {
  const db = await guard();
  await db.from("look_items").delete().eq("look_id", lookId);
  if (items.length) {
    const { error } = await db
      .from("look_items")
      .insert(items.map((it, i) => ({ ...it, look_id: lookId, sort_order: i })));
    if (error) return { error: error.message };
  }
  bust("looks");
  return {};
}
