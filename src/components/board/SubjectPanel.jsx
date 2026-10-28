/* eslint-disable react/prop-types */
import { NO_MODULE } from "../../constants";
import { useCurriculum } from "../../state/CurriculumContext";
import { subjectCode } from "../../utils/subjectCode";

export default function SubjectPanel({ subject: s, idx, up, down, onPick, onClose }) {
  const { palette } = useCurriculum();
  const cfg = palette[s.module] || NO_MODULE;
  const list = (set, cls) => (
    <div className="pills">
      {[...set].map((id) => <button key={id} className={"pill " + cls} onClick={() => onPick(id)}>{idx[id].name}</button>)}
      {!set.size && <span className="muted">—</span>}
    </div>
  );
  return (
    <aside className="panel" aria-label="Aine detailid">
      <div className="ph">
        <span className="tag mono" style={{ background: cfg.color, borderLeft: "4px solid " + cfg.stripe }}>{cfg.name}</span>
        <button onClick={onClose} aria-label="Sulge" className="x">×</button>
      </div>
      <h2>{s.name}</h2>
      <div className="muted">{subjectCode(s) && <span className="mono">{subjectCode(s)} · </span>}Semester {s.semester} · {s.credits} EAP · {s.required ? "kohustuslik" : "valikaine"}</div>
      <div><div className="label">Eeldab ({up.size})</div>{list(up, "up")}</div>
      <div><div className="label">Avab ({down.size})</div>{list(down, "down")}</div>
      {s.objective && <div><div className="label">Eesmärk</div><p>{s.objective}</p></div>}
      {s.outcomes?.length > 0 && (
        <div><div className="label">Õpiväljundid</div>
          <ul>{s.outcomes.map((o) => <li key={o.id ?? o}>{o.description ?? o}</li>)}</ul></div>
      )}
      {s.assessment && <div><div className="label">Hindamine</div><p>{s.assessment}</p></div>}
      {s.url && <a className="btn" href={s.url} target="_blank" rel="noreferrer">Ava ainekaart ↗</a>}
    </aside>
  );
}
