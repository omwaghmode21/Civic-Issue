const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    DOB: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "authority"],
      default: "user",
      required: true,
    },
    department: {
      type: String,
      enum: ["road", "waste management", "electricity"],
      required: function () {
        return this.role === "admin"; // only required if role = admin
      },
    },
    verificationCode: {
      type: String,
      required: function () {
        return this.role === "admin" || this.role === "authority"; // required if admin or authority
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
