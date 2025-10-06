import { Link } from "react-router-dom";
import OutcomesVisualization from "../components/OutcomesVisualization";
import curriculum from "../data/curriculum";
import { transformOutcomesData } from "../utils/outcomesUtils";
import "@xyflow/react/dist/style.css";

const OutcomesPage = () => {
  const curriculumData = curriculum[0];

  const moduleConfig = {
    1: { name: "Praktika", color: "#F4A6A0" },
    2: { name: "Üleülikoolilised ained", color: "#A3C9E1" },
    3: { name: "Eriala kohustuslikud ained", color: "#A8D5BA" },
    4: { name: "Eriala valikained", color: "#D6AEDD" },
    5: { name: "Vabaained", color: "#F4D1A1" },
    6: { name: "Erialane inglise keel", color: "#F4D1C1" },
    7: { name: "Lõputöö", color: "#FFE5B4" },
  };

  const { nodes, edges } = transformOutcomesData(curriculumData, moduleConfig);

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
        <Link
          to="/"
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
        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          <div>
            <strong>Ülemine rida:</strong> Õppekava õpiväljundid (8)
          </div>
          <div>
            <strong>Keskmine rida:</strong> Mooduli õpiväljundid (värviliselt)
          </div>
          <div>
            <strong>Alumine rida:</strong> Aine õpiväljundid
          </div>
          <div style={{ marginLeft: "auto", color: "#666" }}>
            💡 Klõpsa sõlmel seose esiletõstmiseks
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <OutcomesVisualization nodes={nodes} edges={edges} />
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
