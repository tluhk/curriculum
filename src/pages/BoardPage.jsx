import { useMemo, useState } from "react";
import { useCurriculum } from "../state/CurriculumContext";
import { byId, dependentsMap, upstream, downstream, checkMove, moveSubject, creditsBy } from "../utils/graph";
import { SEMESTER_SOFT_LIMIT } from "../constants";
import { semesterCount } from "../utils/curricula";
import FilterRail from "../components/board/FilterRail";
import SemesterRow from "../components/board/SemesterRow";
import SubjectPanel from "../components/board/SubjectPanel";
import "../components/board/board.css";

export default function BoardPage() {
  const { curriculum, update, year } = useCurriculum();
  const { subjects, modules } = curriculum;
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null);
  const [off, setOff] = useState({});
  const [reqOnly, setReqOnly] = useState(false);

  const idx = useMemo(() => byId(subjects), [subjects]);
  const deps = useMemo(() => dependentsMap(subjects), [subjects]);
  const focus = drag ?? sel;
  const up = useMemo(() => (focus ? upstream(focus, idx) : new Set()), [focus, idx]);
  const down = useMemo(() => (focus ? downstream(focus, deps) : new Set()), [focus, deps]);
  const related = (id) => !focus || id === focus || up.has(id) || down.has(id);

  const visible = (s) => !off[s.module] && (!reqOnly || s.required);
  // Every semester of the curriculum gets a row, so subjects can be dragged into an empty one
  const semesters = [...new Set([...Array.from({ length: semesterCount(curriculum) }, (_, i) => i + 1), ...subjects.map((s) => s.semester)])].sort((a, b) => a - b);
  const cols = Math.max(6, ...Object.values(subjects.reduce((a, s) => ((a[s.semester] = (a[s.semester] || 0) + 1), a), {})));
  const credits = creditsBy(subjects.filter(visible), "semester");

  const rowState = (sem) => {
    if (!drag) return { kind: "idle" };
    const r = checkMove(subjects, drag, sem);
    if (!r.ok) return { kind: "blocked", msg: r.reason };
    const n = subjects.filter((s) => s.semester === sem && s.id !== drag).length;
    if (idx[drag].semester !== sem && n >= SEMESTER_SOFT_LIMIT) return { kind: "warn", msg: `Hoiatus: semestris on juba ${n} ainet` };
    return { kind: "ok" };
  };
  const drop = (sem, beforeId) => {
    if (drag && checkMove(subjects, drag, sem).ok) update((c) => ({ ...c, subjects: moveSubject(c.subjects, drag, sem, beforeId) }));
    setDrag(null);
  };

  return (
    <>
      <FilterRail
        key={year} modules={modules} subjects={subjects} off={off} reqOnly={reqOnly}
        onToggle={(id) => { setOff((o) => ({ ...o, [id]: !o[id] })); setSel(null); }}
        onReqOnly={() => { setReqOnly((v) => !v); setSel(null); }}
        total={subjects.filter(visible).reduce((a, s) => a + s.credits, 0)}
      />
      <div className="board" onClick={() => setSel(null)}>
        {semesters.map((sem) => (
          <SemesterRow
            key={sem} semester={sem} cols={cols} credits={credits[sem] || 0}
            subjects={subjects.filter((s) => s.semester === sem && visible(s)).sort((a, b) => a.order - b.order)}
            state={rowState(sem)} sel={sel} related={related} up={up} down={down}
            onSelect={(id) => setSel((v) => (v === id ? null : id))}
            onDragStart={setDrag} onDragEnd={() => setDrag(null)} onDrop={drop}
          />
        ))}
      </div>
      {sel && idx[sel] && <SubjectPanel subject={idx[sel]} idx={idx} up={up} down={down} onPick={setSel} onClose={() => setSel(null)} />}
    </>
  );
}
