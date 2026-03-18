const userModel = require("../models/user-model");
const adminModel=require("../models/admin-model")
const bcrypt = require("bcryptjs");
const { generateToken,generateTokenAdmin } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;
    let user = await userModel.findOne({ email });
    if (user) {
      req.flash("error", "Please login, Account already exists");
      return res.status(401).redirect("/login");
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);
        else {
          let user = await userModel.create({
            email,
            password: hash,
            fullname,
          });

          let token = generateToken(user);
          res.cookie("token", token);
          res.redirect("/shop");
        }
      });
    });
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.loginUser = async function (req, res) {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    req.flash("error", "Email or password incorrect");
    return res.redirect("/login");
  }
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      res.redirect("/shop");
    } else {
      req.flash("error", "Email or password incorrect");
      return res.redirect("/login");
    }
  });
};

module.exports.logout = function (req, res) {
  res.cookie("token", "");
  res.redirect("/login");
};

module.exports.loginAdmin= async function (req,res){
  
  let { email, password } = req.body;
  let admin = await adminModel.findOne({ email });
  if (!admin) {
    req.flash("error", "Email or password incorrect");
    return res.redirect("/admin");
  }
  bcrypt.compare(password, admin.password, function (err, result) {
    if (result) {
      let token = generateTokenAdmin(admin);
      res.cookie("token", token);
      res.redirect("/admin/product");
    } else {
      req.flash("error", "Email or password incorrect");
      return res.redirect("/admin");
    }
  });
}
