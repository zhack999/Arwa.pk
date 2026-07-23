import { apiFetch } from "./client";

export async function subscribeToNewsletter(email: string): Promise<{ alreadySubscribed: boolean; message: string }> {
  const data = await apiFetch("/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return { alreadySubscribed: !!data.alreadySubscribed, message: data.message };
}