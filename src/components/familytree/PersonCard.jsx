import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function PersonCard({ person, accent }) {
  const isKeeper = person.keeper;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded p-3 text-center min-w-[180px] max-w-[240px]"
      style={{
        backgroundColor: isKeeper ? '#1a1815' : '#ffffff',
        color: isKeeper ? '#f4ede0' : '#1a1815',
        border: `1px solid ${isKeeper ? '#1a1815' : accent || '#d4cdb8'}`,
        boxShadow: isKeeper ? '0 0 0 3px #b8a685' : 'none',
      }}
    >
      {isKeeper && (
        <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider mb-1" style={{ color: '#b8a685' }}>
          <Star className="w-3 h-3" /> Knowledge Keeper
        </div>
      )}
      <p className="text-sm font-medium leading-tight" style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.05rem' }}>
        {person.name}
      </p>
      {person.meta && (
        <p className="text-[11px] mt-1 leading-snug" style={{ color: isKeeper ? '#d4cdb8' : '#6b6559' }}>
          {person.meta}
        </p>
      )}
    </motion.div>
  );
}