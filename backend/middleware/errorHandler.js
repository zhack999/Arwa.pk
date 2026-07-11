export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: "Route Not Found" });
}

export function globalErrorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err);

  // Known, safe-to-expose validation/client errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON in request body." });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message || "File upload error." });
  }

  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? "Something went wrong. Please try again." : (err.message || "Internal server error"),
  });
}