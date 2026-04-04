/**
 * Dev-only: forward API calls to the Express backend.
 * When this file exists, CRA ignores package.json "proxy" — keep paths in sync with backend.
 */
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_PROXY_TARGET || "http://127.0.0.1:5000";

  const apiProxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: "warn"
  });

  app.use("/api", apiProxy);
  // Legacy paths used by backend/public (vanilla demo)
  app.use("/chat", apiProxy);
  app.use("/extract", apiProxy);
};
