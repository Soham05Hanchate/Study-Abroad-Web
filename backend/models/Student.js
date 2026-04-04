/**
 * Collection: students
 * Voice / chat sessions with extracted profile + lead qualification.
 */

const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    education: { type: String, default: "" },
    field: { type: String, default: "" },
    institution: { type: String, default: "" },
    gpa: { type: String, default: "" },
    countries: { type: String, default: "" },
    course: { type: String, default: "" },
    intake: { type: String, default: "" },
    ielts_status: { type: String, default: "" },
    budget: { type: String, default: "" },
    timeline: { type: String, default: "" },
    sponsorship: { type: String, default: "" },
    interest: { type: String, default: "" },
    goal: { type: String, default: "" }
  },
  { _id: false }
);

const leadQualificationSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    intentSeriousness: { type: Number, default: 0 },
    financialReadiness: { type: Number, default: 0 },
    timelineUrgency: { type: Number, default: 0 },
    classification: { type: String, enum: ["hot", "warm", "cold"], default: "cold" },
    followUp: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    profile: { type: profileSchema, default: () => ({}) },
    leadQualification: { type: leadQualificationSchema, default: () => ({}) },
    /** Trimmed transcript for audit / counsellor review */
    messagesSnapshot: { type: [messageSchema], default: [] },
    metadata: {
      uiLanguage: { type: String, default: "" },
      source: { type: String, default: "voice_assistant" }
    },
    assignedCounsellorId: { type: String, default: null, sparse: true, index: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new"
    }
  },
  { timestamps: true }
);

studentSchema.index({ createdAt: -1 });
studentSchema.index({ "leadQualification.classification": 1, createdAt: -1 });

module.exports = mongoose.model("Student", studentSchema);
