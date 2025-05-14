// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import PropTypes from "prop-types";
import { ReactFlow, Background, Controls } from "@xyflow/react"; // Import necessary components
import SubjectNode from "./SubjectNode"; // Import SubjectNode component
import SubjectInfoModal from "./SubjectInfoModal"; // Import the new modal component
import SemesterNode from "./SemesterNode"; // Import SemesterNode component

const nodeTypes = {
  semesterNode: (props) => <SemesterNode {...props} />,
  subjectNode: (props) => <SubjectNode {...props} />,
};

const CurriculumVisualization = ({
  updatedNodes,
  updatedEdges,
  onNodeClick,
}) => {
  const [modalData, setModalData] = useState(null);

  const openModal = (data) => {
    setModalData(data);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleNodeClick = (event, node) => {
    if (node.type === "semesterNode") {
      return; // Do nothing if a semester node is clicked
    }
    onNodeClick(event, node);
  };

  // Add handler to clear selection when clicking on pane background
  const handlePaneClick = () => {
    onNodeClick(null, { id: null });
  };

  return (
    <div
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative", // Make container position relative
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
        nodes={updatedNodes.map((node) => ({
          ...node,
          data: { ...node.data, openModal },
        }))}
        edges={updatedEdges.map((edge) => ({
          ...edge,
          style: { ...edge.style, zIndex: 5 },
        }))}
        onNodeClick={handleNodeClick} // Use custom handleNodeClick function
        onPaneClick={handlePaneClick} // <-- Add this line
        nodeTypes={nodeTypes} // Register custom node types
        style={{ width: "100%", height: "100%" }}
      >
        <Background />
        <Controls style={{ color: "black" }} />{" "}
        {/* Change text color to black */}
      </ReactFlow>
      {modalData && (
        <SubjectInfoModal data={modalData} closeModal={closeModal} />
      )}
    </div>
  );
};

CurriculumVisualization.propTypes = {
  updatedNodes: PropTypes.array.isRequired,
  updatedEdges: PropTypes.array.isRequired,
  onNodeClick: PropTypes.func.isRequired,
};

export default CurriculumVisualization;
