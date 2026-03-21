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
    let user = await userModel
      .findOne({
        _id: decoded.id,
      })
      .select("-password");
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
