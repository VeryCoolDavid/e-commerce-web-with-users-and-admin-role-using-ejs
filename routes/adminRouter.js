const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const { isAdmin, logged } = require("../middlewares/isLoggedin");

router.use(logged);
router.use(isAdmin);

router.get("/", async function (req, res) {
  let success = req.flash("success");
  let error = req.flash("error");
  let Products = await productModel.find();
  res.render("admin", { Products, success, error });
});


module.exports = router;
