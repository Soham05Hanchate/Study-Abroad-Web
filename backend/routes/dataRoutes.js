/**
 * REST API for MongoDB-backed resources (students, counsellors, knowledge base).
 */

const express = require("express");
const mongoose = require("mongoose");
const { Student, Counsellor, KnowledgeBase } = require("../models");
const { isConnected } = require("../config/db");
const { requireAdminApiKey } = require("../middleware/adminAuth");

const router = express.Router();

const PROFILE_PATCH_KEYS = [
  "name",
  "email",
  "phone",
  "location",
  "education",
  "field",
  "institution",
  "gpa",
  "countries",
  "course",
  "intake",
  "ielts_status",
  "budget",
  "timeline",
  "sponsorship",
  "interest",
  "goal"
];

function dbRequired(res) {
  if (!isConnected()) {
    res.status(503).json({ error: "Database unavailable", details: "Set MONGODB_URI and restart the server." });
    return false;
  }
  return true;
}

/** GET /api/lead-stats — counts by tier for dashboards */
router.get("/lead-stats", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const [total, hot, warm, cold, newLeads] = await Promise.all([
      Student.countDocuments({}),
      Student.countDocuments({ "leadQualification.classification": "hot" }),
      Student.countDocuments({ "leadQualification.classification": "warm" }),
      Student.countDocuments({ "leadQualification.classification": "cold" }),
      Student.countDocuments({ status: "new" })
    ]);
    res.json({ total, hot, warm, cold, newLeads });
  } catch (err) {
    console.error("GET /api/lead-stats:", err);
    res.status(500).json({ error: "Failed to load stats", details: err.message });
  }
});

/** GET /api/students — list recent voice-session leads */
router.get("/students", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 30));
    const skip = Math.max(0, parseInt(String(req.query.skip), 10) || 0);
    const tier = typeof req.query.tier === "string" ? req.query.tier.toLowerCase() : "";
    const q = {};
    if (["hot", "warm", "cold"].includes(tier)) {
      q["leadQualification.classification"] = tier;
    }
    const [students, total] = await Promise.all([
      Student.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(q)
    ]);
    res.json({ students, total, skip, limit });
  } catch (err) {
    console.error("GET /api/students:", err);
    res.status(500).json({ error: "Failed to list students", details: err.message });
  }
});

/** GET /api/students/:publicId */
router.get("/students/:publicId", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const doc = await Student.findOne({ publicId: req.params.publicId.trim() }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ student: doc });
  } catch (err) {
    console.error("GET /api/students/:id:", err);
    res.status(500).json({ error: "Failed to fetch student", details: err.message });
  }
});

/**
 * PATCH /api/students/:publicId — CRM updates (status, assignment, notes, profile fixes).
 * Secured by obscurity of publicId; add auth when you expose this beyond trusted networks.
 */
router.patch("/students/:publicId", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const publicId = req.params.publicId.trim();
    const body = req.body || {};
    const $set = {};

    if (body.status && ["new", "contacted", "closed"].includes(body.status)) {
      $set.status = body.status;
    }

    if ("assignedCounsellorId" in body) {
      const v = body.assignedCounsellorId;
      $set.assignedCounsellorId =
        v === null || v === "" ? null : typeof v === "string" ? v.trim() : String(v);
    }

    if (body.leadQualification && typeof body.leadQualification === "object") {
      const lq = body.leadQualification;
      if (typeof lq.notes === "string") $set["leadQualification.notes"] = lq.notes;
      if (typeof lq.followUp === "string") $set["leadQualification.followUp"] = lq.followUp;
    }

    if (body.profile && typeof body.profile === "object") {
      for (const k of PROFILE_PATCH_KEYS) {
        if (typeof body.profile[k] === "string") {
          $set[`profile.${k}`] = body.profile[k];
        }
      }
    }

    if (!Object.keys($set).length) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await Student.findOneAndUpdate(
      { publicId },
      { $set },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ student: updated });
  } catch (err) {
    console.error("PATCH /api/students/:id:", err);
    res.status(500).json({ error: "Failed to update student", details: err.message });
  }
});

/** POST /api/counsellors/login — verify portal ID + email against MongoDB (no password yet) */
router.post("/counsellors/login", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const { counsellorId, email, name } = req.body || {};
    if (!counsellorId || typeof counsellorId !== "string" || !counsellorId.trim()) {
      return res.status(400).json({ error: "counsellorId is required" });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "email is required" });
    }

    const idNorm = counsellorId.trim();
    const emailNorm = email.trim().toLowerCase();

    const doc = await Counsellor.findOne({
      counsellorId: idNorm,
      email: emailNorm,
      isActive: true
    })
      .select("-passwordHash")
      .lean();

    if (!doc) {
      return res.status(401).json({ error: "Invalid credentials", details: "Counsellor ID or email not found." });
    }

    if (name && typeof name === "string" && doc.name && doc.name.trim()) {
      if (name.trim().toLowerCase() !== doc.name.trim().toLowerCase()) {
        return res.status(401).json({ error: "Invalid credentials", details: "Name does not match records." });
      }
    }

    res.json({ ok: true, counsellor: doc });
  } catch (err) {
    console.error("POST /api/counsellors/login:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

/** GET /api/counsellors — active portal users */
router.get("/counsellors", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const list = await Counsellor.find({ isActive: true })
      .select("-passwordHash")
      .sort({ name: 1 })
      .lean();
    res.json({ counsellors: list });
  } catch (err) {
    console.error("GET /api/counsellors:", err);
    res.status(500).json({ error: "Failed to list counsellors", details: err.message });
  }
});

/** POST /api/counsellors — register (requires ADMIN_API_KEY when set) */
router.post("/counsellors", requireAdminApiKey, async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const { counsellorId, name, email, phone, role, department } = req.body || {};
    if (!counsellorId || typeof counsellorId !== "string" || !counsellorId.trim()) {
      return res.status(400).json({ error: "counsellorId is required" });
    }
    const created = await Counsellor.create({
      counsellorId: counsellorId.trim(),
      name: typeof name === "string" ? name.trim() : "",
      email: typeof email === "string" ? email.trim().toLowerCase() : "",
      phone: typeof phone === "string" ? phone.trim() : "",
      role: role === "admin" ? "admin" : "counsellor",
      department: typeof department === "string" ? department.trim() : ""
    });
    const out = created.toObject();
    delete out.passwordHash;
    res.status(201).json({ counsellor: out });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Counsellor ID or email already exists" });
    }
    console.error("POST /api/counsellors:", err);
    res.status(500).json({ error: "Failed to create counsellor", details: err.message });
  }
});

/** GET /api/knowledge/search?q= — register before /knowledge */
router.get("/knowledge/search", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");
    const items = await KnowledgeBase.find({
      isPublished: true,
      $or: [{ title: rx }, { content: rx }, { summary: rx }, { tags: rx }]
    })
      .sort({ priority: -1, updatedAt: -1 })
      .limit(15)
      .lean();
    res.json({ articles: items });
  } catch (err) {
    console.error("GET /api/knowledge/search:", err);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

/** GET /api/knowledge — published articles */
router.get("/knowledge", async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const q = { isPublished: true };
    if (category) q.category = category;
    const items = await KnowledgeBase.find(q).sort({ priority: -1, updatedAt: -1 }).limit(limit).lean();
    res.json({ articles: items, count: items.length });
  } catch (err) {
    console.error("GET /api/knowledge:", err);
    res.status(500).json({ error: "Failed to list knowledge base", details: err.message });
  }
});

/** POST /api/knowledge — add article (requires ADMIN_API_KEY when set) */
router.post("/knowledge", requireAdminApiKey, async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const { title, content, summary, category, tags, language, sourceUrl, slug, isPublished, priority } =
      req.body || {};
    if (!title || typeof title !== "string" || !content || typeof content !== "string") {
      return res.status(400).json({ error: "title and content are required" });
    }
    const created = await KnowledgeBase.create({
      title: title.trim(),
      slug: typeof slug === "string" && slug.trim() ? slug.trim().toLowerCase().replace(/\s+/g, "-") : undefined,
      content: String(content),
      summary: typeof summary === "string" ? summary : "",
      category: typeof category === "string" && category.trim() ? category.trim() : "general",
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      language: ["en", "hi", "mr", "multi"].includes(language) ? language : "en",
      sourceUrl: typeof sourceUrl === "string" ? sourceUrl : "",
      isPublished: isPublished !== false,
      priority: typeof priority === "number" ? priority : 0
    });
    res.status(201).json({ article: created.toObject() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Slug must be unique" });
    }
    console.error("POST /api/knowledge:", err);
    res.status(500).json({ error: "Failed to create article", details: err.message });
  }
});

/** PATCH /api/knowledge/:id — update article by Mongo _id */
router.patch("/knowledge/:id", requireAdminApiKey, async (req, res) => {
  if (!dbRequired(res)) return;
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid article id" });
    }
    const body = req.body || {};
    const $set = {};
    if (typeof body.title === "string") $set.title = body.title.trim();
    if (typeof body.content === "string") $set.content = body.content;
    if (typeof body.summary === "string") $set.summary = body.summary;
    if (typeof body.category === "string" && body.category.trim()) $set.category = body.category.trim();
    if (Array.isArray(body.tags)) $set.tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
    if (["en", "hi", "mr", "multi"].includes(body.language)) $set.language = body.language;
    if (typeof body.sourceUrl === "string") $set.sourceUrl = body.sourceUrl;
    if (typeof body.isPublished === "boolean") $set.isPublished = body.isPublished;
    if (typeof body.priority === "number") $set.priority = body.priority;
    if (typeof body.slug === "string" && body.slug.trim()) {
      $set.slug = body.slug.trim().toLowerCase().replace(/\s+/g, "-");
    }

    if (!Object.keys($set).length) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await KnowledgeBase.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ article: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Slug must be unique" });
    }
    console.error("PATCH /api/knowledge/:id:", err);
    res.status(500).json({ error: "Failed to update article", details: err.message });
  }
});

module.exports = router;
