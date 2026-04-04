/**
 * Collection: knowledge_base
 * FAQs, policies, and counselling snippets for RAG or human reference.
 */

const mongoose = require("mongoose");

const knowledgeBaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, sparse: true, unique: true },
    summary: { type: String, default: "" },
    content: { type: String, required: true },
    category: {
      type: String,
      default: "general",
      index: true
    },
    tags: [{ type: String, trim: true }],
    language: {
      type: String,
      enum: ["en", "hi", "mr", "multi"],
      default: "en"
    },
    sourceUrl: { type: String, default: "" },
    isPublished: { type: Boolean, default: true, index: true },
    /** Higher sorts first in listings */
    priority: { type: Number, default: 0 },
    /** Optional embedding id if you plug in a vector store later */
    embeddingRef: { type: String, default: null }
  },
  { timestamps: true, collection: "knowledge_base" }
);

module.exports = mongoose.model("KnowledgeBase", knowledgeBaseSchema);
