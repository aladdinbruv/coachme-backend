const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("./auth");
const { logAction } = require("../utils/auditLogger");

// GET /api/bookings - List bookings for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT b.*, c.title as course_title 
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC
    `;
    let params = [req.user.id];

    // If admin, can see all bookings (optional logic)
    if (req.user.role === "admin") {
      query = `
        SELECT b.*, c.title as course_title, u.email as user_email, u.full_name as user_name
        FROM bookings b
        LEFT JOIN courses c ON b.course_id = c.id
        LEFT JOIN users u ON b.user_id = u.id
        ORDER BY b.booking_date DESC
      `;
      params = [];
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/bookings - Create a new booking
router.post("/", authenticateToken, async (req, res) => {
  const { courseId, bookingDate, notes } = req.body;

  if (!bookingDate) {
    return res.status(400).json({ error: "Booking date is required" });
  }

  try {
    const newBooking = await db.query(
      "INSERT INTO bookings (user_id, course_id, booking_date, notes) VALUES ($1, $2, $3, $4) RETURNING id",
      [req.user.id, courseId || null, bookingDate, notes]
    );

    const bookingId = newBooking.rows[0].id;

    // Log action
    await logAction({
      userId: req.user.id,
      action: "CREATE_BOOKING",
      entityType: "BOOKING",
      entityId: bookingId,
      ipAddress: req.ip,
      details: { courseId, bookingDate },
    });

    res
      .status(201)
      .json({ message: "Booking created successfully", id: bookingId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
