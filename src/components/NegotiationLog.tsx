import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const typeColors: Record<string, string> = {
  intersection: '#00f0ff',
  merge: '#00ff88',
  emergency: '#ff3355',
  fuel_priority: '#ffaa00',
  lane_change: '#7b61ff',
};

const typeIcons: Record<string, string> = {
  intersection: '🔀',
  merge: '🔄',
  emergency: '🚨',
  fuel_priority: '⛽',
  lane_change: '↔️',
};

const NegotiationLog: React.FC = () => {
  const { negotiations } = useStore();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>
          🤝 Negotiation Log
        </h3>
        <span className="text-[10px] text-cyan-400 font-mono">{negotiations.length} events</span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar" style={{ maxHeight: '250px' }}>
        <AnimatePresence>
          {negotiations.slice(0, 20).map((neg, i) => (
            <motion.div
              key={neg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-2 rounded-md border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{typeIcons[neg.type] || '🔀'}</span>
                  <span className="text-[10px] font-semibold" style={{ color: typeColors[neg.type] || '#ccc' }}>
                    {neg.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${neg.status === 'completed' ? 'bg-green-500/20 text-green-400' : neg.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' : neg.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {neg.status}
                  </span>
                  <span className="text-[9px] text-gray-600 font-mono">{formatTime(neg.initiatedAt)}</span>
                </div>
              </div>
              
              <div className="text-[10px] text-gray-500 mb-1">
                Vehicles: <span className="text-gray-300">{neg.vehicleIds.length}</span> involved
              </div>
              
              {neg.outcome && (
                <div className="text-[10px] text-gray-400 truncate">{neg.outcome}</div>
              )}

              {neg.speedAdjustments.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {neg.speedAdjustments.slice(0, 3).map((adj, j) => (
                    <span key={j} className="text-[8px] px-1 py-0.5 bg-white/5 rounded text-gray-500">
                      {adj.vehicleId}→{adj.newSpeed.toFixed(0)}km/h
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {negotiations.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">
            No negotiations yet. Start simulation to see activity.
          </div>
        )}
      </div>
    </div>
  );
};

export default NegotiationLog;
