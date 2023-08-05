// Imports
// ========================================================
import React from "react";
import ReactDOM from "react-dom/client";
import RootProvider from "./providers/index.tsx";
import "./index.css";

// Main Render
// ========================================================
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootProvider />
  </React.StrictMode>
);
