import { describe, it, expect } from "vitest";
import curriculums from "../data/curriculum";
import { checkCurriculum } from "./checks";
import { saveOutcome } from "./adminOps";
import { coverage, moduleOutcomeIndex } from "./outcomes";
import { emptyHistory, record, undo, redo } from "./history";
import {
  nextCurriculumOutcomeId, nextModuleOutcomeId, nextSubjectOutcomeId, addCurriculumOutcome, updateCurriculumOutcome, removeModuleOutcome,
  addModuleOutcome, updateModuleOutcome, addSubjectOutcome, removeSubjectOutcome, linkModuleOutcome, unlinkModuleOutcome,
  linkSubjectOutcome, unlinkSubjectOutcome, setSubjectOutcomeLinks, linksOfSubjectOutcome, moduleOutcomeUsage,
} from "./outcomeOps";

const base = () => ({
  learningOutcomes: [{ id: 1, description: "ÕV", moduleOutcomes: [{ moduleId: 1, outcomeId: 1 }] }, { id: 2, description: "ÕV2", moduleOutcomes: [] }],
  modules: [{ id: 1, name: "M", objective: "", learningOutcomes: [
    { id: 1, description: "mo1", subjectOutcomes: [{ subjectId: 1, outcomeId: 10 }] },
    { id: 2, description: "mo2", subjectOutcomes: [] },
  ] }],
  subjects: [
    { id: 1, semester: 1, order: 1, credits: 6, name: "A", module: 1, required: true, prerequisites: [], outcomes: [{ id: 10, description: "a" }, { id: 11, description: "b" }] },
  ],
});

describe("ids", () => {
  it("continue after the highest id instead of jumping to 181", () => {
    expect(nextCurriculumOutcomeId(base())).toBe(3);
    expect(nextCurriculumOutcomeId({ learningOutcomes: [] })).toBe(1);
    expect(nextCurriculumOutcomeId({ learningOutcomes: [{ id: 188 }] })).toBe(189);
    expect(saveOutcome(base(), "new", { description: "x", moduleOutcomes: [] }).learningOutcomes.at(-1).id).toBe(3);
    expect(nextModuleOutcomeId(base(), 1)).toBe(3);
    expect(nextSubjectOutcomeId(base())).toBe(12);
  });
  it("no curriculum has duplicate ids", () =>
    curriculums.forEach((c) => expect(checkCurriculum(c).filter((i) => i.text.includes("esineb mitu korda"))).toEqual([])));
});

describe("links", () => {
  it("link and unlink are idempotent", () => {
    const c = linkModuleOutcome(linkModuleOutcome(base(), 2, 1, 2), 2, 1, 2);
    expect(c.learningOutcomes[1].moduleOutcomes).toEqual([{ moduleId: 1, outcomeId: 2 }]);
    expect(unlinkModuleOutcome(unlinkModuleOutcome(c, 2, 1, 2), 2, 1, 2).learningOutcomes[1].moduleOutcomes).toEqual([]);
    const d = linkSubjectOutcome(linkSubjectOutcome(base(), 1, 2, 1, 11), 1, 2, 1, 11);
    expect(d.modules[0].learningOutcomes[1].subjectOutcomes).toEqual([{ subjectId: 1, outcomeId: 11 }]);
    expect(unlinkSubjectOutcome(d, 1, 2, 1, 11).modules[0].learningOutcomes[1].subjectOutcomes).toEqual([]);
  });
  it("the coverage matrix follows the links", () => {
    const c = linkSubjectOutcome(base(), 1, 1, 1, 11);
    expect(coverage(c, moduleOutcomeIndex(c))[1]).toEqual({ 1: 2 });
  });
  it("keeps untouched records as they are", () => {
    const c = base();
    expect(linkModuleOutcome(c, 1, 1, 1).learningOutcomes[0]).toBe(c.learningOutcomes[0]);
  });
});

describe("add, edit, remove", () => {
  it("adds and edits outcomes at each level", () => {
    let c = addCurriculumOutcome(base());
    expect(c.learningOutcomes.at(-1)).toEqual({ id: 3, description: "", moduleOutcomes: [] });
    c = updateCurriculumOutcome(c, 3, { description: "uus", khsOutcome: "khs" });
    expect(c.learningOutcomes.at(-1)).toMatchObject({ description: "uus", khsOutcome: "khs" });
    expect("khsOutcome" in updateCurriculumOutcome(c, 3, { khsOutcome: "  " }).learningOutcomes.at(-1)).toBe(false);
    c = updateModuleOutcome(addModuleOutcome(c, 1, 3, "x"), 1, 3, "y");
    expect(c.modules[0].learningOutcomes.at(-1)).toEqual({ id: 3, description: "y", subjectOutcomes: [] });
    expect(addSubjectOutcome(c, 1, 12, "z").subjects[0].outcomes.at(-1)).toEqual({ id: 12, description: "z" });
  });
  it("deleting a module outcome removes it from every ÕV", () => {
    const c = removeModuleOutcome(base(), 1, 1);
    expect(c.modules[0].learningOutcomes.map((o) => o.id)).toEqual([2]);
    expect(c.learningOutcomes[0].moduleOutcomes).toEqual([]);
  });
  it("deleting a subject outcome removes it from every module outcome", () => {
    const c = removeSubjectOutcome(base(), 1, 10);
    expect(c.subjects[0].outcomes.map((o) => o.id)).toEqual([11]);
    expect(c.modules[0].learningOutcomes[0].subjectOutcomes).toEqual([]);
  });
  it("counts what goes with a deleted module outcome", () => expect(moduleOutcomeUsage(base(), 1, 1)).toEqual({ curriculum: 1, subject: 1 }));
});

describe("setSubjectOutcomeLinks", () => {
  it("adds, keeps and drops links of one subject", () => {
    const c = setSubjectOutcomeLinks(base(), 1, { 10: [{ moduleId: 1, outcomeId: 1 }, { moduleId: 1, outcomeId: 2 }], 11: [{ moduleId: 1, outcomeId: 2 }] });
    expect(c.modules[0].learningOutcomes[0].subjectOutcomes).toEqual([{ subjectId: 1, outcomeId: 10 }]);
    expect(c.modules[0].learningOutcomes[1].subjectOutcomes).toEqual([{ subjectId: 1, outcomeId: 10 }, { subjectId: 1, outcomeId: 11 }]);
    expect(linksOfSubjectOutcome(c, 1, 10)).toEqual([{ moduleId: 1, outcomeId: 1 }, { moduleId: 1, outcomeId: 2 }]);
    const d = setSubjectOutcomeLinks(c, 1, { 10: [] });
    expect(d.modules[0].learningOutcomes.flatMap((o) => o.subjectOutcomes)).toEqual([]);
  });
  it("ignores outcomes the subject does not have and leaves other subjects alone", () => {
    const c = base();
    c.subjects.push({ id: 2, semester: 1, order: 2, credits: 3, name: "B", module: 1, required: true, prerequisites: [], outcomes: [{ id: 20, description: "b" }] });
    c.modules[0].learningOutcomes[1].subjectOutcomes = [{ subjectId: 2, outcomeId: 20 }];
    const d = setSubjectOutcomeLinks(c, 1, { 99: [{ moduleId: 1, outcomeId: 2 }] });
    expect(d.modules[0].learningOutcomes[1].subjectOutcomes).toEqual([{ subjectId: 2, outcomeId: 20 }]);
    expect(d.modules[0].learningOutcomes[0].subjectOutcomes).toEqual([]);
  });
});

describe("checks for the outcome levels", () => {
  it("flags duplicate ids, empty texts and loose subject outcomes", () => {
    const c = base();
    c.learningOutcomes.push({ id: 1, description: " ", moduleOutcomes: [] });
    const text = checkCurriculum(c).map((i) => i.text);
    expect(text).toContain("Õppekava väljundi id 1 esineb mitu korda.");
    expect(text).toContain("ÕV 1 tekst on tühi.");
    expect(text.some((t) => t.includes("1 väljundit pole seotud"))).toBe(true); // subject outcome 11
  });
});

describe("history", () => {
  it("undoes and redoes, and a new change clears redo", () => {
    let h = record(record(emptyHistory(), "a"), "b");
    const u = undo(h, "c");
    expect(u.value).toBe("b");
    expect(redo(u.history, "b").value).toBe("c");
    h = record(u.history, "b");
    expect(h.future).toEqual([]);
    expect(undo(emptyHistory(), "x")).toBeNull();
    expect(record(emptyHistory(), 1, 2).past).toEqual([1]);
    expect(record(record(record(emptyHistory(), 1, 2), 2, 2), 3, 2).past).toEqual([2, 3]);
  });
});
