// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import CurriculumVisualization from "./components/CurriculumVisualization";
import curriculum from "./data/curriculum"; // Updated import path
import { transformCurriculum } from "./utils/utils"; // You can extract the transformation logic into a separate utils file
import "@xyflow/react/dist/style.css";
import "./styles.css";
import { FaBars } from "react-icons/fa"; // Import icon

const App = () => {
  // Initialize activeModules with all modules selected
  const initialActiveModules = {
    "Üleülikoolilised ained": true,
    "Eriala kohustuslikud ained": true,
    "Eriala valikained": true,
    Praktika: true,
    "Erialane inglise keel": true,
    Lõputöö: true,
  };

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [highlightedSubjects, setHighlightedSubjects] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  const [activeModules, setActiveModules] = useState(initialActiveModules); // Use initialActiveModules
  const [showRequiredOnly, setShowRequiredOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New state

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const moduleColors = {
    "Üleülikoolilised ained": "#A3C9E1",
    "Eriala kohustuslikud ained": "#A8D5BA",
    "Eriala valikained": "#D6AEDD",
    Praktika: "#F4A6A0",
    "Erialane inglise keel": "#F4D1C1",
    Lõputöö: "#F4D1A1",
  };

  const { nodes, edges } = transformCurriculum(curriculum, moduleColors);

  const findAllPrerequisites = (subjectId, edges) => {
    const prerequisites = edges
      .filter((edge) => edge.target === subjectId)
      .map((edge) => edge.source);

    return prerequisites.reduce(
      (acc, prerequisite) => [
        ...acc,
        prerequisite,
        ...findAllPrerequisites(prerequisite, edges),
      ],
      []
    );
  };

  const findAllUpstreamEdges = (subjectId, edges) => {
    const upstreamEdges = edges.filter((edge) => edge.target === subjectId);

    return upstreamEdges.reduce(
      (acc, edge) => [
        ...acc,
        edge,
        ...findAllUpstreamEdges(edge.source, edges),
      ],
      []
    );
  };

  const onNodeClick = (event, node) => {
    const selectedNodeId = node.id;

    if (selectedNodeId === selectedSubject) {
      setHighlightedSubjects([]);
      setHighlightedEdges([]);
      setSelectedSubject(null);
    } else {
      const allPrerequisites = findAllPrerequisites(selectedNodeId, edges);
      const allUpstreamEdges = findAllUpstreamEdges(selectedNodeId, edges);

      setSelectedSubject(selectedNodeId);
      setHighlightedSubjects([selectedNodeId, ...allPrerequisites]);
      setHighlightedEdges(allUpstreamEdges.map((edge) => edge.id));
    }
  };

  const handleModuleFilter = (module) => {
    setActiveModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const handleCheckAll = () => {
    const newActiveModules = {};
    Object.keys(moduleColors).forEach((module) => {
      newActiveModules[module] = true;
    });
    setActiveModules(newActiveModules);
  };

  const filteredNodes = nodes.filter((node) => {
    // Always include semester nodes
    if (node.type === "semesterNode") {
      return true;
    }

    if (showRequiredOnly && !node.required) {
      return false;
    }

    return activeModules[node.module];
  });

  const updatedNodes = filteredNodes.map((node) => {
    const isConnected = highlightedSubjects.includes(node.id);
    return {
      ...node,
      style: {
        ...node.style,
        opacity: isConnected || highlightedSubjects.length === 0 ? 1 : 0.2,
        transition: "opacity 0.3s",
      },
    };
  });

  const updatedEdges = edges.map((edge) => {
    const isConnected = highlightedEdges.includes(edge.id);
    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: isConnected ? "#000000" : "#D3D3D3",
        strokeWidth: isConnected ? 2 : 1,
        transition: "stroke 0.3s, stroke-width 0.3s",
      },
    };
  });

  const calculateECTS = (nodes, activeModules) => {
    const moduleECTS = {};
    const semesterECTS = {};

    nodes.forEach((node) => {
      if (activeModules[node.module]) {
        moduleECTS[node.module] = (moduleECTS[node.module] || 0) + node.credits;
        semesterECTS[node.semester] =
          (semesterECTS[node.semester] || 0) + node.credits;
      }
    });

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
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {!isSidebarOpen && ( // Conditionally render the icon based on sidebar state
        <FaBars
          onClick={toggleSidebar}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            fontSize: "24px",
            cursor: "pointer",
            color: "black",
          }}
        />
      )}
      <Sidebar
        moduleColors={moduleColors}
        activeModules={activeModules}
        showRequiredOnly={showRequiredOnly}
        setShowRequiredOnly={setShowRequiredOnly}
        handleModuleFilter={handleModuleFilter}
        handleCheckAll={handleCheckAll}
        moduleECTS={moduleECTS}
        semesterECTS={semesterECTS}
        totalECTS={totalECTS}
        isSidebarOpen={isSidebarOpen} // Pass new prop
        toggleSidebar={toggleSidebar} // Pass new prop
      />
      <CurriculumVisualization
        updatedNodes={updatedNodes}
        updatedEdges={updatedEdges}
        onNodeClick={onNodeClick}
      />
    </div>
  );
};

export default App;
