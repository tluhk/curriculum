// Undo / redo for one curriculum version. Values are whole (immutable) curriculum objects, so snapshots share structure and stay cheap.
export const emptyHistory = () => ({ past: [], future: [] });

// Remember `previous` before a change; a new change clears the redo stack
export const record = (history, previous, limit = 100) => ({ past: [...history.past.slice(-(limit - 1)), previous], future: [] });

// Each returns { value, history } to apply, or null when there is nothing to do. `current` is the value being replaced.
export const undo = (history, current) =>
  history.past.length ? { value: history.past[history.past.length - 1], history: { past: history.past.slice(0, -1), future: [...history.future, current] } } : null;
export const redo = (history, current) =>
  history.future.length ? { value: history.future[history.future.length - 1], history: { past: [...history.past, current], future: history.future.slice(0, -1) } } : null;
