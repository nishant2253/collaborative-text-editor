// client/src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

export function createSocket(documentId) {
  if (socket && socket.connected) return socket;
  const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";
  socket = io(SERVER, {
    withCredentials: true,
    autoConnect: false,
    auth: { documentId },
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {}
    socket = null;
  }
}
