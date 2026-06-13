import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const ScenarioPanel: React.FC = () => {
  const { scenarios, activeScenario, runScenario, isSimulating, isPaused, startSimulation, stopSimulation, pauseSimulation, resumeSimulation, stepSimulation, resetSimulation, simulationSpeed, setSimulationSpeed } = useStore();

  const difficultyColors: Record<string, string> = { easy: '#00ff88', medium: '#ffaa00', hard: '#ff6644', extreme: '#ff3355' };

  return (
    <div className="glass-card p-3">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2" style={{ fontFamily: 'Orbitron' }}>Scenario Control</h3>
      
      {/* Scenario Buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {scenarios.map(s => (
          <motion.button
            key={s.id}
            onClick={() => runScenario(s.id)}
            className={`text-[10px] px-2 py-1.5 rounded-md border transition-all ${activeScenario === s.id ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={s.description}
          >
            <span className="mr-1">{s.icon}</span>
            {s.name}
            <span className="ml-1 text-[8px]" style={{ color: difficultyColors[s.difficulty] }}>●</span>
          </motion.button>
        ))}
      </div>

      {/* Simulation Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {!isSimulating ? (
          <button onClick={startSimulation} className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md text-xs hover:bg-green-500/30 transition-colors">
            ▶ Start
          </button>
        ) : isPaused ? (
          <button onClick={resumeSimulation} className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md text-xs hover:bg-cyan-500/30 transition-colors">
            ▶ Resume
          </button>
        ) : (
          <button onClick={pauseSimulation} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-md text-xs hover:bg-yellow-500/30 transition-colors">
            ⏸ Pause
          </button>
        )}
        
        <button onClick={stopSimulation} className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-xs hover:bg-red-500/30 transition-colors">
          ⏹ Stop
        </button>
        
        <button onClick={stepSimulation} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-md text-xs hover:bg-purple-500/30 transition-colors">
          ⏭ Step
        </button>
        
        <button onClick={resetSimulation} className="px-3 py-1.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-md text-xs hover:bg-gray-500/30 transition-colors">
          ↺ Reset
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-gray-500">Speed:</span>
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSimulationSpeed(s)}
              className={`text-[10px] px-1.5 py-0.5 rounded ${simulationSpeed === s ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-gray-500 hover:text-white'}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Active scenario info */}
      {activeScenario && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2 rounded-md bg-cyan-500/5 border border-cyan-500/15">
          <div className="text-[10px] text-cyan-400">
            🎬 Active: {scenarios.find(s => s.id === activeScenario)?.name} — {scenarios.find(s => s.id === activeScenario)?.description}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScenarioPanel;
