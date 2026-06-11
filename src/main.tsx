import React from "react";
import ReactDOM from "react-dom/client";
import "@progress/kendo-theme-default/dist/all.css";
import "hammerjs";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
