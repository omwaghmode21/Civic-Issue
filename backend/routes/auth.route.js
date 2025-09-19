const router = require("express").Router();
const { register, login, logout, me } = require("../controller/auth.controller");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", me);

module.exports = router;


