# Curriculum visualizer

Interactive map of the Rakendusinformaatika curriculum (TLÜ HK): subjects by semester, module colours,
prerequisite chains, ECTS totals, and a drill-down view of learning outcomes
(curriculum → module → subject). See [RAKENDUSE_ULEVAADE.md](RAKENDUSE_ULEVAADE.md) for the product overview (Estonian).

## Development

```bash
npm install
npm run dev        # local dev server
npm run lint       # ESLint
npm run validate   # check references in src/data/curriculum.js (add `-- --verbose` / `-- --strict`)
npm run build      # production build into dist/
```

## Project layout

- `src/data/curriculum.js` – all curriculum data (one entry per year; 2026 is currently a copy of 2025)
- `src/constants.js` – module names/colours and supported years, shared by both views
- `src/utils/utils.js` – subject graph layout, prerequisite traversal, ECTS totals
- `src/utils/outcomesUtils.js` – builds the learning-outcomes graph
- `src/App.jsx` – subject map; `src/pages/OutcomesPage.jsx` – outcomes view

## Updating the data

Edit `src/data/curriculum.js`, then run `npm run validate`. Structural errors (unknown subjects/modules,
missing or circular prerequisites) fail the check and the deploy. Dangling subject-outcome references
are reported as warnings; fix them and then use `--strict` to enforce.

## Deployment

Pushing to `master` runs lint, data validation and build, then publishes `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`).
