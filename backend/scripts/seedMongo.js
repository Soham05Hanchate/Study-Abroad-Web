/**
 * Seed sample counsellors + knowledge base entries.
 * Usage: node scripts/seedMongo.js
 * Requires MONGODB_URI in .env
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const { connectMongo, disconnectMongo } = require("../config/db");
const { Counsellor, KnowledgeBase } = require("../models");

async function run() {
  await connectMongo();
  if (!process.env.MONGODB_URI?.trim()) {
    console.error("Set MONGODB_URI first.");
    process.exit(1);
  }

  const seeds = [
    {
      counsellorId: "FE-COUNS-001",
      name: "Demo Counsellor",
      email: "counsellor@example.com",
      role: "counsellor",
      department: "UK & Ireland",
      isActive: true
    },
    {
      counsellorId: "FATH-2024",
      name: "Portal Demo User",
      email: "counsellor@fateh.education",
      role: "counsellor",
      department: "UK & Ireland",
      isActive: true
    }
  ];

  for (const row of seeds) {
    const doc = await Counsellor.findOneAndUpdate(
      { counsellorId: row.counsellorId },
      { $setOnInsert: row },
      { upsert: true, new: true }
    );
    console.log("Counsellor:", doc.counsellorId, "— login email:", doc.email);
  }
  console.log("Portal test login: ID FATH-2024 + email counsellor@fateh.education (after seed).");

  const articles = [
    {
      title: "UK student visa — key documents",
      summary: "Checklist for Tier 4 / Student Route applications.",
      content:
        "Students typically need a valid CAS, proof of funds, TB test results where applicable, and passport. Timelines vary by country of application.",
      category: "visa",
      tags: ["UK", "visa", "documents"],
      language: "en",
      priority: 10
    },
    {
      title: "Budget planning for Ireland",
      summary: "Tuition and living cost ballparks.",
      content:
        "Ireland postgraduate tuition often ranges widely by university and program. Living costs depend on city; Dublin is typically higher than regional campuses.",
      category: "finance",
      tags: ["Ireland", "budget"],
      language: "en",
      priority: 5
    }
  ];

  for (const a of articles) {
    const exists = await KnowledgeBase.findOne({ title: a.title });
    if (!exists) {
      await KnowledgeBase.create({ ...a, isPublished: true });
      console.log("Knowledge:", a.title);
    } else {
      console.log("Skip (exists):", a.title);
    }
  }

  await disconnectMongo();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
