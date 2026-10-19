/* eslint-disable react/prop-types */
// Logo 1b "Eeldused": two subjects join into the next one as its prerequisite. Same mark as public/logo-mark.svg;
// the connector uses currentColor so it follows the text colour. Thicker strokes keep it legible at small sizes.
export default function Logo({ size = 24 }) {
  const stroke = size >= 40 ? 3 : size >= 24 ? 4 : 5;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      <path d="M26 18H32V32H38M26 46H32V32" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
      <rect x="4" y="10" width="22" height="16" rx="3" fill="#5E9CC4" />
      <rect x="4" y="38" width="22" height="16" rx="3" fill="#5E9CC4" />
      <rect x="38" y="24" width="22" height="16" rx="3" fill="#4F9C72" />
    </svg>
  );
}
