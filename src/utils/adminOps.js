// Pure create/update/delete operations for Haldus. Each takes a curriculum version and returns a new one,
// keeping links consistent (prerequisites, module → subject outcome links, ÕV → module outcome links).
import { moduleConfig } from "../constants";

const nextId = (items, floor = 0) => Math.max(floor, ...items.map((x) => x.id)) + 1;
const lastOrder = (subjects, semester) => Math.max(0, ...subjects.filter((s) => s.semester === semester).map((s) => s.order));
const mapModuleLinks = (modules, keep) =>
  modules.map((m) => ({
    ...m,
    learningOutcomes: m.learningOutcomes.map((o) =>
      o.subjectOutcomes ? { ...o, subjectOutcomes: o.subjectOutcomes.filter(keep) } : o
    ),
  }));

export const newSubject = (modules) => ({
  name: "", code: "", module: modules[0]?.id ?? 1, semester: 1, credits: 3, required: true, prerequisites: [],
  assessment: "", url: "", objective: "", content: "", comment: "", nonUnique: false, outcomes: [],
});

export const saveSubject = (c, id, draft) => {
  const row = { ...draft, name: draft.name.trim() };
  if (id === "new") {
    const subject = { ...row, id: nextId(c.subjects), order: lastOrder(c.subjects, row.semester) + 1 };
    return { ...c, subjects: [...c.subjects, subject] };
  }
  const old = c.subjects.find((s) => s.id === id);
  const order = old.semester === row.semester ? old.order : lastOrder(c.subjects, row.semester) + 1;
  const kept = new Set(row.outcomes.map((o) => o.id));
  const gone = new Set(old.outcomes.filter((o) => !kept.has(o.id)).map((o) => o.id));
  return {
    ...c,
    modules: gone.size ? mapModuleLinks(c.modules, (l) => !(l.subjectId === id && gone.has(l.outcomeId))) : c.modules,
    subjects: c.subjects.map((s) => (s.id === id ? { ...row, id, order } : s)),
  };
};

export const deleteSubject = (c, id) => ({
  ...c,
  subjects: c.subjects.filter((s) => s.id !== id).map((s) => ({ ...s, prerequisites: (s.prerequisites || []).filter((p) => p !== id) })),
  modules: mapModuleLinks(c.modules, (l) => l.subjectId !== id),
});

// Colours are only written to the data when they differ from the defaults in constants.js
const withColor = (id, { color, stripe, ...rest }) => {
  const def = moduleConfig[id];
  return def && def.color === color && def.stripe === stripe ? rest : { ...rest, color, stripe };
};

export const saveModule = (c, id, draft) => {
  const row = { ...draft, name: draft.name.trim() };
  if (id === "new") {
    const mid = nextId(c.modules);
    return { ...c, modules: [...c.modules, { id: mid, ...withColor(mid, row) }] };
  }
  const kept = new Set(row.learningOutcomes.map((o) => o.id));
  return {
    ...c,
    modules: c.modules.map((m) => (m.id === id ? { id, ...withColor(id, row) } : m)),
    learningOutcomes: c.learningOutcomes.map((lo) => ({
      ...lo,
      moduleOutcomes: (lo.moduleOutcomes || []).filter((l) => l.moduleId !== id || kept.has(l.outcomeId)),
    })),
  };
};

export const deleteModule = (c, id) => ({
  ...c,
  modules: c.modules.filter((m) => m.id !== id),
  learningOutcomes: c.learningOutcomes.map((lo) => ({ ...lo, moduleOutcomes: (lo.moduleOutcomes || []).filter((l) => l.moduleId !== id) })),
});

export const saveOutcome = (c, id, draft) => {
  const row = { ...draft };
  if (!row.khsOutcome?.trim()) delete row.khsOutcome;
  if (id === "new") return { ...c, learningOutcomes: [...c.learningOutcomes, { id: nextId(c.learningOutcomes, 180), ...row }] };
  return { ...c, learningOutcomes: c.learningOutcomes.map((lo) => (lo.id === id ? { id, ...row } : lo)) };
};

export const deleteOutcome = (c, id) => ({ ...c, learningOutcomes: c.learningOutcomes.filter((lo) => lo.id !== id) });
