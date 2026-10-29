/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  nextModuleOutcomeId, nextSubjectOutcomeId,
  addModuleOutcome, addSubjectOutcome, linkModuleOutcome, unlinkModuleOutcome, linkSubjectOutcome, unlinkSubjectOutcome,
  updateCurriculumOutcome, updateModuleOutcome, updateSubjectOutcome, removeCurriculumOutcome, removeModuleOutcome, removeSubjectOutcome,
  linksOfSubjectOutcome, moduleOutcomeUsage,
} from "../../utils/outcomeOps";

const clip = (t = "", n) => (t.length > n ? t.slice(0, n) + "…" : t);

// Text that is saved when the field loses focus (one undo step per edit, not per keystroke); Esc cancels
function TextEdit({ value, onCommit, rows = 2, autoFocus = false, placeholder, label }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <textarea className="eta" rows={rows} value={v} placeholder={placeholder} aria-label={label} autoFocus={autoFocus}
      onFocus={(e) => autoFocus && e.target.select()}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onCommit(v)}
      onKeyDown={(e) => { if (e.key === "Escape") { setV(value); e.currentTarget.blur(); } }} />
  );
}

// A select that adds something and snaps back to its prompt. `groups`: [{ label, options: [{ value, label }] }]
function AddSelect({ prompt, groups, onPick, disabled }) {
  const empty = groups.every((g) => !g.options.length);
  return (
    <select className="addsel" value="" disabled={disabled || empty} aria-label={prompt} onChange={(e) => e.target.value && onPick(e.target.value)}>
      <option value="">{empty ? prompt.replace(/…$/, "") + " (pole valikuid)" : prompt}</option>
      {groups.filter((g) => g.options.length).map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

// Editable detail panel under the coverage matrix: the selected ÕV, its module outcomes and their subject outcomes
export default function EditPanel({ curriculum, lo, stripe, update, col, setCol, focusKey, setFocusKey, onSelectLo }) {
  const { subjects, modules, learningOutcomes } = curriculum;
  const [allModules, setAllModules] = useState(false);
  const subj = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);
  const sortedSubjects = useMemo(() => [...subjects].sort((a, b) => a.semester - b.semester || a.order - b.order), [subjects]);

  const linked = (lo.moduleOutcomes || [])
    .map((l) => {
      const module = modules.find((m) => m.id === l.moduleId);
      const mo = module?.learningOutcomes.find((o) => o.id === l.outcomeId);
      return mo && { module, mo };
    })
    .filter(Boolean);
  const isLinked = (moduleId, outcomeId) => (lo.moduleOutcomes || []).some((l) => l.moduleId === moduleId && l.outcomeId === outcomeId);

  // --- ÕV level
  const removeLo = () => {
    const n = (lo.moduleOutcomes || []).length;
    if (!window.confirm(`Kustutada õppekava väljund ÕV ${lo.id}?${n ? ` Eemaldatakse ${n} seost mooduli väljunditega.` : ""}`)) return;
    const rest = learningOutcomes.filter((l) => l.id !== lo.id);
    update((c) => removeCurriculumOutcome(c, lo.id));
    onSelectLo(rest[0]?.id ?? null);
  };
  const linkExisting = (value) => { const [moduleId, outcomeId] = value.split(".").map(Number); update((c) => linkModuleOutcome(c, lo.id, moduleId, outcomeId)); };
  const addNewModuleOutcome = (value) => {
    const moduleId = Number(value);
    let id;
    update((c) => { id = nextModuleOutcomeId(c, moduleId); return linkModuleOutcome(addModuleOutcome(c, moduleId, id), lo.id, moduleId, id); });
    setFocusKey(`mo:${moduleId}.${id}`);
  };

  // --- module outcome level
  const removeMo = (moduleId, mo) => {
    const u = moduleOutcomeUsage(curriculum, moduleId, mo.id);
    if (!window.confirm(`Kustutada mooduli väljund M${moduleId}.${mo.id} kõikjalt? Eemaldatakse seosed ${u.curriculum} õppekava väljundiga ja ${u.subject} aine väljundiga (aine väljundid ise jäävad alles).`)) return;
    update((c) => removeModuleOutcome(c, moduleId, mo.id));
  };
  const subjectPool = (moduleId) => {
    const own = sortedSubjects.filter((s) => s.module === moduleId);
    return allModules || !own.length ? sortedSubjects : own;
  };
  const subjectOutcomeGroups = (moduleId, mo) =>
    subjectPool(moduleId).map((s) => ({
      label: `S${s.semester} · ${s.name}`,
      options: s.outcomes
        .filter((o) => !(mo.subjectOutcomes || []).some((l) => l.subjectId === s.id && l.outcomeId === o.id))
        .map((o) => ({ value: `${s.id}.${o.id}`, label: clip(o.description, 90) || "(tühi)" })),
    }));
  const linkSubject = (moduleId, mo, value) => {
    const [subjectId, outcomeId] = value.split(".").map(Number);
    update((c) => linkSubjectOutcome(c, moduleId, mo.id, subjectId, outcomeId));
  };
  const addNewSubjectOutcome = (moduleId, mo, value) => {
    const subjectId = Number(value);
    let id;
    update((c) => { id = nextSubjectOutcomeId(c); return linkSubjectOutcome(addSubjectOutcome(c, subjectId, id), moduleId, mo.id, subjectId, id); });
    setFocusKey(`so:${subjectId}.${id}`);
  };
  const removeSo = (subjectId, outcomeId) => {
    const n = linksOfSubjectOutcome(curriculum, subjectId, outcomeId).length;
    if (!window.confirm(`Kustutada aine väljund ainest „${subj[subjectId]?.name}“? Seotud ${n} mooduli väljundiga.`)) return;
    update((c) => removeSubjectOutcome(c, subjectId, outcomeId));
  };

  const moduleGroups = modules.map((m) => ({
    label: `M${m.id} · ${m.name}`,
    options: m.learningOutcomes.filter((o) => !isLinked(m.id, o.id)).map((o) => ({ value: `${m.id}.${o.id}`, label: `M${m.id}.${o.id} · ${clip(o.description, 80) || "(tühi)"}` })),
  }));

  return (
    <div className="detail editing">
      <div>
        <div className="label">Õppekava õpiväljund {lo.id}</div>
        <TextEdit key={"lo" + lo.id} value={lo.description} rows={5} label="Õppekava väljundi tekst" placeholder="Õppekava väljundi tekst"
          autoFocus={focusKey === "lo:" + lo.id} onCommit={(description) => update((c) => updateCurriculumOutcome(c, lo.id, { description }))} />
        <div className="label spaced">KHS õpiväljund</div>
        <TextEdit key={"khs" + lo.id} value={lo.khsOutcome || ""} rows={3} label="KHS õpiväljund" placeholder="Seotud kõrgharidusstandardi väljund"
          onCommit={(khsOutcome) => update((c) => updateCurriculumOutcome(c, lo.id, { khsOutcome }))} />
        <div className="editbtns">
          <button className="b link-danger" onClick={removeLo}>Kustuta see õppekava väljund</button>
        </div>
      </div>

      <div className="mos">
        <div className="label">Mooduli väljundid ja nende aine väljundid</div>
        {col && subj[col] && (
          <div className="focus">
            <span>Valitud aine: <b>{subj[col].name}</b> — selle aine väljundid on allpool esile tõstetud</span>
            <button onClick={() => setCol(null)}>Tühista valik</button>
          </div>
        )}
        {!linked.length && <div className="nolinks">Sellel õppekava väljundil pole veel seotud mooduli väljundeid. Lisa allpool.</div>}

        {linked.map(({ module, mo }) => {
          const moKey = `mo:${module.id}.${mo.id}`;
          return (
            <div key={moKey} className="mo editcard">
              <span className="mostripe" style={{ background: stripe(module.id) }} />
              <div className="mohead">
                <div className="mono muted">M{module.id}.{mo.id} · {module.name}</div>
                <div className="moactions">
                  <button onClick={() => update((c) => unlinkModuleOutcome(c, lo.id, module.id, mo.id))} title="Eemalda seos sellelt õppekava väljundilt">Eemalda seos</button>
                  <button className="danger" onClick={() => removeMo(module.id, mo)}>Kustuta</button>
                </div>
              </div>
              <TextEdit key={moKey + (focusKey === moKey)} value={mo.description} rows={2} label={`Mooduli väljund M${module.id}.${mo.id}`} placeholder="Mooduli väljundi tekst"
                autoFocus={focusKey === moKey} onCommit={(d) => update((c) => updateModuleOutcome(c, module.id, mo.id, d))} />

              <div className="sos">
                {(mo.subjectOutcomes || []).map((l) => {
                  const s = subj[l.subjectId];
                  const so = s?.outcomes.find((o) => o.id === l.outcomeId);
                  const soKey = `so:${l.subjectId}.${l.outcomeId}`;
                  return (
                    <div key={soKey} className={"sorow" + (col && col !== l.subjectId ? " dim" : "")}>
                      <button className="schip" onClick={() => setCol(col === l.subjectId ? null : l.subjectId)} title="Vali see aine maatriksis">
                        <span className="dot" style={{ background: stripe(s?.module) }} />{s ? s.name : `puudub #${l.subjectId}`}
                        {s && <span className="mono muted">S{s.semester}</span>}
                      </button>
                      {so ? (
                        <TextEdit key={soKey + (focusKey === soKey)} value={so.description} rows={1} label={`Aine väljund (${s.name})`} placeholder="Aine väljundi tekst"
                          autoFocus={focusKey === soKey} onCommit={(d) => update((c) => updateSubjectOutcome(c, l.subjectId, l.outcomeId, d))} />
                      ) : <span className="nolinks">Aine väljundit {l.outcomeId} pole olemas</span>}
                      <div className="soactions">
                        <button onClick={() => update((c) => unlinkSubjectOutcome(c, module.id, mo.id, l.subjectId, l.outcomeId))} title="Eemalda seos">×</button>
                        {so && <button className="danger" onClick={() => removeSo(l.subjectId, l.outcomeId)} title="Kustuta aine väljund">kustuta</button>}
                      </div>
                    </div>
                  );
                })}
                {!(mo.subjectOutcomes || []).length && <span className="nolinks">Aine väljundeid pole seotud</span>}
              </div>

              <div className="adds">
                <AddSelect prompt="+ Seo aine väljund…" groups={subjectOutcomeGroups(module.id, mo)} onPick={(v) => linkSubject(module.id, mo, v)} />
                <AddSelect prompt="+ Uus aine väljund ainele…" groups={[{ label: "Aine", options: subjectPool(module.id).map((s) => ({ value: String(s.id), label: `S${s.semester} · ${s.name}` })) }]}
                  onPick={(v) => addNewSubjectOutcome(module.id, mo, v)} />
              </div>
            </div>
          );
        })}

        <div className="adds main">
          <AddSelect prompt="+ Seo mooduli väljundiga…" groups={moduleGroups} onPick={linkExisting} />
          <AddSelect prompt="+ Uus mooduli väljund moodulisse…" groups={[{ label: "Moodul", options: modules.map((m) => ({ value: String(m.id), label: `M${m.id} · ${m.name}` })) }]} onPick={addNewModuleOutcome} />
          <label className="check"><input type="checkbox" checked={allModules} onChange={(e) => setAllModules(e.target.checked)} /> Näita aine väljundeid kõigist moodulitest</label>
        </div>
      </div>
    </div>
  );
}
