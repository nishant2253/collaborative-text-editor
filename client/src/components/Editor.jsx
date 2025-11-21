import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import QuillCursors from "quill-cursors";
import "react-quill/dist/quill.snow.css";

export default function Editor({ value, onChange, socket, documentId, user }) {
  const reactQuillRef = useRef(null);
  const applyingRemote = useRef(false);

  // Register cursor module ONCE globally
  useEffect(() => {
    if (window.Quill && !window.Quill.imports["modules/cursors"]) {
      window.Quill.register("modules/cursors", QuillCursors);
    }
  }, []);

  useEffect(() => {
    const quill = reactQuillRef.current?.getEditor();
    if (!quill) return;

    if (!applyingRemote.current) {
      const currentHtml = quill.root.innerHTML;
      if (value !== currentHtml) {
        const delta = quill.clipboard.convert(value || "");
        quill.setContents(delta);
      }
    }
  }, [value]);

  // Handle incoming cursor changes
  useEffect(() => {
    if (!socket) return;
    const quill = reactQuillRef.current?.getEditor();
    if (!quill) return;

    const cursors = quill.getModule("cursors");

    socket.on("cursor-change", ({ userId, range }) => {
      if (!range) return;
      cursors.createCursor(userId, `User ${userId}`, getRandomColor(userId));
      cursors.moveCursor(userId, range);
    });

    return () => {
      socket.off("cursor-change");
    };
  }, [socket]);

  // Random stable color based on userId
  function getRandomColor(id) {
    const colors = ["red", "blue", "green", "purple", "orange"];
    return colors[id?.charCodeAt(0) % colors.length] || "blue";
  }

  function handleChange(content, delta, source, editor) {
    onChange && onChange(content);

    if (source === "user" && socket && documentId) {
      socket.emit("text-change", {
        documentId,
        delta,
      });
    }

    // cursor position
    if (source === "user") {
      const range = editor.getSelection();
      socket.emit("cursor-change", {
        documentId,
        userId: user?._id,
        range,
      });
    }
  }

  return (
    <div className="bg-white shadow rounded p-2">
      <ReactQuill
        ref={reactQuillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        className="h-[500px]"
        modules={{
          toolbar: true,
          cursors: {
            hideDelayMs: 1000,
            transformOnTextChange: true,
          },
        }}
      />
    </div>
  );
}
