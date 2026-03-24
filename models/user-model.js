const mongoose = require("mongoose");

// const userSchema = mongoose.Schema({
//   fullname: {
//     type: String,
//     minLength: 3,
//     trim: true,
//   },
//   email: String,
//   password: String,
//   cart: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
//   default: [], },
//   orders: { type: Array, default: [] },
//   contact: Number,
//   picture: Buffer,
// });

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    saved: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
      },
    ],

    contact: {
      type: String,
      trim: true,
    },

    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
