const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const adminModel = require("../models/admin-model");

module.exports.logged = async function (req, res, next) {
  if (!req.cookies.token) {
    req.flash("error", "You need to login");
    return res.redirect("/login");
  }
  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    let user = await userModel
      .findOne({
        email: decoded.email,
      })
      .select("-password");

    req.user = user;
    next();
  } catch (err) {
    req.flash("error", "you need to login");
    res.redirect("/login");
  }
};
module.exports.isAdmin = async function (req, res, next) {
  if (!req.cookies.token) {
    req.flash("error", "you need to login");
    return res.redirect("/admin");
  }
  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_ADMIN);
    await adminModel
      .findOne({
        email: decoded.email,
      })
      .select("-password");
    next();
  } catch (err) {
    req.flash("error", "you need to login");
    res.redirect("/admin");
  }
};
