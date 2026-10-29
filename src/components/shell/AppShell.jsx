import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CurriculumProvider, useCurriculum } from "../../state/CurriculumContext";
import Logo from "./Logo";
import CurriculumSwitcher from "./CurriculumSwitcher";
import "./shell.css";

function TopBar() {
  const { year, setYear, curriculum, group, dirty, isNew, reset, exportAll, undo, redo, canUndo, canRedo } = useCurriculum();
  const { search } = useLocation();
  useEffect(() => { document.title = `${curriculum.name} ${year} · Õppekava`; }, [curriculum.name, year]);
  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y) outside text fields; fields keep their own text undo
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redo(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [undo, redo]);
  const tab = (to, label) => <NavLink key={to} to={{ pathname: to, search }} end className={({ isActive }) => "tab" + (isActive ? " on" : "")}>{label}</NavLink>;
  return (
    <header className="topbar">
      <NavLink to={{ pathname: "/", search }} className="brand" aria-label="Ained – avaleht">
        <Logo size={28} />
      </NavLink>
      <CurriculumSwitcher />
      <div className="seg" role="group" aria-label="Õppeaasta">
        {group.versions.map((v) => <button key={v.version} aria-pressed={v.version === year} onClick={() => setYear(v.version)}>{v.version}</button>)}
      </div>
      <nav className="tabs">{tab("/", "Ained")}{tab("/outcomes", "Õpiväljundid")}{tab("/schedule", "Ajakava")}{tab("/admin", "Haldus")}</nav>
      {(canUndo || canRedo) && (
        <div className="undo" role="group" aria-label="Muudatused">
          <button onClick={undo} disabled={!canUndo} aria-label="Võta tagasi" title="Võta tagasi (Ctrl+Z)">↶</button>
          <button onClick={redo} disabled={!canRedo} aria-label="Tee uuesti" title="Tee uuesti (Ctrl+Shift+Z)">↷</button>
        </div>
      )}
      {dirty && (
        <div className="draft">
          <span>{isNew ? "Uus, ainult selles brauseris" : "Mustand (ainult selles brauseris)"}</span>
          <button onClick={exportAll}>Ekspordi curriculum.js</button>
          {isNew
            ? <button onClick={() => window.confirm(`Kustutada ${curriculum.name} ${year}? Seda pole veel eksporditud.`) && reset()}>Kustuta</button>
            : <button onClick={() => window.confirm("Visata mustand ära?") && reset()}>Lähtesta</button>}
        </div>
      )}
    </header>
  );
}

export default function AppShell() {
  return (
    <CurriculumProvider>
      <div className="shell"><TopBar /><main className="main"><Outlet /></main></div>
    </CurriculumProvider>
  );
}
