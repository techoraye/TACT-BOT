const express = require("express"),
  CheckAuth = require("../auth/CheckAuth"),
  router = express.Router();


router.get('/', async (req, res) => {
  const user = req.user; // assuming you use passport or something similar
  const guild = null; // or fetch actual guild data if available

  res.render('home', { user, guild });
});

router.get("/selector", CheckAuth, async (req, res) => {
  res.render("selector", {
    user: req.userInfos,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
  });
});

module.exports = router;
