import React from 'react';
import PersonCard from './PersonCard';

export default function GenerationRow({ gen }) {
  const accentByGen = {
    1: '#8b7355',
    2: '#6b5b4f',
    3: '#a68b7a',
    4: '#7a6b5f',
    5: '#6b8e6f',
    6: '#1a1815',
  };
  const accent = accentByGen[gen.gen] || '#8a7b6f';

  return (
    <div className="relative pb-12">
      {/* Generation header */}
      <div className="flex items-baseline gap-4 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: accent, color: '#f4ede0', fontFamily: 'Cormorant Garamond' }}
        >
          {gen.gen}
        </div>
        <div>
          <h2 className="text-2xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
            Generation {gen.gen}: {gen.title}
          </h2>
          <p className="text-xs" style={{ color: '#6b6559' }}>
            {gen.era} · {gen.education}
          </p>
        </div>
      </div>

      {/* People — either flat or grouped */}
      {gen.people && (
        <div className="flex flex-wrap gap-3 justify-center">
          {gen.people.map((p) => (
            <PersonCard key={p.id} person={p} accent={accent} />
          ))}
        </div>
      )}

      {gen.groups && (
        <div className="space-y-6">
          {gen.groups.map((group, i) => (
            <div key={i}>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#6b6559' }}>
                ↳ {group.parent}
              </p>
              <div className="flex flex-wrap gap-3 pl-4 border-l-2" style={{ borderColor: accent }}>
                {group.people.map((p) => (
                  <PersonCard key={p.id} person={p} accent={accent} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connector line down to next gen */}
      <div
        className="absolute left-5 bottom-0 w-px"
        style={{ height: 32, backgroundColor: accent, top: '100%', transform: 'translateY(-32px)' }}
      />
    </div>
  );
}