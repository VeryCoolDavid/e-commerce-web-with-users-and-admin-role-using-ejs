const userModel = require("../models/user-model");
const { verifyToken } = require("../utils/jwt");

module.exports.logged = async function (req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "You need to login");
    return res.redirect("/");
  }
  try {
    const decoded = verifyToken(token);
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    req.user = user;
    next();
  } catch (err) {
    req.flash("error", "Invalid or expired session");
    res.redirect("/");
  }
};
module.exports.isAdmin = function (req, res, next) {
  if (req.user.role !== "admin") {
    req.flash("error", "Forbidden");
    return res.status(403).redirect("/");
  }
  next();
};
