// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: String,
  contentType: {
    type: String,
    enum: ["video", "article", "pdf"],
    default: "video",
  },
  duration: Number,
  mediaUrl: String,
  order: Number,
});

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    shortDescription: String,
    coverImageUrl: String,
    price: { type: Number, default: 0 },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lessons: [LessonSchema],
    tags: [String],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
