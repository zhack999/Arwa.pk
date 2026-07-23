import { apiFetch } from "./client";

export interface TopCategory {
  id: string;
  name: string;
  product_count: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  subtitle: string | null;
  sku: string | null;
  stock: number;
}

export interface RevenueDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  activeProducts: number;
  draftProducts: number;
  featuredProducts: number;
  totalCategories: number;
  topCategories: TopCategory[];
  lowStockList: LowStockItem[];
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  revenueByDay: RevenueDay[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const data = await apiFetch("/dashboard/stats");
  return data.stats;
}