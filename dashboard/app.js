const config = require("@root/config"),
  utils = require("./utils"),
  CheckAuth = require("./auth/CheckAuth");

module.exports.launch = async (client) => {
  /* Init express app */

  const express = require("express"),
    session = require("express-session"),
    MongoStore = require("connect-mongo"),
    mongoose = require("@src/database/mongoose"),
    path = require("path"),
    app = express();

  /* Routers */
  const mainRouter = require("./routes/index"),
    discordAPIRouter = require("./routes/discord"),
    logoutRouter = require("./routes/logout"),
    guildManagerRouter = require("./routes/guild-manager");

  client.states = {};
  client.config = config;

  const db = await mongoose.initializeMongoose();

  /* App configuration */
  const PORT = process.env.PORT || config.DASHBOARD.port || 20125;
  const SESSION_SECRET = process.env.SESSION_PASSWORD || "changeme";
  app
    .use(express.json()) // For post methods
    .use(express.urlencoded({ extended: true }))
    .engine("html", require("ejs").renderFile) // Set the engine to html (for ejs template)
    .set("view engine", "ejs")
    .use(express.static(path.join(__dirname, "/public"))) // Set the css and js folder to ./public
    .set("views", path.join(__dirname, "/views")) // Set the ejs templates to ./views
    .set("port", PORT) // Set the dashboard port
    .use(
      session({
        secret: SESSION_SECRET,
        cookie: { maxAge: 336 * 60 * 60 * 1000 },
        name: "djs_connection_cookie",
        resave: true,
        saveUninitialized: false,
        store: MongoStore.create({
          client: db.getClient(),
          dbName: db.name,
          collectionName: "sessions",
          stringify: false,
          autoRemove: "interval",
          autoRemoveInterval: 1,
        }),
      })
    ) // Set the express session password and configuration
    .use(async function (req, res, next) {
      req.user = req.session.user;
      req.client = client;
      if (req.user && req.url !== "/") req.userInfos = await utils.fetchUser(req.user, req.client);
      next();
    })
    .use("/api", discordAPIRouter)
    .use("/logout", logoutRouter)
    .use("/manage", guildManagerRouter)
    .use("/", mainRouter)
    .use(CheckAuth, function (req, res) {
      res.status(404).render("404", {
        user: req.userInfos,
        currentURL: `${req.client.config.DASHBOARD.baseURL}${req.originalUrl}`,
      });
    })
    .use(CheckAuth, function (err, req, res) {
      console.error(err.stack);
      if (!req.user) return res.redirect("/");
      res.status(500).render("500", {
        user: req.userInfos,
        currentURL: `${req.client.config.DASHBOARD.baseURL}${req.originalUrl}`,
      });
    });

  /* Start */
  app.listen(app.get("port"), "0.0.0.0", () => {
    client.logger.success("Dashboard is listening on port " + app.get("port"));
  });
};
