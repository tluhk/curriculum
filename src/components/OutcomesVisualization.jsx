import { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import PropTypes from "prop-types";

const OutcomesVisualization = ({ allNodes, allEdges, relationships }) => {
  // Start with only header and curriculum outcomes visible
  const initialVisibleNodes = allNodes.map((node) => ({
    ...node,
    hidden: node.data.level !== "header" && node.data.level !== "curriculum",
  }));

  const initialVisibleEdges = allEdges.map((edge) => ({
    ...edge,
    hidden: !edge.source.includes("header"),
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialVisibleNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialVisibleEdges);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const onNodeClick = useCallback(
    (event, clickedNode) => {
      if (!clickedNode.data.clickable) return;

      const nodeId = clickedNode.id;
      const isExpanded = expandedNodes.has(nodeId);

      if (isExpanded) {
        // Collapse: hide children and all descendants
        const newExpandedNodes = new Set(expandedNodes);
        newExpandedNodes.delete(nodeId);

        const nodesToHide = new Set();

        // Recursively find all descendants
        const findDescendants = (id) => {
          const children = relationships[id]?.children || [];
          children.forEach((childId) => {
            nodesToHide.add(childId);
            newExpandedNodes.delete(childId);
            findDescendants(childId);
          });
        };

        findDescendants(nodeId);

        // Hide nodes
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            hidden: nodesToHide.has(n.id) ? true : n.hidden,
            data: {
              ...n.data,
              expanded: n.id === nodeId ? false : n.data.expanded,
            },
          }))
        );

        // Hide edges
        setEdges((eds) =>
          eds.map((e) => {
            const shouldHide =
              nodesToHide.has(e.source) || nodesToHide.has(e.target);
            return {
              ...e,
              hidden: shouldHide ? true : e.hidden,
            };
          })
        );

        setExpandedNodes(newExpandedNodes);
      } else {
        // Expand: show immediate children only
        const newExpandedNodes = new Set(expandedNodes);
        newExpandedNodes.add(nodeId);

        const children = relationships[nodeId]?.children || [];

        // Show immediate children nodes
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                data: { ...n.data, expanded: true },
                style: {
                  ...n.style,
                  border:
                    n.data.level === "curriculum"
                      ? "3px solid #2196f3"
                      : n.style.border,
                },
              };
            }
            if (children.includes(n.id)) {
              return { ...n, hidden: false };
            }
            return n;
          })
        );

        // Show edges to immediate children
        setEdges((eds) =>
          eds.map((e) => {
            if (e.source === nodeId && children.includes(e.target)) {
              return { ...e, hidden: false };
            }
            return e;
          })
        );

        setExpandedNodes(newExpandedNodes);
      }
    },
    [expandedNodes, relationships, setNodes, setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
