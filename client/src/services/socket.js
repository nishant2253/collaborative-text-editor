// client/src/services/socket.js
import { io } from "socket.io-client";

export function createSocket() {
  const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const socket = io(SERVER, {
    transports: ["websocket"], // Always use WebSocket
    autoConnect: false, // We connect manually
    withCredentials: true,
    reconnection: true, // Enable auto-reconnection
    reconnectionAttempts: 5,
    reconnectionDelay: 500,
  });

  return socket;
}

export function disconnectSocket(socket) {
  if (!socket) return;
  try {
    socket.removeAllListeners(); // 🧹 Important cleanup
    socket.disconnect();
  } catch (err) {
    console.error("Socket disconnect error:", err);
  }
}
