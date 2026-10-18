// Pure helpers for the outcomes coverage matrix (curriculum ÕV -> module outcome -> subject outcomes).
export const countBy = (arr) => arr.reduce((o, x) => ((o[x] = (o[x] || 0) + 1), o), {});

// "moduleId.outcomeId" -> { moduleId, id, description, subjectIds: [...] } (one entry per link, so duplicates count)
export const moduleOutcomeIndex = (curriculum) => {
  const subjectIds = new Set(curriculum.subjects.map((s) => s.id));
  const idx = {};
  curriculum.modules.forEach((m) =>
    (m.learningOutcomes || []).forEach((o) => {
      idx[m.id + "." + o.id] = {
        moduleId: m.id,
        id: o.id,
        description: o.description,
        subjectIds: (o.subjectOutcomes || []).map((l) => l.subjectId).filter((id) => subjectIds.has(id)),
      };
    })
  );
  return idx;
};

// ÕV id -> { subjectId: number of subject-outcome links feeding it }
export const coverage = (curriculum, moIdx = moduleOutcomeIndex(curriculum)) =>
  Object.fromEntries(
    curriculum.learningOutcomes.map((lo) => [
      lo.id,
      countBy((lo.moduleOutcomes || []).flatMap((x) => moIdx[x.moduleId + "." + x.outcomeId]?.subjectIds || [])),
    ])
  );

// Data-health notes shown under the matrix
export const outcomeNotes = (curriculum, moIdx, cov) => {
  const notes = [];
  const subjectModule = Object.fromEntries(curriculum.subjects.map((s) => [s.id, s.module]));
  const empties = Object.keys(moIdx).filter((k) => !moIdx[k].subjectIds.length);
  if (empties.length)
    notes.push(`${empties.length} mooduli väljundit ilma seotud aine väljundita (nt M${empties[0]}) — need ei jõua ainetasandile.`);
  const totals = curriculum.learningOutcomes
    .map((lo) => [lo.id, Object.values(cov[lo.id] || {}).reduce((a, b) => a + b, 0)])
    .sort((a, b) => a[1] - b[1]);
  if (totals.length) notes.push(`ÕV ${totals[0][0]} toetub kõige vähematele seostele: ${totals[0][1]}.`);
  // Single-purpose modules (practice, general, English, thesis) should only link their own subjects
  let foreign = 0;
  Object.values(moIdx).forEach((mo) => {
    if ([1, 2, 6, 7].includes(mo.moduleId)) foreign += mo.subjectIds.filter((s) => subjectModule[s] !== mo.moduleId).length;
  });
  if (foreign) notes.push(`${foreign} seost viitab ainele teisest moodulist. Võimalik vana aine ID — kontrolli.`);
  return notes;
};
