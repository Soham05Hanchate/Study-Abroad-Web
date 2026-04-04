/**
 * Collection: counsellors
 * Portal users who review leads (Counsellor ID matches login flow in the React app).
 */

const mongoose = require("mongoose");

const counsellorSchema = new mongoose.Schema(
  {
    counsellorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: { type: String, default: "", trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    phone: { type: String, default: "", trim: true },
    role: {
      type: String,
      enum: ["counsellor", "admin"],
      default: "counsellor"
    },
    /** Set when you add bcrypt-based auth */
    passwordHash: { type: String, default: null, select: false },
    isActive: { type: Boolean, default: true },
    department: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counsellor", counsellorSchema);
