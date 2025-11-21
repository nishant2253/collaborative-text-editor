// server/middleware/authMiddleware.js
const { verifyAccessToken } = require("../config/jwt");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    console.error("auth error", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authMiddleware;
