import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/research_protocol.md?raw';

export default function ResearchProtocol() {
  return (
    <ProtocolPage
      title="Research Protocol — Omega Doctrine"
      subtitle="Master operating doctrine: five-gate admissibility, claim classification, adversarial verification, AI contamination firewall, reference-template integration."
      markdown={markdown}
    />
  );
}
