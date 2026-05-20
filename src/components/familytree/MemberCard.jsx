import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from './auditTreeData';

// Renders **bold** markdown-style emphasis only
function renderInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} style={{ color: '#1a1815', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    )
  );
}

export default function MemberCard({ member }) {
  const color = STATUS_COLORS[member.status];
  const fabricated = member.status === 'fabricated';

  return (
    <div
      className="relative"
      style={{
        background: '#f4ede0',
        border: '1px solid #b8ad97',
        borderLeft: `4px solid ${color}`,
        padding: '12px 14px',
        minWidth: 220,
        flex: '0 1 240px',
      }}
    >
      {member.keeper && (
        <span
          className="absolute"
          style={{
            top: 8, right: 10,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '1.2rem',
            color: '#4a5d3a',
          }}
        >★</span>
      )}

      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.05rem',
          fontWeight: 600,
          color: '#1a1815',
          lineHeight: 1.2,
          marginBottom: 3,
          paddingRight: member.keeper ? 18 : 0,
        }}
      >
        {member.name}
      </p>

      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          color: '#3a3530',
          letterSpacing: '0.05em',
          marginBottom: 8,
        }}
      >
        {member.dates}
      </p>

      <span
        style={{
          display: 'inline-block',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.58rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '3px 7px',
          color: '#f4ede0',
          fontWeight: 600,
          marginBottom: 8,
          backgroundColor: color,
          backgroundImage: fabricated
            ? 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(244,237,224,0.15) 3px, rgba(244,237,224,0.15) 6px)'
            : 'none',
        }}
      >
        {STATUS_LABELS[member.status]}
      </span>

      <p style={{ fontSize: '0.72rem', lineHeight: 1.45, color: '#3a3530' }}>
        {renderInline(member.note)}
        {member.verify && (
          <span
            style={{
              display: 'block',
              marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.62rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#3a3530',
            }}
          >
            Verify via: {member.verify}
          </span>
        )}
      </p>
    </div>
  );
}