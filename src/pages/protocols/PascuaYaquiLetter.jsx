import React from 'react';
import ProtocolPage from '@/components/playbook/ProtocolPage';
import markdown from '@/content/te360/pascua_yaqui_letter.md?raw';

export default function PascuaYaquiLetter() {
  return (
    <ProtocolPage
      title="Pascua Yaqui Cultural Resources Letter"
      subtitle="ORAL — Tribal-sovereign consultation request to ANARÓ. Five questions, explicit no-claim disclaimers, enclosures list. Print-ready."
      markdown={markdown}
    />
  );
}
