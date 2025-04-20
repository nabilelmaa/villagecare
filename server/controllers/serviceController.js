import db from "../database/db.js";

// -------------------------- Getting User Offered Services ----------------------------

export const getServices = async (req, res) => {
  const { id } = req.user;

  try {
    // check user exists
    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // fetch all services and mark which are selected by the user
    const result = await db.query(
      `
        SELECT 
          s.id, 
          s.name, 
          s.description, 
          s.created_at, 
          s.updated_at,
          COALESCE(us.selected, false) AS selected
        FROM services s
        LEFT JOIN user_services us
          ON s.id = us.service_id AND us.user_id = $1
      `,
      [id]
    );

    res.status(200).json({ services: result.rows });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// -------------------------- Getting User Offered Services ----------------------------

export const updateUserServices = async (req, res) => {
  const { id } = req.user;
  const { services } = req.body;

  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ error: "Invalid services input" });
  }

  try {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const queries = services.map(({ service_id, selected }) => {
      return db.query(
        `
          INSERT INTO user_services (user_id, service_id, selected, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          ON CONFLICT (user_id, service_id)
          DO UPDATE SET selected = $3, updated_at = NOW()
        `,
        [id, service_id, selected]
      );
    });

    await Promise.all(queries);

    res.status(200).json({ message: "Services updated successfully" });
  } catch (error) {
    console.error("Error updating user services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Getting User Availabilities ----------------------------
export const getUserAvailability = async (req, res) => {
  const { id } = req.user;

  try {
    const allSlots = [];

    const weekdays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const timeSlots = ["morning", "afternoon", "evening"];

    for (const day of weekdays) {
      for (const time of timeSlots) {
        allSlots.push({ day_of_week: day, time_of_day: time });
      }
    }

    const result = await db.query(
      "SELECT day_of_week, time_of_day FROM availability WHERE user_id = $1",
      [id]
    );

    const selected = result.rows;

    const merged = allSlots.map((slot) => {
      const match = selected.find(
        (s) =>
          s.day_of_week === slot.day_of_week &&
          s.time_of_day === slot.time_of_day
      );

      return {
        ...slot,
        selected: !!match,
      };
    });

    res.status(200).json({ availability: merged });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Updating User Availabilities ----------------------------

export const updateUserAvailability = async (req, res) => {
  const { id } = req.user;
  const { availability } = req.body;

  try {
    await db.query("BEGIN");

    await db.query("DELETE FROM availability WHERE user_id = $1", [id]);

    const inserts = availability
      .filter((a) => a.selected)
      .map((a) => `('${id}', '${a.day_of_week}', '${a.time_of_day}')`)
      .join(", ");

    if (inserts.length > 0) {
      const insertQuery = `
          INSERT INTO availability (user_id, day_of_week, time_of_day)
          VALUES ${inserts}
        `;
      await db.query(insertQuery);
    }

    await db.query("COMMIT");
    res.status(200).json({ message: "Availability updated" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error updating availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
