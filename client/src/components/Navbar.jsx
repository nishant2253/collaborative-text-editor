import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    try {
      await api.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <nav className="bg-white shadow p-3 mb-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl text-blue-600">
          Collab Editor
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-600">{user.name}</span>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600">
                Login
              </Link>
              <Link to="/register" className="text-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
