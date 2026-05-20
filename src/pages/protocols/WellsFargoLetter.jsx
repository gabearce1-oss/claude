import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/wells_fargo.md?raw';

export default function WellsFargoLetter() {
  return (
    <ProtocolPage
      title="Wells Fargo Historical Services Letter"
      subtitle="TSK-004 — Print-ready archival inquiry. MAC A0101-017, 420 Montgomery Street, San Francisco."
      markdown={markdown}
    />
  );
}
