const userModel = require("../models/user-model");
const { generateToken } = require("../utils/jwt");
const { comparePassword, hashPassword } = require("../utils/bcrypt");

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "Please login, Account already exists");
      return res.status(401).redirect("/");
    }

    const hashedPassword = await hashPassword(password);

    const user = await userModel.create({
      email,
      password: hashedPassword,
      fullname,
      role: "user",
    });
    let token = generateToken(user);
  
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect("/shop");
  } catch (err) {
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/");
  }
};

module.exports.loginUser = async function (req, res) {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    req.flash("error", "Email or password incorrect");
    return res.redirect("/");
  }

  const result = await comparePassword(password, user.password);

  if (!result) {
    req.flash("error", "Email or password incorrect");
    return res.redirect("/");
  }
  const token = generateToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.redirect("/shop");
};

module.exports.logout = function (req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.redirect("/");
};
