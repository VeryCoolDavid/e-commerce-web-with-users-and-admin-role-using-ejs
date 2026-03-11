const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");

router.post("/create", upload.single("image"), async function (req, res) {
  try {
    let { name, price, discount, bgColor, panelColor, textColor } = req.body;
    await productModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgColor,
      panelColor,
      textColor,
    });
    req.flash("success", "Products created");
    res.redirect("/admin");
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
