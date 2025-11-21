// server/middleware/rateLimit.js
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = apiLimiter;
