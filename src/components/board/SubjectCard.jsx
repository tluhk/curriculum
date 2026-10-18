/* eslint-disable react/prop-types */
import { NO_MODULE } from "../../constants";
import { useCurriculum } from "../../state/CurriculumContext";

const MAX_EAP = 10; // full volume bar

export default function SubjectCard({ subject: s, selected, dim, rel, onSelect, onDragStart, onDragEnd, onDropBefore, onDragOver }) {
  const { palette } = useCurriculum();
  const cfg = palette[s.module] || NO_MODULE;
  return (
    <div className={"card " + rel + (selected ? " sel" : "")} role="button" tabIndex={0} draggable
      aria-pressed={selected} aria-label={`${s.name}, ${s.credits} EAP, ${cfg.name}`}
      style={{ "--tint": cfg.color, "--stripe": cfg.stripe, opacity: dim ? 0.28 : 1 }}
      onClick={(e) => { e.stopPropagation(); onSelect(s.id); }}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(s.id))}
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(s.id)); e.dataTransfer.effectAllowed = "move"; setTimeout(() => onDragStart(s.id), 0); }}
      onDragEnd={onDragEnd} onDragOver={onDragOver} onDrop={onDropBefore}>
      <span className="name" lang="et">{s.name}</span>
      <span className="meta mono"><span>{s.credits} EAP</span><span>{s.required ? "" : "valik"}</span></span>
      <span className="vol"><i style={{ width: Math.min(100, (s.credits / MAX_EAP) * 100) + "%" }} /></span>
    </div>
  );
}
