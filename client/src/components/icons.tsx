// Line icons drawn in the current text colour; the buttons that use them carry the accessible name.
const SVG_PROPS = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function PencilIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M4 7h16" />
      <path d="M10 3h4" />
      <path d="m6 7 1 13h10l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
