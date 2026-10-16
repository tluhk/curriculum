// Module id -> display name and colour, shared by all views
export const moduleConfig = {
  1: { name: "Praktika", color: "#F4A6A0" },
  2: { name: "Üleülikoolilised ained", color: "#A3C9E1" },
  3: { name: "Eriala kohustuslikud ained", color: "#A8D5BA" },
  4: { name: "Eriala valikained", color: "#D6AEDD" },
  5: { name: "Vabaained", color: "#F4D1A1" },
  6: { name: "Erialane inglise keel", color: "#F4D1C1" },
  7: { name: "Lõputöö", color: "#FFE5B4" },
};

export const moduleColors = Object.fromEntries(
  Object.entries(moduleConfig).map(([id, { color }]) => [id, color])
);

export const YEARS = ["2025", "2026"];
export const DEFAULT_YEAR = "2025";

export const parseYear = (value) => (YEARS.includes(value) ? value : DEFAULT_YEAR);
