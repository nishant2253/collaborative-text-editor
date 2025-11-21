// client/src/pages/DocumentPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Editor from "../components/Editor";
import AIAssistant from "../components/AIAssistant";
import { createSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../hooks/useAuth";
import ShareModal from "../components/ShareModal";
import PresenceList from "../components/PresenceList";
import toast from "react-hot-toast";

export default function DocumentPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [manualSaving, setManualSaving] = useState(false);

  const socketRef = useRef(null);
  const saveTimer = useRef(null);

  // -----------------------------
  // MANUAL SAVE BUTTON FUNCTION
  // -----------------------------
  async function manualSave() {
    setManualSaving(true);
    try {
      await api.put(`/documents/${id}`, { content });

      if (socketRef.current?.connected) {
        socketRef.current.emit("document-save", {
          documentId: id,
          content,
        });
      }

      toast.success("Document saved!");
    } catch (err) {
      console.error("Manual save error", err);
      toast.error("Save failed");
    } finally {
      setManualSaving(false);
    }
  }

  // -----------------------------
  // 1. Load Document
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api.get(`/documents/${id}`);
        if (!mounted) return;

        const d = res.data.document;
        setDoc(d);
        setContent(d.content || "");
      } catch (err) {
        console.error("Failed to load document", err);
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // -----------------------------
  // 2. Setup WebSocket
  // -----------------------------
  useEffect(() => {
    // create a fresh socket instance each page load
    const s = createSocket();
    socketRef.current = s;

    // connect and wire events
    s.connect();

    const onConnect = () => {
      // join document room when connected
      s.emit("join-document", {
        documentId: id,
        userId: user?._id,
        userName: user?.name,
      });
    };

    const onDocument = (payload) => {
      if (payload?.content !== undefined) {
        setContent(payload.content);
      }
    };

    const onPresence = (users) => {
      setActiveUsers(Array.isArray(users) ? users : []);
    };

    const onUserJoined = (u) => {
      // optional toast or console
      console.log("user joined", u);
    };

    const onUserLeft = (u) => {
      console.log("user left", u);
    };

    s.on("connect", onConnect);
    s.on("document", onDocument);
    s.on("presence-update", onPresence);
    s.on("user-joined", onUserJoined);
    s.on("user-left", onUserLeft);

    // cleanup: remove listeners and disconnect this socket instance
    return () => {
      try {
        if (s.connected) {
          s.emit("leave-document", { documentId: id, userId: user?._id });
        }
      } catch (e) {
        // ignore
      }

      s.off("connect", onConnect);
      s.off("document", onDocument);
      s.off("presence-update", onPresence);
      s.off("user-joined", onUserJoined);
      s.off("user-left", onUserLeft);

      // pass the specific socket to disconnect helper
      disconnectSocket(s);
      socketRef.current = null;
    };
    // we intentionally include user as dependency so presence updates after login work
  }, [id, user]);

  // -----------------------------
  // 3. Auto-Save (HTML content)
  // -----------------------------
  useEffect(() => {
    if (!doc) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        await api.put(`/documents/${id}`, { content });

        if (socketRef.current?.connected) {
          socketRef.current.emit("document-save", {
            documentId: id,
            content,
          });
        }
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 1200);

    return () => clearTimeout(saveTimer.current);
  }, [content, doc, id]);

  // -----------------------------
  // RENDER UI
  // -----------------------------
  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* LEFT: MAIN EDITOR AREA */}
      <div className="col-span-2">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">{doc?.title || "Untitled"}</h2>

          {/* SHARE BUTTON */}
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => setShowShare(true)}
          >
            Share
          </button>

          {/* MANUAL SAVE BUTTON */}
          <button
            className={`px-3 py-1 rounded ${
              manualSaving ? "bg-gray-400" : "bg-green-600 text-white"
            }`}
            onClick={manualSave}
            disabled={manualSaving}
          >
            {manualSaving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-2">Document ID: {id}</div>

        <Editor
          value={content}
          onChange={setContent}
          socket={socketRef.current}
          documentId={id}
          user={user}
        />
      </div>

      {/* RIGHT PANEL */}
      <div>
        <PresenceList users={activeUsers} />

        <div className="mt-4">
          <AIAssistant text={content} setText={setContent} />
        </div>
      </div>

      {/* SHARE MODAL */}
      {showShare && (
        <ShareModal documentId={id} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
