require("dotenv").config();
const mongoose = require("mongoose");
const userModel = require("../models/user-model");
const { hashPassword } = require("../utils/bcrypt");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await userModel.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await hashPassword(process.env.ADMIN);

    const admin = await userModel.create({
      fullname: "Admin",
      email: "admin@123.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin created:", admin.email);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

seedAdmin();
