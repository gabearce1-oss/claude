import React from 'react';
import { STATUS_COLORS, STATUS_LABELS, STATUS_DESCRIPTIONS, EVENT_COLORS, EVENT_LABELS } from './auditTreeData';

function LegendColumn({ title, items, colorMap, labelMap }) {
  return (
    <div>
      <h3
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#3a3530',
          marginBottom: 10,
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      <div className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-2.5 text-xs">
            <div style={{ width: 14, height: 14, flexShrink: 0, backgroundColor: colorMap[it.key] }} />
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: '#3a3530',
                fontSize: '0.78rem',
              }}
            >
              <strong style={{ color: '#1a1815', fontWeight: 500 }}>
                {labelMap ? labelMap[it.key] : it.text.split(' — ')[0]}
              </strong>
              {labelMap ? ` — ${it.text}` : ` — ${it.text.split(' — ').slice(1).join(' — ')}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TreeLegend() {
  return (
    <section
      style={{
        background: '#ebe1ce',
        border: '1px solid #b8ad97',
        padding: '18px 22px',
        marginBottom: 40,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
      }}
      className="md:grid-cols-2 grid-cols-1"
    >
      <LegendColumn
        title="Evidentiary Status"
        items={STATUS_DESCRIPTIONS}
        colorMap={STATUS_COLORS}
        labelMap={STATUS_LABELS}
      />
      <LegendColumn
        title="Displacement Timeline Categories"
        items={EVENT_LABELS}
        colorMap={EVENT_COLORS}
      />
    </section>
  );
}