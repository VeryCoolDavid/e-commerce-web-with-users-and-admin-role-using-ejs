const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const bcrypt = require("bcryptjs");
const userModel = require("../models/user-model");

router.get("/product", async function (req, res) {
  let success = req.flash("success");
  let Products = await productModel.find();
  res.render("admin", { Products, success });
});
router.post("/delete", async function (req, res) {
  await productModel.deleteMany({});
  req.flash("success", "Products Deleted");
  res.redirect("/admin");
});
router.post("/delete/:productId", async function (req, res) {
  await productModel.deleteOne({ _id: req.params.productId });
  req.flash("success", "Product deleted!");
  res.redirect("/admin");
});
router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("owner-login", { error });
});
router.get("/create", function (req, res) {
  let success = req.flash("success");
  res.render("createProducts", { success });
});

module.exports = router;
