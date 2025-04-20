import db from "../database/db.js";

// -------------------------- Fetch Notifications ----------------------------
export const getUserNotifications = async (req, res) => {
  const { id } = req.user;

  try {
    const result = await db.query(
      `
          SELECT id, type, message, is_read, created_at
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
        `,
      [id]
    );

    res.status(200).json({ notifications: result.rows });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Mark Notification As Read ----------------------------
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.user;
  const { notificationId } = req.params;

  try {
    const result = await db.query(
      `
          UPDATE notifications
          SET is_read = true
          WHERE id = $1 AND user_id = $2
          RETURNING *
        `,
      [notificationId, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Fetch Unread Notifications ----------------------------
export const getUnreadNotifications = async (req, res) => {
  const { id } = req.user;

  try {
    const result = await db.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [id]
    );

    const count = parseInt(result.rows[0].count, 10);

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
