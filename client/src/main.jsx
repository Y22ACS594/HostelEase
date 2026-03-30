// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";     // Tailwind base + safe-area vars
import "./globals.css";   // Responsive overrides for ALL pages
import { AuthProvider } from "./context/AuthContext";
 
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
 