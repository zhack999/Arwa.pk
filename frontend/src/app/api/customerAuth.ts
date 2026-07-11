import { apiFetch } from "./client";

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export async function registerApi(payload: { first_name: string; last_name: string; email: string; phone?: string; password: string }): Promise<Customer> {
  const data = await apiFetch("/customers/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function loginCustomerApi(email: string, password: string): Promise<Customer> {
  const data = await apiFetch("/customers/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function logoutCustomerApi(): Promise<void> {
  await apiFetch("/customers/logout", { method: "POST" });
}

export async function checkCustomerAuthApi(): Promise<Customer> {
  const data = await apiFetch("/customers/check");
  return data.user;
}