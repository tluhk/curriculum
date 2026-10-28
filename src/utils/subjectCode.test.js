import { describe, it, expect } from "vitest";
import curriculums from "../data/curriculum";
import { subjectCode, withCode, oisUrl } from "./subjectCode";

describe("subject codes", () => {
  it("builds the ÕIS subject-card link", () => expect(oisUrl("HKI5025.HK")).toBe("https://ois2.tlu.ee/tluois/aine/HKI5025.HK"));
  it("falls back to the code in an ÕIS link", () => expect(subjectCode({ url: "https://ois2.tlu.ee/tluois/aine/HKT5097.HK" })).toBe("HKT5097.HK"));
  it("the link follows the code, but a Google Doc link is kept", () => {
    expect(withCode({ url: "" }, "HKI1.HK").url).toBe(oisUrl("HKI1.HK"));
    expect(withCode({ url: oisUrl("OLD.HK") }, "NEW.HK").url).toBe(oisUrl("NEW.HK"));
    expect(withCode({ url: "https://docs.google.com/x" }, "NEW.HK").url).toBe("https://docs.google.com/x");
  });
  it("every RIF 2025 subject but the thesis has a unique code and its ÕIS link", () => {
    const rif = curriculums.find((c) => c.code === "RIF" && c.version === "2025");
    const coded = rif.subjects.filter((s) => s.name !== "Lõputöö");
    coded.forEach((s) => expect(s.url).toBe(oisUrl(s.code)));
    expect(new Set(coded.map((s) => s.code)).size).toBe(coded.length);
  });
});
