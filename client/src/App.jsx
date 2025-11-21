import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DocumentPage from "./pages/DocumentPage";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Editor from "./pages/Editor";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/documents/:id" element={<DocumentPage />} />

          <Route
            path="/documents/:id"
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            }
          />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/documents/:id"
            element={
              <PrivateRoute>
                <DocumentPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
