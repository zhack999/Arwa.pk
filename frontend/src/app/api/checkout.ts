import { apiFetch } from "./client";

export interface CheckoutPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal?: string;
  payment_method: string;
  shipping_fee: number;
  notes?: string;
  items: { product_id: string; quantity: number }[];
}

export interface PlaceOrderResult {
  id: string;              // real DB id — needed to start a Stripe session
  order_number: string;
  total: number;
  payment_method: string;
}

export async function placeOrder(payload: CheckoutPayload): Promise<PlaceOrderResult> {
  const data = await apiFetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return {
    id: data.order.id,
    order_number: data.order.order_number,
    total: Number(data.order.total),
    payment_method: data.order.payment_method,
  };
}
