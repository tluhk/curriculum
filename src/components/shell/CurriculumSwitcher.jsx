import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import base from "../../data/curriculum";
import { useCurriculum } from "../../state/CurriculumContext";
import { LEVELS, codeOf } from "../../utils/curricula";

const committed = new Set(base.map(codeOf));

// Top-bar menu listing every curriculum, grouped by level. "Lisa õppekava" opens Haldus → Õppekava.
export default function CurriculumSwitcher() {
  const { curricula, group, setCurriculum } = useCurriculum();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (e.type === "keydown" ? e.key === "Escape" : !ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  const levels = Object.entries(LEVELS).map(([level, { label }]) => ({ level, label, items: curricula.filter((g) => g.level === level) })).filter((l) => l.items.length);

  return (
    <div className="switcher" ref={ref}>
      <button className="switchbtn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="title">{group.name}</span>
        <span className="mono code">{group.code}</span>
        <span className="caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="switchmenu" role="menu" aria-label="Õppekavad">
          {levels.map((l) => (
            <div key={l.level} className="switchgroup">
              <div className="label">{l.label}</div>
              {l.items.map((g) => (
                <button key={g.code} role="menuitemradio" aria-checked={g.code === group.code} className={"switchitem" + (g.code === group.code ? " on" : "")}
                  onClick={() => { setCurriculum(g.code); setOpen(false); }}>
                  <span className="mono code">{g.code}</span>
                  <span className="sname">{g.name}</span>
                  <span className="mono muted">{g.versions.map((v) => v.version).join(", ")}</span>
                  {!committed.has(g.code) && <span className="newtag mono">uus</span>}
                </button>
              ))}
            </div>
          ))}
          <button role="menuitem" className="switchadd" onClick={() => { setOpen(false); navigate({ pathname: "/admin", search }, { state: { view: "curriculum" } }); }}>
            + Lisa õppekava
          </button>
        </div>
      )}
    </div>
  );
}
