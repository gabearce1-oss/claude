import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/sha256.md?raw';

export default function SHA256Protocol() {
  return (
    <ProtocolPage
      title="SHA-256 Chain-of-Custody Protocol"
      subtitle="TSK-006 — Execute before any other action. Tamper-evident hashing of Gabriel's deed documents and FamilySearch screenshots."
      markdown={markdown}
    />
  );
}
