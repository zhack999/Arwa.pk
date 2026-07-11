import { apiFetch } from "./client";

export async function updateProfileApi(
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  date_of_birth?: string | null,
  gender?: string | null
) {
  const data = await apiFetch("/customers/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name, email, phone, date_of_birth: date_of_birth || null, gender: gender || null }),
  });
  return data.user;
}

export async function changePasswordApi(oldPassword: string, newPassword: string) {
  await apiFetch("/customers/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function uploadProfilePictureApi(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const data = await apiFetch("/customers/profile/picture", {
    method: "POST",
    body: formData,
  });
  return data.user;
}

export async function removeProfilePictureApi() {
  const data = await apiFetch("/customers/profile/picture", { method: "DELETE" });
  return data.user;
}