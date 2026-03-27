const express = require("express");
const { logged } = require("../middlewares/isLoggedin");
const router = express.Router();
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const orderModel = require("../models/order-model");
const { calculateCartTotal } = require("../utils/calculateTotal");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error });
});

router.get("/shop", logged, async function (req, res) {
  let success = req.flash("success");
  const Products = await productModel.find();
  res.render("shop", { Products,success, user: req.user });
});

router.get("/shop/collection", logged, async (req, res) => {
  let query = {};
  let sort = {};
  if (req.query.discount === "true") {
    query.discount = { $gt: 0 };
  }
  if (req.query.sort === "discount") {
    sort.discount = -1;
  }
  if (req.query.availability === "true") {
    query.stock = { $gt: 0 };
  }
  if (req.query.new === "true") {
    let daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 7);

    query.createdAt = { $gte: daysAgo };
  }
  if (!req.query.sort) {
    sort.createdAt = -1;
  }

  let Products = await productModel.find(query).sort(sort);
  res.render("collection", { Products, user: req.user });
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

router.post("/checkout", logged, async function (req, res) {
  let user = await userModel.findById(req.user._id).populate("cart.product");
  const outOfStock = user.cart.find((item) => item.product.stock <= 0);
  if (outOfStock) {
    req.flash("error", `Product ${outOfStock.product.name} is out of stock`);
    return res.redirect("/cart");
  }

  let cartTotal = calculateCartTotal(user.cart);
  let shipping = 20;
  let finalTotal = shipping + cartTotal;
  const options = {
    amount: finalTotal * 100,
    currency: "INR",
    receipt: "order_" + Date.now(),
  };
  const razorOrder = await razorpay.orders.create(options);
  res.render("paymentPage", {
    key: process.env.RAZORPAY_API_KEY,
    razorOrder,
  });
});

router.post("/payment/verify", logged, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // 1️⃣ Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).send("Payment verification failed");
    }

    const user = await userModel
      .findById(req.user._id)
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

    for (let item of user.cart) {
      await productModel.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    user.cart = [];
    user.orders.push(order._id);
    await user.save();

    req.flash("success", "Order Placed!");
    res.redirect(`/users/order/${order._id}`);
  } catch (err) {
    req.flash("error", "Payment verification failed");
    return res.status(500).redirect("/cart");
  }
});

module.exports = router;
