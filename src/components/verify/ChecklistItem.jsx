import React from 'react';
import { Check, Minus, AlertCircle, Circle } from 'lucide-react';

const STATES = [
  { key: 'unmarked', label: 'Unmarked', icon: Circle,       color: '#6b6559', bg: '#f9f5ed' },
  { key: 'pass',     label: 'Pass',     icon: Check,        color: '#4a5d3a', bg: '#e8efe2' },
  { key: 'concern',  label: 'Concern',  icon: AlertCircle,  color: '#8a6e3c', bg: '#f3ead8' },
  { key: 'fail',     label: 'Fail',     icon: Minus,        color: '#6b1f1f', bg: '#f3dede' },
];

export default function ChecklistItem({ item, state, note, onState, onNote }) {
  const current = STATES.find((s) => s.key === (state || 'unmarked'));
  const Icon = current.icon;

  return (
    <div
      className="p-4 rounded"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4cdb8',
        borderLeft: `4px solid ${current.color}`,
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: current.color }} />
        <div className="flex-1">
          <p style={{ color: '#1a1815', fontWeight: 500, fontSize: '0.9rem', lineHeight: 1.4 }}>
            {item.question}
          </p>
          {item.guidance && (
            <p className="mt-1 text-xs" style={{ color: '#6b6559', lineHeight: 1.5 }}>
              {item.guidance}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 mb-2 flex-wrap">
        {STATES.map((s) => {
          const active = (state || 'unmarked') === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onState(s.key)}
              className="text-xs px-2.5 py-1 rounded"
              style={{
                backgroundColor: active ? s.color : '#ffffff',
                color: active ? '#ffffff' : s.color,
                border: `1px solid ${s.color}`,
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.05em',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={note || ''}
        onChange={(e) => onNote(e.target.value)}
        placeholder="Notes / citations / contradictions…"
        rows={2}
        className="w-full px-2.5 py-1.5 rounded text-xs"
        style={{
          border: '1px solid #ebe1ce',
          backgroundColor: '#f9f5ed',
          color: '#1a1815',
          fontFamily: 'JetBrains Mono, monospace',
          resize: 'vertical',
        }}
      />
    </div>
  );
}