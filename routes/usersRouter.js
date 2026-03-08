const express = require("express");
const router = express();
const adminModel = require("../models/user-model");

router.get("/", function (req, res) {
  res.send("usersrouter");
});

module.exports = router;
