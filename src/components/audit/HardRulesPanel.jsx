import React from 'react';
import { Lock } from 'lucide-react';
import { hardRules } from './auditChecklistData';

export default function HardRulesPanel() {
  return (
    <div className="p-6 rounded" style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4" style={{ color: '#b8a685' }} />
        <p className="text-xs uppercase tracking-widest" style={{ color: '#b8a685' }}>Hard rules · always in force</p>
      </div>
      <ul className="space-y-3">
        {hardRules.map((r) => (
          <li key={r.id} className="flex gap-3 text-sm leading-relaxed">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono"
              style={{ backgroundColor: '#b8a685', color: '#1a1815' }}
            >
              {String(r.id).padStart(2, '0')}
            </span>
            <span style={{ color: '#f4ede0' }}>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}