import type { ReactNode } from 'react';
import type { NavSectionKey } from '../types';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`nav-chevron${open ? ' rotated' : ''}`}
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function NavSub({ open, children }: { open: boolean; children?: ReactNode }) {
  return <div className={`nav-sub${open ? ' open' : ''}`}>{children}</div>;
}

export function Sidebar({
  collapsed,
  openSections,
  onToggleSection,
}: {
  collapsed: boolean;
  openSections: Record<NavSectionKey, boolean>;
  onToggleSection: (key: NavSectionKey) => void;
}) {
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src="/logo-pulse.png" alt="OPulse by Devoteam" />
      </div>

      <nav>
        <div className="nav-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </div>

        <div className="nav-item" onClick={() => onToggleSection('inventory')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Cloud Inventory
          <Chevron open={openSections.inventory} />
        </div>
        <NavSub open={openSections.inventory} />

        <div className={`nav-item${openSections.economics ? ' open' : ''}`} onClick={() => onToggleSection('economics')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Cloud Economics
          <Chevron open={openSections.economics} />
        </div>
        <NavSub open={openSections.economics}>
          <div className="nav-sub-item">
            <div className="nav-dot" />
            Cost Analysis
          </div>
          <div className="nav-sub-item">
            <div className="nav-dot" />
            Budget &amp; Alerts
          </div>
          <div className="nav-sub-item">
            <div className="nav-dot" />
            Cost Savings
          </div>
          <div className="nav-sub-item active">
            <div className="nav-dot" />
            Anomaly Detection
          </div>
        </NavSub>

        <div className="nav-item" onClick={() => onToggleSection('compliance')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Cloud Compliance
          <Chevron open={openSections.compliance} />
        </div>
        <NavSub open={openSections.compliance} />

        <div className="nav-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Service Catalog
        </div>
      </nav>
    </aside>
  );
}
