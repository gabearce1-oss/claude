import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/database_registry.md?raw';

export default function DatabaseRegistry() {
  return (
    <ProtocolPage
      title="Database Registry"
      subtitle="50+ candidate sources: newspapers, regional, banking, immigration, Mexican national, mining/bullion, US diplomatic. Each row classified by access pattern (✅ API · 🔓 browse · ⚠️ scrape · 🔒 auth · 💰 paid) and TE360 pipe relevance."
      markdown={markdown}
    />
  );
}
