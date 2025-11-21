import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  // client/src/pages/Dashboard.jsx (loadDocs)
  async function loadDocs() {
    try {
      const res = await api.get("/documents");
      setDocs(res.data.documents || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  }

  async function createDoc() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/documents", { title, content: "" });
      setDocs((prev) => [res.data.document, ...prev]);
      setTitle("");
    } catch (err) {
      console.error("Create failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New document title"
        />
        <button className="btn" onClick={createDoc} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      <div className="grid gap-3">
        {docs.length === 0 && (
          <div className="text-gray-500">No documents yet.</div>
        )}

        {docs.map((d) => (
          <Link
            key={d._id}
            to={`/documents/${d._id || d.id}`}
            className="block p-4 bg-white rounded shadow hover:shadow-md"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{d.title || "Untitled"}</h3>
              <div className="text-sm text-gray-500">
                {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : ""}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {d.content ? d.content.replace(/<[^>]+>/g, "").slice(0, 150) : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
