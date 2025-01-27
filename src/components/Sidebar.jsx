// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import "./Sidebar.css"; // Import custom CSS

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
  isSidebarOpen, // New prop
  toggleSidebar, // New prop
}) => {
  return (
    <div
      style={{
        width: isSidebarOpen ? "300px" : "0", // Adjust width based on isSidebarOpen
        height: "100vh",
        backgroundColor: "#f4f4f4",
        padding: isSidebarOpen ? "20px" : "0", // Adjust padding based on isSidebarOpen
        boxSizing: "border-box",
        borderRight: isSidebarOpen ? "1px solid #ddd" : "none", // Adjust border based on isSidebarOpen
        overflowY: "auto",
        transition: "width 0.3s, padding 0.3s, border 0.3s", // Add transition for smooth toggle
        position: "relative", // Add position relative for the close button
      }}
    >
      {isSidebarOpen && ( // Conditionally render content based on isSidebarOpen
        <>
          <span
            onClick={toggleSidebar} // Toggle sidebar on click
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            &times;
          </span>
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
              color: "black",
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
                className="custom-checkbox"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "normal",
                  fontSize: "14px",
                  color: "#000", // Set text color to black
                }}
              >
                <input
                  type="checkbox"
                  checked={activeModules[module] || false}
                  onChange={() => handleModuleFilter(module)}
                  style={{
                    accentColor: moduleColors[module] || "#cccccc",
                    transform: "scale(1.2)",
                    border: `2px solid ${moduleColors[module] || "#cccccc"}`,
                    borderRadius: "4px",
                    width: "20px",
                    height: "20px",
                  }}
                />
                <span
                  className="checkmark"
                  style={{
                    borderColor: moduleColors[module] || "#cccccc",
                    backgroundColor: activeModules[module]
                      ? moduleColors[module]
                      : moduleColors[module] || "#cccccc", // Change unchecked color to module color
                  }}
                ></span>
                {module}
              </label>
            ))}
          </div>
          {/* Show Required Only Checkbox */}
          <label
            className="custom-checkbox"
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
            <span className="checkmark"></span>
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Moodul</th>
                  <th style={{ textAlign: "left" }}>EAP</th>
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
                  <th style={{ textAlign: "left" }}>EAP</th>
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
        </>
      )}
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
  isSidebarOpen: PropTypes.bool.isRequired, // New prop type
  toggleSidebar: PropTypes.func.isRequired, // New prop type
};

export default Sidebar;
