import React from 'react';
import { auditObservations } from './auditTreeData';

export default function AuditFooter() {
  return (
    <section
      style={{
        background: '#1a1815',
        color: '#f4ede0',
        padding: '32px 36px',
        marginTop: 40,
      }}
    >
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: '1.4rem',
          color: '#f4ede0',
          marginBottom: 18,
        }}
      >
        What This Tree Says, and What It Won't Say
      </h2>

      {auditObservations.map((obs, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 18,
            padding: '14px 0',
            fontSize: '0.84rem',
            lineHeight: 1.55,
            borderBottom: i === auditObservations.length - 1 ? 'none' : '1px solid rgba(244,237,224,0.15)',
          }}
          className="audit-obs"
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#f4ede0',
              opacity: 0.7,
              paddingTop: 2,
            }}
          >
            {obs.tag}
          </span>
          <span style={{ color: '#f4ede0', opacity: 0.92 }}>{obs.desc}</span>
        </div>
      ))}
    </section>
  );
}