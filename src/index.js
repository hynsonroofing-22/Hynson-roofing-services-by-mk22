import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// There used to be a @tanstack/react-query QueryClientProvider wrapped around
// this. Nothing in the site ever called useQuery or useMutation — the provider
// was set up and then never used — so it was roughly 13KB of gzipped
// JavaScript that every visitor downloaded and parsed to do nothing at all.
// Removed. If server state ever does need caching, add it back at that point.

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
