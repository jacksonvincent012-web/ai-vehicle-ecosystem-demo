import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import SystemArchitecture from './SystemArchitecture';

const tabs = ['Overview', 'Architecture', 'AI Engine', 'Negotiation', 'Fuel Optimization'];

const HowItWorksModal: React.FC = () => {
  const { showHowItWorks, toggleHowItWorks } = useStore();
  const [activeTab, setActiveTab] = useState(0);

  if (!showHowItWorks) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && toggleHowItWorks()}
    >
      <motion.div
        initial={{ y: 40, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="glass-card p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto border border-white/10 custom-scrollbar"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" style={{ fontFamily: 'Orbitron' }}>
            ❓ How It Works
          </h2>
          <button onClick={toggleHowItWorks} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${activeTab === i ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === 0 && (
              <div className="space-y-4 text-sm text-gray-300">
                <p>The <span className="text-cyan-400 font-semibold">AI-Powered Self-Learning Vehicle Ecosystem</span> is a comprehensive fleet management system that uses predictive AI to optimize vehicle routing, fuel consumption, and inter-vehicle negotiations in real-time.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: '🧠', title: 'Predictive AI', desc: 'Traffic prediction using weighted moving averages with self-learning accuracy improvement' },
                    { icon: '🤝', title: 'V2V Negotiation', desc: 'Vehicle-to-vehicle negotiation at intersections, merges, and emergency scenarios' },
                    { icon: '⛽', title: 'Fuel Optimization', desc: 'Real-time fuel management with optimal refueling strategies and eco-driving' },
                    { icon: '🛡️', title: 'Hazard Detection', desc: 'Multi-factor risk assessment considering weather, road conditions, and traffic density' },
                    { icon: '📊', title: 'Fleet Analytics', desc: 'Comprehensive metrics tracking with historical data and predictive insights' },
                    { icon: '🎤', title: 'Voice Control', desc: 'Natural language commands for hands-free fleet management' },
                  ].map(f => (
                    <div key={f.title} className="glass-card p-3 border border-white/5">
                      <div className="text-xl mb-1">{f.icon}</div>
                      <div className="text-xs font-semibold text-white mb-1">{f.title}</div>
                      <div className="text-[10px] text-gray-500">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 1 && <SystemArchitecture />}

            {activeTab === 2 && (
              <div className="space-y-3 text-sm text-gray-300">
                <h3 className="text-sm font-bold text-cyan-400">AI Engine Components</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Traffic Predictor', desc: 'Uses weighted moving average (WMA) on 60-sample rolling windows. Calculates trend extrapolation for 30-minute forecasts. Anomaly detection via Z-score analysis (threshold: 2.5σ).', accuracy: '89-99%' },
                    { name: 'Fuel Optimizer', desc: 'Models fuel consumption as a function of speed², weight, terrain, and stop frequency. Optimal refueling scored by: price (30%), distance (40%), wait time (20%), rating (10%).', accuracy: '92-97%' },
                    { name: 'Hazard Detector', desc: 'Multi-factor risk scoring: slipperiness (35%), visibility (25%), speed (20%), density (15%), with weather multipliers (1.0-2.5x).', accuracy: '88-96%' },
                    { name: 'Self-Learning Module', desc: 'Tracks prediction vs actual outcomes. Adjusts model weights using gradient-based optimization. Accuracy improves from ~65% to ~99% over 200+ iterations.', accuracy: '65→99%' },
                  ].map(item => (
                    <div key={item.name} className="p-3 rounded bg-white/[0.03] border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">{item.name}</span>
                        <span className="text-[10px] text-green-400 font-mono">{item.accuracy}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-3 text-sm text-gray-300">
                <h3 className="text-sm font-bold text-yellow-400">Negotiation Protocol</h3>
                <div className="space-y-2">
                  {[
                    { type: '🔀 Intersection', desc: 'Priority scoring: Emergency (+100), Low Fuel<15% (+40), Urgency×8, Passengers×2, Public Transit (+15). Highest score proceeds first.' },
                    { type: '🔄 Merge', desc: 'Gap detection algorithm finds optimal merge points. Vehicles adjust speed to create safe gaps. Speed differentials minimized to <15 km/h.' },
                    { type: '🚨 Emergency', desc: 'All vehicles within 100px pull over (speed=0). Within 200px slow to 30% speed. Beyond 200px reduce by 40%. Auto-restore after 8-12 seconds.' },
                    { type: '⛽ Fuel Priority', desc: 'Vehicles ranked by fuel criticality. Most critical gets closest station. Others rerouted to avoid congestion at station.' },
                    { type: '↔️ Lane Change', desc: 'Consensus-based voting weighted by urgency. Vehicles exchange lane preferences and negotiate optimal assignments.' },
                  ].map(item => (
                    <div key={item.type} className="p-3 rounded bg-white/[0.03] border border-white/5">
                      <div className="text-xs font-semibold text-white mb-1">{item.type}</div>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-3 text-sm text-gray-300">
                <h3 className="text-sm font-bold text-green-400">Fuel Management System</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <p><strong className="text-white">Consumption Model:</strong> Base rate = 6.5 L/100km × speed_factor × weight_factor × terrain × stop_factor</p>
                  <p><strong className="text-white">Speed Factor:</strong> Optimal at 55 km/h. Increases quadratically: 1 + ((speed - 55) / 55)² × 0.3</p>
                  <p><strong className="text-white">Strategies:</strong></p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                      <div className="text-[10px] font-semibold text-green-400">🐢 Eco Mode</div>
                      <div className="text-[9px]">50% max speed, saves ~2.3L on heavy congestion routes</div>
                    </div>
                    <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
                      <div className="text-[10px] font-semibold text-cyan-400">⚡ Fast Mode</div>
                      <div className="text-[9px]">85% max speed, minimal fuel consideration</div>
                    </div>
                    <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                      <div className="text-[10px] font-semibold text-purple-400">⚖️ Balanced</div>
                      <div className="text-[9px]">65% max speed, optimal trade-off</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default HowItWorksModal;
