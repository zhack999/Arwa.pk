import { API_URL } from "../config";

// Every authenticated request in the app should go through this function.
// It automatically sends the login cookie, and if the backend says the
// session is invalid/expired (401), it tells the rest of the app so it
// can log the admin out and send them back to the login screen.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("admin-session-expired"));
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}