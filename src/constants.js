// Module id -> name, tint (card fill) and stripe (accent, AA-friendlier). Shared by all views.
export const moduleConfig = {
  1: { name: "Praktika", color: "#F4A6A0", stripe: "#E0746B" },
  2: { name: "Üleülikoolilised ained", color: "#A3C9E1", stripe: "#5E9CC4" },
  3: { name: "Eriala kohustuslikud ained", color: "#A8D5BA", stripe: "#4F9C72" },
  4: { name: "Eriala valikained", color: "#D6AEDD", stripe: "#A96BB8" },
  5: { name: "Vabaained", color: "#F4D1A1", stripe: "#D9A04F" },
  6: { name: "Erialane inglise keel", color: "#F4D1C1", stripe: "#D98E6E" },
  7: { name: "Lõputöö", color: "#FFE5B4", stripe: "#D9A93F" },
};
export const moduleColors = Object.fromEntries(Object.entries(moduleConfig).map(([id, { color }]) => [id, color]));
export const SEMESTER_EAP = 30;
export const SEMESTER_SOFT_LIMIT = 6; // subjects per semester before a warning (never blocks)

// Colour choices offered in Haldus → Moodulid; [tint, stripe]. The last one is the default for new modules.
export const SWATCHES = [...Object.values(moduleConfig).map((m) => [m.color, m.stripe]), ["#C9D3F2", "#5B72C4"]];

// Module styles for a curriculum: an explicit color/stripe on the module wins, then moduleConfig; modules beyond
// those (e.g. a master's specialisation) get the swatches no other module of the curriculum uses, then grey.
export const modulePalette = (modules) => {
  const fixed = (m) => (m.color ? [m.color, m.stripe] : moduleConfig[m.id] ? [moduleConfig[m.id].color, moduleConfig[m.id].stripe] : null);
  const used = new Set(modules.map(fixed).filter(Boolean).map(([c]) => c));
  const free = SWATCHES.filter(([c]) => !used.has(c));
  return Object.fromEntries(
    modules.map((m) => {
      const [color, stripe] = fixed(m) || free.shift() || ["#ddd", "#999"];
      return [m.id, { name: m.name, color, stripe: stripe || "#999" }];
    })
  );
};
export const NO_MODULE = { name: "—", color: "#ddd", stripe: "#999" };
