// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    name: { type: String },
    role: {
      type: String,
      enum: ["student", "coach", "admin"],
      default: "student",
    },
    profile: {
      bio: String,
      avatarUrl: String,
      phone: String,
      location: String,
    },
    stripeCustomerId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
