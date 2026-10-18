/* eslint-disable react/prop-types */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import base from "../data/curriculum";
import { modulePalette, parseYear } from "../constants";
import { downloadCurriculumJs } from "../utils/exportCurriculum";

const KEY = "curriculumDraft.v1.";
const load = (version) => { try { return JSON.parse(localStorage.getItem(KEY + version)); } catch { return null; } };
const Ctx = createContext(null);

// Drafts live only in this browser (localStorage) until you export curriculum.js and commit it.
export function CurriculumProvider({ children }) {
  const [params, setParams] = useSearchParams();
  const year = parseYear(params.get("year"));
  const [drafts, setDrafts] = useState(() => Object.fromEntries(base.map((c) => [c.version, load(c.version)]).filter(([, d]) => d)));

  useEffect(() => {
    Object.entries(drafts).forEach(([v, d]) => (d ? localStorage.setItem(KEY + v, JSON.stringify(d)) : localStorage.removeItem(KEY + v)));
  }, [drafts]);

  const original = useMemo(() => base.find((c) => c.version === year) || base[0], [year]);
  const curriculum = drafts[original.version] || original;

  const update = useCallback((fn) => setDrafts((d) => ({ ...d, [original.version]: fn(d[original.version] || original) })), [original]);
  const reset = useCallback(() => setDrafts((d) => ({ ...d, [original.version]: null })), [original]);
  const setYear = useCallback((y) => setParams((p) => { const n = new URLSearchParams(p); n.set("year", y); return n; }), [setParams]);
  const exportAll = useCallback(() => downloadCurriculumJs(base.map((c) => drafts[c.version] || c)), [drafts]);
  const dirty = !!drafts[original.version];
  const palette = useMemo(() => modulePalette(curriculum.modules), [curriculum.modules]);

  return <Ctx.Provider value={{ year, setYear, curriculum, original, palette, update, reset, dirty, exportAll }}>{children}</Ctx.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export const useCurriculum = () => useContext(Ctx);
