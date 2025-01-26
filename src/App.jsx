// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactFlow from "react-flow-renderer";
import curriculum from "./data/curriculum"; // Updated import path

// Function to transform curriculum into nodes and edges
const transformCurriculum = (curriculumData) => {
  const semesterSpacing = 100; // Adjust horizontal spacing between semesters
  const nodeSpacing = 200; // Vertical spacing for each node (course)

  // Calculate the x position for each semester (horizontal positioning)
  const nodes = curriculumData.map((course) => ({
    id: `subject-${course.id}`,
    data: { label: course.name },
    position: {
      x: course.order * nodeSpacing, // Space courses vertically within a semester
      y: (course.semester - 1) * semesterSpacing, // Space semesters horizontally
    },
    style: { backgroundColor: "#FFF", padding: 10, border: "1px solid #ddd" },
  }));

  // Edges: Create connections based on prerequisites
  const edges = curriculumData.flatMap((course) =>
    course.prerequisites.map((prerequisiteId) => ({
      id: `edge-${prerequisiteId}-${course.id}`,
      source: `subject-${prerequisiteId}`,
      target: `subject-${course.id}`,
      animated: true,
      style: { stroke: "#000" },
    }))
  );

  return { nodes, edges };
};

const App = () => {
  const { nodes, edges } = transformCurriculum(curriculum);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default App;
