const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/courses - list courses
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM courses WHERE is_published = true ORDER BY created_at DESC LIMIT 50"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/courses/:slug - course detail with relations
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    // 1. Fetch Course
    const courseRes = await db.query("SELECT * FROM courses WHERE slug = $1", [
      slug,
    ]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    const course = courseRes.rows[0];

    // 2. Fetch Benefits
    const benefitsRes = await db.query(
      "SELECT * FROM course_benefits WHERE course_id = $1 ORDER BY order_index ASC",
      [course.id]
    );
    course.benefits = benefitsRes.rows;

    // 3. Fetch Curriculum (Modules + Lessons)
    // This is a bit more complex in SQL. We can do two queries or a join.
    // Let's do two queries for simplicity and clarity.
    const modulesRes = await db.query(
      "SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index ASC",
      [course.id]
    );
    const modules = modulesRes.rows;

    for (let mod of modules) {
      const lessonsRes = await db.query(
        "SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index ASC",
        [mod.id]
      );
      mod.lessons = lessonsRes.rows.map((l) => l.title); // Just titles for now as per frontend
    }
    course.curriculum = modules.map((m) => ({
      module: m.title,
      lessons: m.lessons,
    }));

    // 4. Fetch Instructor (First one for now)
    const instructorRes = await db.query(
      `SELECT i.* FROM instructors i
       JOIN course_instructors ci ON i.id = ci.instructor_id
       WHERE ci.course_id = $1 LIMIT 1`,
      [course.id]
    );
    course.instructor = instructorRes.rows[0] || null;

    // 5. Format for Frontend
    // The frontend expects specific keys like 'features' which might be hardcoded or stored in JSON
    // For now, we'll return the raw DB structure + mapped fields
    const response = {
      ...course,
      features: [
        "Accès à vie au contenu",
        "Certificat de réussite",
        "Support prioritaire",
        "Ressources téléchargeables",
      ], // Hardcoded for now or add to DB
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
