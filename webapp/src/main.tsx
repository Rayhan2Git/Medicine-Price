import React from "react";
import ReactDOM from "react-dom/client";
import App, { HashRouter } from "./App";
import "./styles.css";

// HashRouter is used so the SPA works regardless of the GitHub Pages
// subpath (e.g. /Medicine-Price/) without needing a basename config.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
