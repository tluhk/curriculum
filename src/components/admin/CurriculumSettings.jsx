/* eslint-disable react/prop-types */
import { useState } from "react";
import { useCurriculum } from "../../state/CurriculumContext";
import { LEVELS, DEFAULT_LEVEL, levelOf, semesterCount, slug, newCurriculum, copyVersion, curriculumErrors } from "../../utils/curricula";
import { SEMESTER_EAP } from "../../constants";

const Field = ({ label, children }) => <label className="field"><span className="label">{label}</span>{children}</label>;
const Errors = ({ list }) => list.length > 0 && <div className="errors">{list.map((e) => <div key={e} className="err">{e}</div>)}</div>;
const LevelSelect = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    {Object.entries(LEVELS).map(([k, l]) => <option key={k} value={k}>{l.label}</option>)}
  </select>
);

// Haldus → Õppekava: overview of all curricula, settings of the open one, and creating a new year or curriculum
export default function CurriculumSettings({ onDone }) {
  const { curriculum, curricula, entries, code, year, update, create, setCurriculum } = useCurriculum();

  const [meta, setMeta] = useState(() => ({ name: curriculum.name, level: levelOf(curriculum), semesters: semesterCount(curriculum), objective: curriculum.objective || "" }));
  const nextYear = String(Math.max(...curricula.find((g) => g.code === code).versions.map((v) => +v.version)) + 1);
  const [newYear, setNewYear] = useState(nextYear);
  const [nc, setNc] = useState({ name: "", code: "", codeTouched: false, level: DEFAULT_LEVEL, semesters: LEVELS[DEFAULT_LEVEL].semesters, version: year });

  const usedSemesters = Math.max(0, ...curriculum.subjects.map((s) => s.semester));
  const metaErrors = [
    ...(meta.name.trim() ? [] : ["Nimi on kohustuslik."]),
    ...(meta.semesters >= 1 && meta.semesters <= 12 ? [] : ["Semestreid peab olema 1–12."]),
    ...(meta.semesters < usedSemesters ? [`Aineid on kuni ${usedSemesters}. semestrini; liiguta need enne ümber.`] : []),
  ];
  const yearErrors = curriculumErrors(entries, { code, version: newYear });
  const ncCode = nc.codeTouched ? nc.code : nc.name.trim() ? slug(nc.name).slice(0, 4) : "";
  const ncErrors = curriculumErrors(entries, { code: ncCode, name: nc.name, version: nc.version });

  return (
    <section className="alist csettings">
      <h1>Õppekavad</h1>
      <p className="lead">Iga õppekava kuvatakse eraldi; vali see ülaribalt. Uued õppekavad ja aastad on alguses ainult selles brauseris, kuni ekspordid curriculum.js.</p>
      <div className="scroll">
        <div className="ctable" role="table" aria-label="Kõik õppekavad">
          {curricula.map((g) => {
            const latest = g.versions[g.versions.length - 1];
            const eap = latest.subjects.reduce((a, s) => a + s.credits, 0);
            return (
              <button key={g.code} role="row" className={"crow" + (g.code === code ? " on" : "")} onClick={() => setCurriculum(g.code)}>
                <span className="mono code">{g.code}</span>
                <span className="cname">{g.name}</span>
                <span className="muted">{LEVELS[g.level].label}</span>
                <span className="mono muted">{g.versions.map((v) => v.version).join(", ")}</span>
                <span className="mono muted">{latest.subjects.length} ainet · {eap}/{semesterCount(latest) * SEMESTER_EAP} EAP</span>
              </button>
            );
          })}
        </div>

        <div className="ccards">
          <div className="ccard">
            <h2>{curriculum.name} <span className="mono muted">{code} · {year}</span></h2>
            <Field label="Nimi"><input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} /></Field>
            <div className="grid2">
              <Field label="Tase"><LevelSelect value={meta.level} onChange={(level) => setMeta({ ...meta, level })} /></Field>
              <Field label="Semestreid"><input type="number" min="1" max="12" value={meta.semesters} onChange={(e) => setMeta({ ...meta, semesters: +e.target.value })} /></Field>
            </div>
            <Field label="Eesmärk"><textarea rows={4} value={meta.objective} onChange={(e) => setMeta({ ...meta, objective: e.target.value })} /></Field>
            <Errors list={metaErrors} />
            <div className="row-btns">
              <button className="b primary" disabled={metaErrors.length > 0}
                onClick={() => { update((c) => ({ ...c, name: meta.name.trim(), level: meta.level, semesters: meta.semesters, objective: meta.objective })); onDone("Õppekava salvestatud"); }}>
                Salvesta
              </button>
            </div>
          </div>

          <div className="ccard">
            <h2>Uus aasta</h2>
            <p className="muted">Uus versioon algab praeguse ({year}) koopiana. Varasem aasta jääb muutmata.</p>
            <Field label="Aasta"><input value={newYear} inputMode="numeric" onChange={(e) => setNewYear(e.target.value.trim())} /></Field>
            <Errors list={yearErrors} />
            <div className="row-btns">
              <button className="b accent" disabled={yearErrors.length > 0} onClick={() => create(copyVersion(entries, curriculum, newYear))}>
                + Loo {code} {newYear}
              </button>
            </div>
          </div>

          <div className="ccard">
            <h2>Uus õppekava</h2>
            <p className="muted">Tühi õppekava: lisa moodulid, ained ja õpiväljundid siin Halduses.</p>
            <Field label="Nimi"><input value={nc.name} placeholder="Õppekava nimi" onChange={(e) => setNc({ ...nc, name: e.target.value })} /></Field>
            <div className="grid2">
              <Field label="Kood"><input value={ncCode} placeholder="nt RIF" onChange={(e) => setNc({ ...nc, code: e.target.value.toUpperCase(), codeTouched: true })} /></Field>
              <Field label="Esimene aasta"><input value={nc.version} inputMode="numeric" onChange={(e) => setNc({ ...nc, version: e.target.value.trim() })} /></Field>
              <Field label="Tase"><LevelSelect value={nc.level} onChange={(level) => setNc({ ...nc, level, semesters: LEVELS[level].semesters })} /></Field>
              <Field label="Semestreid"><input type="number" min="1" max="12" value={nc.semesters} onChange={(e) => setNc({ ...nc, semesters: +e.target.value })} /></Field>
            </div>
            <Errors list={nc.name ? ncErrors : []} />
            <div className="row-btns">
              <button className="b accent" disabled={!nc.name || ncErrors.length > 0}
                onClick={() => create(newCurriculum(entries, { code: ncCode, name: nc.name, level: nc.level, semesters: nc.semesters, version: nc.version }))}>
                + Loo õppekava
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
