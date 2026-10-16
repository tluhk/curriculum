// Script to validate outcome ID references in curriculum data
import curriculums from './src/data/curriculum.js';

const curriculum = curriculums[0]; // Use first curriculum

console.log('=== Validating Curriculum Outcome References ===\n');
console.log(`Curriculum: ${curriculum.name}\n`);

// Build a map of subject ID -> array of valid outcome IDs
const subjectOutcomesMap = new Map();
curriculum.subjects.forEach(subject => {
  const outcomeIds = subject.outcomes.map(o => o.id);
  subjectOutcomesMap.set(subject.id, outcomeIds);
});

// Track all errors
const errors = [];
let totalReferences = 0;
let validReferences = 0;

// Check all module learning outcomes
curriculum.modules.forEach(module => {
  module.learningOucomes.forEach(moduleLO => {
    if (moduleLO.subjectOutcomes) {
      moduleLO.subjectOutcomes.forEach(({ subjectId, outcomeId }) => {
        totalReferences++;

        // Check if subject exists
        const validOutcomeIds = subjectOutcomesMap.get(subjectId);
        if (!validOutcomeIds) {
          errors.push({
            module: module.name,
            moduleId: module.id,
            moduleLOId: moduleLO.id,
            moduleLODesc: moduleLO.description.substring(0, 50) + '...',
            subjectId,
            outcomeId,
            error: `Subject ${subjectId} not found`
          });
          return;
        }

        // Check if outcome ID exists in that subject
        if (!validOutcomeIds.includes(outcomeId)) {
          const subject = curriculum.subjects.find(s => s.id === subjectId);
          errors.push({
            module: module.name,
            moduleId: module.id,
            moduleLOId: moduleLO.id,
            moduleLODesc: moduleLO.description.substring(0, 50) + '...',
            subjectId,
            subjectName: subject.name,
            outcomeId,
            validOutcomeIds: validOutcomeIds.join(', '),
            error: `Outcome ${outcomeId} not found in subject ${subjectId}`
          });
        } else {
          validReferences++;
        }
      });
    }
  });
});

console.log(`Total outcome references: ${totalReferences}`);
console.log(`Valid references: ${validReferences}`);
console.log(`Invalid references: ${errors.length}\n`);

if (errors.length > 0) {
  console.log('=== ERRORS FOUND ===\n');

  // Group errors by module
  const errorsByModule = new Map();
  errors.forEach(error => {
    if (!errorsByModule.has(error.moduleId)) {
      errorsByModule.set(error.moduleId, []);
    }
    errorsByModule.get(error.moduleId).push(error);
  });

  errorsByModule.forEach((moduleErrors, moduleId) => {
    const moduleName = moduleErrors[0].module;
    console.log(`\n📌 Module ${moduleId}: ${moduleName}`);
    console.log('─'.repeat(80));

    moduleErrors.forEach(err => {
      console.log(`\n  Module LO ${err.moduleLOId}: ${err.moduleLODesc}`);
      console.log(`  ❌ References: subjectId=${err.subjectId}, outcomeId=${err.outcomeId}`);
      if (err.subjectName) {
        console.log(`     Subject: ${err.subjectName}`);
        console.log(`     Valid outcome IDs for this subject: ${err.validOutcomeIds}`);
      } else {
        console.log(`     ${err.error}`);
      }
    });
  });

  console.log('\n\n=== SUMMARY BY SUBJECT ===\n');

  // Group errors by subject
  const errorsBySubject = new Map();
  errors.forEach(error => {
    if (error.subjectId) {
      if (!errorsBySubject.has(error.subjectId)) {
        errorsBySubject.set(error.subjectId, {
          subjectName: error.subjectName || 'Unknown',
          validIds: error.validOutcomeIds || 'N/A',
          errors: []
        });
      }
      errorsBySubject.get(error.subjectId).errors.push(error);
    }
  });

  errorsBySubject.forEach((data, subjectId) => {
    console.log(`\nSubject ${subjectId}: ${data.subjectName}`);
    console.log(`Valid outcome IDs: ${data.validIds}`);
    console.log(`Invalid references: ${data.errors.length}`);
    data.errors.forEach(err => {
      console.log(`  - Module ${err.moduleId} LO ${err.moduleLOId} tries to use outcome ${err.outcomeId}`);
    });
  });
} else {
  console.log('✅ All outcome references are valid!');
}

console.log('\n');
