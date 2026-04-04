/**
 * POST /chat, POST /api/chat — full client-held conversation + optional UI language.
 * POST /extract, POST /api/extract — structured English JSON from full conversation.
 */

const express = require("express");
const { normalizeMessages, chatWithHistory, extractProfile, shapeProfile } = require("../services/groqService");
const { buildLeadQualification } = require("../services/leadQualification");
const { isConnected } = require("../config/db");
const { Student } = require("../models");
const { buildStudentPayload } = require("../services/studentPersistence");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const messages = normalizeMessages(req.body?.messages);
    if (!messages.length) {
      return res.status(400).json({
        error: "Invalid request",
        details: 'Send a non-empty "messages" array: { role, content }.'
      });
    }

    const language =
      typeof req.body?.language === "string" && req.body.language.trim()
        ? req.body.language.trim()
        : "English";

    const reply = await chatWithHistory(messages, language);
    if (!reply) {
      return res.status(502).json({ error: "Empty reply", details: "Model returned no text." });
    }

    return res.json({ reply });
  } catch (err) {
    console.error("POST /chat:", err?.message || err);
    const code = err?.code;
    const status = code === "MISSING_GROQ_KEY" ? 503 : 500;
    return res.status(status).json({
      error: "Chat failed",
      details: err?.message || "Unknown error"
    });
  }
});

router.post("/extract", async (req, res) => {
  try {
    const messages = normalizeMessages(req.body?.messages);
    if (!messages.length) {
      return res.status(400).json({
        error: "Invalid request",
        details: 'Send a non-empty "messages" array for extraction.'
      });
    }

    const parsed = await extractProfile(messages);
    if (!parsed || typeof parsed !== "object") {
      return res.status(502).json({
        error: "Parse failed",
        details: "Could not parse JSON from the model."
      });
    }

    const leadQualification = buildLeadQualification(parsed);
    const profile = shapeProfile(parsed);
    if (!profile) {
      return res.status(502).json({
        error: "Parse failed",
        details: "Could not shape profile from parsed data."
      });
    }

    let studentPublicId = null;
    const persist = req.body?.persist !== false;
    if (persist && isConnected()) {
      try {
        const payload = buildStudentPayload(profile, leadQualification, messages, {
          uiLanguage: typeof req.body?.language === "string" ? req.body.language : "",
          source: typeof req.body?.source === "string" ? req.body.source : "voice_assistant"
        });
        const saved = await Student.create(payload);
        studentPublicId = saved.publicId;
      } catch (persistErr) {
        console.error("Student persist error:", persistErr.message);
      }
    }

    return res.json({ profile, leadQualification, studentPublicId });
  } catch (err) {
    console.error("POST /extract:", err?.message || err);
    const status = err?.code === "MISSING_GROQ_KEY" ? 503 : 500;
    return res.status(status).json({
      error: "Extract failed",
      details: err?.message || "Unknown error"
    });
  }
});

module.exports = router;
