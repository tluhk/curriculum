/* eslint-disable react/prop-types */
import { NO_MODULE, SEMESTER_EAP } from "../../constants";
import { useCurriculum } from "../../state/CurriculumContext";
import Rail from "../shell/Rail";

export default function FilterRail({ modules, subjects, off, reqOnly, onToggle, onReqOnly, total }) {
  const { palette } = useCurriculum();
  const summary = (
    <div className="railmini">
      <b>{total}</b><span className="mono">EAP</span>
      {modules.map((m) => {
        const cfg = palette[m.id] || NO_MODULE;
        return (
          <button key={m.id} className="minidot" aria-pressed={!off[m.id]} title={m.name} aria-label={m.name}
            onClick={() => onToggle(m.id)} style={{ "--tint": cfg.color, "--stripe": cfg.stripe }} />
        );
      })}
    </div>
  );
  return (
    <Rail id="board" className="rail" label="Filtrid" summary={summary}>
      <div>
        <div className="label">Kokku</div>
        <div className="big">{total}<small>EAP</small></div>
      </div>
      <div className="chips">
        <div className="label">Moodulid</div>
        {modules.map((m) => {
          const cfg = palette[m.id] || NO_MODULE;
          const eap = subjects.filter((s) => s.module === m.id).reduce((a, s) => a + s.credits, 0);
          return (
            <button key={m.id} className="chip" aria-pressed={!off[m.id]} onClick={() => onToggle(m.id)}
              style={{ "--tint": cfg.color, "--stripe": cfg.stripe }}>
              <span>{m.name}</span><span className="mono">{eap}</span>
            </button>
          );
        })}
      </div>
      <button className="switch" role="switch" aria-checked={reqOnly} onClick={onReqOnly}><i />Ainult kohustuslikud</button>
      <p className="hint">Lohista aine teise semestrisse. Eeldused peavad jääma varasemasse ja sõltuvad ained hilisemasse semestrisse. Semestri sihtmaht on {SEMESTER_EAP} EAP.</p>
    </Rail>
  );
}
