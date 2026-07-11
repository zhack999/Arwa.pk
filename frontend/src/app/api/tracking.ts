import { apiFetch } from "./client";

export interface TrackedOrder {
  id: string;             // order_number
  date: string;
  status: string;         // raw order_status
  statusLabel: string;
  tracking: string | null;
  courier: string | null;
  address: string;
  city: string;
  province: string;
  total: number;
  items: { name: string; qty: number; price: number; image: string | null }[];
  timeline: { status: string; note: string; date: string }[];
}

export async function trackOrder(orderNumber: string, email: string): Promise<TrackedOrder> {
  const data = await apiFetch(`/orders/track/${orderNumber}?email=${encodeURIComponent(email)}`);
  const o = data.order;
  return {
    id: o.order_number,
    date: new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status: o.order_status,
    statusLabel: o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1),
    tracking: o.tracking_number,
    courier: o.courier,
    address: o.shipping_address,
    city: o.shipping_city,
    province: o.shipping_province,
    total: Number(o.total),
    items: data.items.map((i: any) => ({ name: i.product_name, qty: i.quantity, price: Number(i.price), image: i.product_image })),
    timeline: data.timeline.map((t: any) => ({
      status: t.status,
      note: t.note,
      date: new Date(t.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    })),
  };
}