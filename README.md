# Curriculum visualizer

Curriculum development tool for Rakendusinformaatika (TLÜ HK), with three tabs under a shared top bar
(year switch 2025 / 2026):

- **Ained** – semester board: module filters, semester load bars, EAP volume bars, "Eeldab / Avab" side
  panel, and drag-and-drop that blocks moves breaking a prerequisite (crowded semesters only warn).
- **Õpiväljundid** – coverage matrix of curriculum outcomes × subjects with a drill-down to module outcomes,
  KHS outcomes and data-health notes.
- **Haldus** – add / edit / delete subjects, modules and curriculum outcomes, plus a live data check. See [RAKENDUSE_ULEVAADE.md](RAKENDUSE_ULEVAADE.md) for the product overview (Estonian).

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

- `src/data/curriculum.js` – all curriculum data (one entry per year; 2026 is its own version with KHS outcomes)
- `src/constants.js` – module names/colours (tint + stripe), years, semester targets
- `src/state/CurriculumContext.jsx` – current year, browser drafts, export
- `src/components/shell/` – top bar and layout; `src/pages/` – `BoardPage`, `OutcomesPage`, `AdminPage`
- `src/utils/graph.js` – prerequisite traversal and move rules; `outcomes.js` – coverage matrix;
  `checks.js` – data checks; `adminOps.js` – create/update/delete keeping links consistent

## Updating the data

Edits made in the app (board moves, Haldus) are kept as a draft in this browser only (`localStorage`). The top
bar then shows **Mustand** with *Ekspordi curriculum.js* (downloads both years) and *Lähtesta*. Replace
`src/data/curriculum.js` with the exported file, run `npm run validate` and commit.

You can also edit `src/data/curriculum.js` by hand, then run `npm run validate`. Structural errors (unknown subjects/modules,
missing or circular prerequisites) fail the check and the deploy. Dangling subject-outcome references
are reported as warnings; fix them and then use `--strict` to enforce.

## Deployment

Pushing to `master` runs lint, data validation and build, then publishes `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`).
