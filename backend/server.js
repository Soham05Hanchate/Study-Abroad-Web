/**
 * AI Voice Counsellor API — Express + Groq.
 * Static UI: ./public
 */
const dns=require('dns');
dns.setServers(["1.1.1.1","8.8.8.8"]);
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), override: false });

const { connectMongo, isConnected } = require("./config/db");
const counsellorRoutes = require("./routes/counsellorRoutes");
const dataRoutes = require("./routes/dataRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const publicDir = path.join(__dirname, "public");



if (!process.env.GROQ_API_KEY) {
  console.warn("Warning: GROQ_API_KEY is not set. /api/chat and /extract will return errors until configured.");
}

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization", "X-API-Key"]
  })
);
app.use(express.json({ limit: "1mb" }));

// Health first so it is never shadowed by /api routers
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    groqConfigured: Boolean(process.env.GROQ_API_KEY?.trim()),
    mongodb: isConnected() ? "connected" : process.env.MONGODB_URI ? "disconnected" : "not_configured",
    adminApiKeyRequired: Boolean(process.env.ADMIN_API_KEY?.trim())
  });
});

// Groq: POST /chat, /extract (vanilla public/) and POST /api/chat, /api/extract (React)
app.use(counsellorRoutes);
app.use("/api", counsellorRoutes);
app.use("/api", dataRoutes);

// Unknown /api/* → JSON 404 (skip if static or SPA handled elsewhere)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

app.use(express.static(publicDir));

// SPA fallback (Express 5: avoid bare "*" route pattern)
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
});

async function start() {
  try {
    await connectMongo();
  } catch {
    console.warn("Server starting without MongoDB.");
  }

  if (process.env.REQUIRE_MONGODB === "true" && !isConnected()) {
    console.error("REQUIRE_MONGODB=true but MongoDB is not connected. Exiting.");
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      (async () => {
        try {
          const { disconnectMongo } = require("./config/db");
          await disconnectMongo();
        } catch (_) {
          /* ignore */
        }
        process.exit(0);
      })();
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
