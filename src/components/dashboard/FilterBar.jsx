import React from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FilterBar({ filters, setFilters }) {
  const evidenceTypes = ['document', 'photograph', 'artifact', 'testimony', 'correspondence', 'report', 'physical_item', 'other'];
  const statuses = ['unreviewed', 'reviewed', 'verified', 'disputed', 'archived'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4" style={{ color: '#8a7b6f' }} />
        <input
          type="text"
          placeholder="Search by title, evidence number, or tags..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded border"
          style={{ 
            borderColor: '#d4cdb8',
            backgroundColor: '#ffffff',
            color: '#1a1815'
          }}
        />
      </div>

      {/* Type & Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type */}
        <div>
          <label className="text-xs block mb-2" style={{ color: '#6b6559' }}>Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
          >
            <option value="all">All Types</option>
            {evidenceTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs block mb-2" style={{ color: '#6b6559' }}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-xs block mb-2" style={{ color: '#6b6559' }}>Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || null })}
              className="flex-1 px-3 py-2 rounded border text-sm"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || null })}
              className="flex-1 px-3 py-2 rounded border text-sm"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <div className="px-3 py-1 rounded text-xs flex items-center gap-2" style={{ backgroundColor: '#e8e0d0', color: '#1a1815' }}>
              Search: {filters.search}
              <button onClick={() => setFilters({ ...filters, search: '' })}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.type !== 'all' && (
            <div className="px-3 py-1 rounded text-xs flex items-center gap-2" style={{ backgroundColor: '#e8e0d0', color: '#1a1815' }}>
              Type: {filters.type}
              <button onClick={() => setFilters({ ...filters, type: 'all' })}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.status !== 'all' && (
            <div className="px-3 py-1 rounded text-xs flex items-center gap-2" style={{ backgroundColor: '#e8e0d0', color: '#1a1815' }}>
              Status: {filters.status}
              <button onClick={() => setFilters({ ...filters, status: 'all' })}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}