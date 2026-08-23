import { createClient } from "../../../lib/supabase/server";
import LooksClient from "./looks-client";

export default async function LooksPage() {
  const supabase = await createClient();
  const [{ data: looks }, { data: products }] = await Promise.all([
    supabase
      .from("looks")
      .select("*, look_items(id, product_id, x, y, sort_order, products(name_en, name_ar, price))")
      .order("sort_order"),
    supabase.from("products").select("id, name_en, name_ar, price").eq("active", true).order("name_en"),
  ]);
  return <LooksClient looks={looks ?? []} products={products ?? []} />;
}
