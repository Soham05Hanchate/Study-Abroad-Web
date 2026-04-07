const dns = require("dns");
const path = require("path");
const express = require("express");
const cors = require("cors");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), override: false });

const { connectMongo, isConnected } = require("./config/db");
const counsellorRoutes = require("./routes/counsellorRoutes");
const dataRoutes = require("./routes/dataRoutes");

const app = express();
const publicDir = path.join(__dirname, "public");
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let initPromise;

function initServices() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await connectMongo();
      } catch {
        console.warn("Server starting without MongoDB.");
        initPromise = null;
      }
    })();
  }
  return initPromise;
}

if (!process.env.GROQ_API_KEY) {
  console.warn("Warning: GROQ_API_KEY is not set. /api/chat and /extract will return errors until configured.");
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization", "X-API-Key"]
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    groqConfigured: Boolean(process.env.GROQ_API_KEY?.trim()),
    mongodb: isConnected() ? "connected" : process.env.MONGODB_URI ? "disconnected" : "not_configured",
    adminApiKeyRequired: Boolean(process.env.ADMIN_API_KEY?.trim())
  });
});

app.use(counsellorRoutes);
app.use("/api", counsellorRoutes);
app.use("/api", dataRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

if (!process.env.VERCEL) {
  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

module.exports = {
  app,
  initServices
};
