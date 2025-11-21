import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { createSocket } from "../services/socket"; // ✅ FIXED
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Editor() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [role, setRole] = useState("viewer");
  const [saving, setSaving] = useState(false);

  const [socket, setSocket] = useState(null); // ⬅️ store socket instance

  // Fetch document data
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/documents/${id}`);
        setDoc(res.data.document);
        setContent(
          typeof res.data.document.content === "string"
            ? res.data.document.content
            : ""
        );
        setRole(res.data.document.role || "owner");
      } catch (err) {
        console.error("Failed to load doc", err);
      }
    }
    load();
  }, [id]);

  // Connect to socket
  useEffect(() => {
    const s = createSocket(id); // ✅ create a socket for this doc
    setSocket(s);

    s.connect();
    s.emit("joinDocument", id);

    s.on("doc-update", (newContent) => {
      setContent(newContent);
    });

    return () => {
      s.emit("leaveDocument", id);
      s.disconnect();
    };
  }, [id]);

  // Debounced saving
  const saveDocument = useCallback(
    debounce(async (newContent) => {
      setSaving(true);
      try {
        await api.put(`/documents/${id}`, { content: newContent });
      } catch (err) {
        console.error("Save error", err);
      }
      setSaving(false);
    }, 800),
    []
  );

  // On text change
  function handleChange(value) {
    setContent(value);

    if (!socket) return; // socket not ready yet

    // send update WS
    socket.emit("doc-edit", { docId: id, content: value });

    // save if allowed
    if (role === "owner" || role === "editor") {
      saveDocument(value);
    }
  }

  if (!doc) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-3">
        <input
          className="border p-2 rounded text-xl font-semibold"
          value={doc.title}
          onChange={(e) => setDoc({ ...doc, title: e.target.value })}
          onBlur={() =>
            api
              .put(`/documents/${id}`, { title: doc.title })
              .catch(console.error)
          }
        />
        <div className="text-gray-500">{saving ? "Saving…" : "Saved"}</div>
      </div>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        readOnly={role === "viewer"}
        className="bg-white"
        style={{ height: "70vh" }}
      />
    </div>
  );
}

// helper — debounce function
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
