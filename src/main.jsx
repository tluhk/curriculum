import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/tokens.css";
import AppShell from "./components/shell/AppShell.jsx";
import BoardPage from "./pages/BoardPage.jsx";
import OutcomesPage from "./pages/OutcomesPage.jsx";
import SchedulePage from "./pages/SchedulePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/curriculum">
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<BoardPage />} />
          <Route path="/outcomes" element={<OutcomesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
