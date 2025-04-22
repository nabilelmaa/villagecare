import db from "../database/db.js";

// -------------------------- Mark Volunteer As Favorite ----------------------------
export const addFavorite = async (req, res) => {
  const { volunteer_id } = req.body;
  const { id } = req.user;

  try {
    await db.query(
      `
        INSERT INTO favorite_volunteers (elder_id, volunteer_id)
        VALUES ($1, $2)
        ON CONFLICT (elder_id, volunteer_id) DO NOTHING
        `,
      [id, volunteer_id]
    );

    res.status(200).json({ message: "Volunteer added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Fetch Favorite Volunteer(s) ----------------------------
export const getFavorites = async (req, res) => {
  const { id } = req.user;

  try {
    const result = await db.query(
      `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          u.bio,
          u.gender,
          u.rating,
          u.review_count,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', s.id,
              'name_en', s.name_en,
              'name_ar', s.name_ar,
              'name_fr', s.name_fr
            )) FILTER (WHERE s.id IS NOT NULL), 
            '[]'
          ) AS services,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'day_of_week', a.day_of_week,
              'time_of_day', a.time_of_day
            )) FILTER (WHERE a.id IS NOT NULL), 
            '[]'
          ) AS availabilities
        FROM favorite_volunteers f
        JOIN users u ON f.volunteer_id = u.id
        LEFT JOIN user_services us ON u.id = us.user_id AND us.selected = true
        LEFT JOIN services s ON us.service_id = s.id
        LEFT JOIN availability a ON u.id = a.user_id
        WHERE f.elder_id = $1
        GROUP BY u.id
        ORDER BY u.rating DESC NULLS LAST
      `,
      [id]
    );

    res.status(200).json({ favorites: result.rows });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Remove Volunteer From Favorites ----------------------------
export const removeFavorite = async (req, res) => {
  const { id } = req.user;
  const { volunteerId } = req.params;

  try {
    await db.query(
      `
        DELETE FROM favorite_volunteers
        WHERE elder_id = $1 AND volunteer_id = $2
        `,
      [id, volunteerId]
    );

    res.status(200).json({ message: "Volunteer removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Check if a Volunteer Is Favorite ----------------------------
export const isFavoriteVolunteer = async (req, res) => {
  const { id } = req.user;
  const { volunteerId } = req.params;

  try {
    const result = await db.query(
      `
        SELECT 1 FROM favorite_volunteers
        WHERE elder_id = $1 AND volunteer_id = $2
        `,
      [id, volunteerId]
    );

    const isFavorite = result.rowCount > 0;

    res.status(200).json({ isFavorite });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
