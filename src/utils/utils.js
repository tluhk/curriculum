export const transformCurriculum = (curriculumData, moduleColors, moduleConfig) => {
  const baseNodeHeight = 10;
  const creditMultiplier = 15;
  const subjectSpacing = 200;
  const margin = 30; // Vertical margin for subject placement
  const badgeWidth = 50; // Width for the badge

  const semesterMaxHeights = {};
  const semesterCounts = {};
  const semesterCredits = {};

  curriculumData.forEach((course) => {
    const nodeHeight = baseNodeHeight + course.credits * creditMultiplier;
    // Track max height per semester
    semesterMaxHeights[course.semester] = Math.max(
      semesterMaxHeights[course.semester] || 0,
      nodeHeight
    );
    // Track number of courses in each semester
    semesterCounts[course.semester] = (semesterCounts[course.semester] || 0) + 1;
    // Track total credits per semester
    semesterCredits[course.semester] = (semesterCredits[course.semester] || 0) + course.credits;
  });

  // Find the maximum width needed for any semester
  const maxCount = Math.max(...Object.values(semesterCounts));
  const maxWidth = maxCount * subjectSpacing + margin + badgeWidth;

  // Calculate the vertical position for each semester
  let currentY = 0;
  const semesterNodes = Object.keys(semesterCounts).map((s) => {
    const semesterNumber = parseInt(s, 10);
    const height = semesterMaxHeights[semesterNumber] + 2 * margin;
    const position = { x: 20, y: currentY };
    currentY += height + 50; // Consistent spacing
    return {
      id: `semester-${semesterNumber}`,
      type: "semesterNode",
      data: {
        semester: semesterNumber,
        width: maxWidth,
        height,
        credits: semesterCredits[semesterNumber], // Pass total credits
      },
      position,
      draggable: false,
      selectable: false,
    };
  });

  // Place subject nodes near the top with a uniform margin
  const subjectNodes = curriculumData.map((course) => {
    const nodeHeight = baseNodeHeight + course.credits * creditMultiplier;
    const verticalOffset = margin / 2 + 5; // Align subjects at the top

    // Get module name from moduleConfig
    const moduleName = moduleConfig[course.module]?.name || 'Unknown Module';

    // Convert outcomes to array of strings for display
    const outcomesArray = Array.isArray(course.outcomes)
      ? course.outcomes.map(outcome =>
        typeof outcome === 'object' && outcome.description
          ? outcome.description
          : outcome
      )
      : [];

    // Find the semester node for this course
    const semesterNode = semesterNodes.find((n) => n.data.semester === course.semester);

    // Safety check: if semester node doesn't exist, use a default position
    const semesterY = semesterNode ? semesterNode.position.y : 0;

    return {
      id: `subject-${course.id}`,
      type: "subjectNode",
      data: {
        label: `${course.name}\n${course.credits}EAP`,
        id: course.id,
        backgroundColor: moduleColors[course.module] || "#cccccc",
        nodeHeight,
        course: {
          ...course,
          moduleName, // Add module name to course data
          outcomes: outcomesArray, // Convert outcomes to strings
        },
        prerequisites: course.prerequisites || [],
        dependents: curriculumData
          .filter((c) => (c.prerequisites || []).includes(course.id))
          .map((c) => c.id),
      },
      position: {
        x: ((course.order || 1) - 1) * subjectSpacing + 50 + badgeWidth,
        y: semesterY + verticalOffset,
      },
      module: course.module,
      semester: course.semester,
      credits: course.credits,
      required: course.required,
    };
  });

  // Build edges
  const edges = curriculumData.flatMap((course) =>
    (course.prerequisites || []).map((pId) => ({
      id: `edge-${pId}-${course.id}`,
      source: `subject-${pId}`,
      target: `subject-${course.id}`,
    }))
  );

  return {
    nodes: [...semesterNodes, ...subjectNodes],
    edges,
  };
};
