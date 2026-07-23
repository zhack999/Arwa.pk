import pool from "../config/db.js";

// ==========================================
// GET DASHBOARD STATS
// ==========================================

export const getDashboardStats = async (req, res) => {
    try {

        // Revenue is counted from delivered orders only, matching how the
        // admin Overview/Reports UI has always defined "Total Revenue".
        const orderTotalsResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total_orders,
                COUNT(*) FILTER (WHERE order_status IN ('pending','processing'))::int AS pending_orders,
                COALESCE(SUM(total) FILTER (WHERE order_status = 'delivered'), 0)::numeric AS total_revenue
            FROM orders
        `);

        // Last 14 days of delivered revenue, bucketed by day, zero-filled so the
        // chart doesn't skip days with no deliveries.
        const revenueByDayResult = await pool.query(`
            SELECT
                to_char(d.day, 'DD Mon') AS date,
                COALESCE(SUM(o.total), 0)::numeric AS revenue,
                COUNT(o.id)::int AS orders
            FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
            LEFT JOIN orders o
                ON o.order_status = 'delivered'
                AND DATE(o.created_at) = d.day
            GROUP BY d.day
            ORDER BY d.day ASC
        `);

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
                totalOrders: orderTotalsResult.rows[0].total_orders,
                pendingOrders: orderTotalsResult.rows[0].pending_orders,
                totalRevenue: Number(orderTotalsResult.rows[0].total_revenue),
                revenueByDay: revenueByDayResult.rows.map(r => ({
                    date: r.date,
                    revenue: Number(r.revenue),
                    orders: r.orders,
                })),
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