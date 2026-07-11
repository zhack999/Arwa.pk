import { apiFetch } from "./client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  created_at: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await apiFetch("/categories");
  return data.categories;
}

export async function createCategory(payload: { name: string; slug: string }): Promise<Category> {
  const data = await apiFetch("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.category;
}

export async function updateCategory(id: string, payload: { name: string; slug: string }): Promise<Category> {
  const data = await apiFetch(`/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch(`/categories/${id}`, { method: "DELETE" });
}