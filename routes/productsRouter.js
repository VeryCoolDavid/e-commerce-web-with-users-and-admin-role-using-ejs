const express = require("express");
const router = express();
const adminModel = require("../models/product-model");
router.get("/", function (req, res) {
  res.send("productsrouter");
});
module.exports = router;
