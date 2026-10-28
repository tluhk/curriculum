import { describe, it, expect } from "vitest"; // npm i -D vitest, then "test": "vitest run"
import { checkMove, moveSubject } from "./graph";

const S = [
  { id: 1, semester: 1, order: 1, credits: 3, name: "A", prerequisites: [] },
  { id: 2, semester: 2, order: 1, credits: 3, name: "B", prerequisites: [1] },
  { id: 3, semester: 3, order: 1, credits: 3, name: "C", prerequisites: [2] },
];
describe("checkMove", () => {
  it("blocks moving a prerequisite after its dependent", () => expect(checkMove(S, 1, 3).ok).toBe(false));
  it("blocks moving a dependent before its prerequisite", () => expect(checkMove(S, 3, 1).ok).toBe(false));
  it("allows a prerequisite and its dependent in the same semester", () => {
    expect(checkMove(S, 1, 2).ok).toBe(true);
    expect(checkMove(S, 3, 2).ok).toBe(true);
  });
  it("allows a free move", () => expect(checkMove(S, 1, 1).ok).toBe(true));
  it("moveSubject ignores blocked moves", () => expect(moveSubject(S, 1, 3)).toBe(S));
});
