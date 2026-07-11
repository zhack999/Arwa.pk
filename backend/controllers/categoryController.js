import pool from "../config/db.js";

// ==========================================
// GET ALL CATEGORIES
// ==========================================

export const getCategories = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM categories
            ORDER BY created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            categories: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories."
        });
    }
};

// ==========================================
// CREATE CATEGORY
// ==========================================

export const createCategory = async (req, res) => {
    try {

        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required."
            });
        }

        const result = await pool.query(
            `
            INSERT INTO categories
            (
                name,
                slug
            )
            VALUES
            (
                $1,
                $2
            )
            RETURNING *;
            `,
            [name, slug]
        );

        res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create category."
        });
    }
};
// ==========================================
// UPDATE CATEGORY
// ==========================================

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required."
            });
        }

        const result = await pool.query(
            `
            UPDATE categories
            SET name = $1, slug = $2
            WHERE id = $3
            RETURNING *;
            `,
            [name, slug, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to update category."
        });
    }
};

// ==========================================
// DELETE CATEGORY
// ==========================================

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM categories WHERE id = $1 RETURNING *;`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete category."
        });
    }
};