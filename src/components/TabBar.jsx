const TABS = [
  { id: 'home',     label: 'Today' },
  { id: 'summary',  label: 'Summary' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'paycheck', label: 'Paycheck' },
  { id: 'settings', label: 'Settings' },
];

function Icon({ id, active }) {
  const w = active ? 2.5 : 1.8;
  const fill = active ? 'currentColor' : 'none';

  if (id === 'home') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
        stroke="currentColor" strokeWidth={w} strokeLinejoin="round"
        fill={fill} fillOpacity={active ? 0.15 : 0} />
      <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (id === 'summary') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3"  y="13" width="4" height="8" rx="1" stroke="currentColor" strokeWidth={w} fill={fill} fillOpacity={active ? 0.9 : 0} />
      <rect x="10" y="8"  width="4" height="13" rx="1" stroke="currentColor" strokeWidth={w} fill={fill} fillOpacity={active ? 0.9 : 0} />
      <rect x="17" y="3"  width="4" height="18" rx="1" stroke="currentColor" strokeWidth={w} fill={fill} fillOpacity={active ? 0.9 : 0} />
    </svg>
  );

  if (id === 'calendar') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2"
        stroke="currentColor" strokeWidth={w}
        fill={fill} fillOpacity={active ? 0.1 : 0} />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth={w} strokeLinecap="round" />
      <line x1="8"  y1="2" x2="8"  y2="6" stroke="currentColor" strokeWidth={w} strokeLinecap="round" />
      <line x1="3"  y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth={w} />
      {active && (
        <>
          <circle cx="8"  cy="15" r="1.5" fill="currentColor" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
          <circle cx="16" cy="15" r="1.5" fill="currentColor" />
        </>
      )}
    </svg>
  );

  if (id === 'paycheck') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="2"
        stroke="currentColor" strokeWidth={w}
        fill={fill} fillOpacity={active ? 0.12 : 0} />
      <circle cx="12" cy="13" r="3"
        stroke="currentColor" strokeWidth={w}
        fill={fill} fillOpacity={active ? 0.25 : 0} />
      <line x1="6" y1="13" x2="6" y2="13.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="13" x2="18" y2="13.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  if (id === 'settings') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={w} fill={fill} fillOpacity={active ? 0.3 : 0} />
      <path strokeWidth={w} stroke="currentColor" strokeLinecap="round"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );

  return null;
}

export default function TabBar({ active, onChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          className={`tab-item ${active === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon id={id} active={active === id} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
