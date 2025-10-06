import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import OutcomesPage from "./pages/OutcomesPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/curriculum">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/outcomes" element={<OutcomesPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
