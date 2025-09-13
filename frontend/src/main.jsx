import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom"; // ✅ HashRouter for GitHub Pages
import App from "./App";
import "./index.css"; // Tailwind + global styles
import "leaflet/dist/leaflet.css"; // Leaflet CSS

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
