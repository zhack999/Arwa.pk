import { apiFetch } from "./client";

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export async function loginApi(email: string, password: string): Promise<Admin> {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return data.admin;
}

export async function logoutApi(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}

export async function checkAuthApi(): Promise<Admin> {
  const data = await apiFetch("/auth/check");
  return data.admin;
}