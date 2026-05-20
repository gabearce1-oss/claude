import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/priority_action_package.md?raw';

export default function PriorityActionPackage() {
  return (
    <ProtocolPage
      title="Priority Action Execution Package"
      subtitle="TSK-001/002, TSK-004, TSK-005, TSK-006, LAND-004/005 — full task brief with model letters."
      markdown={markdown}
    />
  );
}
