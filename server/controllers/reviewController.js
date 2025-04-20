import db from "../database/db.js";

// -------------------------- Getting Review For a Specific Volunteer ----------------------------

export const getReviewsForVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const reviewsResult = await db.query(
      `
        SELECT r.rating, r.comment, u.first_name as elder_first_name, u.last_name as elder_last_name, r.created_at
        FROM reviews r
        JOIN users u ON r.elder_id = u.id
        WHERE r.volunteer_id = $1
        ORDER BY r.created_at DESC
        `,
      [volunteerId]
    );

    if (reviewsResult.rows.length === 0) {
      return res
        .status(200)
        .json({ message: "No reviews found for this volunteer" });
    }

    const reviews = reviewsResult.rows;

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Adding a New eview  ----------------------------

export const addReview = async (req, res) => {
  try {
    const { id } = req.user;
    const { volunteer_id, rating, comment } = req.body;

    if (!volunteer_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid input" });
    }

    await db.query(
      `
      INSERT INTO reviews (elder_id, volunteer_id, rating, comment)
      VALUES ($1, $2, $3, $4)
    `,
      [id, volunteer_id, rating, comment]
    );

    // update volunteer's average rating and review count
    await db.query(
      `
      UPDATE users SET
        review_count = review_count + 1,
        rating = (
          SELECT ROUND(AVG(r.rating)::numeric, 1)
          FROM reviews r
          WHERE r.volunteer_id = $1
        )
      WHERE id = $1
    `,
      [volunteer_id]
    );

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
