import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CurriculumVisualization from "./components/CurriculumVisualization";
import curriculum from "./data/curriculum";
import {
  transformCurriculum,
  findAllPrerequisites,
  findAllUpstreamEdges,
  calculateECTS,
} from "./utils/utils";
import { moduleConfig, moduleColors, parseYear } from "./constants";
import "@xyflow/react/dist/style.css";
import "./styles.css";
import { FaBars } from "react-icons/fa";

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const year = parseYear(searchParams.get("year"));
  const curriculumData = curriculum.find((item) => item.version === year) || curriculum[0];

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [highlightedSubjects, setHighlightedSubjects] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  // Modules the user switched off; everything else is active
  const [disabledModules, setDisabledModules] = useState({});
  const [showRequiredOnly, setShowRequiredOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeModules = useMemo(() => {
    const active = {};
    curriculumData.modules.forEach((module) => {
      active[module.id] = !disabledModules[module.id];
    });
    return active;
  }, [curriculumData, disabledModules]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleYearChange = (nextYear) => {
    setSearchParams({ year: nextYear });
    setSelectedSubject(null);
    setHighlightedSubjects([]);
    setHighlightedEdges([]);
  };

  const { nodes, edges } = useMemo(
    () => transformCurriculum(curriculumData.subjects, moduleColors, moduleConfig),
    [curriculumData]
  );

  const onNodeClick = (event, node) => {
    // If node is null or node.id is null, clear selection
    if (!node || !node.id || node.id === selectedSubject) {
      setHighlightedSubjects([]);
      setHighlightedEdges([]);
      setSelectedSubject(null);
      return;
    }

    const selectedNodeId = node.id;
    const allPrerequisites = findAllPrerequisites(selectedNodeId, edges);
    const allUpstreamEdges = findAllUpstreamEdges(selectedNodeId, edges);

    setSelectedSubject(selectedNodeId);
    setHighlightedSubjects([selectedNodeId, ...allPrerequisites]);
    setHighlightedEdges(allUpstreamEdges.map((edge) => edge.id));
  };

  const handleModuleFilter = (module) => {
    setDisabledModules((prev) => ({ ...prev, [module]: !prev[module] }));
  };

  const handleCheckAll = () => {
    setDisabledModules({});
  };

  const updatedNodes = useMemo(() => {
    const highlighted = new Set(highlightedSubjects);
    return nodes
      .filter((node) => {
        // Always include semester nodes
        if (node.type === "semesterNode") return true;
        if (showRequiredOnly && !node.required) return false;
        return activeModules[node.module];
      })
      .map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: highlighted.has(node.id) || highlighted.size === 0 ? 1 : 0.2,
          transition: "opacity 0.3s",
        },
      }));
  }, [nodes, highlightedSubjects, showRequiredOnly, activeModules]);

  const updatedEdges = useMemo(() => {
    const highlighted = new Set(highlightedEdges);
    return edges.map((edge) => {
      const isConnected = highlighted.has(edge.id);
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
  }, [edges, highlightedEdges]);

  const { moduleECTS, semesterECTS, totalECTS } = calculateECTS(
    updatedNodes,
    activeModules
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Ava külgpaneel"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            fontSize: "24px",
            cursor: "pointer",
            color: "black",
            background: "none",
            border: "none",
            padding: 0,
            lineHeight: 0,
          }}
        >
          <FaBars />
        </button>
      )}
      <Link
        to={`/outcomes?year=${year}`}
        style={{
          position: "absolute",
          top: "10px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 20px",
          background: "#4A90E2",
          color: "white",
          textDecoration: "none",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        📊 Õpiväljundid
      </Link>
      <Sidebar
        year={year}
        onYearChange={handleYearChange}
        moduleConfig={moduleConfig}
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
