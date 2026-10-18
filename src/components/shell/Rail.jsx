/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

const KEY = "railCollapsed.";
const read = (id) => { try { return localStorage.getItem(KEY + id) === "1"; } catch { return false; } };

// Left sidebar that collapses to a slim strip. `summary` is what stays visible when collapsed.
// The choice is remembered per rail in this browser.
export default function Rail({ id, as: Tag = "aside", className, label, summary, children }) {
  const [closed, setClosed] = useState(() => read(id));
  useEffect(() => { try { localStorage.setItem(KEY + id, closed ? "1" : "0"); } catch { /* storage unavailable */ } }, [id, closed]);

  return (
    <Tag className={`${className} siderail${closed ? " closed" : ""}`} aria-label={label}>
      <button className="railtoggle" aria-expanded={!closed} aria-label={closed ? "Ava külgpaneel" : "Peida külgpaneel"}
        title={closed ? "Ava külgpaneel" : "Peida külgpaneel"} onClick={() => setClosed((v) => !v)}>
        {closed ? "»" : "«"}
      </button>
      {closed ? summary : children}
    </Tag>
  );
}
