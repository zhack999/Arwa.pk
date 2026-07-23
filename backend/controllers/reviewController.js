import pool from "../config/db.js";

// GET /api/reviews/:productId — public, but knows "is this mine?" if logged in
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.customer?.id || null;

    // name comes from a join against users, not a stored column — so it can't go stale
    // if the customer later changes their name.
    const reviewsResult = await pool.query(
      `SELECT r.id, r.rating, r.title, r.review AS text, r.verified, r.created_at, r.user_id,
              TRIM(u.first_name || ' ' || u.last_name) AS name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const s = (await pool.query(
      `SELECT COUNT(*)::int AS count, COALESCE(AVG(rating),0)::float AS avg,
              COUNT(*) FILTER (WHERE rating = 5) AS s5, COUNT(*) FILTER (WHERE rating = 4) AS s4,
              COUNT(*) FILTER (WHERE rating = 3) AS s3, COUNT(*) FILTER (WHERE rating = 2) AS s2,
              COUNT(*) FILTER (WHERE rating = 1) AS s1
       FROM reviews WHERE product_id = $1`,
      [productId]
    )).rows[0];

    res.status(200).json({
      success: true,
      reviews: reviewsResult.rows.map(r => ({ ...r, is_mine: !!customerId && r.user_id === customerId })),
      summary: {
        avg: Math.round(Number(s.avg) * 10) / 10,
        count: s.count,
        breakdown: { 5: Number(s.s5), 4: Number(s.s4), 3: Number(s.s3), 2: Number(s.s2), 1: Number(s.s1) },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch reviews." });
  }
};

// GET /api/reviews/summary/all — public, used to show real star ratings on Shop/Home grids
export const getAllRatingSummaries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT product_id, COUNT(*)::int AS count, COALESCE(AVG(rating),0)::float AS avg
       FROM reviews GROUP BY product_id`
    );
    const summary = {};
    for (const row of result.rows) summary[row.product_id] = { avg: Math.round(Number(row.avg) * 10) / 10, count: row.count };
    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch rating summaries." });
  }
};

// POST /api/reviews/:productId — customer auth required, one review per product
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, text } = req.body;

    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: "Review text is required." });

    const dupe = await pool.query("SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2", [productId, req.customer.id]);
    if (dupe.rows.length > 0) return res.status(400).json({ success: false, message: "You've already reviewed this product." });

    const userRow = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [req.customer.id]);
    const u = userRow.rows[0];
    if (!u) return res.status(404).json({ success: false, message: "Account not found." });
    const name = `${u.first_name} ${u.last_name}`.trim() || "Anonymous";

    const verifiedCheck = await pool.query(
      `SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id
       WHERE o.customer_email = $1 AND oi.product_id = $2 AND o.order_status = 'delivered' LIMIT 1`,
      [u.email, productId]
    );

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, title, review, rating, verified)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, product_id, user_id, title, review AS text, rating, verified, created_at`,
      [productId, req.customer.id, title || null, text.trim(), rating, verifiedCheck.rows.length > 0]
    );

    res.status(201).json({ success: true, review: { ...result.rows[0], name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Failed to submit review." });
  }
};

// DELETE /api/reviews/:reviewId — own review only
export const deleteReview = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id", [req.params.reviewId, req.customer.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Review not found." });
    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete review." });
  }
};
