const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const orderModel = require("../models/order-model");
const productModel = require("../models/product-model");
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

  let success = req.flash("success");
  let error = req.flash("error");
  res.render("orders", { success, error, orders, user: req.user });
});

router.get("/order/:id", logged, async (req, res) => {
  let order = await orderModel
    .findById(req.params.id)
    .populate("items.product");

  let success = req.flash("success");
  res.render("orderDetails", { order, user: req.user, success });
});

router.post("/order/:id/cancel", logged, async (req, res) => {
  let order = await orderModel.findById(req.params.id);

  // ❗ Security check (VERY IMPORTANT)
  if (order.user.toString() !== req.user._id.toString()) {
    return res.send("Unauthorized");
  }

  // ❗ Allow cancel only if Pending
  if (order.status !== "Pending") {
    req.flash("error", "Order cannot be cancelled");
    return res.redirect("/users/order");
  }
  for (let item of order.items) {
    await productModel.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }, // 🔥 increase back
    });
  }

  // ✅ Update status
  order.status = "Cancelled";
  await order.save();

  req.flash("success", "Product cancelled successfully");
  res.redirect(`/users/order/${order._id}`);
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);

module.exports = router;
