const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const orderModel = require("../models/order-model");
const { getRevenueStats } = require("../utils/Analytics");
const { isAdmin, logged } = require("../middlewares/isLoggedin");

router.use(logged);
router.use(isAdmin);

router.get("/", async function (req, res) {
  let success = req.flash("success");
  let error = req.flash("error");
  let Products = await productModel.find();
  const totalProducts = Products.length;
  const revenue = await getRevenueStats();
  res.render("admin", { Products, totalProducts,revenue, success, error });
});
router.get("/orders", async function (req, res) {
  let orders = await orderModel
    .find()
    .populate("user")
    .populate("items.product")
    .sort({ createdAt: -1 });

    const totalOrders=orders.length;
  let success = req.flash("success");
  res.render("adminOrders", { orders,totalOrders, success });
});

router.post("/orders/:id/status", async function (req, res) {
  let { status } = req.body;
  await orderModel.findByIdAndUpdate(req.params.id, { status });
  req.flash("success", "Successfully changed status");
  res.redirect("/admin/orders");
});

module.exports = router;
