import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Truck, Wallet } from "lucide-react";
import { createAdminClient } from "../../../lib/supabase/admin";
import { glassLight, CAMEL, INK } from "../../../lib/glass";

export const metadata = { title: "Order confirmed — brand.spot" };

/**
 * Read with the service key: orders are admin-only under RLS, and the order
 * number in the URL is all a customer has to identify their own order with.
 */
export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const parsed = Number(number);
  if (!Number.isFinite(parsed)) notFound();

  const db = createAdminClient();
  const { data: order } = await db
    .from("orders")
    .select("order_number, customer_name, phone, city, address, subtotal, delivery_fee, total, created_at, order_items(id, product_name, brand_name, size, unit_price, quantity, image_url)")
    .eq("order_number", parsed)
    .maybeSingle();

  if (!order) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-28 md:pt-32">
      <div className="rounded-[30px] p-7 md:p-10" style={glassLight}>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: CAMEL, color: INK }}>
          <Check size={26} strokeWidth={3} />
        </span>

        <h1 className="mt-5 text-3xl font-extrabold" style={{ color: INK, letterSpacing: "-0.02em" }}>
          شكراً {order.customer_name} — طلبك وصلنا
        </h1>
        <p className="mt-2 text-[15px] font-medium" style={{ color: "rgba(20,20,20,0.72)" }}>
          رقم طلبك <span className="font-extrabold" style={{ color: INK }}>#{order.order_number}</span> — بنتواصل معك على{" "}
          <span dir="ltr" className="font-extrabold" style={{ color: INK }}>{order.phone}</span> لتأكيد التوصيل.
        </p>

        <ul className="mt-6 flex flex-col gap-2.5 pt-5" style={{ borderTop: "1px solid rgba(20,20,20,0.08)" }}>
          {order.order_items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 text-[14px] font-bold" style={{ color: INK }}>
              <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl" style={{ background: "rgba(20,20,20,0.06)" }}>
                {i.image_url ? <Image src={i.image_url} alt="" fill sizes="56px" className="object-cover" /> : null}
                <span className="absolute bottom-0 end-0 rounded-tl-md px-1.5 text-[10px] font-extrabold" style={{ background: CAMEL, color: INK }}>
                  {i.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{i.product_name}</span>
                {i.brand_name ? <span className="block text-[11.5px] font-extrabold" style={{ color: CAMEL }}>{i.brand_name}</span> : null}
                {i.size ? <span className="block text-[11.5px]" style={{ color: "rgba(20,20,20,0.6)" }}>{i.size}</span> : null}
              </span>
              <span className="shrink-0">{(Number(i.unit_price) * i.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-1.5 pt-4 text-[13.5px] font-bold" style={{ borderTop: "1px solid rgba(20,20,20,0.08)", color: "rgba(20,20,20,0.72)" }}>
          <div className="flex justify-between"><dt>المجموع</dt><dd>{Number(order.subtotal).toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt>التوصيل — {order.city}</dt><dd>{Number(order.delivery_fee).toFixed(2)}</dd></div>
          <div className="mt-1 flex justify-between text-[20px] font-extrabold" style={{ color: INK }}>
            <dt>الإجمالي</dt><dd>{Number(order.total).toFixed(2)} <span className="text-[11px]">د.أ</span></dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-extrabold" style={{ background: "rgba(199,167,129,0.18)", color: INK }}>
            <Wallet size={15} strokeWidth={2.4} style={{ color: CAMEL }} /> الدفع عند الاستلام
          </span>
          <span className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-extrabold" style={{ background: "rgba(199,167,129,0.18)", color: INK }}>
            <Truck size={15} strokeWidth={2.4} style={{ color: CAMEL }} /> {order.address}
          </span>
        </div>

        <Link href="/" className="mt-7 inline-flex rounded-full px-6 py-3 text-[13px] font-extrabold" style={{ background: INK, color: "#fff" }}>
          تابع التسوّق
        </Link>
      </div>
    </main>
  );
}
