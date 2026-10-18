// Writes every version back to a drop-in src/data/curriculum.js
export const buildCurriculumJs = (versions) =>
  "const curriculums = " + JSON.stringify(versions, null, 2) + ";\n\nexport default curriculums;\n";

export const downloadCurriculumJs = (versions) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buildCurriculumJs(versions)], { type: "text/javascript" }));
  a.download = "curriculum.js";
  a.click();
  URL.revokeObjectURL(a.href);
};
