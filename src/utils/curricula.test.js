import { describe, it, expect } from "vitest";
import curriculums from "../data/curriculum";
import { listCurricula, semesterCount, newCurriculum, copyVersion, curriculumErrors, slug, keyOf } from "./curricula";

const master = newCurriculum(curriculums, { code: "MAG", name: "Magistrikava", level: "magistriõpe", semesters: 4, version: "2026" });

describe("curricula", () => {
  it("groups versions by code, applied curricula before master's", () => {
    const list = listCurricula([...curriculums, master]);
    expect(list.map((g) => g.code)).toEqual(["RIF", "TJ", "MAG"]);
    expect(list[0].versions.map((v) => v.version)).toEqual(["2025", "2026"]);
  });
  it("uses the semester count of the curriculum", () => {
    expect(semesterCount(master)).toBe(4);
    expect(semesterCount(curriculums[0])).toBe(6);
  });
  it("new curricula and years get unique ids and keys", () => {
    const copy = copyVersion(curriculums, curriculums[1], "2027");
    expect(copy.id).toBe(Math.max(...curriculums.map((c) => c.id)) + 1);
    expect(keyOf(copy)).toBe("RIF.2027");
    expect(copy.subjects).toEqual(curriculums[1].subjects);
    expect(copy.subjects).not.toBe(curriculums[1].subjects);
  });
  it("rejects duplicates and bad codes", () => {
    expect(curriculumErrors(curriculums, { code: "RIF", version: "2026" })).toContain("RIF 2026 on juba olemas.");
    expect(curriculumErrors(curriculums, { code: "r", name: "x", version: "26" })).toHaveLength(2);
    expect(curriculumErrors(curriculums, { code: "MAG", name: "Magistrikava", version: "2026" })).toEqual([]);
  });
  it("builds a code from the name", () => expect(slug("Õppekava väljund")).toBe("OPPEKAVA"));
});
