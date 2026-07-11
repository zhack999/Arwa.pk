import { apiFetch } from "./client";

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: string | number;
  quantity: number;
  subtotal: string | number;
}

export interface OrderTimelineEntry {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
}

// Shape the existing AdminOrders UI already expects
export interface AdminOrder {
  id: string;           // real DB uuid — used for API calls
  orderNumber: string;  // display id, e.g. ARW-820980
  customer: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  date: string;
  items: number;
  total: number;
  payment: string;
  status: string;
  adminNote: string;
}

function toAdminOrder(o: any): AdminOrder {
  return {
    id: o.id,
    orderNumber: o.order_number,
    customer: o.customer_name,
    phone: o.customer_phone,
    address: o.shipping_address,
    city: o.shipping_city,
    province: o.shipping_province,
    date: new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    items: o.item_count ?? 0,
    total: Number(o.total),
    payment: o.payment_method === "cod" ? "Cash on Delivery" : o.payment_method,
    status: o.order_status,
    adminNote: o.notes || "",
  };
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  const data = await apiFetch("/orders");
  return data.orders.map(toAdminOrder);
}

export async function fetchOrderDetail(id: string): Promise<{ order: AdminOrder; items: OrderItem[]; timeline: OrderTimelineEntry[] }> {
  const data = await apiFetch(`/orders/${id}`);
  return { order: toAdminOrder(data.order), items: data.items, timeline: data.timeline };
}

export async function updateOrderStatus(id: string, order_status: string, note?: string): Promise<AdminOrder> {
  const data = await apiFetch(`/orders/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_status, note }),
  });
  return toAdminOrder(data.order);
}

export async function updateOrderNotes(id: string, notes: string): Promise<AdminOrder> {
  const data = await apiFetch(`/orders/${id}/notes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  return toAdminOrder(data.order);
}