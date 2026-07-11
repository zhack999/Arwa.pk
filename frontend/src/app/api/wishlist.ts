import { apiFetch } from "./client";

// Returns the array of product IDs saved in the logged-in customer's wishlist
export async function fetchWishlist(): Promise<string[]> {
  const data = await apiFetch("/wishlist/mine");
  return data.productIds;
}

export async function addWishlistItem(productId: string): Promise<void> {
  await apiFetch("/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function removeWishlistItem(productId: string): Promise<void> {
  await apiFetch(`/wishlist/${productId}`, { method: "DELETE" });
}
