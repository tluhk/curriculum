/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { NO_MODULE, SWATCHES } from "../../constants";
import { subjectErrors } from "../../utils/checks";
import {
  newSubject, saveSubject, deleteSubject, saveModule, deleteModule, saveOutcome, deleteOutcome,
} from "../../utils/adminOps";

const clone = (o) => JSON.parse(JSON.stringify(o));
const clip = (t = "", n) => (t.length > n ? t.slice(0, n) + "…" : t);
const SEMESTERS = [1, 2, 3, 4, 5, 6];

const Field = ({ label, children }) => (
  <label className="field"><span className="label">{label}</span>{children}</label>
);

// Header, scrolling body and footer (errors, delete confirmation, Salvesta / Tühista / Kustuta) shared by all editors
const SEV_CLASS = { viga: "bad", hoiatus: "warn", info: "info" };

function Frame({ isNew, heading, issues = [], errors, deleteLabel, canDelete, confirmText, onSave, onClose, onDelete, children }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <aside className="editor" aria-label={heading}>
      <div className="edhead">
        <div><div className="label">{isNew ? "Lisa" : "Muuda"}</div><div className="edtitle">{heading}</div></div>
        <button onClick={onClose} aria-label="Sulge" className="x">×</button>
      </div>
      <div className="edbody">
        {issues.length > 0 && (
          <div className="edissues" role="note">
            <span className="label">Kontroll ({issues.length})</span>
            {issues.map((i) => (
              <div key={i.text} className="edissue"><span className={"sev mono " + SEV_CLASS[i.sev]}>{i.sev}</span><span>{i.text}</span></div>
            ))}
          </div>
        )}
        {children}
      </div>
      <div className="edfoot">
        {errors.length > 0 && <div className="errors">{errors.map((e) => <div key={e} className="err">{e}</div>)}</div>}
        {confirm && (
          <div className="confirm">
            {confirmText}
            <div className="row-btns">
              <button className="b danger" onClick={onDelete}>Kustuta lõplikult</button>
              <button className="b ghost" onClick={() => setConfirm(false)}>Tühista</button>
            </div>
          </div>
        )}
        <div className="row-btns">
          <button className="b primary" disabled={errors.length > 0} onClick={onSave}>Salvesta</button>
          <button className="b ghost" onClick={onClose}>Tühista</button>
          {!isNew && canDelete && <button className="b link-danger" onClick={() => setConfirm(true)}>{deleteLabel}</button>}
        </div>
      </div>
    </aside>
  );
}

const Toggle = ({ on, onClick, children }) => (
  <button type="button" className="switch" role="switch" aria-checked={on} onClick={onClick}><i />{children}</button>
);

const AddSelect = ({ placeholder, options, onPick }) => (
  <select value="" onChange={(e) => e.target.value && onPick(e.target.value)}>
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
  </select>
);

const OutcomeList = ({ items, onChange, onRemove }) =>
  items.map((o, i) => (
    <div key={o.id} className="outrow">
      <textarea rows={2} value={o.description} onChange={(e) => onChange(i, e.target.value)} />
      <button className="x small" aria-label="Eemalda" onClick={() => onRemove(i)}>×</button>
    </div>
  ));

export function SubjectEditor({ curriculum, id, onCommit, onClose, issues }) {
  const { subjects, modules } = curriculum;
  const [d, setD0] = useState(() => (id === "new" ? newSubject(modules) : clone(subjects.find((s) => s.id === id))));
  const setD = (patch) => setD0((x) => ({ ...x, ...patch }));
  const subj = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);
  const sorted = useMemo(() => [...subjects].sort((a, b) => a.semester - b.semester || a.order - b.order), [subjects]);
  const errors = subjectErrors(subjects, id, d);
  const deps = id === "new" ? [] : subjects.filter((s) => (s.prerequisites || []).includes(id));
  const links = id === "new" ? 0 : modules.reduce((a, m) => a + m.learningOutcomes.reduce((b, o) => b + (o.subjectOutcomes || []).filter((l) => l.subjectId === id).length, 0), 0);
  const maxOutcome = Math.max(0, ...subjects.flatMap((s) => s.outcomes.map((o) => o.id)), ...d.outcomes.map((o) => o.id));
  const setOutcome = (i, description) => setD({ outcomes: d.outcomes.map((o, j) => (j === i ? { ...o, description } : o)) });

  return (
    <Frame
      issues={issues} isNew={id === "new"} heading={d.name || "Uus aine"} errors={errors} deleteLabel="Kustuta aine" canDelete
      confirmText={(deps.length ? `Kustutamisel eemaldatakse eeldus ainetelt: ${deps.map((s) => s.name).join(", ")}. ` : "") +
        (links ? `Eemaldatakse ${links} seost mooduli väljunditega. ` : "") + `Kas kustutada aine „${d.name}“?`}
      onSave={() => onCommit(saveSubject(curriculum, id, d), id === "new" ? "Aine lisatud" : "Aine salvestatud")}
      onDelete={() => onCommit(deleteSubject(curriculum, id), "Aine kustutatud")}
      onClose={onClose}
    >
      <Field label="Nimi"><input value={d.name} onChange={(e) => setD({ name: e.target.value })} /></Field>
      <div className="grid2">
        <Field label="Moodul">
          <select value={d.module} onChange={(e) => setD({ module: +e.target.value })}>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="Semester">
          <select value={d.semester} onChange={(e) => setD({ semester: +e.target.value })}>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Maht (EAP)"><input type="number" min="1" value={d.credits} onChange={(e) => setD({ credits: +e.target.value })} /></Field>
        <div className="field"><span className="label">Kohustuslik</span>
          <Toggle on={d.required} onClick={() => setD({ required: !d.required })}>{d.required ? "Kohustuslik" : "Valikaine"}</Toggle>
        </div>
      </div>
      <div className="field">
        <span className="label">Eeldusained</span>
        <div className="pills">
          {d.prerequisites.map((p) => {
            const y = subj[p] || { name: "?", semester: "?" }, bad = y.semester >= d.semester;
            const elective = d.required && y.required === false;
            return (
              <button key={p} className={"pill" + (bad ? " bad" : elective ? " warn" : "")} onClick={() => setD({ prerequisites: d.prerequisites.filter((x) => x !== p) })}
                title={elective ? "Valikaine kohustusliku aine eeldusena — klõpsa eemaldamiseks" : "Eemalda"}>
                {y.name} · S{y.semester}{elective ? " · valik" : ""} ×
              </button>
            );
          })}
          {!d.prerequisites.length && <span className="muted">Eeldusaineid pole</span>}
        </div>
        <AddSelect placeholder="+ Lisa eeldusaine…" onPick={(v) => setD({ prerequisites: [...d.prerequisites, +v] })}
          options={sorted.filter((s) => s.id !== id && !d.prerequisites.includes(s.id) && s.semester < d.semester).map((s) => ({ key: s.id, label: `S${s.semester} · ${s.name}` }))} />
      </div>
      <Field label="Hindamisvorm"><input value={d.assessment} onChange={(e) => setD({ assessment: e.target.value })} /></Field>
      <Field label="Ainekaardi URL"><input value={d.url} placeholder="https://" onChange={(e) => setD({ url: e.target.value })} /></Field>
      <Field label="Eesmärk"><textarea rows={3} value={d.objective} onChange={(e) => setD({ objective: e.target.value })} /></Field>
      <Field label="Sisu"><textarea rows={3} value={d.content} onChange={(e) => setD({ content: e.target.value })} /></Field>
      <div className="field">
        <span className="label">Aine õpiväljundid ({d.outcomes.length})</span>
        <OutcomeList items={d.outcomes} onChange={setOutcome} onRemove={(i) => setD({ outcomes: d.outcomes.filter((_, j) => j !== i) })} />
        <button className="b dashed" onClick={() => setD({ outcomes: [...d.outcomes, { id: maxOutcome + 1, description: "" }] })}>+ Lisa õpiväljund</button>
      </div>
    </Frame>
  );
}

export function ModuleEditor({ curriculum, id, palette, onCommit, onClose, issues }) {
  const { subjects } = curriculum;
  const [d, setD0] = useState(() => {
    if (id === "new") { const [color, stripe] = SWATCHES[SWATCHES.length - 1]; return { name: "", objective: "", learningOutcomes: [], color, stripe }; }
    const m = clone(curriculum.modules.find((x) => x.id === id));
    return { ...m, color: palette[id].color, stripe: palette[id].stripe };
  });
  const setD = (patch) => setD0((x) => ({ ...x, ...patch }));
  const subj = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);
  const allSO = useMemo(() => subjects.flatMap((s) => s.outcomes.map((o) => ({ key: s.id + "." + o.id, label: `${s.name} · ${clip(o.description, 40)}` }))), [subjects]);
  const soText = (sid, oid) => subj[sid]?.outcomes.find((o) => o.id === oid)?.description ?? null;
  const used = id === "new" ? [] : subjects.filter((s) => s.module === id);
  const errors = d.name.trim() ? [] : ["Nimi on kohustuslik."];
  const setO = (i, patch) => setD({ learningOutcomes: d.learningOutcomes.map((o, j) => (j === i ? { ...o, ...patch } : o)) });

  return (
    <Frame
      issues={issues} isNew={id === "new"} heading={d.name || "Uus moodul"} errors={errors} deleteLabel="Kustuta moodul" canDelete={!used.length}
      confirmText={`Kas kustutada moodul „${d.name}“? Selle väljundite seosed õppekava väljunditega eemaldatakse.`}
      onSave={() => onCommit(saveModule(curriculum, id, d), id === "new" ? "Moodul lisatud" : "Moodul salvestatud")}
      onDelete={() => onCommit(deleteModule(curriculum, id), "Moodul kustutatud")}
      onClose={onClose}
    >
      <Field label="Mooduli nimi"><input value={d.name} onChange={(e) => setD({ name: e.target.value })} /></Field>
      <div className="field"><span className="label">Värv</span>
        <div className="swatches">
          {SWATCHES.map(([color, stripe]) => (
            <button key={color} aria-label={"Vali värv " + color} aria-pressed={d.color === color} onClick={() => setD({ color, stripe })}
              style={{ background: color, borderColor: d.color === color ? "var(--ink)" : color, borderBottomColor: stripe }} />
          ))}
        </div>
      </div>
      <div className="muted">
        {id === "new" ? "Uus moodul." : `Kasutusel ${used.length} aines (${used.reduce((a, s) => a + s.credits, 0)} EAP). ${used.length ? "Kustutamiseks liiguta ained esmalt teise moodulisse." : ""}`}
      </div>
      <div className="field">
        <span className="label">Mooduli õpiväljundid ({d.learningOutcomes.length})</span>
        {d.learningOutcomes.map((o, i) => {
          const links = o.subjectOutcomes || [];
          const has = new Set(links.map((l) => l.subjectId + "." + l.outcomeId));
          return (
            <div key={o.id} className="mobox">
              <div className="outrow">
                <span className="mono muted code">M{id === "new" ? "?" : id}.{o.id}</span>
                <textarea rows={2} value={o.description} onChange={(e) => setO(i, { description: e.target.value })} />
                <button className="x small" aria-label="Eemalda" onClick={() => setD({ learningOutcomes: d.learningOutcomes.filter((_, j) => j !== i) })}>×</button>
              </div>
              <div className="molinks">
                <div className="pills">
                  {links.map((l) => {
                    const t = soText(l.subjectId, l.outcomeId), miss = t === null;
                    return (
                      <button key={l.subjectId + "." + l.outcomeId} className={"pill" + (miss ? " bad" : "")} title="Eemalda seos"
                        onClick={() => setO(i, { subjectOutcomes: links.filter((x) => !(x.subjectId === l.subjectId && x.outcomeId === l.outcomeId)) })}>
                        {miss ? `puudub: #${l.subjectId}/${l.outcomeId}` : `${subj[l.subjectId].name} · ${clip(t, 26)}`} ×
                      </button>
                    );
                  })}
                </div>
                <AddSelect placeholder={`+ Seo aine väljundiga (${allSO.length - has.size})…`} options={allSO.filter((x) => !has.has(x.key))}
                  onPick={(v) => { const [subjectId, outcomeId] = v.split(".").map(Number); setO(i, { subjectOutcomes: [...links, { subjectId, outcomeId }] }); }} />
              </div>
            </div>
          );
        })}
        <button className="b dashed" onClick={() => setD({ learningOutcomes: [...d.learningOutcomes, { id: Math.max(0, ...d.learningOutcomes.map((o) => o.id)) + 1, description: "", subjectOutcomes: [] }] })}>
          + Lisa õpiväljund
        </button>
      </div>
    </Frame>
  );
}

export function OutcomeEditor({ curriculum, id, palette, onCommit, onClose, issues }) {
  const { modules } = curriculum;
  const [d, setD0] = useState(() => (id === "new" ? { description: "", khsOutcome: "", moduleOutcomes: [] } : clone(curriculum.learningOutcomes.find((x) => x.id === id))));
  const setD = (patch) => setD0((x) => ({ ...x, ...patch }));
  const links = d.moduleOutcomes || [];
  const moText = (m, o) => modules.find((x) => x.id === m)?.learningOutcomes.find((x) => x.id === o)?.description;
  const has = new Set(links.map((l) => l.moduleId + "." + l.outcomeId));
  const allMO = modules.flatMap((m) => m.learningOutcomes.map((o) => ({ key: m.id + "." + o.id, label: `M${m.id}.${o.id} · ${clip(o.description, 48)}` })));
  const errors = d.description.trim() ? [] : ["Õpiväljundi tekst on kohustuslik."];

  return (
    <Frame
      issues={issues} isNew={id === "new"} heading={id === "new" ? "Uus õppekava väljund" : "ÕV " + id} errors={errors} deleteLabel="Kustuta õpiväljund" canDelete
      confirmText={`Kas kustutada õppekava väljund ÕV ${id}?`}
      onSave={() => onCommit(saveOutcome(curriculum, id, d), id === "new" ? "Õpiväljund lisatud" : "Õpiväljund salvestatud")}
      onDelete={() => onCommit(deleteOutcome(curriculum, id), "Õpiväljund kustutatud")}
      onClose={onClose}
    >
      <Field label="KHS õpiväljund">
        <textarea rows={3} value={d.khsOutcome || ""} placeholder="Seotud kõrgharidusstandardi väljund" onChange={(e) => setD({ khsOutcome: e.target.value })} />
      </Field>
      <Field label="Õpiväljund"><textarea rows={5} value={d.description} onChange={(e) => setD({ description: e.target.value })} /></Field>
      <div className="field">
        <span className="label">Seotud mooduli väljundid ({links.length})</span>
        {links.map((l) => (
          <div key={l.moduleId + "." + l.outcomeId} className="linkrow">
            <span className="mostripe" style={{ background: (palette[l.moduleId] || NO_MODULE).stripe }} />
            <span className="linktext"><b className="mono muted">M{l.moduleId}.{l.outcomeId}</b> {moText(l.moduleId, l.outcomeId) || "(puudub)"}</span>
            <button className="x small" aria-label="Eemalda" onClick={() => setD({ moduleOutcomes: links.filter((x) => !(x.moduleId === l.moduleId && x.outcomeId === l.outcomeId)) })}>×</button>
          </div>
        ))}
        <AddSelect placeholder="+ Seo mooduli väljundiga…" options={allMO.filter((x) => !has.has(x.key))}
          onPick={(v) => { const [moduleId, outcomeId] = v.split(".").map(Number); setD({ moduleOutcomes: [...links, { moduleId, outcomeId }] }); }} />
      </div>
    </Frame>
  );
}
