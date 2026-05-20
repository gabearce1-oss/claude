import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

const STATUS = {
  unmarked: { label: 'Unmarked', color: '#d4cdb8', fg: '#1a1815' },
  clear: { label: 'Clear', color: '#6b8e6f', fg: '#ffffff' },
  suspect: { label: 'Suspect', color: '#b8a685', fg: '#1a1815' },
  triggered: { label: 'Triggered', color: '#c97761', fg: '#ffffff' },
};

export default function PatternCard({ pattern, status, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const current = STATUS[status] || STATUS.unmarked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded overflow-hidden"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-4 text-left hover:bg-opacity-50 transition-colors"
        style={{ backgroundColor: expanded ? '#f9f5ed' : '#ffffff' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-light"
          style={{ backgroundColor: '#1a1815', color: '#f4ede0', fontFamily: 'Cormorant Garamond' }}
        >
          {pattern.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
              Pattern {pattern.number} — {pattern.title}
            </h3>
            <span
              className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium"
              style={{ backgroundColor: current.color, color: current.fg }}
            >
              {current.label}
            </span>
          </div>
          <p className="text-xs" style={{ color: '#6b6559' }}>
            {expanded ? 'Hide details' : 'Click to expand diagnostics, examples & mitigation'}
          </p>
        </div>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 transition-transform"
          style={{ color: '#6b6559', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 space-y-5" style={{ borderTop: '1px solid #d4cdb8' }}>
              {/* What it is */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>What it is</p>
                <p className="text-sm leading-relaxed" style={{ color: '#1a1815' }}>{pattern.what}</p>
              </div>

              {/* Diagnostic questions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4" style={{ color: '#8b7355' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>Diagnostic questions</p>
                </div>
                <ol className="space-y-2 list-decimal list-inside">
                  {pattern.diagnostics.map((q, i) => (
                    <li key={i} className="text-sm leading-relaxed" style={{ color: '#1a1815' }}>{q}</li>
                  ))}
                </ol>
              </div>

              {/* Examples */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#c97761' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>Examples in the case file</p>
                </div>
                <ul className="space-y-2">
                  {pattern.examples.map((e, i) => (
                    <li
                      key={i}
                      className="text-sm leading-relaxed pl-3 border-l-2"
                      style={{ color: '#1a1815', borderColor: '#c97761' }}
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mitigation */}
              <div className="p-4 rounded" style={{ backgroundColor: '#f0f5f2', borderLeft: '3px solid #6b8e6f' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#6b8e6f' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>Mitigation</p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#1a1815' }}>{pattern.mitigation}</p>
              </div>

              {/* Status selector */}
              <div className="pt-2" style={{ borderTop: '1px solid #d4cdb8' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>Mark this pattern</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => onStatusChange(key)}
                      className="px-3 py-1.5 rounded text-xs font-medium transition-opacity"
                      style={{
                        backgroundColor: s.color,
                        color: s.fg,
                        opacity: status === key ? 1 : 0.5,
                        border: status === key ? '2px solid #1a1815' : '2px solid transparent',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}