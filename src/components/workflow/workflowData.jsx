// Daily Analyst Workflow — guided checklists for the Terminel-Sagasta case.
// Source: TE360 — Terminel–Sagasta Active Search Playbook.

import { Sun, Network, Inbox, ShieldAlert } from 'lucide-react';

export const WORKFLOW_BLOCKS = [
  {
    id: 'morning',
    title: 'Morning · Evidence Queue',
    cadence: 'Daily',
    Icon: Sun,
    accent: '#b8a685',
    description:
      'Triage newly ingested evidence. Score each item, set review status, and link to existing claims (or draft new ones).',
    steps: [
      {
        id: 'morning-1',
        label: "Filter Evidence where review_status = 'new' and archive_name is in (HNDM, LoC, FamilySearch, UNISON, COLSON).",
      },
      {
        id: 'morning-2',
        label: 'For each document, assign contamination_score, provenance_score, and authenticity_score.',
      },
      {
        id: 'morning-3',
        label: "Change review_status from 'new' to 'triaged' once scored.",
      },
      {
        id: 'morning-4',
        label: 'Link each document to existing claims via Evidence ↔ Claim Link, or draft new claims as needed.',
      },
    ],
    // Metric this block targets — used to show a live count from app data.
    metric: { entity: 'Evidence', label: 'new evidence to triage', match: (e) => e.review_status === 'new' },
  },
  {
    id: 'midday',
    title: 'Midday · Graph Review',
    cadence: 'Daily',
    Icon: Network,
    accent: '#6b8e6f',
    description:
      "Open the Provenance Map around Francisco L. Terminel. Confirm yesterday's ingest added the right entities and relationships.",
    steps: [
      {
        id: 'midday-1',
        label: "Open the Provenance Map and select the Francisco L. Terminel node (or the case's central entity).",
      },
      {
        id: 'midday-2',
        label: "Identify new nodes added by yesterday's ingest (people, places, organizations, archives).",
      },
      {
        id: 'midday-3',
        label: 'Verify relationship types are correctly typed (e.g., COFOUNDED, HELD_OFFICE, EXILED_TO, OWNED).',
      },
      {
        id: 'midday-4',
        label: 'Flag mistyped or unsupported relationships for cleanup; note the evidence that should back each edge.',
      },
    ],
    metric: { entity: 'Entity', label: 'entities in graph', match: () => true },
  },
  {
    id: 'afternoon',
    title: 'Afternoon · Archive Requests',
    cadence: 'Daily',
    Icon: Inbox,
    accent: '#8a9bb8',
    description:
      'Check pending requests for responses. Process incoming documents into the vault. Submit new requests for gaps surfaced this morning.',
    steps: [
      {
        id: 'afternoon-1',
        label: 'Check status updates on outstanding archive requests (AHES, AGN, Wells Fargo, NARA, UA Special Collections, Bancroft).',
      },
      {
        id: 'afternoon-2',
        label: 'If a response arrived, process attached documents into the Evidence vault immediately and link to the request.',
      },
      {
        id: 'afternoon-3',
        label: "Update the request status (submitted → acknowledged → in_progress → closed) to reflect today's state.",
      },
      {
        id: 'afternoon-4',
        label: 'Submit new archive requests triggered by gaps you found in the morning queue.',
      },
    ],
    metric: {
      entity: 'ArchiveRequest',
      label: 'requests awaiting response',
      match: (r) => ['submitted', 'running', 'draft'].includes(r.status),
    },
  },
  {
    id: 'weekly',
    title: 'Weekly · Contamination Quarantine Check',
    cadence: 'Once per week',
    Icon: ShieldAlert,
    accent: '#c97761',
    description:
      'Review quarantined and high-contamination evidence. Never promote a quarantined claim — write a fresh claim sourced from new primary evidence.',
    steps: [
      {
        id: 'weekly-1',
        label: "Query Evidence where contamination_score > 70 OR review_status = 'quarantined'.",
      },
      {
        id: 'weekly-2',
        label: 'For each quarantined item, check whether any AI-generated claims tied to it have since been independently corroborated.',
      },
      {
        id: 'weekly-3',
        label: 'If corroborated, create a NEW claim row linked to the real primary source — do not promote the quarantined claim itself.',
      },
      {
        id: 'weekly-4',
        label: 'Document the disposition in the quarantined item\'s notes so the audit trail is preserved.',
      },
    ],
    metric: {
      entity: 'Evidence',
      label: 'quarantined or high-contamination items',
      match: (e) => e.review_status === 'quarantined' || (e.contamination_score || 0) > 70,
    },
  },
];

export const WORKFLOW_ICONS = { Sun, Network, Inbox, ShieldAlert };