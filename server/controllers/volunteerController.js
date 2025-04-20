import db from "../database/db.js";

// -------------------------- Get All Volunteers ----------------------------
export const getAllVolunteers = async (req, res) => {
  try {
    const result = await db.query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          u.bio,
          u.gender,
          u.city,
          u.rating,
          u.review_count,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'description', s.description
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
        FROM users u
        LEFT JOIN user_services us ON u.id = us.user_id AND us.selected = true
        LEFT JOIN services s ON us.service_id = s.id
        LEFT JOIN availability a ON u.id = a.user_id
        WHERE u.role = 'volunteer' AND us.selected = true
        GROUP BY u.id
        ORDER BY u.rating DESC NULLS LAST;
      `);

    res.status(200).json({ volunteers: result.rows });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Match Volunteers with Elders ----------------------------
export const getVolunteerMatches = async (req, res) => {
  const { id } = req.user;

  try {
    // Step 1: Fetch elder's preferences
    const elderQuery = await db.query(
      `
        SELECT 
          u.gender AS elder_gender,
          LOWER(TRIM(u.city)) AS city,
          array_agg(DISTINCT us.service_id) AS elder_services,
          array_agg(DISTINCT a.day_of_week || '-' || a.time_of_day) AS elder_availability
        FROM users u
        LEFT JOIN user_services us ON u.id = us.user_id AND us.selected = true
        LEFT JOIN availability a ON u.id = a.user_id
        WHERE u.id = $1
        GROUP BY u.id
      `,
      [id]
    );

    if (elderQuery.rows.length === 0) {
      return res.status(404).json({ error: "Elder not found" });
    }

    const elder = elderQuery.rows[0];
    const elderServices = elder.elder_services || [];
    const elderAvailability = elder.elder_availability || [];
    const elderGender = elder.elder_gender;
    const elderCity = elder.city;

    // Step 2: Match volunteers with enforced city match
    const matchQuery = await db.query(
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
          u.city,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'description', s.description
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
        FROM users u
        JOIN user_services us ON u.id = us.user_id AND us.selected = true
        JOIN availability a ON u.id = a.user_id
        LEFT JOIN services s ON us.service_id = s.id
        WHERE u.role = 'volunteer'
          AND us.service_id = ANY($1)
          AND (a.day_of_week || '-' || a.time_of_day) = ANY($2)
          AND LOWER(TRIM(u.gender)) = LOWER(TRIM($3))
          AND LOWER(TRIM(u.city)) = LOWER(TRIM($4))
        GROUP BY u.id
        ORDER BY u.rating DESC NULLS LAST
      `,
      [elderServices, elderAvailability, elderGender, elderCity]
    );

    res.status(200).json({ volunteers: matchQuery.rows });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
