import React from 'react';
import { CUSTODY_STAGES, stageByKey } from './custodyConfig';

export default function CustodyChain({ current = 'draft', size = 'md' }) {
  const idx = CUSTODY_STAGES.findIndex((s) => s.key === current);
  const reachedIdx = idx >= 0 ? idx : 0;
  const dot = size === 'sm' ? 22 : 30;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {CUSTODY_STAGES.map((stage, i) => {
        const reached = i <= reachedIdx;
        const isCurrent = i === reachedIdx;
        const Icon = stage.icon;
        return (
          <React.Fragment key={stage.key}>
            <div className="flex items-center gap-1.5" title={stage.description}>
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: dot,
                  height: dot,
                  backgroundColor: reached ? stage.color : '#ffffff',
                  border: `1.5px solid ${reached ? stage.color : '#d4cdb8'}`,
                  boxShadow: isCurrent ? `0 0 0 3px ${stage.bg}` : 'none',
                }}
              >
                <Icon className="w-3 h-3" style={{ color: reached ? '#ffffff' : '#6b6559' }} />
              </div>
              {size !== 'sm' && (
                <span
                  className="text-xs"
                  style={{
                    color: reached ? stage.color : '#6b6559',
                    fontWeight: isCurrent ? 600 : 400,
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {stage.label}
                </span>
              )}
            </div>
            {i < CUSTODY_STAGES.length - 1 && (
              <div
                style={{
                  width: size === 'sm' ? 14 : 26,
                  height: 2,
                  backgroundColor: i < reachedIdx ? stageByKey(CUSTODY_STAGES[i + 1].key).color : '#d4cdb8',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}