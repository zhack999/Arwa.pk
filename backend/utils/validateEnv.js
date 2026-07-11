const REQUIRED = [
  "PORT", "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME",
  "JWT_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
  "FRONTEND_URL", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
];

export function validateEnv() {
  const missing = REQUIRED.filter(key => !process.env[key] || process.env[key].trim() === "");
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error("❌ JWT_SECRET is too short (minimum 32 characters) — refusing to start.");
    process.exit(1);
  }
}