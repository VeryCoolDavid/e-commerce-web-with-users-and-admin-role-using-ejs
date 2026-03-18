const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);
};

module.exports.generateToken = generateToken;

const generateTokenAdmin = (admin) => {
  return jwt.sign({ email: admin.email, id: admin._id }, process.env.JWT_ADMIN);
};

module.exports.generateTokenAdmin = generateTokenAdmin;
