const express = require("express");
const cors = require("cors");
require("dotenv").config();

const coursesRouter = require("./routes/courses");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Routes
app.use("/api/courses", coursesRouter);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", db: "postgres" })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
