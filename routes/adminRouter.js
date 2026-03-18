const express = require("express");
const router = express.Router();
const adminModel = require("../models/admin-model");
const productModel = require("../models/product-model");
const { loginAdmin } = require("../controllers/authController");
const bcrypt = require("bcryptjs");
const { isAdmin } = require("../middlewares/isLoggedin");

if (process.env.NODE_ENV === "development") {
  router.post("/login", async function (req, res) {
    try {
      let { fullname, email, password } = req.body;
      const admin = await adminModel.find();
      if (admin.length > 0) {
        return res.status(401).send("NO PERMISSION");
      }
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
          if (err) return res.send(err.message);
          let admin = await adminModel.create({
            email,
            password: hash,
            fullname,
          });
          res.send(admin);
        });
      });
    } catch (er) {
      res.send(err.message);
    }
  });
}
router.post("/login", loginAdmin);

router.get("/product", isAdmin, async function (req, res) {
  let success = req.flash("success");
  let Products = await productModel.find();
  res.render("admin", { Products, success });
});

router.post("/delete", isAdmin,async function (req, res) {
  await productModel.deleteMany({});
  req.flash("success", "Products Deleted");
  res.redirect("/admin");
});
router.post("/delete/:productId", isAdmin,async function (req, res) {
  await productModel.deleteOne({ _id: req.params.productId });
  req.flash("success", "Product deleted!");
  res.redirect("/admin");
});
router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("owner-login", { error });
});

router.get("/create",isAdmin, function (req, res) {
  let success = req.flash("success");
  res.render("createProducts", { success });
});

module.exports = router;
