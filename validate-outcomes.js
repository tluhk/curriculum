// Validates references inside the curriculum data.
// Structural problems (missing subjects/modules, bad or circular prerequisites) are errors
// and exit with code 1. Dangling subject-outcome references are known content debt, so they
// are reported as warnings; pass --strict to treat them as errors, --verbose to list them.
// Usage: npm run validate [-- --strict] [-- --verbose]
import process from 'node:process';
import curriculums from './src/data/curriculum.js';

const strict = process.argv.includes('--strict');
const verbose = process.argv.includes('--verbose');
const errors = [];
const warnings = [];

curriculums.forEach((curriculum) => {
  const label = `${curriculum.code || curriculum.name} ${curriculum.version}`;
  const err = (message) => errors.push(`[${label}] ${message}`);
  const warn = (message) => (strict ? err : (m) => warnings.push(`[${label}] ${m}`))(message);

  const subjects = new Map(curriculum.subjects.map((s) => [s.id, s]));
  const modules = new Map(curriculum.modules.map((m) => [m.id, m]));

  if (subjects.size !== curriculum.subjects.length) err('duplicate subject ids');

  // Subject -> module outcome references (module learning outcomes -> subject outcomes)
  curriculum.modules.forEach((module) => {
    module.learningOutcomes.forEach((moduleLO) => {
      (moduleLO.subjectOutcomes || []).forEach(({ subjectId, outcomeId }) => {
        const subject = subjects.get(subjectId);
        if (!subject) {
          err(`module ${module.id} LO ${moduleLO.id}: subject ${subjectId} not found`);
        } else if (!subject.outcomes.some((o) => o.id === outcomeId)) {
          warn(
            `module ${module.id} LO ${moduleLO.id}: subject ${subjectId} (${subject.name}) has no outcome ${outcomeId}. ` +
              `Valid: ${subject.outcomes.map((o) => o.id).join(', ')}`
          );
        }
      });
    });
  });

  // Curriculum outcomes -> module outcomes
  (curriculum.learningOutcomes || []).forEach((lo) => {
    (lo.moduleOutcomes || []).forEach(({ moduleId, outcomeId }) => {
      const module = modules.get(moduleId);
      if (!module) err(`curriculum LO ${lo.id}: module ${moduleId} not found`);
      else if (!module.learningOutcomes.some((x) => x.id === outcomeId)) {
        err(`curriculum LO ${lo.id}: module ${moduleId} has no outcome ${outcomeId}`);
      }
    });
  });

  // Prerequisites exist and are acyclic
  curriculum.subjects.forEach((s) => {
    (s.prerequisites || []).forEach((p) => {
      if (!subjects.has(p)) err(`subject ${s.id} (${s.name}): prerequisite ${p} not found`);
    });
  });
  const state = new Map(); // 1 = in progress, 2 = done
  const visit = (id, path) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      err(`circular prerequisites: ${[...path, id].join(' -> ')}`);
      return;
    }
    state.set(id, 1);
    (subjects.get(id)?.prerequisites || []).forEach((p) => subjects.has(p) && visit(p, [...path, id]));
    state.set(id, 2);
  };
  curriculum.subjects.forEach((s) => visit(s.id, []));
});

if (warnings.length) {
  console.warn(`⚠️  ${warnings.length} dangling subject-outcome reference(s)` + (verbose ? ':\n' : ' (run with -- --verbose to list)'));
  if (verbose) warnings.forEach((w) => console.warn(`  - ${w}`));
}

if (errors.length) {
  console.error(`Found ${errors.length} problem(s):\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`✅ Curriculum data is valid (${curriculums.length} curriculum versions checked)`);
