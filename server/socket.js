// server/socket.js
const { Server } = require("socket.io");
const setupEditorSocket = require("./websockets/editorSocket");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setupEditorSocket(io);
  return io;
}

module.exports = initSocket;
