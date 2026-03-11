const express = require("express");
const router = express.Router();
const adminModel = require("../models/admin-model");

if (process.env.NODE_ENV === "development") {
  router.post("/create", async function (req, res) {
    const admin = await adminModel.find();
    if (admin.length > 0) {
      return res.status(503).send("NO PERMISSION");
    }
    let { fullname, email, password } = req.body;
    let createdAdmin = await adminModel.create({
      fullname,
      email,
      password,
    });
    res.status(201).send(createdAdmin);
  });
}
router.get("/", function (req, res) {
  let success = req.flash("success");
  res.render("createProducts", { success });
});

module.exports = router;
