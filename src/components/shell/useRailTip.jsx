import { useState } from "react";

// Instant label shown to the right of a collapsed-rail button on hover or keyboard focus.
// `render(key)` is called on every render, so the label stays current (e.g. after a click).
// position:fixed so the rail's overflow doesn't clip it.
export default function useRailTip(render) {
  const [tip, setTip] = useState(null);
  const tipProps = (key) => {
    const show = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      setTip({ key, top: r.top + r.height / 2, left: r.right + 8 });
    };
    return { onMouseEnter: show, onFocus: show, onMouseLeave: () => setTip(null), onBlur: () => setTip(null) };
  };
  const tipEl = tip && <div className="railtip" role="tooltip" style={{ top: tip.top, left: tip.left }}>{render(tip.key)}</div>;
  return { tipProps, tipEl };
}
