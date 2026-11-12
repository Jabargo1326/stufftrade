// Small inline SVG icons (no icon library needed).
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const HomeIcon = (p) => (<svg {...base} {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>);
export const PlusIcon = (p) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const SwapIcon = (p) => (<svg {...base} {...p}><path d="M4 8h15M15 4l4 4-4 4" /><path d="M20 16H5M9 12l-4 4 4 4" /></svg>);
export const UserIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>);
export const SearchIcon = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>);
export const HeartIcon = ({ filled, ...p }) => (<svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7-4.6-9-9.2C1.6 7.4 3.7 4 7 4c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.3 0 5.4 3.4 4 6.8C19 15.4 12 20 12 20z" /></svg>);
export const ChevronRight = (p) => (<svg {...base} {...p}><path d="M9 5l7 7-7 7" /></svg>);
export const ChevronLeft = (p) => (<svg {...base} {...p}><path d="M15 5l-7 7 7 7" /></svg>);
export const CheckIcon = (p) => (<svg {...base} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const CloseIcon = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const ChevronDown = (p) => (<svg {...base} {...p}><path d="M6 9l6 6 6-6" /></svg>);

export const Fingerprint = ({ size = 120, color = '#ffe3d3' }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" aria-hidden="true">
    <path d="M18 62C18 32 33 14 50 14s32 18 32 48v12" />
    <path d="M30 92c-4-10-2-20-2-30 0-17 10-34 22-34s22 17 22 34c0 13-2 25-8 38" />
    <path d="M40 106c-4-12-2-26-2-44 0-12 5-22 12-22s12 10 12 22c0 15-2 28-6 46" />
    <path d="M50 54c-3 5-3 12-2 20 1 10 0 20-2 30" />
  </svg>
);
