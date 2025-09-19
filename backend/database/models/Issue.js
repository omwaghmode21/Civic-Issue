const mongoose = require("mongoose");

const reporterSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    issueId: { type: String, unique: true, index: true }, // e.g., CIV-123456
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Roads",
        "Electricity",
        "Waste Management",
      ],
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
      index: true,
    },
    photoUrl: { type: String },
    reporter: { type: reporterSchema, required: true },
    location: { type: locationSchema },
    subIssues: { type: [String], default: [] },
    rating: { type: Number, min: 1, max: 5, default: null },
    date: { type: Date, default: Date.now },
    assigned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;


