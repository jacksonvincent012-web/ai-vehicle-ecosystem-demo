import React from 'react';
import { motion } from 'framer-motion';

const ArchBox: React.FC<{ title: string; icon: string; color: string; items: string[]; delay: number }> = ({ title, icon, color, items, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-3 border hover:border-white/20 transition-all"
    style={{ borderColor: color + '30' }}
  >
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-bold" style={{ color }}>{title}</span>
    </div>
    <div className="space-y-0.5">
      {items.map(item => (
        <div key={item} className="text-[9px] text-gray-500 flex items-center gap-1">
          <span style={{ color }}>▸</span> {item}
        </div>
      ))}
    </div>
  </motion.div>
);

const SystemArchitecture: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-cyan-400 mb-2">System Architecture</h3>

      {/* Data Flow */}
      <div className="p-3 rounded bg-white/[0.02] border border-white/5 mb-4">
        <pre className="text-[9px] text-gray-400 font-mono leading-relaxed overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌─────────┬────────────┬───────────┬──────────┬─────────────┐ │
│  │ 2D Map  │   3D Map   │  Charts   │ Scenario │  AI Console │ │
│  │ Canvas  │  Three.js  │ Chart.js  │  Panel   │   Logs      │ │
│  └────┬────┴─────┬──────┴─────┬─────┴────┬─────┴──────┬──────┘ │
│       └──────────┴────────────┴──────────┴────────────┘        │
│                          │ Zustand Store │                      │
├──────────────────────────┴───────────────┴──────────────────────┤
│                    SIMULATION ENGINE                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Traffic  │  │   Fuel   │  │  Hazard  │  │ Negotiation  │   │
│  │Predictor │  │Optimizer │  │ Detector │  │   Engine     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                    Self-Learning Module                         │
└────────────────────────────────────────────────────────────────┘`}
        </pre>
      </div>

      {/* Component grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <ArchBox
          title="Presentation Layer"
          icon="🖥️"
          color="#00f0ff"
          items={['React 18 + TypeScript', 'Framer Motion animations', 'Canvas 2D + Three.js 3D', 'Chart.js visualizations', 'Web Speech API']}
          delay={0.1}
        />
        <ArchBox
          title="State Management"
          icon="💾"
          color="#7b61ff"
          items={['Zustand global store', 'Persist middleware', 'DevTools integration', 'Immutable updates', 'History snapshots']}
          delay={0.2}
        />
        <ArchBox
          title="AI Engine"
          icon="🧠"
          color="#00ff88"
          items={['Traffic prediction (WMA)', 'Fuel optimization', 'Hazard risk scoring', 'Self-learning weights', 'Anomaly detection']}
          delay={0.3}
        />
        <ArchBox
          title="Negotiation Protocol"
          icon="🤝"
          color="#ffaa00"
          items={['Priority scoring system', 'Intersection management', 'Emergency response', 'Merge coordination', 'Consensus voting']}
          delay={0.4}
        />
        <ArchBox
          title="Fleet Management"
          icon="🚗"
          color="#ff3355"
          items={['8 vehicle types', '15 road segments', '4 fuel stations', '5 demo scenarios', 'Real-time telemetry']}
          delay={0.5}
        />
        <ArchBox
          title="Analytics"
          icon="📊"
          color="#4ecdc4"
          items={['Traffic heatmaps', 'Fuel consumption charts', 'Learning progress', 'Comparison dashboard', 'Data export (JSON/CSV)']}
          delay={0.6}
        />
      </div>

      {/* Data flow description */}
      <div className="mt-4 p-3 rounded bg-purple-500/5 border border-purple-500/15">
        <h4 className="text-[10px] font-semibold text-purple-400 mb-2">Data Flow</h4>
        <div className="text-[9px] text-gray-500 space-y-1">
          <p>1. <span className="text-white">Simulation Step</span> → Updates vehicle positions, fuel, traffic conditions</p>
          <p>2. <span className="text-white">AI Analysis</span> → Traffic prediction, hazard detection, fuel optimization</p>
          <p>3. <span className="text-white">Negotiation Check</span> → Vehicle proximity triggers auto-negotiation</p>
          <p>4. <span className="text-white">Decision Execution</span> → Speed adjustments, route changes, refueling</p>
          <p>5. <span className="text-white">Learning Update</span> → Compare predictions vs outcomes, adjust weights</p>
          <p>6. <span className="text-white">UI Render</span> → Maps, charts, logs updated in real-time</p>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecture;
