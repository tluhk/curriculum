export const transformOutcomesData = (curriculum, moduleConfig) => {
  const nodes = [];
  const edges = [];

  const horizontalSpacing = 300;
  const levelHeight = 250;

  // Level 0: Curriculum Header (root node)
  const headerNode = {
    id: 'curriculum-header',
    type: 'default',
    data: {
      label: `${curriculum.name} (${curriculum.version})`
    },
    position: { x: 0, y: 0 },
    style: {
      background: '#4A90E2',
      color: 'white',
      border: '2px solid #2E5C8A',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '300px',
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  };
  nodes.push(headerNode);

  // Level 1: Curriculum Learning Outcomes (top)
  const curriculumOutcomes = curriculum.learningOutcomes || [];
  const curriculumY = 150; // Moved down to make room for header

  curriculumOutcomes.forEach((outcome, index) => {
    const totalWidth = (curriculumOutcomes.length - 1) * horizontalSpacing;
    const startX = -totalWidth / 2;

    const nodeId = `curriculum-${outcome.id}`;
    nodes.push({
      id: nodeId,
      type: "default",
      data: { label: `ÕV ${outcome.id}: ${outcome.description}` },
      position: { x: startX + index * horizontalSpacing, y: curriculumY },
      style: {
        background: "#e3f2fd",
        border: "2px solid #2196f3",
        borderRadius: "8px",
        padding: "10px",
        minWidth: "200px",
        fontSize: "12px",
      },
    });

    // Connect header to each curriculum outcome
    edges.push({
      id: `header-to-${nodeId}`,
      source: 'curriculum-header',
      target: nodeId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#4A90E2', strokeWidth: 2 },
    });

    // Create edges to module outcomes
    if (outcome.moduleOutcomes) {
      outcome.moduleOutcomes.forEach(({ moduleId, outcomeId }) => {
        edges.push({
          id: `edge-curriculum-${outcome.id}-module-${moduleId}-${outcomeId}`,
          source: `curriculum-${outcome.id}`,
          target: `module-${moduleId}-${outcomeId}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4A90E2', strokeWidth: 2 }
        });
      });
    }
  });

  // Level 2: Module Learning Outcomes (middle)
  const modules = curriculum.modules || [];
  const moduleY = curriculumY + levelHeight;
  let moduleIndex = 0;

  modules.forEach((module) => {
    const moduleOutcomes = module.learningOucomes || [];
    const moduleColor = moduleConfig[module.id]?.color || '#cccccc';

    moduleOutcomes.forEach((outcome) => {
      const xOffset = (moduleIndex - 15) * (horizontalSpacing / 2) + 400;

      nodes.push({
        id: `module-${module.id}-${outcome.id}`,
        type: 'default',
        data: {
          label: `M${module.id}.${outcome.id}: ${outcome.description.substring(0, 60)}...`,
          fullDescription: outcome.description,
          moduleName: module.name,
          level: 'module'
        },
        position: { x: xOffset, y: moduleY },
        style: {
          background: moduleColor,
          border: '2px solid ' + moduleColor,
          borderRadius: '8px',
          padding: '8px',
          width: 220,
          fontSize: '11px',
          opacity: 0.9
        }
      });

      // Create edges to subject outcomes
      if (outcome.subjectOutcomes) {
        outcome.subjectOutcomes.forEach(({ subjectId, outcomeId }) => {
          edges.push({
            id: `edge-module-${module.id}-${outcome.id}-subject-${subjectId}-${outcomeId}`,
            source: `module-${module.id}-${outcome.id}`,
            target: `subject-${subjectId}-${outcomeId}`,
            type: 'smoothstep',
            style: { stroke: moduleColor, strokeWidth: 1.5 }
          });
        });
      }

      moduleIndex++;
    });
  });

  // Level 3: Subject Learning Outcomes (bottom)
  const subjects = curriculum.subjects || [];
  const subjectY = moduleY + levelHeight;
  let subjectOutcomeIndex = 0;

  subjects.forEach((subject) => {
    const subjectOutcomes = subject.outcomes || [];
    const moduleColor = moduleConfig[subject.module]?.color || '#cccccc';

    subjectOutcomes.forEach((outcome) => {
      const xOffset = (subjectOutcomeIndex - 60) * 120 + 1000;

      nodes.push({
        id: `subject-${subject.id}-${outcome.id}`,
        type: 'default',
        data: {
          label: `${subject.name}: ${outcome.description.substring(0, 40)}...`,
          fullDescription: outcome.description,
          subjectName: subject.name,
          level: 'subject'
        },
        position: { x: xOffset, y: subjectY },
        style: {
          background: '#ffffff',
          border: '2px solid ' + moduleColor,
          borderRadius: '6px',
          padding: '6px',
          width: 180,
          fontSize: '10px',
          opacity: 0.8
        }
      });

      subjectOutcomeIndex++;
    });
  });

  return { nodes, edges };
};
