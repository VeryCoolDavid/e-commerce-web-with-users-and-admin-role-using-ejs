const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const fs = require("fs");
const path = require("path");
const { logged, isAdmin } = require("../middlewares/isLoggedin");

router.use(logged);
router.use(isAdmin);

router.get("/create", function (req, res) {
  let success = req.flash("success");
  let error = req.flash("error");
  res.render("createProducts", { success, error });
});

router.post("/create", upload.single("image"), async function (req, res) {
  try {
    let {
      name,
      price,
      discount,
      category,
      stock,
      description,
      bgColor,
      panelColor,
      textColor,
    } = req.body;
    await productModel.create({
      image: req.file.filename,
      name,
      price,
      discount,
      category,
      stock,
      description,
      bgColor,
      panelColor,
      textColor,
    });
    req.flash("success", "Products created");
    res.redirect("/products/create");
  } catch (err) {
    req.flash("error", "Error uploading product");
    res.status(500).redirect("/products/create");
  }
});

router.post("/delete", async function (req, res) {
  try {
    await productModel.deleteMany({});
    const uploadPath = path.join(__dirname, "..", "public", "uploads");
    fs.readdir(uploadPath, (err, files) => {
      if (!err) {
        for (const file of files) {
          fs.unlink(path.join(uploadPath, file), () => {});
        }
      }
    });

    res.redirect("/admin");
  } catch (err) {
    req.flash("error", "Something went wrong");
    res.redirect("/admin");
  }
});

router.post("/delete/:id", async function (req, res) {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/admin");
    }
    const imagePath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      product.image
    );
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.log("Image delete error:", err);
      } else {
        console.log("Image deleted successfully");
      }
    });
    await productModel.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted successfully");
    res.redirect("/admin");
  } catch (err) {
    req.flash("error", "Something went wrong");
    res.redirect("/admin");
  }
});

module.exports = router;
