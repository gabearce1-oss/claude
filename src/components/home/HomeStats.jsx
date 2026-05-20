import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { FileText, FileSearch, Inbox, ShieldCheck } from 'lucide-react';

export default function HomeStats() {
  const { data: s = {} } = useQuery({
    queryKey: ['public-case-stats'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicCaseStats', {});
      return res.data || {};
    },
    staleTime: 60_000,
  });

  const stats = [
    { Icon: FileText,    label: 'Evidence Records',  value: s.evidence_total ?? 0 },
    { Icon: ShieldCheck, label: 'Verified Sources',  value: s.evidence_verified ?? 0 },
    { Icon: FileSearch,  label: 'Claims Tracked',    value: s.claims_total ?? 0, sub: `${s.claims_verified ?? 0} verified · ${s.claims_quarantined ?? 0} quarantined` },
    { Icon: Inbox,       label: 'Archive Requests',  value: s.requests_total ?? 0, sub: `${s.requests_open ?? 0} open` },
  ];

  return (
    <div style={{ backgroundColor: '#ebe1ce', borderTop: '1px solid #d4cdb8', borderBottom: '1px solid #d4cdb8' }}>
      <div className="max-w-6xl mx-auto px-8 py-16">
        <p
          className="text-xs mb-8"
          style={{
            color: '#3a3530',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          Live Case Status
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ Icon, label, value, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-5 rounded"
              style={{ backgroundColor: '#f4ede0', border: '1px solid #d4cdb8' }}
            >
              <Icon className="w-4 h-4 mb-3" style={{ color: '#6b6559' }} />
              <div
                className="text-4xl font-light mb-1"
                style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
              >
                {value}
              </div>
              <div
                className="text-xs"
                style={{
                  color: '#3a3530',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
              {sub && (
                <div className="text-xs mt-1" style={{ color: '#6b6559' }}>
                  {sub}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}