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

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    image: {
      type: String, // store URL instead of Buffer
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // UI fields
    bgColor: String,
    panelColor: String,
    textColor: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
