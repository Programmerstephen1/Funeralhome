import "./styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

// This file serves as the entry point for your React application.
// It finds the 'root' div in your public/index.html file and 
// renders the main App component inside it.

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);