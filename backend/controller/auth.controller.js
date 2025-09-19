const bcrypt = require("bcryptjs");
const User = require("../database/models/user");

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      phone,
      password,
      gender,
      address,
      DOB,
      role: rawRole,
      department: rawDepartment,
      verificationCode,
    } = req.body;
    console.log(req.body);

    // Basic required fields validation (schema also enforces)
    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !phone ||
      !password ||
      !gender ||
      !DOB
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    console.log(req.body);
    // Check duplicates (email, username, phone are unique)
    const [existingEmail, existingUsername, existingPhone] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
      User.findOne({ phone }),
    ]);

    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }
    if (existingUsername) {
      return res.status(409).json({ message: "Username already in use" });
    }
    if (existingPhone) {
      return res.status(409).json({ message: "Phone already in use" });
    }

    // Role & verification checks
    const role = (rawRole || 'user').toString().toLowerCase();
    if (role === 'admin') {
      if (!verificationCode || verificationCode !== 'ADMIN-2025') {
        return res.status(403).json({ message: 'Invalid admin verification code' });
      }
    }
    if (role === 'authority') {
      if (!verificationCode || verificationCode !== 'AUTH-2025') {
        return res.status(403).json({ message: 'Invalid authority verification code' });
      }
    }

    // Normalize department to schema enum (only for admin)
    const departmentMap = {
      roads: 'road',
      road: 'road',
      electricity: 'electricity',
      'waste management': 'waste management',
      wastemanagement: 'waste management',
    };
    const normalizedDepartment = role === 'admin' && rawDepartment
      ? departmentMap[String(rawDepartment).toLowerCase().trim()] || null
      : undefined;
    if (role === 'admin' && !normalizedDepartment) {
      return res.status(400).json({ message: 'Invalid or missing admin department' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstname,
      lastname,
      username: String(username).toLowerCase().trim(),
      email: String(email).toLowerCase().trim(),
      phone,
      password: hashedPassword,
      gender,
      address,
      DOB,
      role,
      department: normalizedDepartment,
      verificationCode: (role === 'admin' || role === 'authority') ? verificationCode : undefined,
    });
    console.log(user);
    // Respond without password
    const { password: _pw, ...safeUser } = user.toObject();
    return res.status(201).json({ message: "User registered successfully", user: safeUser });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    const query = usernameOrEmail.includes("@")
      ? { email: String(usernameOrEmail).toLowerCase().trim() }
      : { username: String(usernameOrEmail).toLowerCase().trim() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // create simple session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };

    const { password: _pw, ...safeUser } = user.toObject();
    return res.status(200).json({ message: "Login successful", user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie('civic.sid');
      return res.status(200).json({ message: 'Logged out' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// GET /api/auth/me
const me = (req, res) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) return res.status(401).json({ message: 'Not authenticated' });
  return res.status(200).json({ user: sessionUser });
};

module.exports = { register, login, logout, me };


