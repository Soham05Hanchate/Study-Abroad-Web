/**
 * MongoDB Atlas connection (MONGODB_URI).
 * App runs without DB if URI is omitted — extract still works, persistence is skipped.
 */

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * @returns {Promise<boolean>} true if connected
 */
async function connectMongo() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.warn("MongoDB: MONGODB_URI not set — database features disabled.");
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log("MongoDB: connected to Atlas");
    return true;
  } catch (err) {
    console.error("MongoDB: connection failed:", err.message);
    throw err;
  }
}

async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectMongo,
  disconnectMongo,
  isConnected,
  mongoose
};
