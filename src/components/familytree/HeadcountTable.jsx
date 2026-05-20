import React from 'react';
import { headcount } from './familyTreeData';

export default function HeadcountTable() {
  return (
    <div className="rounded overflow-hidden" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <div className="p-4 border-b" style={{ borderColor: '#d4cdb8', backgroundColor: '#f9f5ed' }}>
        <h3 className="text-lg font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
          Family Head Count & Education Progression
        </h3>
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid #d4cdb8' }}>
            <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>Generation</th>
            <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>People</th>
            <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>Education</th>
            <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>Notable</th>
          </tr>
        </thead>
        <tbody>
          {headcount.map((r, i) => {
            const isTotal = r.gen === 'TOTAL';
            return (
              <tr key={i} style={{ borderBottom: '1px solid #d4cdb8', backgroundColor: isTotal ? '#f9f5ed' : 'transparent' }}>
                <td className="px-4 py-3 text-sm" style={{ color: '#1a1815', fontWeight: isTotal ? 600 : 400 }}>{r.gen}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{ color: '#1a1815' }}>{r.count}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#6b6559' }}>{r.education}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#6b6559' }}>{r.notable}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}