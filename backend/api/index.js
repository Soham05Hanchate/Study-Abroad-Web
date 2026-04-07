const { app, initServices } = require("../app");

module.exports = async (req, res) => {
  await initServices();
  return app(req, res);
};
