import { apiFetch } from "./client";

// Asks the backend to open a Stripe Checkout Session for an already-created
// (pending) order, and returns the URL to redirect the customer to.
export async function createStripeCheckoutSession(orderId: string): Promise<string> {
  const data = await apiFetch("/payments/stripe/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId }),
  });
  return data.url;
}
