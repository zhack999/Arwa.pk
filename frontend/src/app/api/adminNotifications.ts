import { apiFetch } from "./client";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const data = await apiFetch("/notifications/admin");
  return data.notifications;
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/admin/${id}/read`, { method: "PATCH" });
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  await apiFetch("/notifications/admin/read-all", { method: "PATCH" });
}

export async function deleteAdminNotification(id: string): Promise<void> {
  await apiFetch(`/notifications/admin/${id}`, { method: "DELETE" });
}