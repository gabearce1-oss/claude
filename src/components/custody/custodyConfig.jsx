import { FileEdit, Activity, Lock, AlertOctagon } from 'lucide-react';

export const CUSTODY_STAGES = [
  {
    key: 'draft',
    label: 'Draft',
    description: 'Newly catalogued. No formal chain established.',
    color: '#b8a685',
    bg: '#f4ede0',
    icon: FileEdit,
  },
  {
    key: 'tracked',
    label: 'Tracked',
    description: 'Source, custodian, and acquisition path documented.',
    color: '#5a6b7a',
    bg: '#e8eef2',
    icon: Activity,
  },
  {
    key: 'sealed',
    label: 'Sealed',
    description: 'Verified, locked, and admissible. Modifications require review.',
    color: '#4a5d3a',
    bg: '#e8efe2',
    icon: Lock,
  },
  {
    key: 'quarantined',
    label: 'Quarantined',
    description: 'Authenticity in doubt or contamination flagged. Excluded from analysis.',
    color: '#6b1f1f',
    bg: '#f3dede',
    icon: AlertOctagon,
  },
];

export const stageByKey = (key) =>
  CUSTODY_STAGES.find((s) => s.key === key) || CUSTODY_STAGES[0];