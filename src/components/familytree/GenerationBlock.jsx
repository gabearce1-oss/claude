import React from 'react';
import MemberCard from './MemberCard';
import MilestoneList from './MilestoneList';

export default function GenerationBlock({ gen, isLast }) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr 360px',
        gap: 24,
        padding: '28px 0',
        borderBottom: `1px solid ${isLast ? '#2a2520' : '#b8ad97'}`,
      }}
      className="audit-generation"
    >
      {/* Generation marker */}
      <div
        style={{
          textAlign: 'right',
          paddingRight: 8,
          borderRight: '2px solid #1a1815',
          paddingTop: 4,
        }}
        className="gen-marker"
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '2.4rem',
            lineHeight: 1,
            color: '#1a1815',
            fontWeight: 600,
          }}
        >
          {gen.roman}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#3a3530',
            marginTop: 4,
          }}
        >
          {gen.era}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: '#1a1815',
            marginTop: 8,
            lineHeight: 1.25,
          }}
        >
          {gen.label}
        </div>
      </div>

      {/* Members */}
      <div className="flex flex-wrap gap-3 content-start">
        {gen.unknownPanel && (
          <div
            style={{
              flex: '1 1 100%',
              background: '#ebe1ce',
              border: '1px dashed #2a2520',
              padding: '18px 22px',
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '1.05rem',
              color: '#3a3530',
              lineHeight: 1.5,
            }}
          >
            <strong
              style={{
                color: '#1a1815',
                fontStyle: 'normal',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              {gen.unknownPanel.title}
            </strong>
            {gen.unknownPanel.body}
          </div>
        )}
        {gen.members.map((m, i) => (
          <MemberCard key={i} member={m} />
        ))}
      </div>

      {/* Milestones */}
      <MilestoneList title={gen.milestonesTitle} milestones={gen.milestones} />
    </section>
  );
}