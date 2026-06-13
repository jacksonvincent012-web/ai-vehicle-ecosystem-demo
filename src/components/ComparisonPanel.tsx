import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const ComparisonPanel: React.FC = () => {
  const { comparison, showComparison, toggleComparison } = useStore();

  if (!showComparison) return null;

  const metrics = [
    { label: 'Fuel Used', withAI: comparison.withAI.fuelUsed, withoutAI: comparison.withoutAI.fuelUsed, unit: 'L', icon: '⛽', better: 'lower' },
    { label: 'Travel Time', withAI: comparison.withAI.timeMin, withoutAI: comparison.withoutAI.timeMin, unit: 'min', icon: '⏱️', better: 'lower' },
    { label: 'Accidents', withAI: comparison.withAI.accidents, withoutAI: comparison.withoutAI.accidents, unit: '', icon: '💥', better: 'lower' },
    { label: 'Avg Speed', withAI: comparison.withAI.avgSpeed, withoutAI: comparison.withoutAI.avgSpeed, unit: 'km/h', icon: '🏎️', better: 'higher' },
    { label: 'CO₂ Emissions', withAI: comparison.withAI.emissions, withoutAI: comparison.withoutAI.emissions, unit: 'kg', icon: '🌱', better: 'lower' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && toggleComparison()}
    >
      <motion.div
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        className="glass-card p-6 w-full max-w-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" style={{ fontFamily: 'Orbitron' }}>
            📊 AI Impact Comparison
          </h2>
          <button onClick={toggleComparison} className="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Headers */}
        <div className="grid grid-cols-4 gap-3 mb-4 text-center">
          <div />
          <div className="text-xs font-semibold text-red-400 uppercase">❌ Without AI</div>
          <div className="text-xs font-semibold text-green-400 uppercase">✅ With AI</div>
          <div className="text-xs font-semibold text-cyan-400 uppercase">Improvement</div>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          {metrics.map((m, i) => {
            const improvement = m.better === 'lower'
              ? ((m.withoutAI - m.withAI) / m.withoutAI * 100)
              : ((m.withAI - m.withoutAI) / m.withoutAI * 100);

            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-4 gap-3 items-center p-2 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{m.icon}</span>
                  <span className="text-xs text-gray-300">{m.label}</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-mono text-red-400">{m.withoutAI}</span>
                  <span className="text-[10px] text-gray-500 ml-1">{m.unit}</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-mono text-green-400">{m.withAI}</span>
                  <span className="text-[10px] text-gray-500 ml-1">{m.unit}</span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold font-mono ${improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement).toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-center">
          <div className="text-xs text-gray-400 mb-1">Overall AI Improvement</div>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400" style={{ fontFamily: 'Orbitron' }}>
            {((metrics.reduce((sum, m) => {
              const imp = m.better === 'lower'
                ? ((m.withoutAI - m.withAI) / m.withoutAI * 100)
                : ((m.withAI - m.withoutAI) / m.withoutAI * 100);
              return sum + imp;
            }, 0)) / metrics.length).toFixed(1)}% Better
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComparisonPanel;
