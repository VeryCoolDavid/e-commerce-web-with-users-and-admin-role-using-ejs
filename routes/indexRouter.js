const express = require("express");
const { logged } = require("../middlewares/isLoggedin");
const router = express.Router();
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const orderModel = require("../models/order-model");
const { calculateCartTotal } = require("../utils/calculateTotal");

router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error });
});

router.get("/shop", logged, async function (req, res) {
  let success = req.flash("success");
  let Products = await productModel.find();
  res.render("shop", { Products, success, user: req.user });
});

router.get("/cart", logged, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product")
    .populate("saved.product");
  let finalTotal = calculateCartTotal(user.cart);

  let error = req.flash("error");
  res.render("cart", { user, error, finalTotal });
});

router.post("/addtocart/:id", logged, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  let existingItem = user.cart.find(
    (item) =>
      (item.product._id?.toString() || item.product.toString()) ===
      req.params.id
  );
  console.log(existingItem);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cart.push({ product: req.params.id, quantity: 1 });
  }
  await user.save();
  req.flash("success", "Added to cart");
  res.redirect("/shop");
});

router.post("/cart/update/:id", logged, async (req, res) => {
  const { action } = req.body;

  let user = await userModel.findOne({ email: req.user.email });
  let product = await productModel.findById(req.params.id);

  if (!product) {
    req.flash("error", "Product not found");
    return res.redirect("/cart");
  }

  let item = user.cart.find(
    (item) => item.product.toString() === req.params.id
  );

  if (!item) {
    req.flash("error", "Item not in cart");
    return res.redirect("/cart");
  }

  if (action === "increase") {
    if (item.quantity >= product.stock) {
      req.flash("error", "Out of stock");
      return res.redirect("/cart");
    }
    item.quantity += 1;
  }

  if (action === "decrease") {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      user.cart = user.cart.filter(
        (i) => i.product.toString() !== req.params.id
      );
    }
  }

  if (action === "delete") {
    user.cart = user.cart.filter((i) => i.product.toString() !== req.params.id);
  }

  await user.save();
  res.redirect("/cart");
});

router.post("/checkout", logged, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");

  let finalTotal = calculateCartTotal(user.cart);
  let orderItems = user.cart.map((item) => {
    let price = item.product.price;
    let discount = item.product.discount;

    let finalPrice = price * (1 - discount / 100);

    return {
      product: item.product._id,
      quantity: item.quantity,
      price: finalPrice,
    };
  });
  // create order...
  let order = await orderModel.create({
    user: user._id,
    items: orderItems,
    totalAmount: finalTotal,
  });

  user.cart = [];
  await user.save();
  
  req.flash("success","Order Placed!")
  res.redirect("/users/order");
});

module.exports = router;
