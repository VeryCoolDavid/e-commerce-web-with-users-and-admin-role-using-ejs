const express = require("express");
const isLoggedin = require("../middlewares/isLoggedin");
const router = express.Router();
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error, isLoggedin: false });
});

router.get("/shop", isLoggedin, async function (req, res) {
  let success = req.flash("success");
  let Products = await productModel.find();
  res.render("shop", { Products, success });
});

router.get("/cart", isLoggedin, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");
  let bill = Number(user.cart[0].price) - Number(user.cart[0].discount);
  res.render("cart", { user, bill });
});

router.get("/addtocart/:productID", isLoggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  user.cart.push(req.params.productID);
  await user.save();
  req.flash("success", "Added to cart");
  res.redirect("/shop");
});

module.exports = router;
