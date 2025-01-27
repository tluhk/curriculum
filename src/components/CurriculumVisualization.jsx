// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import { ReactFlow, Background, Controls } from "@xyflow/react"; // Import necessary components

const CurriculumVisualization = ({
  updatedNodes,
  updatedEdges,
  onNodeClick,
  onNodeMouseEnter,
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
        onNodeMouseEnter={onNodeMouseEnter} // Log node ID on mouse enter
        style={{ width: "100%", height: "100%" }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

CurriculumVisualization.propTypes = {
  updatedNodes: PropTypes.array.isRequired,
  updatedEdges: PropTypes.array.isRequired,
  onNodeClick: PropTypes.func.isRequired,
  onNodeMouseEnter: PropTypes.func.isRequired,
};

export default CurriculumVisualization;
