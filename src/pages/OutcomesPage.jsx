import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import OutcomesVisualization from "../components/OutcomesVisualization";
import curriculum from "../data/curriculum";
import { buildOutcomesGraph } from "../utils/outcomesUtils";
import { moduleConfig, parseYear, YEARS } from "../constants";
import "@xyflow/react/dist/style.css";

const OutcomesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const year = parseYear(searchParams.get("year"));
  const curriculumData = curriculum.find((item) => item.version === year) || curriculum[0];

  const { allNodes, allEdges, relationships } = useMemo(
    () => buildOutcomesGraph(curriculumData, moduleConfig),
    [curriculumData]
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "15px 20px",
          background: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>
            {curriculumData.name} ({curriculumData.version})
          </h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
            Õpiväljundite visualiseering
          </p>
        </div>
        <label style={{ marginLeft: "auto", marginRight: "16px", fontSize: "14px" }}>
          Õppeaasta
          <select
            aria-label="Vali õppeaasta"
            value={year}
            onChange={(event) => setSearchParams({ year: event.target.value })}
            style={{ marginLeft: "8px", padding: "7px" }}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <Link
          to={`/?year=${year}`}
          style={{
            padding: "8px 16px",
            background: "#4A90E2",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          ← Tagasi ainete juurde
        </Link>
      </div>

      <div
        style={{
          padding: "10px 20px",
          background: "#fff",
          borderBottom: "1px solid #ddd",
          fontSize: "13px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Kuidas kasutada:</strong>
          </div>
          <div>
            1️⃣ Klõpsa õppekava õpiväljundil → näed seotud mooduli õpiväljundeid
          </div>
          <div>
            2️⃣ Klõpsa mooduli õpiväljundil → näed seotud ainete õpiväljundeid
          </div>
          <div>3️⃣ Klõpsa uuesti sama sõlme peal → peidab alamsõlmed</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <OutcomesVisualization
          key={year}
          allNodes={allNodes}
          allEdges={allEdges}
          relationships={relationships}
        />
      </div>

      <div
        style={{
          padding: "10px 20px",
          background: "#f5f5f5",
          borderTop: "1px solid #ddd",
          fontSize: "12px",
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {Object.entries(moduleConfig).map(([id, { name, color }]) => (
          <div
            key={id}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                background: color,
                borderRadius: "3px",
                border: "1px solid #999",
              }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutcomesPage;
