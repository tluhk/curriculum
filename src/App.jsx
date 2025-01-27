// App.jsx
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import CurriculumVisualization from "./components/CurriculumVisualization";
import curriculum from "./data/curriculum"; // Updated import path
import { transformCurriculum } from "./utils/utils"; // You can extract the transformation logic into a separate utils file
import "@xyflow/react/dist/style.css";
import "./styles.css";

const App = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [highlightedSubjects, setHighlightedSubjects] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  const [activeModules, setActiveModules] = useState({});
  const [showRequiredOnly, setShowRequiredOnly] = useState(false);

  const moduleColors = {
    "Üleülikoolilised ained": "#A3C9E1",
    "Eriala kohustuslikud ained": "#A8D5BA",
    "Eriala valikained": "#D6AEDD",
    Praktika: "#F4A6A0",
    "Erialane inglise keel": "#F4D1C1",
    Lõputöö: "#F4D1A1",
  };

  const { nodes, edges } = transformCurriculum(curriculum, moduleColors);

  const onNodeClick = (event, node) => {
    const selectedNodeId = node.id;

    if (selectedNodeId === selectedSubject) {
      setHighlightedSubjects([]);
      setHighlightedEdges([]);
      setSelectedSubject(null);
    } else {
      const connectedNodes = edges
        .filter(
          (edge) =>
            edge.source === selectedNodeId || edge.target === selectedNodeId
        )
        .map((edge) =>
          edge.source === selectedNodeId ? edge.target : edge.source
        );

      const connectedEdges = edges.filter(
        (edge) =>
          edge.source === selectedNodeId || edge.target === selectedNodeId
      );

      setSelectedSubject(selectedNodeId);
      setHighlightedSubjects([selectedNodeId, ...connectedNodes]);
      setHighlightedEdges(connectedEdges.map((edge) => edge.id));
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
    if (Object.keys(activeModules).length === 0 && !showRequiredOnly) {
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
        opacity: isConnected || highlightedSubjects.length === 0 ? 1 : 0.1,
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
        strokeWidth: isConnected ? 3 : 1,
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
