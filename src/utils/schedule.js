// Pure helpers for the Ajakava view. Input is an ÕIS schedule export (see src/data/schedule-2026.json):
// { subjects: { code: { name, module, label } }, weeks: [{ week, days: [{ day, date, sessions: [...] }] }] }
export const DAYS = ["Neljapäev", "Reede", "Laupäev"];
export const INTRO = "INTRO"; // all events without a module (aktus, infotund, paigutustest) share one row
const INTRO_COLOR = "#6b675f";
const MONTHS = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];

export const toMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const longDate = (iso) => { const [, m, d] = iso.split("-"); return `${+d}. ${MONTHS[+m - 1]}`; };
export const shortDate = (iso) => { const [, m, d] = iso.split("-"); return `${+d}. ${MONTHS[+m - 1].slice(0, 3)}`; };

// `palette` is the curriculum module palette ({ moduleId: { stripe } }) so colours match the other views
export const buildSchedule = (json, palette = {}) => {
  const rows = [{ key: INTRO, name: "Sissejuhatav nädal", color: INTRO_COLOR, label: null }];
  Object.entries(json.subjects).forEach(([code, s]) => {
    if (s.module != null) rows.push({ key: code, name: s.name, color: palette[s.module]?.stripe || "#999", label: s.label });
  });
  const color = Object.fromEntries(rows.map((r) => [r.key, r.color]));
  const weeks = json.weeks.map((w, wi) => ({
    n: String(w.week).padStart(2, "0"),
    days: w.days.map((d) => ({
      name: d.day,
      iso: d.date,
      sessions: d.sessions.map((q, si) => {
        const sb = json.subjects[q.code] || { name: q.code, module: null, label: null };
        const key = sb.module == null ? INTRO : q.code;
        return { ...q, id: `${wi}-${d.day}-${si}`, day: d.day, iso: d.date, name: sb.name, label: sb.label, isIntro: sb.module == null, key, color: color[key] };
      }),
    })),
  }));
  // Drop the intro row when the schedule has no intro events (e.g. a second-year schedule)
  const hasIntro = weeks.some((w) => w.days.some((d) => d.sessions.some((q) => q.isIntro)));
  return { rows: hasIntro ? rows : rows.slice(1), weeks };
};

export const weekSessions = (week) => week.days.flatMap((d) => d.sessions);

// Hours per subject row in a week, plus which of the three days it meets
export const weekCell = (week, key) => {
  let hours = 0;
  const days = DAYS.map((dn) => {
    const ss = (week.days.find((d) => d.name === dn)?.sessions || []).filter((s) => s.key === key);
    ss.forEach((s) => (hours += s.hours));
    return ss.length > 0;
  });
  return { hours, days };
};

// Warnings for one week: session notes, subject sessions without a teacher, sessions without a room
export const weekNotes = (week) => {
  const notes = [];
  const all = weekSessions(week);
  all.forEach((s) => {
    if (s.note) notes.push(`${s.name} (${shortDate(s.iso)}): ${s.note}`);
    if (!s.teacher && !s.isIntro) notes.push(`${s.name} (${shortDate(s.iso)}): õppejõud määramata`);
  });
  const noRoom = all.filter((s) => !s.room).length;
  if (noRoom) notes.push(`Ruum määramata ${noRoom} tunnil`);
  return notes;
};

// Time axis covering every session in the schedule, padded to half hours
export const timeRange = (weeks) => {
  const all = weeks.flatMap(weekSessions);
  if (!all.length) return { start: 600, end: 1080 };
  const start = Math.min(...all.map((s) => toMinutes(s.start)));
  const end = Math.max(...all.map((s) => toMinutes(s.end)));
  return { start: Math.floor(start / 60) * 60 - 30, end: Math.ceil(end / 60) * 60 + 30 };
};

