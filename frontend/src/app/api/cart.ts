import { apiFetch } from "./client";

export interface BackendCartItem {
  product_id: string;
  quantity: number;
}

export async function fetchCart(): Promise<BackendCartItem[]> {
  const data = await apiFetch("/cart/mine");
  return data.items;
}

export async function addCartItem(productId: string, quantity = 1): Promise<void> {
  await apiFetch("/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartItem(productId: string, quantity: number): Promise<void> {
  await apiFetch(`/cart/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId: string): Promise<void> {
  await apiFetch(`/cart/${productId}`, { method: "DELETE" });
}

export async function clearCart(): Promise<void> {
  await apiFetch("/cart", { method: "DELETE" });
}