const express = require("express");
const app = express();
const { DBConnection } = require("./database/db");
const authRoutes = require("./routes/auth.route");
const reportRoutes = require("./routes/report.route");

// const path = require("path");
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const FRONTEND_URL=process.env.FRONTEND_URL

require("dotenv").config();
DBConnection();
app.use(cors({
  origin: FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());
app.use(session({
  name: 'civic.sid',
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true behind HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const uploadRoutes = require('./routes/upload.route');
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// app.use(middlewareError);
