import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/familysearch.md?raw';

export default function FamilySearchProtocol() {
  return (
    <ProtocolPage
      title="FamilySearch Browse Protocol"
      subtitle="TSK-001 & TSK-002 — Catalogs 704679 (civil) & 704681 (parish), Sahuaripa / San Javier, Sonora"
      markdown={markdown}
    />
  );
}
