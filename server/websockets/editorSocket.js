// server/websockets/editorSocket.js
const Document = require("../models/Document");

// -----------------------------------------------------------
// Main Socket Handler
// -----------------------------------------------------------
const setupEditorSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ---------------------------
    // JOIN DOCUMENT
    // ---------------------------
    socket.on("join-document", async ({ documentId, userId, userName }) => {
      if (!documentId) return;

      socket.join(documentId);
      socket.documentId = documentId;
      socket.userId = userId;
      socket.userName = userName;

      try {
        const doc = await Document.findById(documentId).lean();
        socket.emit("document", { content: doc?.content || "" });
      } catch (err) {
        console.error("Socket join failed:", err);
      }

      updatePresence(io, documentId);
    });

    // ---------------------------
    // TEXT CHANGE
    // ---------------------------
    socket.on("text-change", ({ documentId, delta, content }) => {
      if (!documentId) return;

      socket.to(documentId).emit("text-change", {
        delta,
        content,
        from: socket.userId,
      });
    });

    // ---------------------------
    // CURSOR MOVE
    // ---------------------------
    socket.on("cursor-change", ({ documentId, range }) => {
      if (!documentId) return;

      socket.to(documentId).emit("cursor-change", {
        userId: socket.userId,
        userName: socket.userName,
        range,
      });
    });

    // ---------------------------
    // MANUAL OR AUTO DOCUMENT SAVE
    // ---------------------------
    socket.on("document-save", async ({ documentId, content }) => {
      if (!documentId) return;

      try {
        await Document.findByIdAndUpdate(documentId, {
          content,
          updatedAt: new Date(),
        });

        io.to(documentId).emit("document-saved", {
          documentId,
          savedAt: new Date(),
        });
      } catch (err) {
        socket.emit("error", { message: "Save failed" });
      }
    });

    // ---------------------------
    // USER LEAVES DOCUMENT
    // ---------------------------
    socket.on("leave-document", ({ documentId }) => {
      if (!documentId) return;

      socket.leave(documentId);
      updatePresence(io, documentId);
    });

    // ---------------------------
    // SOCKET DISCONNECT
    // ---------------------------
    socket.on("disconnect", () => {
      if (socket.documentId) {
        updatePresence(io, socket.documentId);
      }
    });
  });
};

// -----------------------------------------------------------
// PRESENCE LIST HELPER
// -----------------------------------------------------------
async function updatePresence(io, documentId) {
  const sockets = await io.in(documentId).fetchSockets();

  const users = sockets.map((s) => ({
    userId: s.userId,
    userName: s.userName,
  }));

  io.to(documentId).emit("presence-update", users);
}

module.exports = setupEditorSocket;
