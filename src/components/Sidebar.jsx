// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

const Sidebar = ({
  moduleColors,
  activeModules,
  showRequiredOnly,
  setShowRequiredOnly,
  handleModuleFilter,
  handleCheckAll,
  moduleECTS,
  semesterECTS,
  totalECTS,
}) => {
  return (
    <div
      style={{
        width: "300px",
        height: "100vh",
        backgroundColor: "#f4f4f4",
        padding: "20px",
        boxSizing: "border-box",
        borderRight: "1px solid #ddd",
        overflowY: "auto",
        transition: "width 0.3s",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#333",
          fontSize: "20px",
        }}
      >
        Rakendusinformaatika õppekava 2025
      </h2>

      {/* "Check All" Button */}
      <button
        onClick={handleCheckAll}
        style={{
          padding: "8px 18px",
          marginBottom: "20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
          width: "100%",
        }}
      >
        Vali kõik moodulid
      </button>

      {/* Filter checkboxes */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {[
          "Üleülikoolilised ained",
          "Eriala kohustuslikud ained",
          "Eriala valikained",
          "Praktika",
          "Erialane inglise keel",
          "Lõputöö",
        ].map((module) => (
          <label
            key={module}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "normal", // Thinner text
              fontSize: "14px", // Adjust font size for readability
              color: moduleColors[module] || "#cccccc",
            }}
          >
            <input
              type="checkbox"
              checked={activeModules[module] || false}
              onChange={() => handleModuleFilter(module)}
              style={{
                accentColor: moduleColors[module] || "#cccccc",
                transform: "scale(1.2)",
                border: `2px solid ${moduleColors[module] || "#cccccc"}`, // Unchecked box in same color as text
                borderRadius: "4px",
                width: "20px",
                height: "20px",
              }}
            />
            {module}
          </label>
        ))}
      </div>

      {/* Show Required Only Checkbox */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: "normal",
          fontSize: "14px",
          color: "#333",
          marginTop: "14px",
        }}
      >
        <input
          type="checkbox"
          checked={showRequiredOnly}
          onChange={() => setShowRequiredOnly(!showRequiredOnly)}
          style={{
            transform: "scale(1.2)",
            border: "2px solid #cccccc",
            borderRadius: "4px",
            width: "20px",
            height: "20px",
          }}
        />
        Näita ainult kohustuslikke aineid
      </label>

      {/* ECTS by Module Table */}
      <div
        style={{
          marginTop: "20px",
          fontSize: "14px",
          color: "#333",
        }}
      >
        <h3>ECTS by Module</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Module</th>
              <th style={{ textAlign: "left" }}>ECTS</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(moduleECTS).map((module) => (
              <tr key={module}>
                <td>{module}</td>
                <td>{moduleECTS[module]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ECTS by Semester Table */}
      <div
        style={{
          marginTop: "20px",
          fontSize: "14px",
          color: "#333",
        }}
      >
        <h3>ECTS by Semester</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Semester</th>
              <th style={{ textAlign: "left" }}>ECTS</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(semesterECTS).map((semester) => (
              <tr key={semester}>
                <td>Semester {semester}</td>
                <td>{semesterECTS[semester]}</td>
              </tr>
            ))}
            <tr>
              <td>
                <strong>Total</strong>
              </td>
              <td>
                <strong>{totalECTS}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
Sidebar.propTypes = {
  moduleColors: PropTypes.object.isRequired,
  activeModules: PropTypes.object.isRequired,
  showRequiredOnly: PropTypes.bool.isRequired,
  setShowRequiredOnly: PropTypes.func.isRequired,
  handleModuleFilter: PropTypes.func.isRequired,
  handleCheckAll: PropTypes.func.isRequired,
  moduleECTS: PropTypes.object.isRequired,
  semesterECTS: PropTypes.object.isRequired,
  totalECTS: PropTypes.number.isRequired,
};

export default Sidebar;
