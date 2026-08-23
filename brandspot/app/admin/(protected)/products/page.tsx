import { createClient } from "../../../lib/supabase/server";
import ProductsClient from "./products-client";

export default async function ProductsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: brands }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, brands(name), categories(name_en), product_images(url, sort_order)")
      .order("created_at", { ascending: false }),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("categories").select("id, name_en").order("name_en"),
  ]);

  return <ProductsClient products={products ?? []} brands={brands ?? []} categories={categories ?? []} />;
}
