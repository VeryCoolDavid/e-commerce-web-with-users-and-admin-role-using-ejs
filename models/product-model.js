const mongoose = require("mongoose");
// const productSchema = mongoose.Schema({
//   image: Buffer,
//   name: String,
//   price: Number,
//   discount: {
//     type: Number,
//     default: 0,
//   },
//   bgColor: String,
//   panelColor: String,
//   textColor: String,
// });

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  finalPrice: {
    type: Number
  },

  image: {
    type: String, // store URL instead of Buffer
    required: true
  },

  category: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  stock: {
    type: Number,
    required: true,
    min: 0
  },

  // UI fields 
  bgColor: String,
  panelColor: String,
  textColor: String

}, { timestamps: true });

module.exports = mongoose.model("product", productSchema);
