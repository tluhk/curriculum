// Pure operations on one curriculum version for the outcome levels:
//   curriculum outcome (ÕV) → module outcome → subject outcome
// Links live on the parent: lo.moduleOutcomes = [{ moduleId, outcomeId }], moduleOutcome.subjectOutcomes = [{ subjectId, outcomeId }].
// Every operation returns a new curriculum (or the same one when nothing changes) and keeps links consistent.
import { deleteOutcome } from "./adminOps";

const maxId = (items) => Math.max(0, ...items.map((x) => x.id));

// New ids continue after the highest existing one, so a curriculum numbered 1–8 gets 9 and one numbered 181–188 gets 189
export const nextCurriculumOutcomeId = (c) => maxId(c.learningOutcomes) + 1;
export const nextModuleOutcomeId = (c, moduleId) => maxId(c.modules.find((m) => m.id === moduleId)?.learningOutcomes || []) + 1;
export const nextSubjectOutcomeId = (c) => Math.max(0, ...c.subjects.flatMap((s) => s.outcomes.map((o) => o.id))) + 1;

const mapLo = (c, id, fn) => ({ ...c, learningOutcomes: c.learningOutcomes.map((l) => (l.id === id ? fn(l) : l)) });
const mapModuleOutcome = (c, moduleId, outcomeId, fn) => ({
  ...c,
  modules: c.modules.map((m) => (m.id !== moduleId ? m : { ...m, learningOutcomes: m.learningOutcomes.map((o) => (o.id === outcomeId ? fn(o) : o)) })),
});
const mapSubject = (c, id, fn) => ({ ...c, subjects: c.subjects.map((s) => (s.id === id ? fn(s) : s)) });

const hasModuleLink = (lo, moduleId, outcomeId) => (lo.moduleOutcomes || []).some((l) => l.moduleId === moduleId && l.outcomeId === outcomeId);
const hasSubjectLink = (mo, subjectId, outcomeId) => (mo.subjectOutcomes || []).some((l) => l.subjectId === subjectId && l.outcomeId === outcomeId);

// ÕV ↔ module outcome
export const linkModuleOutcome = (c, loId, moduleId, outcomeId) =>
  mapLo(c, loId, (lo) => (hasModuleLink(lo, moduleId, outcomeId) ? lo : { ...lo, moduleOutcomes: [...(lo.moduleOutcomes || []), { moduleId, outcomeId }] }));
export const unlinkModuleOutcome = (c, loId, moduleId, outcomeId) =>
  mapLo(c, loId, (lo) => ({ ...lo, moduleOutcomes: (lo.moduleOutcomes || []).filter((l) => !(l.moduleId === moduleId && l.outcomeId === outcomeId)) }));

// module outcome ↔ subject outcome
export const linkSubjectOutcome = (c, moduleId, outcomeId, subjectId, subjectOutcomeId) =>
  mapModuleOutcome(c, moduleId, outcomeId, (mo) =>
    hasSubjectLink(mo, subjectId, subjectOutcomeId) ? mo : { ...mo, subjectOutcomes: [...(mo.subjectOutcomes || []), { subjectId, outcomeId: subjectOutcomeId }] });
export const unlinkSubjectOutcome = (c, moduleId, outcomeId, subjectId, subjectOutcomeId) =>
  mapModuleOutcome(c, moduleId, outcomeId, (mo) => ({
    ...mo,
    subjectOutcomes: (mo.subjectOutcomes || []).filter((l) => !(l.subjectId === subjectId && l.outcomeId === subjectOutcomeId)),
  }));

// Curriculum outcomes
export const addCurriculumOutcome = (c, id = nextCurriculumOutcomeId(c), description = "") => ({
  ...c,
  learningOutcomes: [...c.learningOutcomes, { id, description, moduleOutcomes: [] }],
});
export const updateCurriculumOutcome = (c, id, patch) =>
  mapLo(c, id, (lo) => {
    const next = { ...lo, ...patch };
    if ("khsOutcome" in patch && !String(patch.khsOutcome ?? "").trim()) delete next.khsOutcome;
    return next;
  });
export const removeCurriculumOutcome = deleteOutcome;

// Module outcomes
export const addModuleOutcome = (c, moduleId, id = nextModuleOutcomeId(c, moduleId), description = "") => ({
  ...c,
  modules: c.modules.map((m) => (m.id !== moduleId ? m : { ...m, learningOutcomes: [...m.learningOutcomes, { id, description, subjectOutcomes: [] }] })),
});
export const updateModuleOutcome = (c, moduleId, outcomeId, description) => mapModuleOutcome(c, moduleId, outcomeId, (mo) => ({ ...mo, description }));
export const removeModuleOutcome = (c, moduleId, outcomeId) => ({
  ...c,
  modules: c.modules.map((m) => (m.id !== moduleId ? m : { ...m, learningOutcomes: m.learningOutcomes.filter((o) => o.id !== outcomeId) })),
  learningOutcomes: c.learningOutcomes.map((lo) => ({
    ...lo,
    moduleOutcomes: (lo.moduleOutcomes || []).filter((l) => !(l.moduleId === moduleId && l.outcomeId === outcomeId)),
  })),
});

// Subject outcomes
export const addSubjectOutcome = (c, subjectId, id = nextSubjectOutcomeId(c), description = "") =>
  mapSubject(c, subjectId, (s) => ({ ...s, outcomes: [...s.outcomes, { id, description }] }));
export const updateSubjectOutcome = (c, subjectId, outcomeId, description) =>
  mapSubject(c, subjectId, (s) => ({ ...s, outcomes: s.outcomes.map((o) => (o.id === outcomeId ? { ...o, description } : o)) }));
export const removeSubjectOutcome = (c, subjectId, outcomeId) => ({
  ...mapSubject(c, subjectId, (s) => ({ ...s, outcomes: s.outcomes.filter((o) => o.id !== outcomeId) })),
  modules: c.modules.map((m) => ({
    ...m,
    learningOutcomes: m.learningOutcomes.map((o) =>
      hasSubjectLink(o, subjectId, outcomeId) ? { ...o, subjectOutcomes: o.subjectOutcomes.filter((l) => !(l.subjectId === subjectId && l.outcomeId === outcomeId)) } : o),
  })),
});

// Sets the module-outcome links of a subject's outcomes in one go (subject editor in Haldus).
// linkMap: { [subjectOutcomeId]: [{ moduleId, outcomeId }] }. Existing links that stay keep their position; links to ids the subject no longer has are dropped.
export const setSubjectOutcomeLinks = (c, subjectId, linkMap) => {
  const subject = c.subjects.find((s) => s.id === subjectId);
  if (!subject) return c;
  const valid = new Set(subject.outcomes.map((o) => o.id));
  const wanted = new Map(); // "moduleId.outcomeId" -> subject outcome ids
  Object.entries(linkMap).forEach(([soId, targets]) => {
    if (!valid.has(Number(soId))) return;
    targets.forEach((t) => {
      const k = t.moduleId + "." + t.outcomeId;
      if (!wanted.has(k)) wanted.set(k, new Set());
      wanted.get(k).add(Number(soId));
    });
  });
  let changed = false;
  const modules = c.modules.map((m) => {
    let moduleChanged = false;
    const learningOutcomes = m.learningOutcomes.map((mo) => {
      const want = wanted.get(m.id + "." + mo.id) || new Set();
      const current = mo.subjectOutcomes || [];
      const keep = current.filter((l) => l.subjectId !== subjectId || want.has(l.outcomeId));
      const add = [...want].filter((soId) => !current.some((l) => l.subjectId === subjectId && l.outcomeId === soId)).map((soId) => ({ subjectId, outcomeId: soId }));
      if (keep.length === current.length && !add.length) return mo;
      moduleChanged = true;
      return { ...mo, subjectOutcomes: [...keep, ...add] };
    });
    if (!moduleChanged) return m;
    changed = true;
    return { ...m, learningOutcomes };
  });
  return changed ? { ...c, modules } : c;
};

// The module outcomes a subject outcome feeds: [{ moduleId, outcomeId }]
export const linksOfSubjectOutcome = (c, subjectId, subjectOutcomeId) =>
  c.modules.flatMap((m) => m.learningOutcomes.filter((o) => hasSubjectLink(o, subjectId, subjectOutcomeId)).map((o) => ({ moduleId: m.id, outcomeId: o.id })));

// How many links go with an outcome when it is deleted (for the confirmation text)
export const moduleOutcomeUsage = (c, moduleId, outcomeId) => ({
  curriculum: c.learningOutcomes.filter((lo) => hasModuleLink(lo, moduleId, outcomeId)).length,
  subject: (c.modules.find((m) => m.id === moduleId)?.learningOutcomes.find((o) => o.id === outcomeId)?.subjectOutcomes || []).length,
});
