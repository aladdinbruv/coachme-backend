const express = require("express");
const router = express.Router();
const db = require("../db");
const { logAction } = require("../utils/auditLogger");

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required" });
  }

  try {
    const newSubmission = await db.query(
      "INSERT INTO contact_submissions (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, subject, message]
    );

    const submissionId = newSubmission.rows[0].id;

    // Log action (anonymous user)
    await logAction({
      userId: null,
      action: "SUBMIT_CONTACT_FORM",
      entityType: "CONTACT_SUBMISSION",
      entityId: submissionId,
      ipAddress: req.ip,
      details: { email },
    });

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
