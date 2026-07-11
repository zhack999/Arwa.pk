import { apiFetch } from "./client";

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal: string | null;
  country: string;
  is_default: boolean;
}

export async function fetchAddresses(): Promise<Address[]> {
  const data = await apiFetch("/customers/addresses");
  return data.addresses;
}

export async function addAddressApi(payload: Omit<Address, "id" | "is_default"> & { isDefault?: boolean }): Promise<Address> {
  const data = await apiFetch("/customers/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.address;
}

export async function updateAddressApi(id: string, payload: Omit<Address, "id" | "is_default"> & { isDefault?: boolean }): Promise<Address> {
  const data = await apiFetch(`/customers/addresses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.address;
}

export async function deleteAddressApi(id: string): Promise<void> {
  await apiFetch(`/customers/addresses/${id}`, { method: "DELETE" });
}

export async function setDefaultAddressApi(id: string): Promise<Address> {
  const data = await apiFetch(`/customers/addresses/${id}/default`, { method: "PUT" });
  return data.address;
}