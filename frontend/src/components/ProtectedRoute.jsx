import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#A3978F] tracking-widest uppercase text-xs">
        Brewing…
      </div>
    );
  }
  if (user === false) return <Navigate to="/login" replace />;
  return children;
}
