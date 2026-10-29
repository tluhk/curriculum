/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useCurriculum } from "../state/CurriculumContext";
import { countBy, coverage, moduleOutcomeIndex, outcomeNotes } from "../utils/outcomes";
import { addCurriculumOutcome, nextCurriculumOutcomeId } from "../utils/outcomeOps";
import EditPanel from "../components/outcomes/EditPanel";
import "../components/outcomes/outcomes.css";

const clip = (t = "", n) => (t.length > n ? t.slice(0, n) + "…" : t);
const shade = (n) => Math.min(0.95, 0.16 + n * 0.1);

function Matrix({ curriculum, palette, history }) {
  const { subjects, modules, learningOutcomes } = curriculum;
  const { update, undo, redo, canUndo, canRedo } = history;
  const stripe = (moduleId) => palette[moduleId]?.stripe || "#999";
  const [row, setRow] = useState(learningOutcomes[0]?.id ?? null);
  const [col, setCol] = useState(null);
  const [edit, setEdit] = useState(false);
  const [focusKey, setFocusKey] = useState(null);

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

  // The selected row can disappear (deleted, undone); fall back to the first outcome
  const lo = learningOutcomes.find((l) => l.id === row) ?? learningOutcomes[0];
  const rowId = lo?.id ?? null;
  const rowCov = cov[rowId] || {};
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
  const selectLo = (id) => { setRow(id); setFocusKey(null); };
  const addLo = () => {
    let id;
    update((c) => { id = nextCurriculumOutcomeId(c); return addCurriculumOutcome(c, id); });
    setRow(id);
    setFocusKey("lo:" + id);
  };

  return (
    <div className="outcomes">
      <div className="ohead">
        <div>
          <h1>Kus õppekava väljundeid õpetatakse?</h1>
          <p>
            Iga rida on õppekava õpiväljund, iga veerg aine. Ruudu tume toon näitab, mitu aine väljundit (mooduli väljundite kaudu) panustavad. Vali rida või veerg.
            {edit && " Muuda režiimis saad valitud rea mooduli väljundeid ja nende aine väljundeid allpool muuta; maatriks arvutatakse kohe uuesti. Muudatused on mustand, Ctrl+Z võtab tagasi."}
          </p>
        </div>
        <div className="otools">
          <div className="seg" role="group" aria-label="Režiim">
            <button aria-pressed={!edit} onClick={() => setEdit(false)}>Ülevaade</button>
            <button aria-pressed={edit} onClick={() => setEdit(true)}>Muuda</button>
          </div>
          {edit && (
            <div className="etools">
              <button className="b accent small" onClick={addLo}>+ Õppekava väljund</button>
              <div className="undo" role="group" aria-label="Muudatused">
                <button onClick={undo} disabled={!canUndo} aria-label="Võta tagasi" title="Võta tagasi (Ctrl+Z)">↶</button>
                <button onClick={redo} disabled={!canRedo} aria-label="Tee uuesti" title="Tee uuesti (Ctrl+Shift+Z)">↷</button>
              </div>
            </div>
          )}
          <div className="legend mono" aria-hidden="true">
            <span>vähe</span><i style={{ opacity: 0.2 }} /><i style={{ opacity: 0.5 }} /><i style={{ opacity: 0.9 }} /><span>palju</span>
          </div>
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
              <button className={"mlabel lo" + (rowId === l.id ? " on" : "")} onClick={() => selectLo(l.id)} title={l.description}>
                <span className="mono muted">ÕV {l.id}</span>
                <span className="lotitle">{clip(l.description, 70) || "(uus õpiväljund)"}</span>
              </button>
              <div className="mgroups">
                {groups.map((g) => (
                  <div key={g.sem} className="mcells">
                    {g.subjects.map((s) => {
                      const n = c[s.id] || 0, a = shade(n);
                      const dim = (col && col !== s.id) || (!col && rowId !== l.id);
                      return (
                        <button key={s.id} className={"cell mono" + (rowId === l.id && col === s.id ? " on" : "")}
                          title={`${s.name} → ÕV ${l.id}: ${n}`}
                          aria-label={`${s.name}, ÕV ${l.id}: ${n} seost`}
                          style={{ background: n ? `rgba(43,95,217,${a})` : "var(--sunken)", color: a > 0.5 ? "#fff" : "var(--ink)", opacity: dim ? 0.4 : 1 }}
                          onClick={() => { selectLo(l.id); setCol(n ? s.id : null); }}>
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

      {edit && lo && (
        <EditPanel key={lo.id} curriculum={curriculum} lo={lo} stripe={stripe} update={update} col={col} setCol={setCol}
          focusKey={focusKey} setFocusKey={setFocusKey} onSelectLo={selectLo} />
      )}
      {edit && !lo && (
        <div className="detail"><div className="nolinks">Õppekaval pole veel õppekava väljundeid. Alusta nupust „+ Õppekava väljund“.</div></div>
      )}

      {!edit && lo && (
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
  const { curriculum, palette, code, year, update, undo, redo, canUndo, canRedo } = useCurriculum();
  // Remount on curriculum or year switch so the selection starts from the first outcome again
  return <Matrix key={code + "." + year} curriculum={curriculum} palette={palette} history={{ update, undo, redo, canUndo, canRedo }} />;
}
