import { apiFetch } from "./client";

export interface Review {
  id: string; name: string; rating: number; title: string; text: string;
  date: string; verified: boolean; isMine: boolean;
}
export interface ReviewSummary { avg: number; count: number; breakdown: Record<number, number>; }

export async function fetchProductReviews(productId: string): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
  const data = await apiFetch(`/reviews/${productId}`);
  return {
    reviews: data.reviews.map((r: any) => ({
      id: r.id, name: r.name, rating: r.rating, title: r.title || "", text: r.text,
      date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      verified: r.verified, isMine: r.is_mine,
    })),
    summary: data.summary,
  };
}

export async function submitReview(productId: string, rating: number, title: string, text: string): Promise<void> {
  await apiFetch(`/reviews/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, title, text }),
  });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await apiFetch(`/reviews/${reviewId}`, { method: "DELETE" });
}

export async function fetchAllRatingSummaries(): Promise<Record<string, { avg: number; count: number }>> {
  const data = await apiFetch(`/reviews/summary/all`);
  return data.summary;
}