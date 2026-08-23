import { createClient } from "../../lib/supabase/server";
import CheckoutClient from "./checkout-client";

export const metadata = { title: "Checkout — brand.spot" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: zones } = await supabase
    .from("delivery_zones")
    .select("id, city_ar, city_en, fee, eta_ar, eta_en")
    .eq("active", true)
    .order("sort_order");

  return <CheckoutClient zones={zones ?? []} />;
}
