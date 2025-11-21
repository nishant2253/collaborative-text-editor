// client/src/components/ShareModal.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function ShareModal({ documentId, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch permissions for the document
  async function loadPermissions() {
    try {
      const res = await api.get(`/documents/${documentId}/permissions`);
      setPermissions(res.data.permissions);
    } catch (err) {
      console.error("Failed to load permissions", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPermissions();
  }, []);

  // Share (add permission)
  async function share() {
    if (!email) return;

    try {
      await api.post(`/documents/${documentId}/share`, {
        userEmail: email,
        role,
      });

      setEmail("");
      loadPermissions();
    } catch (err) {
      console.error(err);
    }
  }

  // Update role
  async function updateRole(targetEmail, newRole) {
    try {
      await api.post(`/documents/${documentId}/share`, {
        userEmail: targetEmail,
        role: newRole,
      });

      loadPermissions();
    } catch (err) {
      console.error(err);
    }
  }

  // Remove user
  async function removeAccess(targetEmail) {
    try {
      await api.post(`/documents/${documentId}/share/remove`, {
        userEmail: targetEmail,
      });

      loadPermissions();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Share Document</h2>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="email"
            placeholder="User Email"
            value={email}
            className="border p-2 rounded w-full"
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>

        <button
          onClick={share}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
        >
          Share
        </button>

        <hr className="my-4" />

        {/* Permissions list */}
        <h3 className="font-semibold mb-2">Existing Access</h3>

        {loading ? (
          <div>Loading...</div>
        ) : permissions.length === 0 ? (
          <div className="text-gray-500">No users have access yet.</div>
        ) : (
          <ul className="space-y-2">
            {permissions.map((p, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <div>
                  <div className="font-medium">{p.userEmail}</div>
                  <div className="text-sm text-gray-600">Role: {p.role}</div>
                </div>

                <div className="flex gap-2">
                  {/* Toggle role */}
                  <button
                    onClick={() =>
                      updateRole(
                        p.userEmail,
                        p.role === "viewer" ? "editor" : "viewer"
                      )
                    }
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Make {p.role === "viewer" ? "Editor" : "Viewer"}
                  </button>

                  {/* Remove access */}
                  <button
                    onClick={() => removeAccess(p.userEmail)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-gray-400 text-white px-4 py-2 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
