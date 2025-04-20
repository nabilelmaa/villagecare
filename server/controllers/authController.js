import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database/db.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const saltRounds = 10;
// -------------------------- Login ----------------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log(email);
  console.log(password);

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstname: user.first_name,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    console.log("Token: ", token);

    return res.json({
      success: true,
      token,
      userType: user.usertype,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.first_name,
        lastname: user.last_name,
        phoneNumber: user.phone_number,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during authentication" });
  }
};

// -------------------------- Register ----------------------------

export const register = async (req, res) => {
  const { first_name, last_name, email, phone_number, password, gender } =
    req.body;

  try {
    // checking if the email already exists
    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // inserting new user into the database
    const newUser = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, phone_number, gender)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        first_name,
        last_name,
        email.toLowerCase().trim(),
        hashedPassword,
        phone_number,
        gender,
      ]
    );

    return res.status(201).json({
      success: true,
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).send({ message: "Server Error" });
  }
};

// -------------------------- Validating the Token ----------------------------

export const validateToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    console.log(token);
    const { header } = jwt.decode(token, { complete: true });

    if (!header) {
      return res.status(400).json({ error: "Invalid token format" });
    }

    // verifying the token using  JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({ valid: true, decoded });
  } catch (error) {
    console.error("Error during token validation:", error);
    res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
};
