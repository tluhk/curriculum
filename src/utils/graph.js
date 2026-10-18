// Pure helpers for prerequisites and moves. No React, easy to unit test.
export const byId = (subjects) => Object.fromEntries(subjects.map((s) => [s.id, s]));

export const dependentsMap = (subjects) => {
  const m = {};
  subjects.forEach((s) => (s.prerequisites || []).forEach((p) => (m[p] = m[p] || []).push(s.id)));
  return m;
};

const walk = (start, next) => {
  const seen = new Set(), stack = [start];
  while (stack.length) for (const n of next(stack.pop()) || []) if (!seen.has(n)) { seen.add(n); stack.push(n); }
  seen.delete(start);
  return seen;
};
export const upstream = (id, idx) => walk(id, (x) => idx[x]?.prerequisites);
export const downstream = (id, deps) => walk(id, (x) => deps[x]);

// Can subject `id` move to `semester`? Prerequisites must stay earlier, dependents later.
export const checkMove = (subjects, id, semester) => {
  const idx = byId(subjects), deps = dependentsMap(subjects), s = idx[id];
  if (!s || s.semester === semester) return { ok: true };
  for (const p of s.prerequisites || []) if (idx[p] && idx[p].semester >= semester)
    return { ok: false, reason: `Eeldab: ${idx[p].name} (S${idx[p].semester})` };
  for (const d of deps[id] || []) if (idx[d].semester <= semester)
    return { ok: false, reason: `Avab: ${idx[d].name} (S${idx[d].semester})` };
  return { ok: true };
};

// Returns a new subjects array with `id` placed in `semester` before `beforeId` (or last); orders renumbered.
export const moveSubject = (subjects, id, semester, beforeId = null) => {
  if (!checkMove(subjects, id, semester).ok) return subjects;
  const moved = subjects.find((s) => s.id === id);
  const target = subjects.filter((s) => s.semester === semester && s.id !== id).sort((a, b) => a.order - b.order);
  let i = beforeId ? target.findIndex((s) => s.id === beforeId) : -1;
  if (i < 0) i = target.length;
  target.splice(i, 0, { ...moved, semester });
  const next = new Map(target.map((s, k) => [s.id, { ...s, order: k + 1 }]));
  return subjects.map((s) => next.get(s.id) || s);
};

export const creditsBy = (subjects, key) =>
  subjects.reduce((acc, s) => ((acc[s[key]] = (acc[s[key]] || 0) + s.credits), acc), {});
