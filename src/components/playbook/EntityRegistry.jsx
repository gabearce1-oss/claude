import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Building2, MapPin, Sparkles, Archive, Briefcase, Download } from 'lucide-react';
import { seedEntities, normalizeKey } from './seedEntities';
import { listAll } from '@/lib/base44/pagination';

const TYPE_META = {
  person:       { Icon: Users,     label: 'People',        color: '#5a6b7a' },
  organization: { Icon: Building2, label: 'Organizations', color: '#8a6e3c' },
  place:        { Icon: MapPin,    label: 'Places',        color: '#4a5d3a' },
  tribe:        { Icon: Sparkles,  label: 'Tribes',        color: '#6b1f1f' },
  archive:      { Icon: Archive,   label: 'Archives',      color: '#3a3530' },
  case:         { Icon: Briefcase, label: 'Cases',         color: '#1a1815' },
};

export default function EntityRegistry() {
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: () => listAll(base44.entities.Entity),
  });

  const grouped = useMemo(() => {
    const out = {};
    Object.keys(TYPE_META).forEach((k) => (out[k] = []));
    entities.forEach((e) => {
      if (!out[e.entity_type]) out[e.entity_type] = [];
      out[e.entity_type].push(e);
    });
    return out;
  }, [entities]);

  const create = useMutation({
    mutationFn: (rows) => base44.entities.Entity.bulkCreate(rows),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entities'] }),
  });

  const handleSeed = async () => {
    setSeeding(true);
    const existingKeys = new Set(
      entities.map((e) => `${e.entity_type}::${normalizeKey(e.name)}`)
    );
    const toInsert = seedEntities
      .filter((s) => !existingKeys.has(`${s.entity_type}::${normalizeKey(s.name)}`))
      .map((s) => ({
        case_id: 'Terminel-Sagasta',
        ...s,
        normalized_key: normalizeKey(s.name),
      }));
    if (toInsert.length > 0) {
      await create.mutateAsync(toInsert);
    }
    setSeeding(false);
  };

  return (
    <div className="rounded p-5" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3
            style={{
              color: '#1a1815',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Entity Registry
          </h3>
          <p className="text-xs mt-1" style={{ color: '#6b6559' }}>
            Canonical people, places, orgs, tribes, and archives. Mirrors the Neo4j node model.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding || isLoading}
          className="text-xs px-3 py-1.5 rounded inline-flex items-center gap-1.5 disabled:opacity-50"
          style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
        >
          <Download className="w-3 h-3" />
          {seeding ? 'Seeding…' : 'Seed case entities'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(TYPE_META).map(([key, meta]) => {
          const list = grouped[key] || [];
          const Icon = meta.Icon;
          return (
            <div
              key={key}
              className="p-3 rounded"
              style={{
                backgroundColor: '#f9f5ed',
                border: '1px solid #ebe1ce',
                borderLeft: `4px solid ${meta.color}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  <span
                    className="text-xs"
                    style={{
                      color: meta.color,
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}>
                  {list.length}
                </span>
              </div>
              {list.length === 0 ? (
                <p className="text-xs italic" style={{ color: '#6b6559' }}>
                  None registered yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {list.slice(0, 8).map((e) => (
                    <li
                      key={e.id}
                      className="text-xs truncate"
                      style={{ color: '#1a1815' }}
                      title={e.name}
                    >
                      {e.name}
                      {e.aka?.length > 0 && (
                        <span className="ml-1" style={{ color: '#6b6559' }}>
                          ({e.aka.join(', ')})
                        </span>
                      )}
                    </li>
                  ))}
                  {list.length > 8 && (
                    <li className="text-xs italic" style={{ color: '#6b6559' }}>
                      +{list.length - 8} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}