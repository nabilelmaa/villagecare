import jwt from "jsonwebtoken";
import db from "../database/db.js";

export const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token is missing" });
  }

  try {
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) {
      return res.status(401).json({ error: "Invalid token structure" });
    }

    // Verify the token with your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    if (!email) {
      return res.status(401).json({ error: "Email not found in the token" });
    }

    // Query PostgreSQL for the user
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // Assign the user to req.user
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error("Error during authentication:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }

    return res.status(401).json({ error: "Invalid token or user not found" });
  }
};
