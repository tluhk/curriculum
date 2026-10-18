import { describe, it, expect } from "vitest";
import json from "../data/schedule-2026.json";
import { buildSchedule, weekCell, weekNotes, timeRange, INTRO } from "./schedule";

const { rows, weeks } = buildSchedule(json, { 2: { stripe: "#5E9CC4" }, 3: { stripe: "#4F9C72" } });

describe("schedule", () => {
  it("groups events without a module into one intro row", () => {
    expect(rows[0].key).toBe(INTRO);
    expect(rows.filter((r) => r.key === INTRO)).toHaveLength(1);
    expect(rows.find((r) => r.key === "HKI5025").color).toBe("#4F9C72");
  });
  it("counts hours and meeting days per week", () => {
    expect(weekCell(weeks[1], "HKI5080")).toEqual({ hours: 8, days: [true, true, false] });
    expect(weekCell(weeks[1], "HKI5062")).toEqual({ hours: 8, days: [false, false, true] });
  });
  it("flags subject sessions without a teacher", () => expect(weekNotes(weeks[1])).toContain("Õppimine kõrgkoolis (10. sep): õppejõud määramata"));
  it("time axis covers all sessions", () => {
    const r = timeRange(weeks);
    expect(r.start).toBeLessThanOrEqual(600);
    expect(r.end).toBeGreaterThanOrEqual(1110);
  });
});
