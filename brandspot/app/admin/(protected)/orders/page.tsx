import { createClient } from "../../../lib/supabase/server";
import OrdersClient from "./orders-client";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(id, product_name, brand_name, size, unit_price, quantity, image_url)")
    .order("created_at", { ascending: false });
  return <OrdersClient orders={data ?? []} />;
}
