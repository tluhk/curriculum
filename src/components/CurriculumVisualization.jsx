// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import PropTypes from "prop-types";
import { ReactFlow, Background, Controls } from "@xyflow/react"; // Import necessary components
import SubjectNode from "./SubjectNode"; // Import SubjectNode component
import SubjectInfoModal from "./SubjectInfoModal"; // Import the new modal component

const nodeTypes = {
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
        edges={updatedEdges}
        onNodeClick={onNodeClick} // Add event listener for node click
        nodeTypes={nodeTypes} // Register custom node types
        style={{ width: "100%", height: "100%" }}
      >
        <Background />
        <Controls />
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
