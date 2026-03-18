const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: String,
  password: String,
  cart: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
  default: [], },
  orders: { type: Array, default: [] },
  contact: Number,
  picture: Buffer,
});
module.exports = mongoose.model("user", userSchema);
