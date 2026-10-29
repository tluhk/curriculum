/* eslint-disable react/prop-types */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import base from "../data/curriculum";
import { modulePalette } from "../constants";
import { codeOf, keyOf, listCurricula } from "../utils/curricula";
import { downloadCurriculumJs } from "../utils/exportCurriculum";
import { emptyHistory, record, undo as undoStep, redo as redoStep } from "../utils/history";

// Drafts live only in this browser (localStorage) until you export curriculum.js and commit it.
// One draft per curriculum version, keyed "<code>.<year>". A draft without a base entry is a new curriculum or year.
const KEY = "curriculumDraft.v2.";
const OLD_KEY = "curriculumDraft.v1."; // single-curriculum drafts, keyed by year only

const loadDrafts = () => {
  const drafts = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(KEY)) drafts[k.slice(KEY.length)] = JSON.parse(localStorage.getItem(k));
    }
    // Move drafts from before multi-curriculum support to the first curriculum. Written straight to the new key,
    // so running this twice (React StrictMode) gives the same result.
    const first = codeOf(base[0]);
    base.filter((c) => codeOf(c) === first).forEach((c) => {
      const old = localStorage.getItem(OLD_KEY + c.version);
      if (!old) return;
      if (!drafts[keyOf(c)]) {
        drafts[keyOf(c)] = { ...JSON.parse(old), code: first, level: c.level, semesters: c.semesters };
        localStorage.setItem(KEY + keyOf(c), JSON.stringify(drafts[keyOf(c)]));
      }
      localStorage.removeItem(OLD_KEY + c.version);
    });
  } catch { /* storage unavailable or corrupt: start without drafts */ }
  return drafts;
};

const Ctx = createContext(null);

export function CurriculumProvider({ children }) {
  const [params, setParams] = useSearchParams();
  const [drafts, setDrafts] = useState(loadDrafts);

  useEffect(() => {
    try {
      Object.entries(drafts).forEach(([k, d]) => (d ? localStorage.setItem(KEY + k, JSON.stringify(d)) : localStorage.removeItem(KEY + k)));
    } catch { /* storage full or unavailable */ }
  }, [drafts]);

  // Every curriculum version: committed ones (with their draft applied) plus browser-only new ones
  const entries = useMemo(() => {
    const keys = new Set(base.map(keyOf));
    return [...base.map((c) => drafts[keyOf(c)] || c), ...Object.entries(drafts).filter(([k, d]) => d && !keys.has(k)).map(([, d]) => d)];
  }, [drafts]);
  const curricula = useMemo(() => listCurricula(entries), [entries]);

  const group = curricula.find((g) => g.code === params.get("c")) || curricula[0];
  const curriculum = group.versions.find((v) => v.version === params.get("year")) || group.versions[0];
  const key = keyOf(curriculum);
  const original = base.find((c) => keyOf(c) === key) || null; // null for a browser-only curriculum or year
  const year = curriculum.version;
  const code = group.code;

  const go = useCallback((c, y) => setParams((p) => { const n = new URLSearchParams(p); n.set("c", c); n.set("year", y); return n; }), [setParams]);
  const setYear = useCallback((y) => go(code, y), [go, code]);
  const setCurriculum = useCallback((c) => {
    const g = curricula.find((x) => x.code === c);
    if (g) go(c, g.versions[0].version);
  }, [curricula, go]);

  // Undo / redo per curriculum version. The latest drafts are mirrored in a ref so several edits in one tick still chain correctly.
  const [hist, setHist] = useState({});
  const draftsRef = useRef(drafts);
  const effective = useCallback((k) => draftsRef.current[k] || base.find((c) => keyOf(c) === k), []);
  const setDraft = useCallback((k, value) => {
    draftsRef.current = { ...draftsRef.current, [k]: value };
    setDrafts(draftsRef.current);
  }, []);

  const update = useCallback((fn) => {
    const prev = effective(key);
    const next = fn(prev);
    if (!next || next === prev) return;
    setDraft(key, next);
    setHist((h) => ({ ...h, [key]: record(h[key] || emptyHistory(), prev) }));
  }, [key, effective, setDraft]);
  // Going back to the committed entry drops the draft; a browser-only curriculum always keeps its draft
  const restore = useCallback((value) => setDraft(key, original && value === original ? null : value), [key, original, setDraft]);
  const undo = useCallback(() => {
    const r = undoStep(hist[key] || emptyHistory(), effective(key));
    if (!r) return;
    restore(r.value);
    setHist((h) => ({ ...h, [key]: r.history }));
  }, [hist, key, effective, restore]);
  const redo = useCallback(() => {
    const r = redoStep(hist[key] || emptyHistory(), effective(key));
    if (!r) return;
    restore(r.value);
    setHist((h) => ({ ...h, [key]: r.history }));
  }, [hist, key, effective, restore]);
  const canUndo = !!hist[key]?.past.length;
  const canRedo = !!hist[key]?.future.length;

  const reset = useCallback(() => {
    setDraft(key, null);
    setHist((h) => ({ ...h, [key]: undefined }));
    if (!original) {
      // A deleted new year falls back to the curriculum's other years; a deleted new curriculum to another curriculum
      const rest = group.versions.filter((v) => v.version !== year);
      const g = rest.length ? { code, versions: rest } : curricula.find((x) => x.code !== code) || curricula[0];
      go(g.code, g.versions[g.versions.length - 1].version);
    }
  }, [key, original, group, year, curricula, code, go, setDraft]);
  // Adds a new curriculum or year as a draft and switches to it
  const create = useCallback((entry) => { setDraft(keyOf(entry), entry); go(codeOf(entry), entry.version); }, [go, setDraft]);
  const exportAll = useCallback(() => downloadCurriculumJs(entries), [entries]);

  const dirty = !!drafts[key];
  const palette = useMemo(() => modulePalette(curriculum.modules), [curriculum.modules]);

  return (
    <Ctx.Provider value={{ code, year, curriculum, original, curricula, entries, group, setYear, setCurriculum, palette, update, undo, redo, canUndo, canRedo, reset, create, dirty, isNew: !original, exportAll }}>
      {children}
    </Ctx.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useCurriculum = () => useContext(Ctx);
