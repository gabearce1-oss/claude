import React from 'react';
import { EVENT_COLORS } from './auditTreeData';

export default function MilestoneList({ title, milestones }) {
  return (
    <div style={{ borderLeft: '1px solid #b8ad97', paddingLeft: 18 }}>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#3a3530',
          marginBottom: 4,
          fontWeight: 500,
        }}
      >
        {title}
      </p>
      {milestones.map((m, i) => {
        const color = EVENT_COLORS[m.cat] || '#3a3530';
        const isLast = i === milestones.length - 1;
        return (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr',
              gap: 10,
              padding: '8px 0',
              borderBottom: isLast ? 'none' : '1px dotted #b8ad97',
              fontSize: '0.73rem',
              lineHeight: 1.45,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color,
              }}
            >
              {m.year}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.58rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 2,
                  color,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '0.95rem',
                  color: '#1a1815',
                  lineHeight: 1.35,
                }}
              >
                {m.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}