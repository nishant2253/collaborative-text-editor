import React from "react";

export default function PresenceList({ users }) {
  return (
    <div className="bg-white p-3 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Active Users</h3>

      {users.length === 0 && (
        <div className="text-gray-500 text-sm">No active collaborators</div>
      )}

      <ul className="space-y-1">
        {users.map((u) => (
          <li key={u.userId} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>{u.userName || "Unknown User"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
