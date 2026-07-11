import { apiFetch } from "./client";

export interface TrackedOrder {
  id: string;
  order_number: string;
  payment_status: string;
  order_status: string;
  finalized_at: string | null;
  total: string | number;
  customer_name: string;
  shipping_city: string;
  shipping_province: string;
}

export interface TrackedOrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: string | number;
  quantity: number;
  subtotal: string | number;
}

// Reuses the existing public order-tracking endpoint (same one OrderTracking.tsx
// uses) rather than adding a new backend route — it already returns everything
// the Order Success page needs to confirm payment happened.
export async function trackOrderPublic(orderNumber: string, email: string): Promise<{ order: TrackedOrder; items: TrackedOrderItem[] }> {
  const data = await apiFetch(`/orders/track/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`);
  return { order: data.order, items: data.items };
}
