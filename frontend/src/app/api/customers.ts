import { apiFetch } from "./client";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;      // not linked to addresses yet — blank until Phase 4's Address feature is built
  province: string;  // same as above
  orders: number;
  spent: number;
  points: number;     // loyalty points aren't built yet — always 0 for now
  status: "active" | "blocked"; // no ban/block system in the backend yet — always "active" for now
  vip: boolean;
  joined: string;
}

function toAdminCustomer(c: any): AdminCustomer {
  return {
    id: c.id,
    name: `${c.first_name} ${c.last_name}`.trim(),
    email: c.email,
    phone: c.phone || "",
    city: "",
    province: "",
    orders: c.order_count,
    spent: Number(c.total_spent),
    points: 0,
    status: "active",
    vip: Number(c.total_spent) > 5000,
    joined: new Date(c.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  const data = await apiFetch("/customers");
  return data.customers.map(toAdminCustomer);
}