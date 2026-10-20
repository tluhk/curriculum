// Several curricula live side by side in src/data/curriculum.js: one entry per curriculum version (year),
// grouped by `code`. Pure helpers, no React.
export const LEVELS = {
  rakenduskõrgharidus: { label: "Rakenduskõrgharidus", semesters: 6 },
  magistriõpe: { label: "Magistriõpe", semesters: 4 },
};
export const DEFAULT_LEVEL = "rakenduskõrgharidus";

export const slug = (name) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "").slice(0, 8).toUpperCase() || "OK";
export const codeOf = (c) => c.code || slug(c.name);
export const keyOf = (c) => `${codeOf(c)}.${c.version}`;
export const levelOf = (c) => (LEVELS[c.level] ? c.level : DEFAULT_LEVEL);

// Number of semester rows: explicit `semesters`, else the latest semester used, else the level default
export const semesterCount = (c) =>
  c.semesters || Math.max(0, ...c.subjects.map((s) => s.semester)) || LEVELS[levelOf(c)].semesters;

const byVersion = (a, b) => String(a.version).localeCompare(String(b.version), undefined, { numeric: true });

// [{ code, name, level, versions: [entries sorted by year] }], applied curricula first, then by name
export const listCurricula = (entries) => {
  const groups = new Map();
  entries.forEach((c) => {
    const code = codeOf(c);
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code).push(c);
  });
  const order = Object.keys(LEVELS);
  return [...groups.entries()]
    .map(([code, versions]) => {
      const sorted = [...versions].sort(byVersion);
      const latest = sorted[sorted.length - 1];
      return { code, name: latest.name, level: levelOf(latest), versions: sorted };
    })
    .sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level) || a.name.localeCompare(b.name, "et"));
};

const nextId = (entries) => Math.max(0, ...entries.map((c) => c.id || 0)) + 1;

export const newCurriculum = (entries, { code, name, level, semesters, version }) => ({
  id: nextId(entries),
  code,
  name: name.trim(),
  level,
  semesters,
  objective: "",
  learningOutcomes: [],
  version: String(version),
  modules: [],
  subjects: [],
});

// A new year starts as a copy of an existing version
export const copyVersion = (entries, source, version) => ({
  ...JSON.parse(JSON.stringify(source)),
  id: nextId(entries),
  code: codeOf(source),
  version: String(version),
});

// Problems with a new curriculum / year before it is created
export const curriculumErrors = (entries, { code, name, version }) => {
  const errors = [];
  if (name !== undefined && !name.trim()) errors.push("Nimi on kohustuslik.");
  if (code !== undefined && !/^[A-Z0-9]{2,8}$/.test(code)) errors.push("Kood: 2–8 suurtähte või numbrit (nt RIF).");
  if (!/^\d{4}$/.test(String(version))) errors.push("Aasta peab olema neljakohaline (nt 2027).");
  if (entries.some((c) => codeOf(c) === code && String(c.version) === String(version))) errors.push(`${code} ${version} on juba olemas.`);
  return errors;
};
