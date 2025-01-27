// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import { Handle } from "@xyflow/react";
import { FaInfoCircle } from "react-icons/fa"; // Import the info icon

const SubjectNode = ({ data }) => {
  const onSubjecInfoClick = () => {
    console.log(`Subject ID: ${data.id}`);
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
        color: "black", // Set text color to black
        whiteSpace: "pre-line", // Preserve line breaks
        textAlign: "center", // Center
        fontSize: "12px",
        position: "relative", // Add relative positioning
      }}
    >
      <div>{data.label}</div>
      <FaInfoCircle
        style={{
          position: "absolute",
          bottom: 5,
          right: 5,
          cursor: "pointer",
          fontSize: 16,
          color: "#005555",
        }}
        onClick={onSubjecInfoClick}
      />
      <Handle type="target" position="top" />
      <Handle type="source" position="bottom" />
    </div>
  );
};

SubjectNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    nodeHeight: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
  }).isRequired,
};

export default SubjectNode;
