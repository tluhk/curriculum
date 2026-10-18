/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useCurriculum } from "../state/CurriculumContext";
import { countBy, coverage, moduleOutcomeIndex, outcomeNotes } from "../utils/outcomes";
import "../components/outcomes/outcomes.css";

const clip = (t = "", n) => (t.length > n ? t.slice(0, n) + "…" : t);
const shade = (n) => Math.min(0.95, 0.16 + n * 0.1);

function Matrix({ curriculum, palette }) {
  const { subjects, modules, learningOutcomes } = curriculum;
  const stripe = (moduleId) => palette[moduleId]?.stripe || "#999";
  const [row, setRow] = useState(learningOutcomes[0]?.id ?? null);
  const [col, setCol] = useState(null);

  const subj = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);
  const modName = useMemo(() => Object.fromEntries(modules.map((m) => [m.id, m.name])), [modules]);
  const moIdx = useMemo(() => moduleOutcomeIndex(curriculum), [curriculum]);
  const cov = useMemo(() => coverage(curriculum, moIdx), [curriculum, moIdx]);
  const notes = useMemo(() => outcomeNotes(curriculum, moIdx, cov), [curriculum, moIdx, cov]);
  const groups = useMemo(() => {
    const sorted = [...subjects].sort((a, b) => a.semester - b.semester || a.order - b.order);
    const sems = [...new Set(sorted.map((s) => s.semester))];
    return sems.map((sem) => ({ sem, subjects: sorted.filter((s) => s.semester === sem) }));
  }, [subjects]);

  const lo = learningOutcomes.find((l) => l.id === row);
  const rowCov = cov[row] || {};
  const rowSubjects = Object.keys(rowCov).map(Number);
  const allItems = (lo?.moduleOutcomes || [])
    .map((x) => moIdx[x.moduleId + "." + x.outcomeId])
    .filter(Boolean)
    .map((mo) => ({ ...mo, counts: countBy(mo.subjectIds) }));
  const focusSubject = col && subj[col];
  const items = focusSubject ? allItems.filter((mo) => mo.counts[col]) : allItems;
  const focus = !!(focusSubject && items.length);
  const focusLinks = focus ? items.reduce((a, mo) => a + mo.counts[col], 0) : 0;
  const toggleCol = (id) => setCol((c) => (c === id ? null : id));

  return (
    <div className="outcomes">
      <div className="ohead">
        <div>
          <h1>Kus õppekava väljundeid õpetatakse?</h1>
          <p>Iga rida on õppekava õpiväljund, iga veerg aine. Ruudu tume toon näitab, mitu aine väljundit (mooduli väljundite kaudu) panustavad. Vali rida või veerg.</p>
        </div>
        <div className="legend mono" aria-hidden="true">
          <span>vähe</span><i style={{ opacity: 0.2 }} /><i style={{ opacity: 0.5 }} /><i style={{ opacity: 0.9 }} /><span>palju</span>
        </div>
      </div>

      <div className="matrix">
        <div className="mrow mcols">
          <div className="mlabel" />
          <div className="mgroups">
            {groups.map((g) => (
              <div key={g.sem} className="mgroup">
                <div className="mgl mono">Semester {g.sem}</div>
                <div className="mcells">
                  {g.subjects.map((s) => (
                    <button key={s.id} className="mcol" title={s.name} aria-pressed={col === s.id}
                      style={{ opacity: col && col !== s.id ? 0.35 : 1 }} onClick={() => toggleCol(s.id)}>
                      <span className="mstripe" style={{ background: stripe(s.module) }} />
                      <span className="mname" style={{ fontWeight: col === s.id ? 600 : 400 }}>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mtotal mono muted">seoseid</div>
        </div>

        {learningOutcomes.map((l) => {
          const c = cov[l.id] || {};
          const total = Object.values(c).reduce((a, b) => a + b, 0);
          return (
            <div key={l.id} className="mrow">
              <button className={"mlabel lo" + (row === l.id ? " on" : "")} onClick={() => setRow(l.id)} title={l.description}>
                <span className="mono muted">ÕV {l.id}</span>
                <span className="lotitle">{clip(l.description, 70)}</span>
              </button>
              <div className="mgroups">
                {groups.map((g) => (
                  <div key={g.sem} className="mcells">
                    {g.subjects.map((s) => {
                      const n = c[s.id] || 0, a = shade(n);
                      const dim = (col && col !== s.id) || (!col && row !== l.id);
                      return (
                        <button key={s.id} className={"cell mono" + (row === l.id && col === s.id ? " on" : "")}
                          title={`${s.name} → ÕV ${l.id}: ${n}`}
                          aria-label={`${s.name}, ÕV ${l.id}: ${n} seost`}
                          style={{ background: n ? `rgba(43,95,217,${a})` : "var(--sunken)", color: a > 0.5 ? "#fff" : "var(--ink)", opacity: dim ? 0.4 : 1 }}
                          onClick={() => { setRow(l.id); setCol(n ? s.id : null); }}>
                          {n || ""}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mtotal mono">{total}</div>
            </div>
          );
        })}
      </div>

      {notes.length > 0 && (
        <div className="notes">
          {notes.map((n) => <div key={n} className="note"><b>!</b><span>{n}</span></div>)}
        </div>
      )}

      {lo && (
        <div className="detail">
          <div>
            <div className="label">Õppekava õpiväljund {lo.id}</div>
            <h2>{clip(lo.description, 80)}</h2>
            <p className="desc">{lo.description}</p>
            {lo.khsOutcome && <div className="khs"><b className="mono muted">KHS</b><br />{lo.khsOutcome}</div>}
            <div className="stats">
              <div><b>{(lo.moduleOutcomes || []).length}</b><span>mooduli väljundit</span></div>
              <div><b>{rowSubjects.length}</b><span>ainet</span></div>
              <div><b>{new Set(rowSubjects.map((id) => subj[id].semester)).size}</b><span>semestrit</span></div>
            </div>
          </div>
          <div className="mos">
            {focus && (
              <div className="focus">
                <span><b>{focusSubject.name}</b> toetab ÕV {lo.id} kaudu {items.length} mooduli väljundit ({focusLinks} seost aine väljunditega)</span>
                <button onClick={() => setCol(null)}>Näita kõiki</button>
              </div>
            )}
            <div className="label">{focus ? "Mooduli väljundid, mida see aine toetab" : "Mooduli väljundid ja panustavad ained"}</div>
            {items.map((mo) => (
              <div key={mo.moduleId + "." + mo.id} className="mo">
                <span className="mostripe" style={{ background: stripe(mo.moduleId) }} />
                <div className="motext">
                  <div className="mono muted">M{mo.moduleId}.{mo.id} · {modName[mo.moduleId]}</div>
                  <div className="clamp">{mo.description}</div>
                </div>
                <div className="mochips">
                  {Object.keys(mo.counts).map(Number).sort((a, b) => subj[a].semester - subj[b].semester).map((id) => (
                    <button key={id} className={"schip" + (col === id ? " on" : "")} style={{ opacity: col && col !== id ? 0.35 : 1 }} onClick={() => toggleCol(id)}>
                      <span className="dot" style={{ background: stripe(subj[id].module) }} />
                      {subj[id].name}
                      <span className="mono muted">S{subj[id].semester}{mo.counts[id] > 1 ? " ×" + mo.counts[id] : ""}</span>
                    </button>
                  ))}
                  {!mo.subjectIds.length && <span className="nolinks">Aine väljundeid pole seotud</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutcomesPage() {
  const { curriculum, palette, year } = useCurriculum();
  // Remount on year switch so the selection starts from the first outcome again
  return <Matrix key={year} curriculum={curriculum} palette={palette} />;
}
