// Imports a curriculum version from a saved ÕIS curriculum page (Õppekavad → curriculum → "Salvesta lehena", HTML)
// into src/data/curriculum.js. Replaces the entry with the same code and year if there is one.
// Usage: node scripts/ois-curriculum-to-json.js <page.html> <code> [--dry-run]
//   e.g. node scripts/ois-curriculum-to-json.js TLU_OIS_TJ.html TJ
//
// Taken from the page: name, level, semesters, objective, curriculum outcomes, modules (goal, outcomes),
// subjects (name, ÕIS code, EAP, exam/pass, required/elective) and their semester from the nominal plan.
// Not on the page, so left empty: prerequisites, subject outcomes and the outcome links between levels.
import fs from 'node:fs';
import process from 'node:process';
import curriculums from '../src/data/curriculum.js';
import { buildCurriculumJs } from '../src/utils/exportCurriculum.js';

const [file, code] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
if (!file || !code) {
  console.error('Usage: node scripts/ois-curriculum-to-json.js <page.html> <code> [--dry-run]');
  process.exit(1);
}
const html = fs.readFileSync(file, 'utf8');
const notes = [];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const text = (h) =>
  h.replace(/<a[^>]*class="tlink"[\s\S]*?<\/a>/g, '') // "Kuva rohkem..." toggles
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|\w+);/g, (m, e) => (e[0] === '#' ? String.fromCharCode(+e.slice(1)) : ENTITIES[e] ?? m))
    .split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
// The "Kuva rohkem" toggle can split a level code like "B1.2" across two lines; join those back
const oneLine = (t) => t.replace(/\s*\n\s*/g, ' ').replace(/([A-C][12]\.) (\d)/g, '$1$2').trim();
// "- a;\n- b" or "Mooduli läbinud üliõpilane: - a; - b" -> ["a", "b"]; a paragraph without dashes stays one item
const items = (t) => {
  const body = oneLine(t).replace(/^Mooduli läbinud üliõpilane:\s*/i, '');
  const parts = body.split(/(?:^|\s)-\s+(?=\S)/).map((p) => p.trim().replace(/[;,]$/, '').trim()).filter(Boolean);
  return parts.length ? parts : [body];
};
// Value cell of a "label | value" row in the general info block
const field = (label) => {
  const m = html.match(new RegExp(`class="yldaine_c1_?">${label}</div><div class="yldaine_c2">([\\s\\S]*?)</div></div>`));
  return m ? text(m[1]) : '';
};
const infoRow = (label) => {
  const m = html.match(new RegExp(`>${label}</div>\\s*<div[^>]*>([^<]*)<`));
  return m ? m[1].trim() : '';
};

// General info
const name = infoRow('Õppekava nimetus e\\.k\\.') || field('Õppekava nimetus');
const versionCode = infoRow('versiooni kood'); // e.g. HKTR/26.HK
const yy = versionCode.match(/\/(\d{2})\./)?.[1];
if (!name || !yy) throw new Error('Could not find the curriculum name or version code; is this an ÕIS curriculum page?');
const version = '20' + yy;
const levelText = infoRow('Õppetase').toLowerCase();
const level = levelText.startsWith('magist') ? 'magistriõpe' : 'rakenduskõrgharidus';
if (!/rakendus|magist/.test(levelText)) notes.push(`Õppetase "${levelText}" is not applied or master's; stored as ${level}.`);
const semesters = Number(infoRow('Nominaalne õppeaeg \\(semestrites\\)')) || (level === 'magistriõpe' ? 4 : 6);
const objective = oneLine(field('Õppekava eesmärgid'));
const learningOutcomes = items(field('Õppekava õpiväljundid')).map((description, i) => ({ id: i + 1, description, moduleOutcomes: [] }));

// Modules map onto the same ids as Rakendusinformaatika so colours and Haldus behave the same
const MODULE_IDS = [[/praktika/i, 1], [/üleülikool/i, 2], [/valik/i, 4], [/kohustuslik/i, 3], [/vabaain/i, 5], [/inglise/i, 6], [/lõputöö/i, 7]];
const blocks = html.split(/<li><a href="javascript: hide_show_pm\(/).slice(1);
const modules = [];
const subjects = [];
blocks.forEach((b) => {
  const head = b.match(/MOODUL:\s*([^<]*?)\s+[\d.]+\s*EAP/);
  if (!head) return;
  const mName = head[1].trim();
  let id = MODULE_IDS.find(([re]) => re.test(mName))?.[1];
  if (!id || modules.some((m) => m.id === id)) id = Math.max(7, ...modules.map((m) => m.id)) + 1;
  const goal = b.match(/>Eesmärgid<\/div><div class="yldaine_c2">([\s\S]*?)<\/div><\/div>/);
  const outs = b.match(/>Õpiväljundid<\/div><div class="yldaine_c2">([\s\S]*?)<\/div><\/div>/);
  modules.push({
    id,
    name: mName,
    objective: goal ? oneLine(text(goal[1])) : '',
    learningOutcomes: outs ? items(text(outs[1])).map((description, i) => ({ id: i + 1, description, subjectOutcomes: [] })) : [],
  });
  // Subject rows; "Kohustuslikud ained:" / "Valikained:" headers decide required
  const re = /<div class="yldaine_h_">([^<]*)<\/div>|kuvaainekava\(\d+,'([^']*?) \(([^)]+)\)',1\)[\s\S]*?_w90">([^<]*)<\/div>\s*<div[^>]*_w70">([^<]*)<\/div>\s*<div[^>]*_w50">([^<]*)<\/div>/g;
  let required = true;
  for (const m of b.matchAll(re)) {
    if (m[1] !== undefined) { required = !/valik/i.test(m[1]); continue; }
    const [, , sName, , sCode, eap, ea] = m;
    subjects.push({ code: sCode.trim(), name: sName.trim(), module: id, required, credits: Number(eap), assessment: ea.trim() === 'E' ? 'Eksam' : 'Arvestus' });
  }
});
if (!modules.length) throw new Error('No modules found on the page.');

// Nominal plan: the semester column that holds the subject's EAP
const plan = html.slice(html.indexOf('NOMINAALJAOTUS'));
const semesterOf = {};
for (const chunk of plan.split('<div class="row row-white"').slice(1)) {
  const row = chunk.split(/class="row row-(?:purple|gray)"|id="vabaaine_row"/)[0]; // stop at the next module or section
  const c = row.match(/kuvaainekava\('\d+', '([^ ]+) - /);
  if (!c) continue;
  const cell = row.match(/id="m\d+_s(\d+)"[^>]*>\s*<div[^>]*class="cell-click">\s*(\d+(?:\.\d+)?)\s*</);
  if (cell) semesterOf[c[1]] = Number(cell[1]);
}

const order = {};
const entrySubjects = subjects.map((s, i) => {
  let semester = semesterOf[s.code];
  let comment = '';
  if (!semester) {
    semester = semesters;
    comment = 'ÕIS: toimumise semestrit ei määrata';
    notes.push(`${s.name} (${s.code}) has no semester in the nominal plan; placed in S${semester}.`);
  }
  order[semester] = (order[semester] || 0) + 1;
  return {
    id: i + 1, semester, order: order[semester], url: `https://ois2.tlu.ee/tluois/aine/${s.code}`, name: s.name, module: s.module,
    required: s.required, prerequisites: [], credits: s.credits, content: '', objective: '', outcomes: [], assessment: s.assessment, comment, nonUnique: false,
  };
});
// Thesis modules list no subject, but the plan gives their EAP and semester; add the thesis as a subject
const thesis = modules.find((m) => m.id === 7);
const thesisRow = plan.match(/Moodul: Lõputöö<\/span><\/div><div[^>]*>(\d+)<\/div>((?:<div[^>]*>\d+<\/div>)+)/);
if (thesis && !entrySubjects.some((s) => s.module === 7) && thesisRow) {
  const cols = [...thesisRow[2].matchAll(/>(\d+)</g)].map((x) => Number(x[1]));
  const semester = cols.findIndex((v) => v > 0) + 1 || semesters;
  order[semester] = (order[semester] || 0) + 1;
  entrySubjects.push({ id: entrySubjects.length + 1, semester, order: order[semester], url: '', name: 'Lõputöö', module: 7, required: true, prerequisites: [],
    credits: Number(thesisRow[1]), content: '', objective: '', outcomes: [], assessment: 'Eksam', comment: 'Lisatud mooduli põhjal; ÕIS-is ainet pole', nonUnique: false });
  notes.push(`Added a "Lõputöö" subject (${thesisRow[1]} EAP, S${semester}) for the thesis module.`);
}
modules.filter((m) => !entrySubjects.some((s) => s.module === m.id)).forEach((m) => notes.push(`Module "${m.name}" has no subjects (free choice).`));

const existing = curriculums.find((c) => c.code === code && c.version === version);
const entry = {
  id: existing?.id ?? Math.max(0, ...curriculums.map((c) => c.id || 0)) + 1,
  name, code, level, semesters, objective, learningOutcomes, version, modules, subjects: entrySubjects,
};
const next = existing ? curriculums.map((c) => (c === existing ? entry : c)) : [...curriculums, entry];

const eap = entrySubjects.reduce((a, s) => a + s.credits, 0);
console.log(`${name} (${code}) ${version}: ${level}, ${semesters} semesters`);
console.log(`  ${learningOutcomes.length} curriculum outcomes, ${modules.length} modules, ${modules.reduce((a, m) => a + m.learningOutcomes.length, 0)} module outcomes`);
console.log(`  ${entrySubjects.length} subjects (${entrySubjects.filter((s) => s.required).length} required), ${eap} EAP listed`);
notes.forEach((n) => console.log('  note: ' + n));
if (dryRun) console.log('Dry run: curriculum.js not changed.');
else {
  fs.writeFileSync('src/data/curriculum.js', buildCurriculumJs(next));
  console.log(`${existing ? 'Replaced' : 'Added'} ${code} ${version} in src/data/curriculum.js`);
}
