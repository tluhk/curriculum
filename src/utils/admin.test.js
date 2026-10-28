import { describe, it, expect } from "vitest";
import curriculums from "../data/curriculum";
import { checkCurriculum, issuesFor, subjectErrors } from "./checks";
import { saveSubject, deleteSubject, saveModule, deleteModule, saveOutcome } from "./adminOps";
import { coverage, moduleOutcomeIndex } from "./outcomes";

const C = {
  learningOutcomes: [{ id: 181, description: "ÕV", moduleOutcomes: [{ moduleId: 1, outcomeId: 1 }, { moduleId: 1, outcomeId: 2 }] }],
  modules: [{ id: 1, name: "M", objective: "", learningOutcomes: [
    { id: 1, description: "mo1", subjectOutcomes: [{ subjectId: 1, outcomeId: 10 }, { subjectId: 2, outcomeId: 20 }] },
    { id: 2, description: "mo2", subjectOutcomes: [{ subjectId: 1, outcomeId: 11 }] },
  ] }],
  subjects: [
    { id: 1, semester: 1, order: 1, credits: 15, name: "A", module: 1, required: true, prerequisites: [], outcomes: [{ id: 10, description: "a" }, { id: 11, description: "b" }] },
    { id: 2, semester: 2, order: 1, credits: 30, name: "B", module: 1, required: true, prerequisites: [1], outcomes: [{ id: 20, description: "c" }] },
  ],
};

describe("coverage", () => {
  it("counts subject-outcome links per ÕV and subject", () => expect(coverage(C, moduleOutcomeIndex(C))[181]).toEqual({ 1: 2, 2: 1 }));
});

describe("checks", () => {
  it("flags semesters that are not 30 EAP", () => expect(checkCurriculum(C).map((i) => i.text)).toContain("Semester 1 maht on 15 EAP (eeldatav 30)."));
  it("blocks moving a prerequisite after its dependent, but allows the same semester", () => {
    expect(subjectErrors(C.subjects, 1, { ...C.subjects[0], semester: 3 })).toHaveLength(1);
    expect(subjectErrors(C.subjects, 1, { ...C.subjects[0], semester: 2 })).toHaveLength(0);
  });
  it("a prerequisite in the same semester is not flagged", () => {
    const C3 = { ...C, subjects: C.subjects.map((s) => (s.id === 1 ? { ...s, semester: 2 } : s)) };
    expect(checkCurriculum(C3).filter((i) => i.sev === "viga")).toEqual([]);
  });
  it("required → elective warning shows on both subjects", () => {
    const C2 = { ...C, subjects: C.subjects.map((s) => (s.id === 1 ? { ...s, required: false } : s)) };
    const issues = checkCurriculum(C2).filter((i) => i.sev === "hoiatus");
    expect(issuesFor(issues, "subject", 2)).toHaveLength(1);
    expect(issuesFor(issues, "subject", 1)).toEqual(issuesFor(issues, "subject", 2));
  });
  it.each([["RIF", "2026"], ["TJ", "2026"], ["KTD", "2026"], ["LO", "2026"], ["KVM", "2026"]])("%s %s data has no errors", (code, version) =>
    expect(checkCurriculum(curriculums.find((c) => c.code === code && c.version === version)).filter((i) => i.sev === "viga")).toEqual([]));
});

describe("adminOps", () => {
  it("deleting a subject removes it from prerequisites and module links", () => {
    const n = deleteSubject(C, 1);
    expect(n.subjects[0].prerequisites).toEqual([]);
    expect(n.modules[0].learningOutcomes[1].subjectOutcomes).toEqual([]);
  });
  it("removing a subject outcome drops its module links", () => {
    const n = saveSubject(C, 1, { ...C.subjects[0], outcomes: [{ id: 10, description: "a" }] });
    expect(n.modules[0].learningOutcomes[1].subjectOutcomes).toEqual([]);
  });
  it("new subjects go last in their semester", () => {
    const n = saveSubject(C, "new", { ...C.subjects[0], name: " X ", semester: 2 });
    expect(n.subjects.at(-1)).toMatchObject({ id: 3, order: 2, name: "X" });
  });
  it("removing a module outcome drops ÕV links; deleting a module drops all its links", () => {
    expect(saveModule(C, 1, { ...C.modules[0], learningOutcomes: [C.modules[0].learningOutcomes[0]] }).learningOutcomes[0].moduleOutcomes).toHaveLength(1);
    expect(deleteModule(C, 1).learningOutcomes[0].moduleOutcomes).toEqual([]);
  });
  it("default module colours are not written to the data", () =>
    expect(saveModule(C, 1, { ...C.modules[0], color: "#F4A6A0", stripe: "#E0746B" }).modules[0]).not.toHaveProperty("color"));
  it("empty KHS is dropped, new ÕV ids continue after 180", () => {
    const n = saveOutcome(C, "new", { description: "x", khsOutcome: " ", moduleOutcomes: [] });
    expect(n.learningOutcomes.at(-1)).toEqual({ id: 182, description: "x", moduleOutcomes: [] });
  });
});
