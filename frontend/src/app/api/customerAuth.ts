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

export async function registerApi(payload: { first_name: string; last_name: string; email: string; phone?: string; password: string }): Promise<{ email: string; message: string }> {
  // NOTE: registration no longer logs the customer in — the account is created
  // unverified and must be verified before login works. Returns the email so the
  // caller can route straight to the verify-email screen.
  const data = await apiFetch("/customers/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { email: data.email, message: data.message };
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

export async function logoutAllDevicesApi(): Promise<void> {
  await apiFetch("/customers/logout-all", { method: "POST" });
}

export async function checkCustomerAuthApi(): Promise<Customer> {
  const data = await apiFetch("/customers/check");
  return data.user;
}

// ── Email verification ──
export async function verifyEmailOtpApi(email: string, otp: string): Promise<Customer> {
  const data = await apiFetch("/customers/verify-email/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return data.user;
}

export async function verifyEmailTokenApi(email: string, token: string): Promise<Customer> {
  const data = await apiFetch("/customers/verify-email/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  return data.user;
}

export async function resendVerificationApi(email: string): Promise<string> {
  const data = await apiFetch("/customers/verify-email/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return data.message;
}

// ── Forgot / reset password ──
export async function forgotPasswordApi(email: string): Promise<string> {
  const data = await apiFetch("/customers/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return data.message;
}

export async function verifyResetOtpApi(email: string, otp: string): Promise<string> {
  // Returns a short-lived resetToken — hand this straight to resetPasswordApi, don't
  // persist it anywhere durable (sessionStorage/router state for the single navigation
  // to the reset screen is fine, localStorage is not).
  const data = await apiFetch("/customers/verify-reset-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return data.resetToken;
}

export async function resetPasswordApi(resetToken: string, newPassword: string): Promise<string> {
  const data = await apiFetch("/customers/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword }),
  });
  return data.message;
}

// ── Social login ──
export async function googleAuthApi(accessToken: string): Promise<Customer> {
  const data = await apiFetch("/customers/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  return data.user;
}

export async function facebookAuthApi(accessToken: string): Promise<Customer> {
  const data = await apiFetch("/customers/auth/facebook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  return data.user;
}

export interface AuthProviderConfig {
  google: boolean;
  facebook: boolean;
}

export async function fetchAuthConfig(): Promise<AuthProviderConfig> {
  const data = await apiFetch("/customers/auth-config");
  return data.providers;
}
