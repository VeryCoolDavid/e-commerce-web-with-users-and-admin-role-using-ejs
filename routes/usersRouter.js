const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const orderModel = require("../models/order-model");
const { logged } = require("../middlewares/isLoggedin");

const {
  registerUser,
  loginUser,
  logout,
} = require("../controllers/authController");

router.get("/", function (req, res) {
  res.send("usersrouter");
});

router.get("/save-for-later/:id", logged, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });

  // find item in cart
  let itemIndex = user.cart.findIndex(
    (item) => item.product.toString() === req.params.id
  );

  if (itemIndex > -1) {
    let item = user.cart[itemIndex];

    // add to saved
    user.saved.push({
      product: item.product,
    });

    // remove from cart
    user.cart.splice(itemIndex, 1);
  }

  await user.save();
  res.redirect("/cart");
});

router.get("/move-to-cart/:id", logged, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });

  let index = user.saved.findIndex(
    (item) => item.product.toString() === req.params.id
  );

  if (index > -1) {
    let item = user.saved[index];

    user.cart.push({
      product: item.product,
      quantity: 1,
    });

    user.saved.splice(index, 1);
  }

  await user.save();
  res.redirect("/cart");
});

router.get("/order", logged, async (req, res) => {
  let orders = await orderModel
    .find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 });

  let success=req.flash("success")
  res.render("orders", { success, orders, user:req.user });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);

module.exports = router;
