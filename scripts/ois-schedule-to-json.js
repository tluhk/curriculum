// Converts a schedule copied from ÕIS (plain text) into the JSON used by the Ajakava tab.
// Usage: node scripts/ois-schedule-to-json.js <ois.txt> <version> [out.json]
//   e.g. node scripts/ois-schedule-to-json.js ajakava.txt 2025 src/data/schedule-2025.json
// Then register the file in src/data/schedules.js.
//
// Expected input, as ÕIS prints it ("NN. nädal" lines are optional; the week is taken from the date):
//   Neljapäev, 03. september 2026
//   10:00 - 13:15	Graafilise disaini alused (HKM5084.HK) []
//   Laura Hein	4	Auditoorium 307
//   Kommentaar: Kirjalik test            <- optional, attaches to the session above
// Each subject is matched to the curriculum version by name to get its module (for colours).
import fs from 'node:fs';
import process from 'node:process';
import curriculums from '../src/data/curriculum.js';

const MONTHS = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
// ÕIS name -> curriculum name, where they differ
const ALIASES = { 'Graafilise disaini alused': 'Graafiline disain' };

const [input, version, out] = process.argv.slice(2);
if (!input || !version) {
  console.error('Usage: node scripts/ois-schedule-to-json.js <ois.txt> <version> [out.json]');
  process.exit(1);
}
const curriculum = curriculums.find((c) => c.version === version);
if (!curriculum) {
  console.error(`No curriculum version ${version} in src/data/curriculum.js`);
  process.exit(1);
}

const isoWeek = (iso) => {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7)); // Thursday of this week decides the year
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor(Math.floor((d - yearStart) / 864e5) / 7) + 1;
};
const pad = (n) => String(n).padStart(2, '0');
const findSubject = (name) => {
  const names = [name, ALIASES[name], name.replace(/\s+(I{1,3}|IV|V)$/, '')].filter(Boolean);
  for (const n of names) {
    const s = curriculum.subjects.find((x) => x.name === n);
    if (s) return s;
  }
  return null;
};

const subjects = {};
const weeks = [];
const unmatched = new Set();
let day = null;
let last = null;

const lines = fs.readFileSync(input, 'utf8').split(/\r?\n/);
lines.forEach((raw, i) => {
  const line = raw.trimEnd();
  if (!line.trim() || /^\d+\.\s*nädal$/.test(line.trim())) return;

  const dm = line.match(/^(Esmaspäev|Teisipäev|Kolmapäev|Neljapäev|Reede|Laupäev|Pühapäev),\s*(\d{1,2})\.\s*(\S+)\s+(\d{4})$/);
  if (dm) {
    const iso = `${dm[4]}-${pad(MONTHS.indexOf(dm[3].toLowerCase()) + 1)}-${pad(dm[2])}`;
    const week = isoWeek(iso);
    let w = weeks.at(-1)?.week === week ? weeks.at(-1) : null;
    if (!w) weeks.push((w = { week, days: [] }));
    w.days.push((day = { day: dm[1], date: iso, sessions: [] }));
    return;
  }

  const sm = line.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\t(.+?)\s*\(([^)]+)\)/);
  if (sm) {
    if (!day) throw new Error(`Line ${i + 1}: session before any date`);
    const [, start, end, name, label] = sm;
    const code = label.split('.')[0];
    if (!subjects[code]) {
      const s = findSubject(name);
      if (!s) unmatched.add(name);
      subjects[code] = { name, module: s ? s.module : null, label };
    }
    // The next line holds teacher, hours and room
    const [teacher = '', hours = '', room = ''] = (lines[i + 1] || '').split('\t');
    lines[i + 1] = '';
    day.sessions.push((last = { start, end, code, teacher: teacher.trim() || null, hours: Number(hours) || 0, room: room.trim() || null, note: null }));
    return;
  }

  const cm = line.match(/^Kommentaar:\s*(.*)$/);
  if (cm && last) {
    last.note = cm[1].trim() || null;
    return;
  }
  console.warn(`Line ${i + 1} skipped: ${line}`);
});

const json = { year: version, source: 'TLÜ ÕIS ajakava', subjects, weeks };
const text = JSON.stringify(json, null, 2) + '\n';
if (out) fs.writeFileSync(out, text);
else process.stdout.write(text);

const n = weeks.reduce((a, w) => a + w.days.reduce((b, d) => b + d.sessions.length, 0), 0);
console.error(`${weeks.length} weeks, ${n} sessions, ${Object.keys(subjects).length} subjects`);
if (unmatched.size) console.error(`Not found in curriculum ${version} (shown grey, no module): ${[...unmatched].join(', ')}`);
