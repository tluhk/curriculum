# Data Structure Migration Notes

## Summary

The curriculum application has been successfully updated to use the new data structure where:

- **Module references in subjects** are now **numeric IDs** instead of string names
- Module information (names, colors) is now centrally managed through a `moduleConfig` object
- The application properly maps module IDs to their display names throughout the UI

## Changes Made

### 1. App.jsx

**Before:** Used hardcoded module string names as keys
**After:** Uses numeric module IDs with a `moduleConfig` mapping object

Key changes:

- Created `moduleConfig` object that maps module IDs to `{ name, color }` objects
- Updated `initialActiveModules` to use module IDs from curriculum data
- Modified `handleCheckAll()` to iterate over curriculum modules by ID
- Updated `transformCurriculum()` call to pass `moduleConfig` as third parameter
- Changed Sidebar prop from `moduleColors` to `moduleConfig`

Module configuration:

```javascript
const moduleConfig = {
  1: { name: "Praktika", color: "#F4A6A0" },
  2: { name: "Üleülikoolilised ained", color: "#A3C9E1" },
  3: { name: "Eriala kohustuslikud ained", color: "#A8D5BA" },
  4: { name: "Eriala valikained", color: "#D6AEDD" },
  5: { name: "Vabaained", color: "#F4D1A1" },
  6: { name: "Erialane inglise keel", color: "#F4D1C1" },
  7: { name: "Lõputöö", color: "#FFE5B4" },
};
```

### 2. utils.js (transformCurriculum function)

**Before:** Only received `curriculumData` and `moduleColors`
**After:** Now receives `moduleConfig` as third parameter

Key changes:

- Added `moduleConfig` parameter to function signature
- Looks up module name using `moduleConfig[course.module]?.name`
- Adds `moduleName` to course data for display purposes
- Converts outcome objects to array of strings: `outcomes.map(o => o.description)`
- Maintains backward compatibility by handling both object and string outcomes

### 3. Sidebar.jsx

**Before:** Used hardcoded array of module string names
**After:** Dynamically generates module list from `moduleConfig`

Key changes:

- Changed prop from `moduleColors` to `moduleConfig`
- Creates sorted `moduleEntries` array from `moduleConfig`
- Iterates over module entries using `[moduleId, config]` destructuring
- Uses `config.name` for display and `config.color` for styling
- Updated module ECTS table to display module names using `moduleConfig[id]?.name`
- Updated PropTypes to accept `moduleConfig` object

### 4. SubjectInfoModal.jsx

**Before:** Displayed `course.module` string directly
**After:** Displays `course.moduleName` (looked up from module ID)

Key changes:

- Updated display to use `{course.moduleName || course.module}` (fallback for safety)
- Updated PropTypes: `module` changed from `string` to `number`
- Added optional `moduleName: PropTypes.string` to PropTypes

## Data Structure Reference

### Module Data in curriculum.js

```javascript
modules: [
  {
    id: 1,  // Numeric ID (used for references)
    name: 'Praktika',  // Display name
    objective: '...',
    learningOucomes: [...]  // Note: typo in key name, kept for compatibility
  },
  // ...
]
```

### Subject Data in curriculum.js

```javascript
subjects: [
  {
    id: 1,
    module: 2, // References module by numeric ID (was: "Üleülikoolilised ained")
    outcomes: [
      // Array of outcome objects
      {
        id: 1,
        description: "...", // Extracted for display
      },
      // ...
    ],
    // ...
  },
  // ...
];
```

## Testing Checklist

- [x] Application starts without errors (`npm run dev`)
- [x] Module filters display correct module names
- [x] Module colors are correctly applied to checkboxes
- [x] Module ECTS table shows module names instead of IDs
- [x] Subject info modal displays module name correctly
- [x] Subject outcomes display correctly (converted from objects to strings)
- [x] No PropTypes validation errors
- [x] No console errors

## Known Issues / Technical Debt

1. **Typo in module data**: `learningOucomes` should be `learningOutcomes` (kept for compatibility)
2. **Module ID hardcoding**: Module IDs and colors are hardcoded in `moduleConfig` in App.jsx
   - Consider deriving this from curriculum.modules data instead
3. **Outcome structure inconsistency**: Some old code may expect string outcomes, new data has objects
   - Current solution: Transform objects to strings in utils.js

## Future Improvements

1. Auto-generate `moduleConfig` from `curriculum[0].modules` data
2. Normalize `learningOucomes` → `learningOutcomes` throughout the data
3. Consider using a context or state management for module configuration
4. Add TypeScript for better type safety with the new numeric IDs

## Migration Complete ✅

The application now successfully uses numeric module IDs throughout, with proper display name mapping for the UI.
