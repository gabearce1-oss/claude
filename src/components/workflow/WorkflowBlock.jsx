import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

export default function WorkflowBlock({ block, checked, onToggle, metricCount }) {
  const Icon = block.Icon;
  const completed = block.steps.filter((s) => checked[s.id]).length;
  const total = block.steps.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded p-6"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-start gap-4 mb-4 flex-wrap">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: block.accent }}
        >
          <Icon className="w-5 h-5" style={{ color: '#ffffff' }} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p
            className="mb-1"
            style={{
              color: '#6b6559',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {block.cadence}
          </p>
          <h2
            className="mb-1"
            style={{
              color: '#1a1815',
              fontFamily: 'Cormorant Garamond',
              fontSize: '1.6rem',
              fontWeight: 500,
              lineHeight: 1.1,
            }}
          >
            {block.title}
          </h2>
          <p className="text-sm" style={{ color: '#3a3530', lineHeight: 1.5 }}>
            {block.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            style={{
              color: block.accent,
              fontFamily: 'Cormorant Garamond',
              fontSize: '2rem',
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {pct}%
          </p>
          <p className="text-xs" style={{ color: '#6b6559' }}>
            {completed} / {total} done
          </p>
        </div>
      </div>

      {/* Live metric */}
      {block.metric && (
        <div
          className="mb-4 px-3 py-2 rounded text-xs flex items-center gap-2"
          style={{ backgroundColor: '#f9f5ed', color: '#1a1815' }}
        >
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, backgroundColor: block.accent }}
          />
          <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{metricCount}</strong>
          <span style={{ color: '#3a3530' }}>{block.metric.label}</span>
        </div>
      )}

      {/* Steps */}
      <ul className="space-y-2">
        {block.steps.map((step, idx) => {
          const isChecked = !!checked[step.id];
          return (
            <li key={step.id}>
              <button
                onClick={() => onToggle(step.id)}
                className="w-full text-left flex items-start gap-3 px-3 py-2 rounded hover:bg-stone-50 transition-colors"
                style={{ border: '1px solid #e8e0cd' }}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6b8e6f' }} />
                ) : (
                  <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#b8ad97' }} />
                )}
                <span
                  className="text-sm"
                  style={{
                    color: isChecked ? '#6b6559' : '#1a1815',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.7rem',
                      color: '#6b6559',
                      marginRight: 8,
                    }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}