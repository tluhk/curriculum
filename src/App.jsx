import React, { useState } from "react";
import ReactFlow, { Controls, ReactFlowProvider } from "react-flow-renderer";
import curriculum from "./data/curriculum"; // Updated import path
import "./styles.css";

// Function to transform curriculum into nodes and edges
const transformCurriculum = (curriculumData) => {
  const semesterSpacing = 200; // Adjust horizontal spacing between semesters
  const baseNodeHeight = 10; // Base height for each node
  const creditMultiplier = 15; // How much each credit adds to node height

  const moduleColors = {
    "Üleülikoolilised ained": "#A3C9E1", // Light Blue
    "Eriala kohustuslikud ained": "#A8D5BA", // Light Green
    "Eriala valikained": "#D6AEDD", // Soft Purple
    Praktika: "#F4A6A0", // Light Coral
    "Erialane inglise keel": "#F4D1C1", // Soft Peach
  };

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

  const { nodes, edges } = transformCurriculum(curriculum);

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

  // Apply styles to nodes based on whether they are connected to the selected subject
  const updatedNodes = nodes.map((node) => {
    const isConnected = highlightedSubjects.includes(node.id);
    return {
      ...node,
      style: {
        ...node.style,
        opacity: isConnected || highlightedSubjects.length === 0 ? 1 : 0.3, // Faded opacity for non-connected nodes unless all are visible
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

  return (
    <ReactFlowProvider>
      <div
        style={{ height: "100vh", width: "100vw", backgroundColor: "white" }}
      >
        <ReactFlow
          nodes={updatedNodes}
          edges={updatedEdges}
          onNodeClick={onNodeClick} // Add event listener for node click
          style={{ width: "100%", height: "100%" }}
        />
        <Controls />
      </div>
    </ReactFlowProvider>
  );
};

export default App;
