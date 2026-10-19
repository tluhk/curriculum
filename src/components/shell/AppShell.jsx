import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CurriculumProvider, useCurriculum } from "../../state/CurriculumContext";
import { YEARS } from "../../constants";
import Logo from "./Logo";
import "./shell.css";

function TopBar() {
  const { year, setYear, curriculum, dirty, reset, exportAll } = useCurriculum();
  const { search } = useLocation();
  const tab = (to, label) => <NavLink key={to} to={{ pathname: to, search }} end className={({ isActive }) => "tab" + (isActive ? " on" : "")}>{label}</NavLink>;
  return (
    <header className="topbar">
      <NavLink to={{ pathname: "/", search }} className="brand" aria-label={`${curriculum.name} õppekava – avaleht`}>
        <Logo size={28} />
        <span className="title">{curriculum.name} õppekava</span>
      </NavLink>
      <div className="seg" role="group" aria-label="Õppeaasta">
        {YEARS.map((y) => <button key={y} aria-pressed={y === year} onClick={() => setYear(y)}>{y}</button>)}
      </div>
      <nav className="tabs">{tab("/", "Ained")}{tab("/outcomes", "Õpiväljundid")}{tab("/schedule", "Ajakava")}{tab("/admin", "Haldus")}</nav>
      {dirty && (
        <div className="draft">
          <span>Mustand (ainult selles brauseris)</span>
          <button onClick={exportAll}>Ekspordi curriculum.js</button>
          <button onClick={() => window.confirm("Visata mustand ära?") && reset()}>Lähtesta</button>
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
