import { apiFetch } from "./client";

export interface MyOrder {
  id: string;          // order_number, shown as the Order ID
  date: string;
  total: number;
  status: string;       // raw backend status, used for filtering
  statusLabel: string;  // capitalized display label
}

export async function fetchMyOrders(): Promise<MyOrder[]> {
  const data = await apiFetch("/orders/mine");
  return data.orders.map((o: any) => ({
    id: o.order_number,
    date: new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    total: Number(o.total),
    status: o.order_status,
    statusLabel: o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1),
  }));
}