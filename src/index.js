const express = require("express");
const cors = require("cors");
require("dotenv").config();

const coursesRouter = require("./routes/courses");
const { router: authRouter } = require("./routes/auth");
const contactRouter = require("./routes/contact");
const bookingsRouter = require("./routes/bookings");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://coachme-eight.vercel.app", // Add your Vercel domain here
    ],
  })
);
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Routes
app.use("/api/courses", coursesRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);
app.use("/api/bookings", bookingsRouter);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", db: "postgres" })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
