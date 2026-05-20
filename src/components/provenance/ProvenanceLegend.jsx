import React from 'react';

export default function ProvenanceLegend() {
  const Item = ({ color, shape = 'circle', label, dashed }) => (
    <div className="flex items-center gap-2 text-xs" style={{ color: '#1a1815' }}>
      {shape === 'line' ? (
        <svg width="28" height="10">
          <line x1="0" y1="5" x2="28" y2="5" stroke={color} strokeWidth="1.5" strokeDasharray={dashed ? '4 3' : ''} />
        </svg>
      ) : (
        <span
          className="inline-block rounded-full"
          style={{ width: 12, height: 12, backgroundColor: color, border: '1.5px solid #ffffff', boxShadow: '0 0 0 1px #d4cdb8' }}
        />
      )}
      <span style={{ color: '#6b6559' }}>{label}</span>
    </div>
  );

  return (
    <div className="p-4 rounded grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <div className="space-y-2">
        <p className="text-xs font-semibold" style={{ color: '#1a1815' }}>Document trust</p>
        <Item color="#6b8e6f" label="verified" />
        <Item color="#b8a685" label="plausible" />
        <Item color="#c97761" label="fabricated risk" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold" style={{ color: '#1a1815' }}>Document trust</p>
        <Item color="#8a7b6f" label="mixed" />
        <Item color="#6b6559" label="methodology" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold" style={{ color: '#1a1815' }}>Evidence status</p>
        <Item color="#6b8e6f" label="verified" />
        <Item color="#b8a685" label="reviewed" />
        <Item color="#d4cdb8" label="unreviewed" />
        <Item color="#c97761" label="disputed" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold" style={{ color: '#1a1815' }}>Links</p>
        <Item color="#6b8e6f" shape="line" label="evidence → source" />
        <Item color="#8b7355" shape="line" dashed label="document → evidence" />
        <Item color="#3a3530" label="source" />
      </div>
    </div>
  );
}