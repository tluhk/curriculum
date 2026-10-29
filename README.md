# Curriculum visualizer

Curriculum development tool for TLÜ HK curricula (currently Rakendusinformaatika), with four tabs under a shared
top bar (curriculum menu and year switch):

- **Ained** – semester board: module filters, semester load bars, EAP volume bars, "Eeldab / Avab" side
  panel, and drag-and-drop that blocks moves breaking a prerequisite (crowded semesters only warn).
- **Õpiväljundid** – coverage matrix of curriculum outcomes × subjects with a drill-down to module outcomes,
  KHS outcomes and data-health notes.
  Switch to **Muuda** to edit the links behind the matrix: add, rename and delete outcomes and link ÕV ↔ module
  outcomes ↔ subject outcomes from the detail panel; the matrix updates at once. ↶ / ↷ (Ctrl+Z / Ctrl+Shift+Z) undo and
  redo every change, in Haldus too (history lasts until the page is reloaded; the draft itself is kept).
- **Ajakava** – contact-week timeline per subject and a Thursday–Saturday week view with session details
  (teacher, room, notes), from ÕIS schedule exports in `src/data/schedules/<code>-<year>.json`.
- **Haldus** – add / edit / delete subjects, modules and curriculum outcomes, plus a live data check. See [RAKENDUSE_ULEVAADE.md](RAKENDUSE_ULEVAADE.md) for the product overview (Estonian).

## Several curricula

All curricula live in `src/data/curriculum.js`, one entry per curriculum version (year). Entries are grouped by
`code` (e.g. `RIF`); `level` is `rakenduskõrgharidus` or `magistriõpe` and `semesters` sets the number of
semester rows (6 / 4 by default). Pick a curriculum from the menu next to the logo; the URL carries it as
`?c=RIF&year=2026`.

To import one from ÕIS, open the curriculum version page in ÕIS (Õppekavad → curriculum), save it as HTML and run

```bash
npm run curriculum:import -- TLU_OIS_TJ.html TJ   # adds or replaces TJ <year> in src/data/curriculum.js
```

It takes the name, level, semesters, objective, curriculum and module outcomes, modules and subjects (code, EAP,
exam/pass, required/elective, semester from the nominal plan). Prerequisites, subject outcomes and the links between
outcome levels are not on that page; add them in Haldus.

To start one by hand, open **Haldus → Õppekavad → Uus õppekava** (or *Uus aasta* to start a new year as a copy).
It stays in this browser until you export `curriculum.js` and commit it.

## Development

```bash
npm install
npm run dev        # local dev server
npm run lint       # ESLint
npm run validate   # check references in src/data/curriculum.js (add `-- --verbose` / `-- --strict`)
npm test           # unit tests (vitest)
npm run build      # production build into dist/
```

## Project layout

- `src/data/curriculum.js` – all curricula, one entry per curriculum version (see *Several curricula*)
- `src/constants.js` – module names/colours (tint + stripe), years, semester targets
- `src/state/CurriculumContext.jsx` – current year, browser drafts, export
- `src/components/shell/` – top bar and layout; `src/pages/` – `BoardPage`, `OutcomesPage`, `AdminPage`
- `src/utils/graph.js` – prerequisite traversal and move rules; `outcomes.js` – coverage matrix;
  `checks.js` – data checks; `schedule.js` – Ajakava timeline and week view; `curricula.js` – grouping curricula and versions; `adminOps.js` – create/update/delete keeping links consistent

## Updating the data

Edits made in the app (board moves, Haldus) are kept as a draft in this browser only (`localStorage`). The top
bar then shows **Mustand** with *Ekspordi curriculum.js* (downloads every curriculum and year) and *Lähtesta*. Replace
`src/data/curriculum.js` with the exported file, run `npm run validate` and commit.

You can also edit `src/data/curriculum.js` by hand, then run `npm run validate`. Structural errors (unknown subjects/modules,
missing or circular prerequisites) fail the check and the deploy. Dangling subject-outcome references
are reported as warnings; fix them and then use `--strict` to enforce.

## Adding a schedule

Copy the timetable from ÕIS as plain text into a file, then convert it and register it in `src/data/schedules.js`:

```bash
npm run schedule:import -- ajakava.txt RIF 2025   # writes src/data/schedules/RIF-2025.json
```

Subjects are matched to that curriculum version by name (for module colours); the script lists any it can't match.

## Deployment

Pushing to `master` runs lint, data validation and build, then publishes `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`).
