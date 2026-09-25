// Line icons drawn on a 24px grid in the spirit of SF Symbols.
const Svg = ({ children, size = 20, stroke = 1.8, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

export const ChevronLeft = (p) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>;
export const ChevronRight = (p) => <Svg {...p}><path d="M9 5l7 7-7 7" /></Svg>;
export const Close = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const Plus = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const ArrowUpRight = (p) => <Svg {...p}><path d="M7 17L17 7M9 7h8v8" /></Svg>;
export const Mail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></Svg>;
export const Copy = (p) => <Svg {...p}><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></Svg>;
export const Check = (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const Menu = (p) => <Svg {...p}><path d="M4 8h16M4 16h16" /></Svg>;
export const Star = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" />
  </svg>
);

// Discipline icons
export const LevelIcon = (p) => (
  <Svg size={28} stroke={1.6} {...p}>
    <path d="M3 17l9 4 9-4M3 12l9 4 9-4M12 3l9 4-9 4-9-4z" />
  </Svg>
);
export const EnvironmentIcon = (p) => (
  <Svg size={28} stroke={1.6} {...p}>
    <path d="M3 19l6-9 4 6 3-4 5 7z" /><circle cx="16.5" cy="6.5" r="2" />
  </Svg>
);
export const XrIcon = (p) => (
  <Svg size={28} stroke={1.6} {...p}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v5a2.5 2.5 0 0 1-2.5 2.5h-2.2a2 2 0 0 1-1.7-1l-.9-1.5a.8.8 0 0 0-1.4 0l-.9 1.5a2 2 0 0 1-1.7 1H6.5A2.5 2.5 0 0 1 4 13.5z" />
  </Svg>
);
