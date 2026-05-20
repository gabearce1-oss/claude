import React from 'react';
import { REQUEST_STATUS } from '../forensic/statusConfig';
import { Pencil, Trash2 } from 'lucide-react';

export default function ArchiveRequestTable({ requests, onEdit, onDelete }) {
  if (!requests.length) {
    return (
      <div className="p-10 rounded text-center" style={{ backgroundColor: '#ffffff', border: '1px dashed #d4cdb8' }}>
        <p style={{ color: '#6b6559' }}>
          No archive requests yet. Use the playbook on the right to draft your first one.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded overflow-hidden" style={{ border: '1px solid #d4cdb8' }}>
      <table className="w-full text-sm" style={{ backgroundColor: '#ffffff' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f5ed', color: '#6b6559', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <th className="text-left p-3">#</th>
            <th className="text-left p-3">Source</th>
            <th className="text-left p-3">Target</th>
            <th className="text-left p-3">Query</th>
            <th className="text-left p-3">Submitted</th>
            <th className="text-left p-3">Follow-up</th>
            <th className="text-left p-3">Status</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const s = REQUEST_STATUS[r.status] || REQUEST_STATUS.planned;
            return (
              <tr key={r.id} className="border-t" style={{ borderColor: '#ebe1ce' }}>
                <td className="p-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1a1815' }}>{r.request_number || '—'}</td>
                <td className="p-3" style={{ color: '#1a1815' }}>{r.source}</td>
                <td className="p-3" style={{ color: '#1a1815' }}>{r.record_target}</td>
                <td className="p-3" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#3a3530', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.query_used || '—'}</td>
                <td className="p-3" style={{ color: '#3a3530' }}>{r.submitted_date || '—'}</td>
                <td className="p-3" style={{ color: '#3a3530' }}>{r.follow_up_due || '—'}</td>
                <td className="p-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#f9f5ed', color: s.color, border: `1px solid ${s.color}` }}>
                    {s.label}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => onEdit(r)} className="text-xs p-1.5 rounded" style={{ color: '#1a1815' }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(r)} className="text-xs p-1.5 rounded" style={{ color: '#6b1f1f' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}