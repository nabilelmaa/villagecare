import db from "../database/db.js";

// -------------------------- Send Help Request ----------------------------
export const createRequest = async (req, res) => {
  const { id } = req.user;
  const {
    volunteer_id,
    service_id,
    day_of_week,
    time_of_day,
    details,
    urgent,
  } = req.body;

  if (!volunteer_id || !service_id || !day_of_week || !time_of_day) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.query(
      `
        INSERT INTO requests (
          elder_id,
          volunteer_id,
          service_id,
          day_of_week,
          time_of_day,
          details,
          urgent
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
      [
        id,
        volunteer_id,
        service_id,
        day_of_week,
        time_of_day,
        details || null,
        urgent || false,
      ]
    );

    res.status(201).json({ message: "Request sent successfully" });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Get Elder Requests ----------------------------
export const getElderRequests = async (req, res) => {
  const { id } = req.user;

  try {
    const result = await db.query(
      `
        SELECT 
          r.id,
          r.day_of_week,
          r.time_of_day,
          r.details,
          r.urgent,
          r.status,
          s.id AS service_id,
          s.name AS service_name,
          
          -- Elder Info
          e.first_name AS elder_first_name,
          e.last_name AS elder_last_name,
          e.profile_image_url AS elder_profile_image_url,
          e.gender AS elder_gender,
  
          -- Volunteer Info
          v.first_name AS volunteer_first_name,
          v.last_name AS volunteer_last_name,
          v.profile_image_url AS volunteer_profile_image_url,
          v.gender AS elder_gender,
          v.rating AS volunteer_rating,
          v.review_count AS volunteer_review_count
 
  
        FROM requests r
        JOIN services s ON r.service_id = s.id
        JOIN users e ON r.elder_id = e.id
        JOIN users v ON r.volunteer_id = v.id
        WHERE r.elder_id = $1
        ORDER BY r.created_at DESC
        `,
      [id]
    );

    res.status(200).json({ requests: result.rows });
  } catch (error) {
    console.error("Error fetching elder requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Get Volunteer Requests ----------------------------
export const getVolunteerRequests = async (req, res) => {
  const { id } = req.user;

  try {
    const result = await db.query(
      `
        SELECT 
          r.id,
          r.day_of_week,
          r.time_of_day,
          r.details,
          r.urgent,
          r.status,
          s.id AS service_id,
          s.name AS service_name,
  
          -- Elder Info
          e.first_name AS elder_first_name,
          e.last_name AS elder_last_name,
          e.profile_image_url AS elder_profile_image_url,
          e.gender AS elder_gender,
  
          -- Volunteer Info
          v.first_name AS volunteer_first_name,
          v.last_name AS volunteer_last_name,
          v.profile_image_url AS volunteer_profile_image_url,
          v.gender AS elder_gender,
          v.rating AS volunteer_rating,
          v.review_count AS volunteer_review_count
  
        FROM requests r
        JOIN services s ON r.service_id = s.id
        JOIN users e ON r.elder_id = e.id
        JOIN users v ON r.volunteer_id = v.id
        WHERE r.volunteer_id = $1
        ORDER BY r.created_at DESC
        `,
      [id]
    );

    res.status(200).json({ requests: result.rows });
  } catch (error) {
    console.error("Error fetching volunteer requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------------- Change Request Status ----------------------------
export const updateRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "canceled",
    "accepted",
    "rejected",
    "completed",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    // 1. Update the request
    const result = await db.query(
      `
          UPDATE requests
          SET status = $1
          WHERE id = $2
          RETURNING *
        `,
      [status, requestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const updatedRequest = result.rows[0];
    const elderId = updatedRequest.elder_id;
    const volunteerId = updatedRequest.volunteer_id;

    // 2. Fetch volunteer full name
    const volunteerResult = await db.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [volunteerId]
    );

    const volunteer = volunteerResult.rows[0];
    const fullName = `${volunteer.first_name} ${volunteer.last_name}`;

    // 3. Compose personalized message
    let message = null;
    let recipientId = elderId;

    switch (status) {
      case "accepted":
        message = `Your request has been accepted by ${fullName}.`;
        break;
      case "rejected":
        message = `Your request has been rejected by ${fullName}.`;
        break;
      case "canceled":
        message = `${fullName} has canceled your request.`;
        break;
      case "completed":
        message = `${fullName} marked your request as completed.`;
        break;
      default:
        break;
    }

    // 4. Insert notification
    if (message) {
      await db.query(
        `
            INSERT INTO notifications (user_id, type, message)
            VALUES ($1, $2, $3)
          `,
        [recipientId, `request_${status}`, message]
      );
    }

    res.status(200).json({
      message: "Request status updated",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
