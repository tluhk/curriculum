// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import { Handle } from "@xyflow/react";
import { FaInfoCircle } from "react-icons/fa"; // Import the info icon

const SubjectNode = ({ data }) => {
  const onSubjecInfoClick = (event) => {
    event.stopPropagation(); // Prevent the node click behavior
    // Pass the entire 'data' object to openModal
    data.openModal(data);
  };

  return (
    <div
      style={{
        borderRadius: 5,
        backgroundColor: data.backgroundColor,
        padding: 10,
        border: "1px solid #ddd",
        height: data.nodeHeight,
        width: 150,
        opacity: 1,
        color: "black",
        whiteSpace: "pre-line",
        textAlign: "center",
        fontSize: "12px",
        position: "relative",
        zIndex: 10, // Higher zIndex to be above edges
      }}
    >
      <div>{data.label}</div>
      <FaInfoCircle
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          cursor: "pointer",
          fontSize: 16,
          color: "#005555",
        }}
        onClick={onSubjecInfoClick}
      />
      {data.prerequisites.length > 0 && <Handle type="target" position="top" />}
      {data.dependents.length > 0 && <Handle type="source" position="bottom" />}
    </div>
  );
};

SubjectNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    nodeHeight: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    openModal: PropTypes.func.isRequired,
    prerequisites: PropTypes.array.isRequired,
    dependents: PropTypes.array.isRequired,
  }).isRequired,
};

export default SubjectNode;
