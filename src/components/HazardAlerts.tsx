import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: '#ff3355', bg: 'rgba(255,51,85,0.1)', border: 'rgba(255,51,85,0.3)' },
  high: { color: '#ff8800', bg: 'rgba(255,136,0,0.1)', border: 'rgba(255,136,0,0.3)' },
  medium: { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.3)' },
  low: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)' },
};

const hazardIcons: Record<string, string> = {
  accident: '💥', debris: '🪨', weather: '⛈️', construction: '🚧', animal: '🦌',
  pedestrian: '🚶', vehicle_breakdown: '🔧', road_damage: '🕳️', flooding: '🌊', fire: '🔥',
};

const HazardAlerts: React.FC = () => {
  const { hazards, alerts, dismissAlert, removeHazard } = useStore();
  const activeHazards = hazards.filter(h => h.isActive);
  const activeAlerts = alerts.filter(a => !a.acknowledged).slice(0, 10);

  return (
    <div className="glass-card p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>
          ⚠️ Hazards & Alerts
        </h3>
        <div className="flex items-center gap-1.5">
          {activeHazards.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">
              {activeHazards.length} active
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar" style={{ maxHeight: '250px' }}>
        <AnimatePresence>
          {/* Active Hazards */}
          {activeHazards.map(h => {
            const cfg = severityConfig[h.severity] || severityConfig.low;
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                className={`p-2 rounded-md border ${h.severity === 'critical' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{hazardIcons[h.type] || '⚠️'}</span>
                    <div>
                      <div className="text-[11px] font-semibold" style={{ color: cfg.color }}>
                        {h.type.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="text-[9px] text-gray-500">{h.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {h.severity}
                    </span>
                    <button onClick={() => removeHazard(h.id)} className="text-gray-600 hover:text-white text-xs ml-1">✕</button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* System Alerts */}
          {activeAlerts.map(alert => {
            const cfg = severityConfig[alert.severity] || severityConfig.low;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-2 rounded-md border"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold" style={{ color: cfg.color }}>{alert.title}</div>
                    <div className="text-[9px] text-gray-500 truncate">{alert.message}</div>
                  </div>
                  <button onClick={() => dismissAlert(alert.id)} className="text-gray-600 hover:text-white text-xs ml-2">✕</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {activeHazards.length === 0 && activeAlerts.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">
            ✅ No active hazards or alerts
          </div>
        )}
      </div>
    </div>
  );
};

export default HazardAlerts;
