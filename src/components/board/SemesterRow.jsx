/* eslint-disable react/prop-types */
import SubjectCard from "./SubjectCard";
import { SEMESTER_EAP } from "../../constants";

export default function SemesterRow({ semester, cols, credits, subjects, state, sel, related, up, down, onSelect, onDragStart, onDragEnd, onDrop }) {
  const allow = state.kind === "ok" || state.kind === "warn";
  return (
    <section className="row">
      <header className="rowhead">
        <b>Semester {semester}</b>
        <div className="bar"><i style={{ width: Math.min(100, (credits / SEMESTER_EAP) * 100) + "%", background: credits === SEMESTER_EAP ? "var(--ok)" : "var(--warn)" }} /></div>
        <span className="mono" style={{ color: credits === SEMESTER_EAP ? "#2f6d4c" : "#8a5a12" }}>{credits} EAP</span>
      </header>
      <div className={"cells " + state.kind} style={{ "--cols": cols }}
        onDragOver={(e) => allow && e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDrop(semester, null); }}>
        {state.msg && <div className={"toast " + state.kind}>{state.msg}</div>}
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} selected={sel === s.id} dim={!related(s.id)}
            rel={up.has(s.id) ? "up" : down.has(s.id) ? "down" : ""}
            onSelect={onSelect} onDragStart={onDragStart} onDragEnd={onDragEnd}
            onDropBefore={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(semester, s.id); }}
            onDragOver={(e) => allow && e.preventDefault()} />
        ))}
      </div>
    </section>
  );
}
