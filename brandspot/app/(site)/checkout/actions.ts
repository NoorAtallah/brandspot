'use server';
import { createAdminClient } from "../../lib/supabase/admin";

export type IncomingLine = { productId: string; size: string | null; qty: number };
export type OrderPayload = {
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  lines: IncomingLine[];
};

/**
 * Prices and stock are read from the database, never taken from the browser —
 * the cart in localStorage is a convenience, not a source of truth. Runs with
 * the service key because `orders` has no public insert policy on purpose.
 */
export async function placeOrder(payload: OrderPayload) {
  const { customer_name, phone, city, address, notes, lines } = payload;

  if (!customer_name?.trim() || !phone?.trim() || !city?.trim() || !address?.trim()) {
    return { error: "missing_fields" as const };
  }
  if (!lines?.length) return { error: "empty_cart" as const };

  const db = createAdminClient();

  const ids = [...new Set(lines.map((l) => l.productId))];
  const { data: products, error: readErr } = await db
    .from("products")
    .select("id, name_en, name_ar, price, stock, active, brands(name), product_images(url, sort_order)")
    .in("id", ids);

  if (readErr) return { error: "lookup_failed" as const, detail: readErr.message };

  type Row = {
    id: string; name_en: string; name_ar: string; price: number; stock: number; active: boolean;
    brands: { name: string } | null; product_images: { url: string; sort_order: number }[];
  };
  const byId = new Map((products as Row[] | null ?? []).map((p) => [p.id, p]));

  const items = [];
  let subtotal = 0;

  for (const line of lines) {
    const p = byId.get(line.productId);
    if (!p || !p.active) return { error: "unavailable" as const };

    const qty = Math.max(1, Math.min(line.qty, 99));
    if (p.stock < qty) return { error: "out_of_stock" as const, detail: p.name_en };

    const unit = Number(p.price);
    subtotal += unit * qty;

    items.push({
      product_id: p.id,
      product_name: p.name_en,
      brand_name: p.brands?.name ?? null,
      size: line.size,
      unit_price: unit,
      quantity: qty,
      image_url: [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null,
    });
  }

  // Delivery is priced by city, matched against the zones table in either language.
  const { data: zone } = await db
    .from("delivery_zones")
    .select("fee")
    .or(`city_en.eq.${city},city_ar.eq.${city}`)
    .eq("active", true)
    .maybeSingle();

  const delivery_fee = Number(zone?.fee ?? 0);
  const total = subtotal + delivery_fee;

  const { data: order, error: insertErr } = await db
    .from("orders")
    .insert({
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      notes: notes?.trim() || null,
      subtotal,
      delivery_fee,
      total,
    })
    .select("id, order_number")
    .single();

  if (insertErr) return { error: "insert_failed" as const, detail: insertErr.message };

  const { error: itemsErr } = await db
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: order.id })));

  if (itemsErr) {
    // Never leave an order without its lines.
    await db.from("orders").delete().eq("id", order.id);
    return { error: "insert_failed" as const, detail: itemsErr.message };
  }

  // Decrement stock. Not a transaction — acceptable for a shop this size, and
  // the admin sees the real numbers either way.
  for (const i of items) {
    const p = byId.get(i.product_id)!;
    await db.from("products").update({ stock: Math.max(0, p.stock - i.quantity) }).eq("id", p.id);
  }

  return { orderNumber: order.order_number as number };
}
