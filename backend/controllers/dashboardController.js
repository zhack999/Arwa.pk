import pool from "../config/db.js";

// ==========================================
// GET DASHBOARD STATS
// (Only uses data that genuinely exists today: products + categories.
//  Revenue/Orders/Customer stats will be added once those tables exist —
//  see Phase 3/4 of the project plan.)
// ==========================================

export const getDashboardStats = async (req, res) => {
    try {

        const totalsResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total_products,
                COUNT(*) FILTER (WHERE stock = 0)::int AS out_of_stock,
                COUNT(*) FILTER (WHERE stock > 0 AND stock < 20)::int AS low_stock,
                COUNT(*) FILTER (WHERE status = true)::int AS active_products,
                COUNT(*) FILTER (WHERE status = false)::int AS draft_products,
                COUNT(*) FILTER (WHERE featured = true)::int AS featured_products
            FROM products
        `);

        const topCategoriesResult = await pool.query(`
            SELECT
                c.id,
                c.name,
                COUNT(p.id)::int AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            GROUP BY c.id, c.name
            ORDER BY product_count DESC
            LIMIT 5
        `);

        const lowStockListResult = await pool.query(`
            SELECT id, name, subtitle, sku, stock
            FROM products
            WHERE stock > 0 AND stock < 20
            ORDER BY stock ASC
            LIMIT 10
        `);

        const totalCategoriesResult = await pool.query(`
            SELECT COUNT(*)::int AS total_categories FROM categories
        `);

        res.status(200).json({
            success: true,
            stats: {
                totalProducts: totalsResult.rows[0].total_products,
                outOfStock: totalsResult.rows[0].out_of_stock,
                lowStock: totalsResult.rows[0].low_stock,
                activeProducts: totalsResult.rows[0].active_products,
                draftProducts: totalsResult.rows[0].draft_products,
                featuredProducts: totalsResult.rows[0].featured_products,
                totalCategories: totalCategoriesResult.rows[0].total_categories,
                topCategories: topCategoriesResult.rows,
                lowStockList: lowStockListResult.rows,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch dashboard stats."
        });
    }
};