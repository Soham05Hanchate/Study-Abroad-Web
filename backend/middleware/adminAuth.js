/**
 * When ADMIN_API_KEY is set, mutating admin routes require:
 *   Authorization: Bearer <key>   or   X-API-Key: <key>
 * If unset, requests are allowed (local dev).
 */

function getProvidedKey(req) {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && /^Bearer\s+\S+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  const x = req.headers["x-api-key"];
  if (typeof x === "string" && x.trim()) return x.trim();
  return "";
}

function requireAdminApiKey(req, res, next) {
  const expected = process.env.ADMIN_API_KEY?.trim();
  if (!expected) return next();
  const got = getProvidedKey(req);
  if (got !== expected) {
    return res.status(401).json({
      error: "Unauthorized",
      details: "Set Authorization: Bearer <ADMIN_API_KEY> or X-API-Key."
    });
  }
  return next();
}

module.exports = { requireAdminApiKey, getProvidedKey };
