// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

const SemesterNode = ({ data }) => {
  return (
    <div
      style={{
        position: "relative",
        zIndex: -1000, // Lower zIndex to be behind edges
        width: data.width,
        height: data.height,
        backgroundColor: "#f0f0f0",
        border: "1px solid gray", // Valid border color
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.7,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "#A8D5BA",
          color: "black",
          borderRadius: "50%",
          width: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        {data.semester}
      </div>
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 10,
          backgroundColor: "#A8D5BA",
          color: "black",
          borderRadius: "5px",
          padding: "2px 5px",
          fontSize: "12px",
        }}
      >
        {data.credits} EAP
      </div>
    </div>
  );
};

SemesterNode.propTypes = {
  data: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    semester: PropTypes.number.isRequired,
    credits: PropTypes.number.isRequired,
  }).isRequired,
};

export default SemesterNode;
