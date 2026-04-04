/**
 * Map API profile + lead objects into a Student document; trim messages for storage.
 */

const crypto = require("crypto");

const MAX_MESSAGES = 120;

function generatePublicId() {
  const part = crypto.randomBytes(3).toString("hex").toUpperCase();
  const tail = Date.now().toString(36).slice(-4).toUpperCase();
  return `FE-${part}-${tail}`;
}

function unknownToEmpty(v) {
  if (v == null || v === "unknown") return "";
  return String(v);
}

/**
 * @param {object} profile - from shapeProfile (API)
 * @param {object} leadQualification - from buildLeadQualification
 * @param {{ role: string, content: string }[]} messages
 * @param {{ uiLanguage?: string }} [meta]
 */
function buildStudentPayload(profile, leadQualification, messages, meta = {}) {
  const snap = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

  return {
    publicId: generatePublicId(),
    profile: {
      name: unknownToEmpty(profile.name),
      email: unknownToEmpty(profile.email),
      phone: unknownToEmpty(profile.phone),
      location: unknownToEmpty(profile.location),
      education: unknownToEmpty(profile.education),
      field: unknownToEmpty(profile.field),
      institution: unknownToEmpty(profile.institution),
      gpa: unknownToEmpty(profile.gpa),
      countries: unknownToEmpty(profile.countries),
      course: unknownToEmpty(profile.course),
      intake: unknownToEmpty(profile.intake),
      ielts_status: unknownToEmpty(profile.ielts_status),
      budget: unknownToEmpty(profile.budget),
      timeline: unknownToEmpty(profile.timeline),
      sponsorship: unknownToEmpty(profile.sponsorship),
      interest: unknownToEmpty(profile.interest),
      goal: unknownToEmpty(profile.goal)
    },
    leadQualification: {
      score: Number(leadQualification.score) || 0,
      intentSeriousness: Number(leadQualification.intentSeriousness) || 0,
      financialReadiness: Number(leadQualification.financialReadiness) || 0,
      timelineUrgency: Number(leadQualification.timelineUrgency) || 0,
      classification: leadQualification.classification || "cold",
      followUp: leadQualification.followUp || "",
      notes: leadQualification.notes || ""
    },
    messagesSnapshot: snap,
    metadata: {
      uiLanguage: meta.uiLanguage || "",
      source: meta.source || "voice_assistant"
    }
  };
}

module.exports = {
  generatePublicId,
  buildStudentPayload
};
