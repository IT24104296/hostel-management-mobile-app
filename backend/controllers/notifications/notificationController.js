const Notification = require("../../models/notifications/Notification");
const Student = require("../../models/student/Student");

// ====================== GET ALL NOTIFICATIONS ======================
// ====================== GET ALL NOTIFICATIONS ======================
const getNotifications = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await Notification.find({
      $or: [
        { user: req.userId },     // Personal notifications
        { user: null }            // System-wide notifications (due/overdue)
      ]
    })
      .sort({ createdAt: -1 })
      .populate("relatedStudent", "fullName studentId")
      .populate("relatedPayment", "amount dueDate status");

    res.json({ 
      success: true, 
      notifications 
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ====================== GET UNREAD COUNT ======================
const getUnreadCount = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const count = await Notification.countDocuments({
      user: req.userId,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== MARK AS READ ======================
// ====================== MARK AS READ ======================
const markAsRead = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { user: req.userId },      // Personal notifications
          { user: null }             // System-wide notifications (Payment Received, Due, Overdue)
        ]
      },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark as Read Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== MARK ALL AS READ ======================
// ====================== MARK ALL AS READ (DEBUG VERSION) ======================
// ====================== MARK ALL AS READ (Fixed) ======================
const markAllAsRead = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Mark as read BOTH personal notifications AND system-wide notifications
    const result = await Notification.updateMany(
      {
        $or: [
          { user: req.userId },      // Personal notifications
          { user: null }             // System-wide (due/overdue) notifications
        ],
        isRead: false
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    console.log(`✅ Mark All as Read success. Updated ${result.modifiedCount} notifications`);

    res.json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark All as Read Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== CREATE NOTIFICATION (Internal Use) ======================
// ====================== CREATE NOTIFICATION ======================
const createNotification = async (userId, title, message, type, relatedStudent = null, relatedPayment = null) => {
  try {
    const notification = await Notification.create({
      user: userId,           // null = visible to all admins
      title,
      message,
      type,
      relatedStudent,
      relatedPayment,
    });

    console.log(`✅ Notification created: ${title} (for student: ${relatedStudent || 'system'})`);
    return notification;

  } catch (error) {
    console.error("Create Notification Error:", error);
    return null;
  }
};

// ====================== DELETE NOTIFICATION ======================
const deleteNotification = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== GENERATE DUE & OVERDUE NOTIFICATIONS (1 Document per Student) ======================
const generateDueNotifications = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get students with due or overdue payments
    const students = await Student.find({
      status: "active",
      isDeleted: false,
      nextDueDate: { $lte: today },
    }).populate("room", "roomNumber");

    if (students.length === 0) {
      console.log("✅ No due/overdue students found");
      return 0;
    }

    let createdCount = 0;

    for (const student of students) {
      const isOverdue = new Date(student.nextDueDate) < today;

      const title = isOverdue ? "Payment Overdue ⚠️" : "Payment Due Today";
      const message = isOverdue
        ? `${student.fullName} has an overdue payment (Due: ${new Date(student.nextDueDate).toLocaleDateString("en-GB")})`
        : `${student.fullName}'s rent is due today`;

      // Check if a notification for this student already exists today
      const existing = await Notification.findOne({
        relatedStudent: student._id,
        createdAt: { $gte: today },
      });

      if (!existing) {
        // Create ONE notification per student (visible to all admins)
        await createNotification(
          null,                                // user = null → visible to everyone
          title,
          message,
          isOverdue ? "overdue" : "payment_due",
          student._id,
          null
        );
        createdCount++;
      }
    }

    console.log(`✅ Cron Job: Created ${createdCount} due/overdue notifications (1 per student)`);
    return createdCount;
  } catch (error) {
    console.error("Generate Due Notifications Error:", error);
    return 0;
  }
};
// ====================== CLEAR ALL NOTIFICATIONS (FOR CURRENT USER) ======================
// ====================== CLEAR ALL NOTIFICATIONS ======================
const clearAllNotifications = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete BOTH personal notifications AND system-wide notifications
    const result = await Notification.deleteMany({
      $or: [
        { user: req.userId },     // Personal notifications for this admin
        { user: null }            // System-wide due/overdue notifications
      ]
    });

    console.log(`✅ Clear All: Deleted ${result.deletedCount} notifications`);

    res.json({
      success: true,
      message: "All notifications cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear All Notifications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  createNotification,
  deleteNotification,
  generateDueNotifications,
};