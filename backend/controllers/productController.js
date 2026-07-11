import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";

// =======================================================
// GET ALL PRODUCTS
// =======================================================

export const getProducts = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                p.*,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c
            ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            products: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });

    }
};

// =======================================================
// GET SINGLE PRODUCT
// =======================================================

export const getSingleProduct = async (req, res) => {
    try {

        const { slug } = req.params;

        const result = await pool.query(
            `
            SELECT
                p.*,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c
            ON p.category_id = c.id
            WHERE p.slug = $1
            `,
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.status(200).json({
            success: true,
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product."
        });

    }
};

// =======================================================
// CREATE PRODUCT
// =======================================================

export const createProduct = async (req, res) => {
    try {

        const {
            category_id,
            name,
            slug,
            subtitle,
            sku,
            description,
            ingredients,
            benefits,
            weight,
            brand,
            price,
            old_price,
            sale_price,
            discount,
            stock,
            sold,
            tags,
            featured,
            status = true
        } = req.body;

        let imageUrl = null;
        let imagePublicId = null;

        // Upload image to Cloudinary
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "arwa-products"
            });

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        if (!category_id || !name || !slug || !price || !sku) {
            return res.status(400).json({
                success: false,
                message: "Name, slug, SKU, category, and price are required."
            });
        }

        // tags may arrive as a JSON string (from form-data) — parse it safely
        let parsedTags = [];
        try {
            parsedTags = tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [];
        } catch {
            parsedTags = [];
        }

        const result = await pool.query(
            `
            INSERT INTO products
            (
                category_id,
                name,
                slug,
                subtitle,
                sku,
                description,
                ingredients,
                benefits,
                weight,
                brand,
                price,
                old_price,
                sale_price,
                discount,
                stock,
                sold,
                tags,
                featured,
                status,
                image_url,
                image_public_id
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
            )
            RETURNING *;
            `,
            [
                category_id,
                name,
                slug,
                subtitle || "",
                sku,
                description,
                ingredients,
                benefits,
                weight,
                brand,
                price,
                old_price || 0,
                sale_price,
                discount || 0,
                stock,
                sold || 0,
                JSON.stringify(parsedTags),
                featured,
                status,
                imageUrl,
                imagePublicId
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create product."
        });

    }
};
// =======================================================
// UPDATE PRODUCT
// =======================================================

export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const existing = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        let product = existing.rows[0];

        let imageUrl = product.image_url;
        let imagePublicId = product.image_public_id;

        // Upload new image if provided
        if (req.file) {

            // Delete old image
            if (imagePublicId) {
                await cloudinary.uploader.destroy(imagePublicId);
            }

            const uploadResult = await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "arwa-products",
                }
            );

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const {
            category_id,
            name,
            slug,
            subtitle,
            sku,
            description,
            ingredients,
            benefits,
            weight,
            brand,
            price,
            old_price,
            sale_price,
            discount,
            stock,
            sold,
            tags,
            featured,
            status
        } = req.body;

        let parsedTags = product.tags;
        if (tags !== undefined) {
            try {
                parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
            } catch {
                parsedTags = [];
            }
        }

        const result = await pool.query(
            `
            UPDATE products
            SET
                category_id=$1,
                name=$2,
                slug=$3,
                subtitle=$4,
                sku=$5,
                description=$6,
                ingredients=$7,
                benefits=$8,
                weight=$9,
                brand=$10,
                price=$11,
                old_price=$12,
                sale_price=$13,
                discount=$14,
                stock=$15,
                sold=$16,
                tags=$17,
                featured=$18,
                status=$19,
                image_url=$20,
                image_public_id=$21,
                updated_at=NOW()
            WHERE id=$22
            RETURNING *;
            `,
            [
                category_id,
                name,
                slug,
                subtitle,
                sku,
                description,
                ingredients,
                benefits,
                weight,
                brand,
                price,
                old_price,
                sale_price,
                discount,
                stock,
                sold,
                JSON.stringify(parsedTags),
                featured,
                status,
                imageUrl,
                imagePublicId,
                id
            ]
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update product."
        });

    }
};
// =======================================================
// DELETE PRODUCT
// =======================================================

export const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const existing = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const product = existing.rows[0];

        // Delete image from Cloudinary
        if (product.image_public_id) {
            await cloudinary.uploader.destroy(product.image_public_id);
        }

        // Delete product from database
        await pool.query(
            "DELETE FROM products WHERE id = $1",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product."
        });

    }
};