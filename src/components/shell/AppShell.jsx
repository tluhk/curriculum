import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CurriculumProvider, useCurriculum } from "../../state/CurriculumContext";
import Logo from "./Logo";
import CurriculumSwitcher from "./CurriculumSwitcher";
import "./shell.css";

function TopBar() {
  const { year, setYear, curriculum, group, dirty, isNew, reset, exportAll } = useCurriculum();
  const { search } = useLocation();
  useEffect(() => { document.title = `${curriculum.name} ${year} · Õppekava`; }, [curriculum.name, year]);
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
