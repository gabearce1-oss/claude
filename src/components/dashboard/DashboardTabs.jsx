import React from 'react';
import { LayoutDashboard, FileBox, Activity, Lock } from 'lucide-react';

const TABS = [
  { key: 'overview',     label: 'Overview',     Icon: LayoutDashboard },
  { key: 'evidence',     label: 'Evidence',     Icon: FileBox },
  { key: 'intelligence', label: 'Intelligence', Icon: Activity },
  { key: 'custody',      label: 'Custody',      Icon: Lock },
];

export default function DashboardTabs({ active, onChange }) {
  return (
    <div
      className="sticky top-0 z-10"
      style={{ backgroundColor: '#f4ede0', borderBottom: '1px solid #d4cdb8' }}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => onChange(key)}
                className="relative inline-flex items-center gap-2 px-4 py-3.5 transition-colors"
                style={{
                  color: isActive ? '#1a1815' : '#6b6559',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.72rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 8,
                      right: 8,
                      bottom: -1,
                      height: 2,
                      backgroundColor: '#1a1815',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}