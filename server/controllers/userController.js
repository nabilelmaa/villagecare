import db from "../database/db.js";
import bcrypt from "bcryptjs";

// -------------------------- Getting User Data ----------------------------

export const getUserData = async (req, res) => {
  try {
    const { id } = req.user;

    // get the user
    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Update User Personal Info ----------------------------

export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.user;
    const { first_name, last_name, phone_number, gender, city, bio } = req.body;

    // checking if user exists
    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // update
    const updatedUser = await db.query(
      `UPDATE users 
           SET first_name = $1, last_name = $2, phone_number = $3, city = $4, bio = $5, gender = $6
           WHERE id = $7 
           RETURNING *`,
      [
        first_name,
        last_name,
        phone_number,
        city?.toLowerCase().trim(),
        bio,
        gender,
        id,
      ]
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.error("Error updating user info:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Update User Role ----------------------------
// this is needed to give the flexibility to users to be either elders or volunteers.

export const updateUserRole = async (req, res) => {
  const { id } = req.user;
  const { role } = req.body;

  if (!["elder", "volunteer"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    await db.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, id]);

    res.status(200).json({ message: "Role updated", role });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Update User Password ----------------------------
export const updatePassword = async (req, res) => {
  const { id } = req.user;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await db.query("SELECT password FROM users WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // comparing current password
    const valid = await bcrypt.compare(current_password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // hashing and updating new password
    const newHashedPassword = await bcrypt.hash(new_password, 10);

    await db.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [newHashedPassword, id]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
