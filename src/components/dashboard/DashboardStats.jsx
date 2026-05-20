import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardStats({ evidence, allEvidence }) {
  const stats = useMemo(() => {
    const total = evidence.length;
    const verified = evidence.filter(e => e.status === 'verified').length;
    const byType = {};
    const byStatus = {};
    
    evidence.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });

    // Timeline data
    const timelineMap = {};
    evidence.forEach(item => {
      if (item.date_created) {
        const year = new Date(item.date_created).getFullYear();
        timelineMap[year] = (timelineMap[year] || 0) + 1;
      }
    });
    
    const timeline = Object.entries(timelineMap)
      .sort(([a], [b]) => a - b)
      .map(([year, count]) => ({ year: String(year), count }));

    return { total, verified, byType, byStatus, timeline };
  }, [evidence]);

  const typeData = Object.entries(stats.byType).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }));

  const colors = {
    document: '#8b7355',
    photograph: '#6b5b4f',
    artifact: '#a68b7a',
    testimony: '#7a6b5f',
    correspondence: '#9a8b7f',
    report: '#5a4b3f',
    physical_item: '#7a6b5b',
    other: '#8a7b6f'
  };

  const statusColors = {
    unreviewed: '#d4cdb8',
    reviewed: '#b8a685',
    verified: '#6b8e6f',
    disputed: '#c97761',
    archived: '#8a7b6f'
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
    >
      {/* Total Items */}
      <motion.div variants={item} className="p-6 rounded" style={{ backgroundColor: '#ffffff', borderLeft: '4px solid #1a1815' }}>
        <p className="text-sm" style={{ color: '#6b6559' }}>Total Evidence Items</p>
        <p className="text-3xl font-light mt-2" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
          {stats.total}
        </p>
      </motion.div>

      {/* Verified */}
      <motion.div variants={item} className="p-6 rounded" style={{ backgroundColor: '#f0f5f2', borderLeft: '4px solid #6b8e6f' }}>
        <p className="text-sm" style={{ color: '#6b6559' }}>Verified</p>
        <p className="text-3xl font-light mt-2" style={{ color: '#6b8e6f', fontFamily: 'Cormorant Garamond' }}>
          {stats.verified}
        </p>
        <p className="text-xs mt-2" style={{ color: '#6b6559' }}>
          {stats.total > 0 ? `${Math.round((stats.verified / stats.total) * 100)}%` : '0%'}
        </p>
      </motion.div>

      {/* Evidence Types */}
      <motion.div variants={item} className="p-6 rounded" style={{ backgroundColor: '#ffffff' }}>
        <p className="text-sm" style={{ color: '#6b6559' }} className="mb-4">Types</p>
        <div className="space-y-2">
          {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => (
            <div key={type} className="flex justify-between text-xs">
              <span style={{ color: '#6b6559' }}>{type.replace(/_/g, ' ')}</span>
              <span style={{ color: '#1a1815' }} className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* By Status */}
      <motion.div variants={item} className="p-6 rounded" style={{ backgroundColor: '#ffffff' }}>
        <p className="text-sm" style={{ color: '#6b6559' }} className="mb-4">Status Breakdown</p>
        <div className="space-y-2">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between text-xs">
              <span style={{ color: '#6b6559' }}>{status}</span>
              <span style={{ color: '#1a1815' }} className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Timeline Chart */}
      {stats.timeline.length > 1 && (
        <motion.div variants={item} className="md:col-span-2 p-6 rounded" style={{ backgroundColor: '#ffffff' }}>
          <p className="text-sm mb-4" style={{ color: '#6b6559' }}>Evidence Timeline</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4cdb8" />
              <XAxis dataKey="year" stroke="#8a7b6f" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8a7b6f" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#f4ede0', border: '1px solid #d4cdb8' }} />
              <Line type="monotone" dataKey="count" stroke="#6b5b4f" dot={{ fill: '#6b5b4f' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Type Distribution */}
      {typeData.length > 0 && (
        <motion.div variants={item} className="md:col-span-2 p-6 rounded" style={{ backgroundColor: '#ffffff' }}>
          <p className="text-sm mb-4" style={{ color: '#6b6559' }}>Evidence by Type</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.name] || '#8a7b6f'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#f4ede0', border: '1px solid #d4cdb8' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}