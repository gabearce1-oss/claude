import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/foia_crawlers.md?raw';

export default function FOIACrawlers() {
  return (
    <ProtocolPage
      title="FOIA Requests & n8n Crawler Configurations"
      subtitle="AUMER Foundation · TruthEngine360 · Exile Patriot Project — 5 INAI requests, 3 US FOIA requests, 3 university outreach drafts, 4 n8n crawler configs. PDF bundled in-app."
      markdown={markdown}
    />
  );
}
