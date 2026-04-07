const { app, initServices } = require("./app");
const { isConnected, disconnectMongo } = require("./config/db");

const PORT = Number(process.env.PORT) || 8080;

async function start() {
  await initServices();

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
