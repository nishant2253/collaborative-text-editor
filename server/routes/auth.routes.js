// server/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { signAccessToken, signRefreshToken } = require("../config/jwt");
const { validate } = require("../middlewares/validator");
const Joi = require("joi");

// Schemas
const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});
const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

// Register
router.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "Email already in use" });

  user = new User({ name, email, password, roles: ["viewer"] });
  await user.save();

  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
  });
});

// Login
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await user.comparePassword(password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
  });
});

// Me
const { verifyAccessToken } = require("../config/jwt");
router.get("/me", async (req, res) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null);
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

module.exports = router;
