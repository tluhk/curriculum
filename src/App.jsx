import React, { useState } from "react";
import ReactFlow, { Controls, ReactFlowProvider } from "react-flow-renderer";
import curriculum from "./data/curriculum"; // Updated import path
import "./styles.css";

// Function to transform curriculum into nodes and edges
const transformCurriculum = (curriculumData, moduleColors) => {
  const semesterSpacing = 200; // Adjust horizontal spacing between semesters
  const baseNodeHeight = 10; // Base height for each node
  const creditMultiplier = 15; // How much each credit adds to node height

  // Calculate the x position for each semester (horizontal positioning)
  const nodes = curriculumData.map((course) => {
    const nodeHeight = baseNodeHeight + course.credits * creditMultiplier; // Calculate height based on credits
    const moduleColor = moduleColors[course.module] || "#cccccc"; // Default color if module not found
    const label = `${course.name}`;
    return {
      id: `subject-${course.id}`,
      data: { label },
      position: {
        y: (course.semester - 1) * semesterSpacing, // Space semesters horizontally
        x: (course.order - 1) * 200, // Space courses vertically within a semester
      },
      module: course.module, // Store module for filtering purposes
      semester: course.semester, // Store semester for filtering purposes
      credits: course.credits, // Store credits for calculation
      required: course.required, // Store if the subject is required
      style: {
        backgroundColor: moduleColor,
        padding: 10,
        border: "1px solid #ddd",
        height: nodeHeight, // Adjust height based on credits
        opacity: 1, // Set initial opacity to 1 (fully visible)
      },
    };
  });

  // Edges: Create connections based on prerequisites
  const edges = curriculumData.flatMap((course) =>
    course.prerequisites.map((prerequisiteId) => ({
      id: `edge-${prerequisiteId}-${course.id}`,
      source: `subject-${prerequisiteId}`,
      target: `subject-${course.id}`,
      animated: false,
      markerEnd: { type: "arrow", color: "#000" },
      style: { stroke: "#D3D3D3", strokeWidth: 1 }, // Default light grey color for edges, thin
    }))
  );

  return { nodes, edges };
};

const App = () => {
  const [selectedSubject, setSelectedSubject] = useState(null); // Track selected subject
  const [highlightedSubjects, setHighlightedSubjects] = useState([]); // Track highlighted (connected) subjects
  const [highlightedEdges, setHighlightedEdges] = useState([]); // Track highlighted (connected) edges
  const [activeModules, setActiveModules] = useState({}); // Track selected modules for filtering
  const [showRequiredOnly, setShowRequiredOnly] = useState(false); // Track "Required Subjects" checkbox state

  const moduleColors = {
    "Üleülikoolilised ained": "#A3C9E1", // Light Blue
    "Eriala kohustuslikud ained": "#A8D5BA", // Light Green
    "Eriala valikained": "#D6AEDD", // Soft Purple
    Praktika: "#F4A6A0", // Light Coral
    "Erialane inglise keel": "#F4D1C1", // Soft Peach
    Lõputöö: "#F4D1A1", // Soft Yellow
  };

  const { nodes, edges } = transformCurriculum(curriculum, moduleColors);

  // Handle node click event
  const onNodeClick = (event, node) => {
    const selectedNodeId = node.id;

    // Check if the clicked node is the same as the previously selected one
    if (selectedNodeId === selectedSubject) {
      // Reset all nodes and edges to visible if the same node is clicked again
      setHighlightedSubjects([]); // Reset highlighted subjects to empty (all visible)
      setHighlightedEdges([]); // Reset highlighted edges to empty (all visible)
      setSelectedSubject(null); // Clear the selected subject
    } else {
      // Get connected nodes (those with edges from or to the selected node)
      const connectedNodes = edges
        .filter(
          (edge) =>
            edge.source === selectedNodeId || edge.target === selectedNodeId
        )
        .map((edge) =>
          edge.source === selectedNodeId ? edge.target : edge.source
        );

      // Get connected edges (those with source or target as the selected node)
      const connectedEdges = edges.filter(
        (edge) =>
          edge.source === selectedNodeId || edge.target === selectedNodeId
      );

      // Set the selected subject, highlighted connected subjects, and edges
      setSelectedSubject(selectedNodeId);
      setHighlightedSubjects([selectedNodeId, ...connectedNodes]); // Update the highlighted subjects
      setHighlightedEdges(connectedEdges.map((edge) => edge.id)); // Store edge IDs in highlightedEdges state
    }
  };

  // Filter nodes based on the active modules and required subjects
  const filteredNodes = nodes.filter((node) => {
    if (Object.keys(activeModules).length === 0 && !showRequiredOnly) {
      return true; // Show all nodes if no filter is applied
    }
    if (showRequiredOnly && !node.required) {
      return false; // Only show required subjects if showRequiredOnly is true
    }
    return activeModules[node.module]; // Only show nodes where module is selected
  });

  // Apply styles to nodes based on whether they are connected to the selected subject
  const updatedNodes = filteredNodes.map((node) => {
    const isConnected = highlightedSubjects.includes(node.id);
    return {
      ...node,
      style: {
        ...node.style,
        opacity: isConnected || highlightedSubjects.length === 0 ? 1 : 0.1, // Faded opacity for non-connected nodes unless all are visible
        transition: "opacity 0.3s", // Smooth transition
      },
    };
  });

  // Apply styles to edges based on whether they are connected to the selected subject
  const updatedEdges = edges.map((edge) => {
    const isConnected = highlightedEdges.includes(edge.id); // Compare edge ID instead of edge object
    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: isConnected ? "#000000" : "#D3D3D3", // Black for selected edges, light grey for others
        strokeWidth: isConnected ? 3 : 1, // Thicker stroke for selected edges
        transition: "stroke 0.3s, stroke-width 0.3s", // Smooth transition for stroke color and width
      },
    };
  });

  // Function to handle module filter checkbox change
  const handleModuleFilter = (module) => {
    setActiveModules((prev) => ({
      ...prev,
      [module]: !prev[module], // Toggle the active state of the module
    }));
  };

  // Function to handle the "Check All" button click
  const handleCheckAll = () => {
    const newActiveModules = {};
    Object.keys(moduleColors).forEach((module) => {
      newActiveModules[module] = true; // Set all modules to true
    });
    setActiveModules(newActiveModules); // Set all modules as selected
  };

  // Calculate total ECTS per module and semester
  const calculateECTS = (nodes, activeModules) => {
    const moduleECTS = {};
    const semesterECTS = {};

    nodes.forEach((node) => {
      if (activeModules[node.module]) {
        // Add the node's ECTS credits to its module's total
        moduleECTS[node.module] = (moduleECTS[node.module] || 0) + node.credits;

        // Add the node's ECTS credits to its semester's total
        semesterECTS[node.semester] =
          (semesterECTS[node.semester] || 0) + node.credits;
      }
    });

    // Calculate total ECTS for all semesters combined
    const totalECTS = Object.values(semesterECTS).reduce(
      (total, current) => total + current,
      0
    );

    return { moduleECTS, semesterECTS, totalECTS };
  };

  const { moduleECTS, semesterECTS, totalECTS } = calculateECTS(
    updatedNodes,
    activeModules
  );

  return (
    <ReactFlowProvider>
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          backgroundColor: "white",
        }}
      >
        {/* Sidebar */}
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
            Show Required Subjects Only
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

        {/* Main Content */}
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
          <Controls />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default App;
