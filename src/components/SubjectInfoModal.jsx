// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

const SubjectInfoModal = ({ data, closeModal }) => {
  const { course } = data;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999, // Higher than other elements
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "black",
      }}
      onClick={closeModal}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 20,
          borderRadius: 5,
          width: "80%",
          maxWidth: 700, // Increase modal max width
          maxHeight: "80vh", // Limit vertical size
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#000",
          }}
        >
          &times;
        </button>
        <h2 style={{ marginBottom: 10 }}>{course.name}</h2>
        <p>
          <strong>
            <a href={course.url} target="_blank" rel="noopener noreferrer">
              Ainekaart
            </a>
          </strong>
        </p>
        <p>
          <strong>Moodul:</strong> {course.module}
        </p>
        <p>
          <strong>Maht:</strong> {course.credits} EAP
        </p>
        <p>
          <strong>Hindamisvorm:</strong> {course.assessment}
        </p>
        <p>
          <strong>Eesmärk:</strong> {course.objective}
        </p>
        <p style={{ whiteSpace: "pre-line" }}>
          <strong>Sisu:</strong> {course.content}
        </p>
        <p>
          <strong>Õpiväljundid:</strong>
        </p>
        <ul>
          {course.outcomes.map((outcome, index) => (
            <li key={index}>{outcome}</li>
          ))}
        </ul>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={closeModal}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Sulge
          </button>
        </div>
      </div>
    </div>
  );
};

SubjectInfoModal.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    course: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      module: PropTypes.string.isRequired,
      credits: PropTypes.number.isRequired,
      url: PropTypes.string.isRequired,
      assessment: PropTypes.string.isRequired,
      objective: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      outcomes: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default SubjectInfoModal;
