import express from "express";
import {
    getMyNotifications, markRead, markAllRead, deleteNotification,
    getAdminNotifications, markAdminRead, markAllAdminRead, deleteAdminNotification,
} from "../controllers/notificationController.js";
import customerAuthMiddleware from "../middleware/customerAuthMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", customerAuthMiddleware, getMyNotifications);
router.patch("/:id/read", customerAuthMiddleware, markRead);
router.patch("/read-all", customerAuthMiddleware, markAllRead);
router.delete("/:id", customerAuthMiddleware, deleteNotification);

router.get("/admin", authMiddleware, getAdminNotifications);
router.patch("/admin/:id/read", authMiddleware, markAdminRead);
router.patch("/admin/read-all", authMiddleware, markAllAdminRead);
router.delete("/admin/:id", authMiddleware, deleteAdminNotification);

export default router;