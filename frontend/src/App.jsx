import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { CartProvider } from "@/context/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "@/pages/Landing";
import Menu from "@/pages/Menu";
import Stores from "@/pages/Stores";
import Craft from "@/pages/Craft";
import Dashboard from "@/pages/Dashboard";
import Rewards from "@/pages/Rewards";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CatalogProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/stores" element={<Stores />} />
                <Route path="/craft" element={<Craft />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
            <Toaster
              theme="dark"
              position="top-right"
              toastOptions={{
                style: {
                  background: "#0A0604",
                  border: "1px solid #2C1A12",
                  color: "#F5F0EB",
                  fontFamily: "Outfit, sans-serif",
                  borderRadius: "2px",
                },
              }}
            />
          </CartProvider>
        </CatalogProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
