import React from "react";
import { createRoot } from "react-dom/client";
import Orbit from "./Orbit.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Orbit />
  </React.StrictMode>
);
