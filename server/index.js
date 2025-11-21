require("dotenv").config();
const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const apiLimiter = require("./middlewares/rateLimit");

const authRoutes = require("./routes/auth.routes");
const docRoutes = require("./routes/document.routes");
const aiRoutes = require("./routes/ai.routes");
const initSocket = require("./socket");

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV !== "test") {
  connectDB();
  const helmet = require("helmet");
  app.use(helmet());
}

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(apiLimiter);

app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
  })
);
const shareRoutes = require("./routes/share.routes");
app.use("/api/share", shareRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/ai", aiRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Server Error" });
});

if (process.env.NODE_ENV !== "test") {
  initSocket(server);
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("Server running on port", PORT));
}

module.exports = app;
module.exports.server = server;
