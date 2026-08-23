'use client';
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { PageHeader, Panel, Select, Empty, muted } from "../../ui";
import { updateRow } from "../actions";
import { CAMEL, INK } from "../../../lib/glass";

type Item = { id: string; product_name: string; brand_name: string | null; size: string | null; unit_price: number; quantity: number; image_url: string | null };
type Order = {
  id: string; order_number: number; status: string;
  customer_name: string; phone: string; city: string; address: string; notes: string | null;
  subtotal: number; delivery_fee: number; total: number; created_at: string;
  order_items: Item[];
};

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled", "returned"] as const;

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [openId, setOpenId] = React.useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    await updateRow("orders", id, { status });
    router.refresh();
  };

  return (
    <>
      <PageHeader title="Orders" subtitle={`${orders.length} total — all cash on delivery`} />

      <Panel>
        {orders.length ? (
          <ul>
            {orders.map((o) => {
              const open = openId === o.id;
              return (
                <li key={o.id} style={{ borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <button onClick={() => setOpenId(open ? null : o.id)} className="flex items-center gap-2" aria-expanded={open}>
                      <ChevronDown size={16} strokeWidth={2.6} style={{ color: muted, transform: open ? "rotate(180deg)" : "none" }} />
                      <span className="text-[13.5px] font-extrabold" style={{ color: INK }}>#{o.order_number}</span>
                    </button>

                    <span className="flex shrink-0 -space-x-2 rtl:space-x-reverse">
                      {o.order_items.slice(0, 3).map((it) => (
                        <span key={it.id} className="relative h-9 w-8 overflow-hidden rounded-lg"
                          style={{ background: "rgba(20,20,20,0.06)", border: "2px solid #fff" }}>
                          {it.image_url ? <Image src={it.image_url} alt="" fill sizes="32px" className="object-cover" /> : null}
                        </span>
                      ))}
                      {o.order_items.length > 3 ? (
                        <span className="flex h-9 w-8 items-center justify-center rounded-lg text-[10px] font-extrabold"
                          style={{ background: CAMEL, color: INK, border: "2px solid #fff" }}>
                          +{o.order_items.length - 3}
                        </span>
                      ) : null}
                    </span>

                    <span className="text-[13px] font-bold" style={{ color: INK }}>{o.customer_name}</span>
                    <span dir="ltr" className="text-[13px] font-bold" style={{ color: muted }}>{o.phone}</span>
                    <span className="text-[13px] font-bold" style={{ color: muted }}>{o.city}</span>

                    <span className="flex w-full items-center justify-between gap-3 sm:ms-auto sm:w-auto sm:justify-normal">
                      <span className="text-[14px] font-extrabold" style={{ color: INK }}>{Number(o.total).toFixed(2)} JD</span>
                      <Select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </span>
                  </div>

                  {open ? (
                    <div className="px-4 pb-4 sm:ps-11">
                      <p className="text-[13px] font-bold" style={{ color: muted }}>{o.address}</p>
                      {o.notes ? <p className="mt-1 text-[13px] font-medium" style={{ color: muted }}>“{o.notes}”</p> : null}

                      <ul className="mt-3 flex flex-col gap-1.5">
                        {o.order_items.map((it) => (
                          <li key={it.id} className="flex items-center gap-3 text-[13px] font-bold" style={{ color: INK }}>
                            <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl" style={{ background: "rgba(20,20,20,0.06)" }}>
                              {it.image_url ? <Image src={it.image_url} alt="" fill sizes="48px" className="object-cover" /> : null}
                              <span className="absolute bottom-0 end-0 rounded-tl-md px-1 text-[10px] font-extrabold" style={{ background: CAMEL, color: INK }}>
                                {it.quantity}
                              </span>
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate">{it.product_name}</span>
                              <span className="block text-[11.5px]" style={{ color: muted }}>
                                {it.brand_name ? <span style={{ color: CAMEL }}>{it.brand_name}</span> : null}
                                {it.brand_name && it.size ? " · " : null}
                                {it.size}
                              </span>
                            </span>
                            <span className="shrink-0">{(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-3 text-[13px] font-bold" style={{ color: muted }}>
                        Subtotal {Number(o.subtotal).toFixed(2)} · Delivery {Number(o.delivery_fee).toFixed(2)}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty label="No orders yet — the cart and checkout still need building." />
        )}
      </Panel>
    </>
  );
}
