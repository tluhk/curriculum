// Build a complete graph structure for progressive reveal
export const buildOutcomesGraph = (curriculum, moduleConfig) => {
  const allNodes = [];
  const allEdges = [];
  const relationships = {}; // Store parent-child relationships
  const createdEdges = new Set(); // Track created edge IDs to avoid duplicates
  const nodeIds = new Set(); // Track created node IDs for O(1) duplicate checks
  const modulesById = new Map(curriculum.modules.map((m) => [m.id, m]));
  const subjectsById = new Map(curriculum.subjects.map((s) => [s.id, s]));

  const levelHeight = 200;
  const compactSpacing = 250;

  // Level 0: Curriculum Header (root node)
  const headerNode = {
    id: 'curriculum-header',
    type: 'default',
    data: {
      label: `${curriculum.name} (${curriculum.version})`,
      level: 'header',
      clickable: false,
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
      cursor: 'default',
    },
  };
  allNodes.push(headerNode);
  nodeIds.add(headerNode.id);
  relationships['curriculum-header'] = { children: [], parent: null };

  // Level 1: Curriculum Learning Outcomes
  const curriculumOutcomes = curriculum.learningOutcomes || [];
  const curriculumY = 150;

  curriculumOutcomes.forEach((outcome, index) => {
    const totalWidth = (curriculumOutcomes.length - 1) * compactSpacing;
    const startX = -totalWidth / 2;
    const nodeId = `curriculum-${outcome.id}`;

    nodeIds.add(nodeId);
    allNodes.push({
      id: nodeId,
      type: "default",
      data: {
        label: `ÕV ${outcome.id}: ${outcome.description}`,
        level: 'curriculum',
        clickable: true,
        expanded: false,
      },
      position: { x: startX + index * compactSpacing, y: curriculumY },
      style: {
        background: "#e3f2fd",
        border: "2px solid #2196f3",
        borderRadius: "8px",
        padding: "10px",
        minWidth: "200px",
        fontSize: "12px",
        cursor: 'pointer',
      },
    });

    allEdges.push({
      id: `header-to-${nodeId}`,
      source: 'curriculum-header',
      target: nodeId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#4A90E2', strokeWidth: 2 },
    });

    relationships[nodeId] = { children: [], parent: 'curriculum-header' };
    relationships['curriculum-header'].children.push(nodeId);

    // Build module outcome nodes
    if (outcome.moduleOutcomes) {
      outcome.moduleOutcomes.forEach(({ moduleId, outcomeId }, mIndex) => {
        const module = modulesById.get(moduleId);
        if (!module) return;

        const moduleLO = module.learningOutcomes.find(lo => lo.id === outcomeId);
        if (!moduleLO) return;

        const moduleNodeId = `module-${moduleId}-${outcomeId}`;
        const moduleColor = moduleConfig[moduleId]?.color || '#cccccc';

        // Calculate compact position for modules under this curriculum outcome
        const moduleX = startX + index * compactSpacing + (mIndex - (outcome.moduleOutcomes.length - 1) / 2) * 200;
        const moduleY = curriculumY + levelHeight;

        if (!nodeIds.has(moduleNodeId)) {
          nodeIds.add(moduleNodeId);
          allNodes.push({
            id: moduleNodeId,
            type: 'default',
            data: {
              label: `M${moduleId}.${outcomeId}: ${moduleLO.description.substring(0, 50)}...`,
              fullDescription: moduleLO.description,
              moduleName: module.name,
              level: 'module',
              clickable: true,
              expanded: false,
              parentCurriculum: nodeId,
            },
            position: { x: moduleX, y: moduleY },
            style: {
              background: moduleColor,
              border: '2px solid ' + moduleColor,
              borderRadius: '8px',
              padding: '8px',
              width: 200,
              fontSize: '11px',
              cursor: 'pointer',
            },
            hidden: true, // Initially hidden
          });

          relationships[moduleNodeId] = { children: [], parent: nodeId };
        }

        const cmEdgeId = `edge-curriculum-${outcome.id}-module-${moduleId}-${outcomeId}`;
        if (!createdEdges.has(cmEdgeId)) allEdges.push({
          id: cmEdgeId,
          source: nodeId,
          target: moduleNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4A90E2', strokeWidth: 2 },
          hidden: true, // Initially hidden
        });
        createdEdges.add(cmEdgeId);

        if (!relationships[nodeId].children.includes(moduleNodeId)) {
          relationships[nodeId].children.push(moduleNodeId);
        }

        // Build subject outcome nodes
        if (moduleLO.subjectOutcomes) {
          moduleLO.subjectOutcomes.forEach(({ subjectId, outcomeId: subOutcomeId }, sIndex) => {
            const subject = subjectsById.get(subjectId);
            if (!subject) {
              console.warn(`Subject ${subjectId} not found`);
              return;
            }

            const subjectOutcome = subject.outcomes.find(o => o.id === subOutcomeId);
            if (!subjectOutcome) {
              console.warn(`Subject ${subject.name} (ID: ${subjectId}) does not have outcome ID ${subOutcomeId}. Valid IDs: ${subject.outcomes.map(o => o.id).join(', ')}`);
              return;
            }

            const subjectNodeId = `subject-${subjectId}-${subOutcomeId}`;
            const subjectColor = moduleConfig[subject.module]?.color || '#cccccc';
            const edgeId = `edge-module-${moduleId}-${outcomeId}-subject-${subjectId}-${subOutcomeId}`;

            // Calculate compact position for subjects under this module
            const subjectX = moduleX + (sIndex - (moduleLO.subjectOutcomes.length - 1) / 2) * 180;
            const subjectY = moduleY + levelHeight;

            // Create subject node if it doesn't exist
            if (!nodeIds.has(subjectNodeId)) {
              nodeIds.add(subjectNodeId);
              allNodes.push({
                id: subjectNodeId,
                type: 'default',
                data: {
                  label: `${subject.name}: ${subjectOutcome.description.substring(0, 35)}...`,
                  fullDescription: subjectOutcome.description,
                  subjectName: subject.name,
                  level: 'subject',
                  clickable: false,
                  parentModule: moduleNodeId,
                },
                position: { x: subjectX, y: subjectY },
                style: {
                  background: '#ffffff',
                  border: '2px solid ' + subjectColor,
                  borderRadius: '6px',
                  padding: '6px',
                  width: 170,
                  fontSize: '10px',
                  cursor: 'default',
                },
                hidden: true, // Initially hidden
              });

              // Initialize relationships for new subject node with array of parents
              relationships[subjectNodeId] = { children: [], parents: [moduleNodeId] };
            } else {
              // Subject node exists, add this module as additional parent if not already there
              if (!relationships[subjectNodeId].parents) {
                relationships[subjectNodeId].parents = [moduleNodeId];
              } else if (!relationships[subjectNodeId].parents.includes(moduleNodeId)) {
                relationships[subjectNodeId].parents.push(moduleNodeId);
              }
            }

            // Only add edge if it hasn't been created yet
            if (!createdEdges.has(edgeId)) {
              allEdges.push({
                id: edgeId,
                source: moduleNodeId,
                target: subjectNodeId,
                type: 'smoothstep',
                style: { stroke: moduleColor, strokeWidth: 1.5 },
                hidden: true, // Initially hidden
              });
              createdEdges.add(edgeId);
            }

            // Always add subject to module's children if not already there
            if (!relationships[moduleNodeId].children.includes(subjectNodeId)) {
              relationships[moduleNodeId].children.push(subjectNodeId);
            }
          });
        }
      });
    }
  });

  return { allNodes, allEdges, relationships };
};
