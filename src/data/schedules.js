// ÕIS schedule exports per curriculum version (convert new ones with scripts/ois-schedule-to-json.js). A year without an entry shows an empty Ajakava tab.
import schedule2025 from "./schedule-2025.json";
import schedule2026 from "./schedule-2026.json";

const schedules = { 2025: schedule2025, 2026: schedule2026 };

export default schedules;
