// CurriculumVisualization.jsx
import React from "react";
import { ReactFlow } from "@xyflow/react";
import { Controls } from "@xyflow/react";

const CurriculumVisualization = ({
  updatedNodes,
  updatedEdges,
  onNodeClick,
}) => {
  return (
    <div
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ReactFlow
        onInit={(instance) => {
          setTimeout(() => {
            instance.fitView({
              maxZoom: 1,
            });
          }, 0);
        }}
        nodes={updatedNodes}
        edges={updatedEdges}
        onNodeClick={onNodeClick} // Add event listener for node click
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default CurriculumVisualization;
