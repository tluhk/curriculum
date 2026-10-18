import { useEffect, useMemo, useRef, useState } from "react";
import { useCurriculum } from "../state/CurriculumContext";
import { checkCurriculum } from "../utils/checks";
import { NO_MODULE } from "../constants";
import { SubjectEditor, ModuleEditor, OutcomeEditor } from "../components/admin/Editors";
import Rail from "../components/shell/Rail";
import useRailTip from "../components/shell/useRailTip";
import "../components/admin/admin.css";

const clip = (t = "", n) => (t.length > n ? t.slice(0, n) + "…" : t);
const VIEW_OF = { subject: "subjects", module: "modules", co: "outcomes" };
const EDITOR = { subject: SubjectEditor, module: ModuleEditor, co: OutcomeEditor };
const SEV_CLASS = { viga: "bad", hoiatus: "warn", info: "info" };

function Admin() {
  const { curriculum, palette, update, reset, exportAll, year } = useCurriculum();
  const { subjects, modules, learningOutcomes } = curriculum;
  const [view, setView] = useState("subjects");
  const [q, setQ] = useState("");
  const [ed, setEd] = useState(null); // { type, id }
  const [toast, setToast] = useState("");
  const { tipProps, tipEl } = useRailTip((label) => label);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const issues = useMemo(() => checkCurriculum(curriculum), [curriculum]);
  const warnSubjects = new Set(issues.filter((i) => i.target.type === "subject" && i.sev !== "info").map((i) => i.target.id));
  const nWarn = issues.filter((i) => i.sev !== "info").length;
  const mod = (id) => palette[id] || NO_MODULE;

  const say = (msg) => { setToast(msg); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2600); };
  const commit = (next, msg) => { update(() => next); setEd(null); say(msg); };
  const open = (type, id) => { setView(VIEW_OF[type]); setEd({ type, id }); };
  const go = (v) => { setView(v); setEd(null); };

  const isSel = (type, id) => ed && ed.type === type && ed.id === id;
  let title, addType, items = [];
  if (view === "subjects") {
    title = "Ained"; addType = "subject";
    const needle = q.trim().toLowerCase();
    items = [...subjects]
      .sort((a, b) => a.semester - b.semester || a.order - b.order)
      .filter((s) => !needle || s.name.toLowerCase().includes(needle))
      .map((s) => ({ key: s.id, title: s.name, sub: `S${s.semester} · ${s.credits} EAP · ${mod(s.module).name}`, stripe: mod(s.module).stripe,
        tag: s.required ? "" : "valik", warn: warnSubjects.has(s.id), sel: isSel("subject", s.id), on: () => setEd({ type: "subject", id: s.id }) }));
  } else if (view === "modules") {
    title = "Moodulid"; addType = "module";
    items = modules.map((m) => {
      const ss = subjects.filter((s) => s.module === m.id);
      return { key: m.id, title: m.name, sub: `${ss.length} ainet · ${ss.reduce((a, s) => a + s.credits, 0)} EAP · ${m.learningOutcomes.length} väljundit`,
        stripe: mod(m.id).stripe, tag: "M" + m.id, warn: !ss.length, sel: isSel("module", m.id), on: () => setEd({ type: "module", id: m.id }) };
    });
  } else if (view === "outcomes") {
    title = "Õppekava väljundid"; addType = "co";
    items = learningOutcomes.map((c) => ({ key: c.id, title: `ÕV ${c.id} · ${clip(c.description, 80)}`,
      sub: `${(c.moduleOutcomes || []).length} mooduli väljundit` + (c.khsOutcome ? ` · KHS: ${clip(c.khsOutcome, 50)}` : ""),
      stripe: "var(--accent)", tag: "", warn: !(c.moduleOutcomes || []).length, sel: isSel("co", c.id), on: () => setEd({ type: "co", id: c.id }) }));
  }

  const nav = [
    ["subjects", "Ained", subjects.length, false, "Ai"],
    ["modules", "Moodulid", modules.length, false, "Mo"],
    ["outcomes", "Õppekava väljundid", learningOutcomes.length, false, "ÕV"],
    ["check", "Kontroll", nWarn, nWarn > 0, "✓"],
  ];
  const Editor = ed && EDITOR[ed.type];

  return (
    <div className="admin">
      <Rail id="admin" as="nav" className="anav" label="Haldus" summary={
        <div className="railmini">
          {nav.map(([v, label, count, warn, short]) => (
            <button key={v} className={"mininav" + (view === v ? " on" : "")} aria-label={label} {...tipProps(label)}
              aria-current={view === v ? "page" : undefined} onClick={() => go(v)}>
              {short}<span className={"count mono" + (warn ? " warn" : "")}>{count}</span>
            </button>
          ))}
          {tipEl}
        </div>
      }>
        <div className="label">Õppekava andmed</div>
        {nav.map(([v, label, count, warn]) => (
          <button key={v} className={"anavitem" + (view === v ? " on" : "")} aria-current={view === v ? "page" : undefined} onClick={() => go(v)}>
            <span>{label}</span><span className={"count mono" + (warn ? " warn" : "")}>{count}</span>
          </button>
        ))}
        <div className="anavfoot">
          <p>Andmed on laetud failist src/data/curriculum.js ({year}). Muudatused salvestatakse brauseris; ekspordi uus curriculum.js ja pane see repositooriumi.</p>
          <button className="b primary" onClick={exportAll}>Ekspordi curriculum.js</button>
          <button className="b ghost" onClick={() => { if (window.confirm(`Visata ${year} mustand ära ja laadida andmed failist?`)) { reset(); setEd(null); say(`${year} andmed laaditud failist`); } }}>Lähtesta failist</button>
        </div>
      </Rail>

      {view === "check" ? (
        <section className="alist">
          <h1>Andmete kontroll</h1>
          <p className="lead">Reeglid arvutatakse iga muudatusega uuesti. Klõpsa kirjel, et see avada.</p>
          <div className="scroll">
            {issues.map((i, k) => (
              <button key={k} className="issue" onClick={() => (i.target.type === "semester" ? (setQ(""), go("subjects")) : open(i.target.type, i.target.id))}>
                <span className={"sev mono " + SEV_CLASS[i.sev]}>{i.sev}</span><span>{i.text}</span>
              </button>
            ))}
            {!issues.length && <div className="allgood">Probleeme ei leitud.</div>}
          </div>
        </section>
      ) : (
        <section className="alist">
          <div className="alisthead">
            <h1>{title}</h1>
            {view === "subjects" && <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Otsi nime järgi" aria-label="Otsi ainet" />}
            <button className="b accent" onClick={() => setEd({ type: addType, id: "new" })}>
              + {addType === "subject" ? "Lisa aine" : addType === "module" ? "Lisa moodul" : "Lisa õpiväljund"}
            </button>
          </div>
          <div className="scroll">
            {items.map((it) => (
              <button key={it.key} className={"aitem" + (it.sel ? " sel" : "")} onClick={it.on}>
                <span className="stripe" style={{ background: it.stripe }} />
                <span className="aitext"><span className="aititle">{it.title}</span><span className="aisub mono">{it.sub}</span></span>
                <span className="mono muted">{it.tag}</span>
                {it.warn && <span className="warnbadge mono" title="Kontrolli andmeid">!</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {Editor && (
        <Editor key={ed.type + ":" + ed.id} curriculum={curriculum} id={ed.id} palette={palette} onCommit={commit} onClose={() => setEd(null)} />
      )}
      {toast && <div className="atoast" role="status">{toast}</div>}
    </div>
  );
}

export default function AdminPage() {
  const { year } = useCurriculum();
  // Remount on year switch so an open editor never saves into the other version
  return <Admin key={year} />;
}
