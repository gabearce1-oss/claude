import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RotateCcw, Calendar } from 'lucide-react';
import { WORKFLOW_BLOCKS } from '../components/workflow/workflowData';
import WorkflowBlock from '../components/workflow/WorkflowBlock';
import DailySummaryButton from '../components/workflow/DailySummaryButton';

const STORAGE_KEY = 'te360_workflow_checks';
const STORAGE_DATE_KEY = 'te360_workflow_date';

export default function WorkflowPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [checked, setChecked] = useState({});

  // Load saved checks; auto-reset when the date changes (new day, fresh checklist).
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem(STORAGE_DATE_KEY);
      const savedChecks = localStorage.getItem(STORAGE_KEY);
      if (savedDate === today && savedChecks) {
        setChecked(JSON.parse(savedChecks));
      } else {
        localStorage.setItem(STORAGE_DATE_KEY, today);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [today]);

  const toggle = (stepId) => {
    setChecked((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const resetAll = () => {
    setChecked({});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    } catch (e) {
      // ignore
    }
  };

  // Live data for the per-block metrics
  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => base44.entities.Evidence.list(),
  });
  const { data: archiveRequests = [] } = useQuery({
    queryKey: ['archiveRequests'],
    queryFn: () => base44.entities.ArchiveRequest.list(),
  });
  const { data: entities = [] } = useQuery({
    queryKey: ['entities'],
    queryFn: () => base44.entities.Entity.list(),
  });

  const dataByEntity = useMemo(
    () => ({ Evidence: evidence, ArchiveRequest: archiveRequests, Entity: entities }),
    [evidence, archiveRequests, entities]
  );

  // Overall progress
  const { totalSteps, doneSteps } = useMemo(() => {
    let total = 0;
    let done = 0;
    WORKFLOW_BLOCKS.forEach((b) => {
      b.steps.forEach((s) => {
        total += 1;
        if (checked[s.id]) done += 1;
      });
    });
    return { totalSteps: total, doneSteps: done };
  }, [checked]);

  const overallPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          to="/dashboard"
          className="text-xs inline-flex items-center gap-2 mb-6 hover:opacity-70"
          style={{ color: '#3a3530', fontFamily: 'JetBrains Mono, monospace' }}
        >
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div
          className="rounded p-6 mb-6 flex items-start justify-between gap-4 flex-wrap"
          style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
        >
          <div>
            <p
              className="mb-2"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#c4b896',
              }}
            >
              TruthEngine360 · Terminel–Sagasta · Operations
            </p>
            <h1
              style={{
                fontFamily: 'Cormorant Garamond',
                fontSize: '2.4rem',
                fontWeight: 500,
                lineHeight: 1.05,
                marginBottom: 8,
              }}
            >
              Daily Analyst <em>Workflow</em>
            </h1>
            <p className="text-sm flex items-center gap-2" style={{ color: '#c4b896' }}>
              <Calendar className="w-3.5 h-3.5" />
              {today} · checklist resets at the start of each day
            </p>
          </div>

          <div className="text-right">
            <p
              style={{
                fontFamily: 'Cormorant Garamond',
                fontSize: '3.5rem',
                fontWeight: 300,
                lineHeight: 1,
                color: '#f4ede0',
              }}
            >
              {overallPct}%
            </p>
            <p className="text-xs mb-3" style={{ color: '#c4b896' }}>
              {doneSteps} / {totalSteps} steps complete
            </p>
            <div className="flex gap-2 justify-end flex-wrap">
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded hover:opacity-80"
                style={{
                  border: '1px solid #c4b896',
                  color: '#f4ede0',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <RotateCcw className="w-3 h-3" />
                Reset day
              </button>
              <DailySummaryButton />
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-5">
          {WORKFLOW_BLOCKS.map((block) => {
            const records = dataByEntity[block.metric.entity] || [];
            const metricCount = records.filter(block.metric.match).length;
            return (
              <WorkflowBlock
                key={block.id}
                block={block}
                checked={checked}
                onToggle={toggle}
                metricCount={metricCount}
              />
            );
          })}
        </div>

        <p
          className="mt-8 text-center text-xs"
          style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}
        >
          Source: TE360 — Terminel–Sagasta Active Search Playbook
        </p>
      </div>
    </div>
  );
}