import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/living_sources.md?raw';

export default function LivingSources() {
  return (
    <ProtocolPage
      title="Living Oral-History Sources"
      subtitle="URGENT — Carmelita Terango contact + audio-consent script + contact-attempt log. Living sources expire."
      markdown={markdown}
    />
  );
}
