import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
} from "@xyflow/react";
import PropTypes from "prop-types";

const ROOT_LEVELS = new Set(["header", "curriculum"]);

const OutcomesVisualization = ({ allNodes, allEdges, relationships }) => {
  // Nodes keep their (draggable) positions in state; visibility is derived
  // from the set of expanded nodes so shared children stay visible as long as
  // at least one expanded parent still points to them.
  const [nodes, , onNodesChange] = useNodesState(allNodes);
  const [expandedNodes, setExpandedNodes] = useState(() => new Set());

  const visibleIds = useMemo(() => {
    const visible = new Set(
      allNodes.filter((n) => ROOT_LEVELS.has(n.data.level)).map((n) => n.id)
    );
    const queue = [...visible];
    while (queue.length) {
      const id = queue.pop();
      if (!expandedNodes.has(id)) continue;
      (relationships[id]?.children || []).forEach((childId) => {
        if (!visible.has(childId)) {
          visible.add(childId);
          queue.push(childId);
        }
      });
    }
    return visible;
  }, [allNodes, relationships, expandedNodes]);

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        hidden: !visibleIds.has(n.id),
        data: { ...n.data, expanded: expandedNodes.has(n.id) },
        style:
          n.data.level === "curriculum" && expandedNodes.has(n.id)
            ? { ...n.style, border: "3px solid #2196f3" }
            : n.style,
      })),
    [nodes, visibleIds, expandedNodes]
  );

  const displayEdges = useMemo(
    () =>
      allEdges.map((e) => ({
        ...e,
        hidden: !(
          visibleIds.has(e.source) &&
          visibleIds.has(e.target) &&
          (e.source === "curriculum-header" || expandedNodes.has(e.source))
        ),
      })),
    [allEdges, visibleIds, expandedNodes]
  );

  const onNodeClick = useCallback((event, clickedNode) => {
    if (!clickedNode.data.clickable) return;
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(clickedNode.id)) {
        next.delete(clickedNode.id);
      } else {
        next.add(clickedNode.id);
      }
      return next;
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

OutcomesVisualization.propTypes = {
  allNodes: PropTypes.array.isRequired,
  allEdges: PropTypes.array.isRequired,
  relationships: PropTypes.object.isRequired,
};

export default OutcomesVisualization;
