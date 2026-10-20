// ÕIS schedule exports per curriculum code and version (convert new ones with scripts/ois-schedule-to-json.js).
// A curriculum year without an entry shows an empty Ajakava tab.
import rif2025 from "./schedules/RIF-2025.json";
import rif2026 from "./schedules/RIF-2026.json";

const schedules = {
  RIF: { 2025: rif2025, 2026: rif2026 },
};

export default schedules;
