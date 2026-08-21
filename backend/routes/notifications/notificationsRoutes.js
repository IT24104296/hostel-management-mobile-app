const express = require("express");
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../../controllers/notifications/notificationController");

const auth = require("../../middlewares/UserAuth/auth.middleware");

// Static routes first
router.get("/", auth, getNotifications);
router.get("/unread-count", auth, getUnreadCount);

// Specific parameterized routes BEFORE catch-all routes
router.put("/:id/read", auth, markAsRead);        // ← Must come before /:id
router.put("/mark-all-read", auth, markAllAsRead);

// Delete routes
router.delete("/all", auth, clearAllNotifications);   // specific first
router.delete("/:id", auth, deleteNotification);      // catch-all last

module.exports = router;