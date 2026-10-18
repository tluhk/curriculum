// Data checks for Haldus → Kontroll. Pure: takes one curriculum version, returns issues sorted by severity.
// Each issue: { sev: "viga" | "hoiatus" | "info", text, target: { type: "subject"|"module"|"co"|"semester", id }, related: [{ type, id }] }
// `related` lists other records the issue is also about (e.g. the elective a required subject depends on).
import { SEMESTER_EAP } from "../constants";

const ORDER = { viga: 0, hoiatus: 1, info: 2 };

export const checkCurriculum = ({ subjects, modules, learningOutcomes }) => {
  const issues = [];
  const add = (sev, text, type, id, related = []) => issues.push({ sev, text, target: { type, id }, related });
  const subj = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const soExists = (sid, oid) => !!subj[sid]?.outcomes.some((o) => o.id === oid);

  subjects.forEach((s) =>
    (s.prerequisites || []).forEach((p) => {
      const y = subj[p];
      if (!y) return add("viga", `${s.name} viitab olematule eeldusainele #${p}.`, "subject", s.id);
      if (y.semester >= s.semester)
        add("viga", `${s.name} (S${s.semester}) eeldab ainet ${y.name} (S${y.semester}) — eeldus peab olema varasemas semestris.`, "subject", s.id,
          [{ type: "subject", id: y.id }]);
      if (s.required && !y.required)
        add("hoiatus", `Kohustuslik aine „${s.name}“ eeldab valikainet „${y.name}“. Kui tudeng seda valikainet ei vali, ei saa ta eeldust täita. Tee „${y.name}“ kohustuslikuks või eemalda see eeldus.`,
          "subject", s.id, [{ type: "subject", id: y.id }]);
    })
  );

  const byName = {};
  subjects.forEach((s) => (byName[s.name.trim().toLowerCase()] ||= []).push(s));
  Object.values(byName).forEach((l) => l.length > 1 && add("viga", `Dubleeruv aine nimi: ${l[0].name}`, "subject", l[0].id));

  modules.forEach((m) => {
    if (!subjects.some((s) => s.module === m.id)) add("hoiatus", `Moodulil „${m.name}“ pole ühtegi ainet.`, "module", m.id);
    m.learningOutcomes.forEach((o) => {
      const bad = (o.subjectOutcomes || []).filter((l) => !soExists(l.subjectId, l.outcomeId));
      if (bad.length)
        add("hoiatus", `M${m.id}.${o.id} viitab ${bad.length} puuduvale aine väljundile (nt aine #${bad[0].subjectId}, väljund ${bad[0].outcomeId}).`, "module", m.id);
    });
  });

  const linked = new Set(learningOutcomes.flatMap((c) => (c.moduleOutcomes || []).map((l) => l.moduleId + "." + l.outcomeId)));
  modules.forEach((m) =>
    m.learningOutcomes.forEach((o) => {
      if (!linked.has(m.id + "." + o.id)) add("info", `Mooduli väljund M${m.id}.${o.id} ei ole seotud ühegi õppekava väljundiga.`, "module", m.id);
    })
  );

  const moExists = (mid, oid) => !!modules.find((m) => m.id === mid)?.learningOutcomes.some((o) => o.id === oid);
  learningOutcomes.forEach((c) => {
    const links = c.moduleOutcomes || [];
    links.forEach((l) => {
      if (!moExists(l.moduleId, l.outcomeId)) add("viga", `ÕV ${c.id} viitab puuduvale mooduli väljundile M${l.moduleId}.${l.outcomeId}.`, "co", c.id);
    });
    if (!links.length) add("hoiatus", `ÕV ${c.id} pole seotud ühegi mooduli väljundiga.`, "co", c.id);
  });

  const semCredits = {};
  subjects.forEach((s) => (semCredits[s.semester] = (semCredits[s.semester] || 0) + s.credits));
  Object.keys(semCredits)
    .sort((a, b) => a - b)
    .forEach((s) => {
      if (semCredits[s] !== SEMESTER_EAP) add("info", `Semester ${s} maht on ${semCredits[s]} EAP (eeldatav ${SEMESTER_EAP}).`, "semester", +s);
    });

  return issues.sort((a, b) => ORDER[a.sev] - ORDER[b.sev]);
};

// Issues about one record: where it is the target or one of the related records
export const issuesFor = (issues, type, id) =>
  issues.filter((i) => (i.target.type === type && i.target.id === id) || i.related.some((r) => r.type === type && r.id === id));

// Errors that block saving a subject draft (prerequisites earlier, dependents later)
export const subjectErrors = (subjects, id, draft) => {
  const errors = [];
  const subj = Object.fromEntries(subjects.map((s) => [s.id, s]));
  if (!draft.name.trim()) errors.push("Nimi on kohustuslik.");
  if (!(draft.credits > 0)) errors.push("Maht peab olema suurem kui 0.");
  draft.prerequisites.forEach((p) => {
    const y = subj[p];
    if (y && y.semester >= draft.semester)
      errors.push(`Eeldus „${y.name}“ (S${y.semester}) peab olema varasemas semestris kui S${draft.semester}.`);
  });
  if (id !== "new")
    subjects
      .filter((s) => (s.prerequisites || []).includes(id) && s.semester <= draft.semester)
      .forEach((s) => errors.push(`Sõltuv aine „${s.name}“ (S${s.semester}) peab jääma hilisemasse semestrisse kui S${draft.semester}.`));
  return errors;
};
