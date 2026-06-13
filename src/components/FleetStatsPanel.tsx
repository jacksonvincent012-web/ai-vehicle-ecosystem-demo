import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string; suffix?: string }> = ({ label, value, icon, color, suffix }) => (
  <motion.div
    className="glass-card p-2.5 text-center hover:border-white/10 transition-all"
    whileHover={{ scale: 1.03, y: -2 }}
  >
    <div className="text-lg mb-0.5">{icon}</div>
    <div className="text-base md:text-lg font-bold font-mono" style={{ color }}>
      {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}
      {suffix && <span className="text-[10px] text-gray-500 ml-0.5">{suffix}</span>}
    </div>
    <div className="text-[9px] text-gray-500 mt-0.5 leading-tight">{label}</div>
  </motion.div>
);

const FleetStatsPanel: React.FC = () => {
  const { stats } = useStore();

  return (
    <div className="glass-card p-3">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2" style={{ fontFamily: 'Orbitron' }}>
        📊 Fleet Statistics
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Total Negotiations" value={stats.totalNegotiations} icon="🤝" color="#00f0ff" />
        <StatCard label="Accidents Prevented" value={stats.accidentsPreventedCount} icon="🛡️" color="#00ff88" />
        <StatCard label="Fuel Saved" value={stats.fuelSavedLiters} icon="⛽" color="#ffaa00" suffix="L" />
        <StatCard label="Time Saved" value={stats.timeSavedMinutes} icon="⏱️" color="#7b61ff" suffix="min" />
        <StatCard label="AI Accuracy" value={stats.predictionAccuracy} icon="🧠" color="#00f0ff" suffix="%" />
        <StatCard label="CO₂ Reduced" value={stats.co2Reduced} icon="🌱" color="#00ff88" suffix="kg" />
        <StatCard label="Efficiency" value={stats.efficiencyScore} icon="📈" color="#ffaa00" suffix="%" />
        <StatCard label="Safety Score" value={stats.safetyScore} icon="✅" color="#7b61ff" suffix="%" />
      </div>
    </div>
  );
};

export default FleetStatsPanel;
