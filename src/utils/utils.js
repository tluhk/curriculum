export const transformCurriculum = (curriculumData, moduleColors) => {
  const semesterSpacing = 200;
  const baseNodeHeight = 10;
  const creditMultiplier = 15;

  const nodes = curriculumData.map((course) => {
    const nodeHeight = baseNodeHeight + course.credits * creditMultiplier;
    const moduleColor = moduleColors[course.module] || "#cccccc";
    return {
      id: `subject-${course.id}`,
      data: { label: `${course.name}` },
      position: {
        y: (course.semester - 1) * semesterSpacing,
        x: (course.order - 1) * 200,
      },
      module: course.module,
      semester: course.semester,
      credits: course.credits,
      required: course.required,
      style: {
        backgroundColor: moduleColor,
        padding: 10,
        border: "1px solid #ddd",
        height: nodeHeight,
        opacity: 1,
      },
    };
  });

  const edges = curriculumData.flatMap((course) =>
    course.prerequisites.map((prerequisiteId) => ({
      id: `edge-${prerequisiteId}-${course.id}`,
      source: `subject-${prerequisiteId}`,
      target: `subject-${course.id}`,
      animated: false,
      markerEnd: { type: "arrow", color: "#000" },
      style: { stroke: "#D3D3D3", strokeWidth: 1 },
    }))
  );

  return { nodes, edges };
};
