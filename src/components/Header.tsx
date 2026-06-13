import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const Header: React.FC = () => {
  const [clock, setClock] = useState(new Date());
  const { isSimulating, isPaused, stepCount, isConnected, connectionLatency, stats, user, logout, toggleHowItWorks, toggleComparison, toggleAIConsole, soundEnabled, toggleSound, mapMode, setMapMode, exportData, sidebarCollapsed, toggleSidebar } = useStore();

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="glass-card border-b border-white/5 px-4 py-2 flex items-center justify-between relative z-30 gap-2 flex-wrap">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="text-gray-400 hover:text-cyan-400 transition-colors text-lg" title="Toggle Sidebar">
          {sidebarCollapsed ? '☰' : '✕'}
        </button>
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
          <span className="text-2xl">🚗</span>
          <div>
            <h1 className="text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" style={{ fontFamily: 'Orbitron' }}>
              AI Vehicle Ecosystem
            </h1>
            <p className="text-[10px] text-gray-500 hidden md:block">Predictive Negotiation & Fuel Management</p>
          </div>
        </motion.div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isSimulating && !isPaused ? 'bg-green-400 animate-pulse' : isPaused ? 'bg-yellow-400' : 'bg-gray-500'}`} />
          <span className="text-gray-400 hidden sm:inline">{isSimulating ? (isPaused ? 'Paused' : 'Running') : 'Idle'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
          <span className="text-gray-400 hidden sm:inline">{isConnected ? `${connectionLatency}ms` : 'Offline'}</span>
        </div>
        <div className="text-gray-500 hidden md:block">Step: <span className="text-cyan-400">{stepCount}</span></div>
        <div className="text-gray-500 hidden md:block">AI: <span className="text-green-400">{stats.predictionAccuracy.toFixed(1)}%</span></div>
        <div className="text-gray-500 hidden lg:block">Efficiency: <span className="text-purple-400">{stats.efficiencyScore.toFixed(1)}%</span></div>
      </div>

      {/* Clock & Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button onClick={toggleAIConsole} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors text-sm" title="AI Console">🤖</button>
          <button onClick={toggleComparison} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-green-400 transition-colors text-sm" title="Comparison">📊</button>
          <button onClick={toggleHowItWorks} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors text-sm" title="How It Works">❓</button>
          <button onClick={toggleSound} className={`p-1.5 rounded hover:bg-white/10 transition-colors text-sm ${soundEnabled ? 'text-yellow-400' : 'text-gray-500'}`} title="Sound">{soundEnabled ? '🔊' : '🔇'}</button>
          <button onClick={() => setMapMode(mapMode === '2d' ? '3d' : '2d')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors text-sm" title="Toggle Map">{mapMode === '2d' ? '🗺️' : '🌐'}</button>
          <button onClick={() => exportData('json')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-orange-400 transition-colors text-sm" title="Export">📥</button>
        </div>
        <div className="text-cyan-400 font-mono text-xs md:text-sm tabular-nums border-l border-white/10 pl-2">
          {clock.toLocaleTimeString()}
        </div>
        {user && (
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
            <span className="text-xs text-gray-400 hidden lg:inline">{user.name}</span>
            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300" title="Logout">⏻</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
