import { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import PropTypes from "prop-types";

const OutcomesVisualization = ({
  nodes: initialNodes,
  edges: initialEdges,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback(
    (event, node) => {
      if (selectedNode === node.id) {
        // Deselect - reset all nodes and edges
        setSelectedNode(null);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            style: {
              ...n.style,
              opacity:
                n.data.level === "curriculum"
                  ? 1
                  : n.data.level === "module"
                  ? 0.9
                  : 0.8,
            },
          }))
        );
        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            style: {
              ...e.style,
              opacity: 1,
            },
            animated: e.source.startsWith("curriculum-"),
          }))
        );
      } else {
        // Select node and highlight connections
        setSelectedNode(node.id);

        // Find connected nodes
        const connectedNodeIds = new Set([node.id]);
        const connectedEdgeIds = new Set();

        // Find all edges connected to this node
        initialEdges.forEach((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            connectedNodeIds.add(edge.source);
            connectedNodeIds.add(edge.target);
            connectedEdgeIds.add(edge.id);
          }
        });

        // Update nodes opacity
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            style: {
              ...n.style,
              opacity: connectedNodeIds.has(n.id) ? 1 : 0.2,
            },
          }))
        );

        // Update edges
        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            style: {
              ...e.style,
              opacity: connectedEdgeIds.has(e.id) ? 1 : 0.1,
              strokeWidth: connectedEdgeIds.has(e.id) ? 3 : 1.5,
            },
            animated: connectedEdgeIds.has(e.id),
          }))
        );
      }
    },
    [selectedNode, initialEdges, setNodes, setEdges]
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
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
};

export default OutcomesVisualization;
