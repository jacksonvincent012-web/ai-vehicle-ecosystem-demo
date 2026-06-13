// ============================================
// AI-POWERED VEHICLE ECOSYSTEM v4.0
// Complete Full-Stack Application with AR/VR & Voice
// ============================================

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useStore, VehicleData } from './store/useStore';
import Map3D from './components/Map3D';
import { VoiceCommands } from './components/VoiceCommands';
import { ARVRSupport } from './components/ARVRSupport';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getVehicleIcon = (type: string) => {
  const icons: Record<string, string> = { ambulance: '🚑', truck: '🚚', bus: '🚌', van: '🚐', suv: '🚙', police: '🚓', fire_truck: '🚒', motorcycle: '🏍️' };
  return icons[type] || '🚗';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { moving: 'bg-green-500', emergency: 'bg-red-500 animate-pulse', negotiating: 'bg-yellow-500', refueling: 'bg-orange-500', yielding: 'bg-purple-500', stopped: 'bg-gray-500', parking: 'bg-blue-500', waiting: 'bg-indigo-500' };
  return colors[status] || 'bg-gray-500';
};

const getFuelColor = (level: number) => level < 20 ? '#ff3355' : level < 50 ? '#ffaa00' : '#00ff88';

// ============================================
// LOADING SCREEN
// ============================================
const LoadingScreen: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center z-50 overflow-hidden">
    {/* Particle background */}
    <div className="absolute inset-0">
      {[...Array(60)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ width: Math.random() * 4 + 1, height: Math.random() * 4 + 1, background: ['#00f0ff', '#7b61ff', '#00ff88', '#ff3355'][i % 4], left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -200 - Math.random() * 300], opacity: [0, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}
    </div>
    
    <div className="text-center relative z-10">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <div className="text-7xl mb-6">🚗</div>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Orbitron' }}>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">AI Vehicle Ecosystem</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-gray-400 mb-8 text-lg">
        Predictive Negotiation & Fuel Management
      </motion.p>
      
      <div className="w-80 mx-auto">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Initializing AI Systems</span>
          <span className="text-cyan-400">{Math.min(100, Math.round(progress))}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 text-xs text-gray-600 space-y-1">
          {progress > 20 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ Neural networks loaded</motion.div>}
          {progress > 40 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ Fleet data synchronized</motion.div>}
          {progress > 60 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ Traffic prediction models ready</motion.div>}
          {progress > 80 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ WebSocket connection established</motion.div>}
          {progress > 95 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-cyan-400">✅ System online</motion.div>}
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// LOGIN SCREEN - Now uses Professional Login
// ============================================
import LoginPage from './components/LoginPage';

const LoginScreen: React.FC = () => {
  const { login } = useStore();
  return <LoginPage onLogin={login} />;
};

// ============================================
// HEADER
// ============================================
const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { user, logout, isConnected, connectionLatency, stats, isSimulating, stepCount } = useStore();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 px-4 py-2 flex items-center justify-between relative z-30">
      <div className="flex items-center gap-3">
        <motion.span className="text-2xl" animate={{ rotate: isSimulating ? 360 : 0 }} transition={{ duration: 3, repeat: isSimulating ? Infinity : 0, ease: 'linear' }}>🚗</motion.span>
        <div>
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500" style={{ fontFamily: 'Orbitron' }}>AI Vehicle Ecosystem</h1>
          <div className="text-[10px] text-gray-500 -mt-0.5">Predictive Negotiation & Fuel Management v3.0</div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full ml-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-400">{isConnected ? `WS ${connectionLatency}ms` : 'Offline'}</span>
        </div>
        {isSimulating && <span className="hidden lg:inline-block text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Step #{stepCount}</span>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex items-center gap-4 text-xs">
          <div><span className="text-gray-500">Vehicles:</span> <span className="text-cyan-400 font-bold">{stats.totalVehicles}</span></div>
          <div><span className="text-gray-500">Efficiency:</span> <span className="text-green-400 font-bold">{stats.efficiencyScore.toFixed(1)}%</span></div>
          <div><span className="text-gray-500">Safety:</span> <span className="text-purple-400 font-bold">{stats.safetyScore.toFixed(1)}%</span></div>
          <div><span className="text-gray-500">AI Acc:</span> <span className="text-pink-400 font-bold">{stats.predictionAccuracy.toFixed(1)}%</span></div>
        </div>
        <div className="text-right">
          <div className="text-cyan-400 font-mono text-sm">{format(time, 'HH:mm:ss')}</div>
          <div className="text-gray-500 text-[10px]">{format(time, 'MMM dd, yyyy')}</div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <div className="text-white text-xs font-medium">{user.name}</div>
              <div className="text-gray-500 text-[10px] capitalize">{user.role}</div>
            </div>
            <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800" title="Logout">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// ============================================
// VEHICLE CARD
// ============================================
const VehicleCard: React.FC<{ vehicle: VehicleData; isSelected: boolean; onClick: () => void }> = ({ vehicle, isSelected, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
    className={`p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-cyan-500/15 border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600'}`}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xl">{getVehicleIcon(vehicle.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm truncate">{vehicle.name}</div>
        <div className="text-[10px] text-gray-500 uppercase">{vehicle.type} • {vehicle.plateNumber}</div>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusColor(vehicle.status)}`} />
    </div>
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-gray-400">Fuel</span>
        <span style={{ color: getFuelColor(vehicle.fuelLevel) }}>{vehicle.fuelLevel.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: getFuelColor(vehicle.fuelLevel) }} animate={{ width: `${vehicle.fuelLevel}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1 text-[10px]">
      <div className="bg-gray-700/30 rounded px-1.5 py-1 text-center">
        <div className="text-gray-500">SPD</div>
        <div className="text-cyan-400 font-bold">{vehicle.speed}</div>
      </div>
      <div className="bg-gray-700/30 rounded px-1.5 py-1 text-center">
        <div className="text-gray-500">URG</div>
        <div className={`font-bold ${vehicle.urgency >= 8 ? 'text-red-400' : vehicle.urgency >= 5 ? 'text-yellow-400' : 'text-green-400'}`}>{vehicle.urgency}/10</div>
      </div>
      <div className="bg-gray-700/30 rounded px-1.5 py-1 text-center">
        <div className="text-gray-500">ETA</div>
        <div className="text-purple-400 font-bold">{vehicle.eta}m</div>
      </div>
    </div>
  </motion.div>
);

// ============================================
// VEHICLE DETAIL PANEL
// ============================================
const VehicleDetailPanel: React.FC = () => {
  const { selectedVehicleId, vehicles, selectVehicle, optimizeRoute } = useStore();
  const vehicle = vehicles.find(v => v.id === selectedVehicleId);
  if (!vehicle) return null;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="absolute left-[290px] top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 p-4 overflow-y-auto z-20 hidden xl:block">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>Vehicle Details</h3>
        <button onClick={() => selectVehicle(null)} className="text-gray-400 hover:text-white text-xs">✕</button>
      </div>
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">{getVehicleIcon(vehicle.type)}</div>
        <h4 className="text-lg font-bold text-white">{vehicle.name}</h4>
        <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)} bg-opacity-20`}>{vehicle.status.toUpperCase()}</span>
      </div>

      {/* Circular fuel gauge */}
      <div className="flex justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1f2937" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={getFuelColor(vehicle.fuelLevel)} strokeWidth="8" strokeDasharray={`${vehicle.fuelLevel * 2.64} 264`} strokeLinecap="round" className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getFuelColor(vehicle.fuelLevel) }}>{vehicle.fuelLevel.toFixed(0)}%</span>
            <span className="text-[10px] text-gray-500">FUEL</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        {[
          { label: 'Speed', value: `${vehicle.speed} km/h`, color: 'text-cyan-400' },
          { label: 'Rec. Speed', value: `${vehicle.recommendedSpeed} km/h`, color: 'text-green-400' },
          { label: 'Urgency', value: `${vehicle.urgency}/10`, color: vehicle.urgency >= 8 ? 'text-red-400' : 'text-yellow-400' },
          { label: 'Passengers', value: `${vehicle.passengerCount}`, color: 'text-purple-400' },
          { label: 'Distance', value: `${vehicle.distanceTraveled.toFixed(0)} km`, color: 'text-blue-400' },
          { label: 'Fuel Used', value: `${vehicle.fuelConsumed.toFixed(1)} L`, color: 'text-orange-400' },
          { label: 'Engine °C', value: `${vehicle.engineTemp}°`, color: vehicle.engineTemp > 100 ? 'text-red-400' : 'text-green-400' },
          { label: 'Health', value: `${vehicle.healthScore}%`, color: vehicle.healthScore > 80 ? 'text-green-400' : 'text-yellow-400' },
          { label: 'CO₂', value: `${vehicle.co2Emissions.toFixed(1)}kg`, color: 'text-teal-400' },
          { label: 'Odometer', value: `${(vehicle.odometerKm / 1000).toFixed(0)}k`, color: 'text-gray-400' }
        ].map((item, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-gray-500 text-[10px]">{item.label}</div>
            <div className={`font-bold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h5 className="text-xs text-gray-400 font-semibold">Route Optimization</h5>
        {(['fuel_saving', 'fastest', 'balanced'] as const).map(mode => (
          <button key={mode} onClick={() => optimizeRoute(vehicle.id, mode)}
            className="w-full px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-xs text-left transition-colors">
            <span className="capitalize">{mode.replace('_', ' ')}</span>
            <span className="text-gray-500 float-right">
              {mode === 'fuel_saving' ? '⛽ -30%' : mode === 'fastest' ? '⚡ -15min' : '⚖️ Optimal'}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// SCENARIO PANEL
// ============================================
const ScenarioPanel: React.FC = () => {
  const { scenarios, activeScenario, runScenario, isSimulating, isPaused, simulationSpeed,
    startSimulation, stopSimulation, pauseSimulation, resumeSimulation,
    setSimulationSpeed, stepSimulation, resetSimulation } = useStore();

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: 'Orbitron' }}>🎬 Scenario Control</h3>
      <div className="grid grid-cols-5 gap-2 mb-3">
        {scenarios.map(s => (
          <motion.button key={s.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => runScenario(s.id)}
            className={`p-2 rounded-lg text-center transition-all ${activeScenario === s.id ? 'bg-cyan-500/20 border-2 border-cyan-500' : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'}`}>
            <div className="text-lg">{s.icon}</div>
            <div className="text-[9px] text-gray-300 truncate">{s.name}</div>
            <div className={`text-[8px] mt-0.5 ${s.difficulty === 'extreme' ? 'text-red-400' : s.difficulty === 'hard' ? 'text-orange-400' : 'text-green-400'}`}>{s.difficulty}</div>
          </motion.button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={isSimulating ? (isPaused ? resumeSimulation : pauseSimulation) : startSimulation}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${isSimulating && !isPaused ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
          {isSimulating ? (isPaused ? '▶ Resume' : '⏸ Pause') : '▶ Start'}
        </button>
        <button onClick={stopSimulation} className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white text-xs font-semibold">⏹ Stop</button>
        <button onClick={stepSimulation} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xs">⏭ Step</button>
        <button onClick={resetSimulation} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xs">🔄 Reset</button>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-gray-500 text-[10px]">Speed:</span>
          {[1, 2, 5, 10].map(sp => (
            <button key={sp} onClick={() => setSimulationSpeed(sp)} className={`px-2 py-1 rounded text-[10px] ${simulationSpeed === sp ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{sp}x</button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// TOOLBAR
// ============================================
const Toolbar: React.FC = () => {
  const { mapMode, setMapMode, showTraffic, toggleTraffic, showWeather, toggleWeather,
    showHazards, toggleHazards, showHeatMap, toggleHeatMap, showAIConsole, toggleAIConsole,
    showComparison, toggleComparison, showHowItWorks, toggleHowItWorks,
    soundEnabled, toggleSound, exportData } = useStore();

  const buttons = [
    { icon: '🚦', active: showTraffic, toggle: toggleTraffic, label: 'Traffic' },
    { icon: '🌧️', active: showWeather, toggle: toggleWeather, label: 'Weather' },
    { icon: '⚠️', active: showHazards, toggle: toggleHazards, label: 'Hazards' },
    { icon: '🗺️', active: showHeatMap, toggle: toggleHeatMap, label: 'HeatMap' },
    { icon: '🧠', active: showAIConsole, toggle: toggleAIConsole, label: 'AI' },
    { icon: '📊', active: showComparison, toggle: toggleComparison, label: 'Compare' },
    { icon: '❓', active: showHowItWorks, toggle: toggleHowItWorks, label: 'How' },
    { icon: soundEnabled ? '🔊' : '🔇', active: soundEnabled, toggle: toggleSound, label: 'Sound' }
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-gray-800/50">
      <div className="flex bg-gray-800/50 rounded-lg p-0.5">
        {(['2d', '3d'] as const).map(mode => (
          <button key={mode} onClick={() => setMapMode(mode)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${mapMode === mode ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {mode.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-0.5">
        {buttons.map((b, i) => (
          <button key={i} onClick={b.toggle} title={b.label}
            className={`p-1.5 rounded-lg text-sm transition-colors ${b.active ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}>
            {b.icon}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button onClick={() => exportData('json')} className="px-2 py-1 bg-gray-800/50 hover:bg-gray-700 rounded text-[10px] text-gray-400 transition-colors">📥 JSON</button>
        <button onClick={() => exportData('csv')} className="px-2 py-1 bg-gray-800/50 hover:bg-gray-700 rounded text-[10px] text-gray-400 transition-colors">📊 CSV</button>
      </div>
    </div>
  );
};

// ============================================
// 2D MAP
// ============================================
const Map2D: React.FC = () => {
  const { vehicles, roadSegments, fuelStations, hazards, selectedVehicleId, selectVehicle, showTraffic, showHazards: showHazardsState, showWeather } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const dw = w / 2, dh = h / 2;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, dw, dh);

    // Grid
    ctx.strokeStyle = '#111122';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < dw; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, dh); ctx.stroke(); }
    for (let i = 0; i < dh; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(dw, i); ctx.stroke(); }

    // Roads
    roadSegments.forEach(seg => {
      const congColor = !showTraffic ? '#333' : seg.congestionLevel > 70 ? '#ff3355' : seg.congestionLevel > 40 ? '#ffaa00' : '#00ff88';
      ctx.strokeStyle = congColor;
      ctx.lineWidth = seg.lanes * 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(seg.startPoint.x, seg.startPoint.y);
      ctx.lineTo(seg.endPoint.x, seg.endPoint.y);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Weather overlay
      if (showWeather && seg.weather !== 'clear') {
        ctx.strokeStyle = seg.weather === 'rain' || seg.weather === 'heavy_rain' ? '#4488ff33' : '#ffffff33';
        ctx.lineWidth = seg.lanes * 10;
        ctx.beginPath();
        ctx.moveTo(seg.startPoint.x, seg.startPoint.y);
        ctx.lineTo(seg.endPoint.x, seg.endPoint.y);
        ctx.stroke();
      }

      // Dashed center lines
      ctx.strokeStyle = '#ffffff40';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(seg.startPoint.x, seg.startPoint.y);
      ctx.lineTo(seg.endPoint.x, seg.endPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Segment label
      const mx = (seg.startPoint.x + seg.endPoint.x) / 2;
      const my = (seg.startPoint.y + seg.endPoint.y) / 2;
      ctx.fillStyle = '#ffffff30';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(seg.name, mx, my - 8);
    });

    // Fuel stations
    fuelStations.forEach(st => {
      const glow = ctx.createRadialGradient(st.position.x, st.position.y, 0, st.position.x, st.position.y, 20);
      glow.addColorStop(0, '#00f0ff30'); glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; ctx.fillRect(st.position.x - 20, st.position.y - 20, 40, 40);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath(); ctx.arc(st.position.x, st.position.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⛽', st.position.x, st.position.y + 4);
      ctx.fillStyle = '#00f0ff80'; ctx.font = '7px sans-serif';
      ctx.fillText(`$${st.fuelPrice}`, st.position.x, st.position.y + 20);
    });

    // Hazards
    if (showHazardsState) {
      hazards.filter(h => h.isActive).forEach(hz => {
        const c = hz.severity === 'critical' ? '#ff0000' : hz.severity === 'high' ? '#ff6600' : '#ffaa00';
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = c + '33';
        ctx.beginPath(); ctx.arc(hz.position.x, hz.position.y, 20, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = c; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hz.position.x, hz.position.y, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = c; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('⚠️', hz.position.x, hz.position.y + 5);
      });
    }

    // Vehicles
    vehicles.forEach(v => {
      const isSelected = v.id === selectedVehicleId;

      // Selection glow
      if (isSelected) {
        const glow = ctx.createRadialGradient(v.position.x, v.position.y, 0, v.position.x, v.position.y, 30);
        glow.addColorStop(0, '#00f0ff40'); glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.fillRect(v.position.x - 30, v.position.y - 30, 60, 60);
        ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(v.position.x, v.position.y, 16, 0, Math.PI * 2); ctx.stroke();
      }

      // Emergency pulse
      if (v.status === 'emergency') {
        const pulse = (Date.now() % 500) / 500;
        ctx.globalAlpha = 1 - pulse;
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(v.position.x, v.position.y, 12 + pulse * 20, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Vehicle body
      ctx.save();
      ctx.translate(v.position.x, v.position.y);
      ctx.rotate(v.heading * Math.PI / 180);
      
      // Shadow
      ctx.fillStyle = '#00000040';
      ctx.fillRect(-9, -5, 18, 10);

      // Body
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.roundRect(-10, -6, 20, 12, 3);
      ctx.fill();
      
      // Windshield
      ctx.fillStyle = '#ffffff40';
      ctx.fillRect(4, -4, 4, 8);
      
      // Direction arrow
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(7, -3); ctx.lineTo(7, 3); ctx.closePath(); ctx.fill();
      ctx.restore();

      // Label
      ctx.fillStyle = isSelected ? '#00f0ff' : '#ffffff80';
      ctx.font = `${isSelected ? 'bold ' : ''}8px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(v.name, v.position.x, v.position.y - 14);
      
      // Mini fuel bar
      const barW = 16, barH = 2;
      ctx.fillStyle = '#333';
      ctx.fillRect(v.position.x - barW / 2, v.position.y + 10, barW, barH);
      ctx.fillStyle = getFuelColor(v.fuelLevel);
      ctx.fillRect(v.position.x - barW / 2, v.position.y + 10, barW * (v.fuelLevel / 100), barH);
    });

    animRef.current = requestAnimationFrame(draw);
  }, [vehicles, roadSegments, fuelStations, hazards, selectedVehicleId, showTraffic, showHazardsState, showWeather]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clicked = vehicles.find(v => Math.hypot(v.position.x - x, v.position.y - y) < 15);
    selectVehicle(clicked?.id || null);
  };

  return <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full cursor-pointer" style={{ minHeight: '350px' }} />;
};

// ============================================
// STATS PANEL
// ============================================
const StatsPanel: React.FC = () => {
  const stats = useStore(s => s.stats);
  const items = [
    { label: 'Negotiations', value: stats.totalNegotiations, icon: '🤝', color: 'text-cyan-400' },
    { label: 'Accidents Prevented', value: stats.accidentsPreventedCount, icon: '🛡️', color: 'text-green-400' },
    { label: 'Fuel Saved', value: `${stats.fuelSavedLiters.toFixed(1)}L`, icon: '⛽', color: 'text-orange-400' },
    { label: 'Time Saved', value: `${stats.timeSavedMinutes.toFixed(0)}min`, icon: '⏱️', color: 'text-purple-400' },
    { label: 'AI Accuracy', value: `${stats.predictionAccuracy.toFixed(1)}%`, icon: '🧠', color: 'text-pink-400' },
    { label: 'CO₂ Reduced', value: `${stats.co2Reduced.toFixed(1)}kg`, icon: '🌍', color: 'text-teal-400' },
    { label: 'Efficiency', value: `${stats.efficiencyScore.toFixed(1)}%`, icon: '📈', color: 'text-blue-400' },
    { label: 'Learning Cycles', value: Math.floor(stats.learningIterations), icon: '🔄', color: 'text-indigo-400' }
  ];

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: 'Orbitron' }}>📊 Fleet Statistics</h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-gray-800/30 rounded-lg p-2 text-center">
            <div className="text-lg">{item.icon}</div>
            <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
            <div className="text-[9px] text-gray-500">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// CHARTS PANEL
// ============================================
const ChartsPanel: React.FC = () => {
  const { congestionHistory, learningHistory, vehicles } = useStore();

  const chartOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a2e', borderColor: '#00f0ff', borderWidth: 1 } },
    scales: { x: { grid: { color: '#1a1a2e' }, ticks: { color: '#666', font: { size: 9 } } }, y: { grid: { color: '#1a1a2e' }, ticks: { color: '#666', font: { size: 9 } } } }
  }), []);

  const congestionData = useMemo(() => {
    const labels = congestionHistory.slice(-20).map((_, i) => `${i}`);
    const seg1 = congestionHistory.slice(-20).map(h => h.segments.find(s => s.id === 'seg_4')?.level || 0);
    const seg2 = congestionHistory.slice(-20).map(h => h.segments.find(s => s.id === 'seg_10')?.level || 0);
    const seg3 = congestionHistory.slice(-20).map(h => h.segments.find(s => s.id === 'seg_15')?.level || 0);
    return {
      labels,
      datasets: [
        { label: 'Central Park', data: seg1, borderColor: '#ff3355', backgroundColor: '#ff335520', tension: 0.4, fill: true, pointRadius: 0 },
        { label: 'Shopping Dist', data: seg2, borderColor: '#ffaa00', backgroundColor: '#ffaa0020', tension: 0.4, fill: true, pointRadius: 0 },
        { label: 'Downtown', data: seg3, borderColor: '#00f0ff', backgroundColor: '#00f0ff20', tension: 0.4, fill: true, pointRadius: 0 }
      ]
    };
  }, [congestionHistory]);

  const fuelData = useMemo(() => ({
    labels: vehicles.map(v => v.name.split(' ')[0]),
    datasets: [{
      data: vehicles.map(v => v.fuelLevel),
      backgroundColor: vehicles.map(v => getFuelColor(v.fuelLevel) + '80'),
      borderColor: vehicles.map(v => getFuelColor(v.fuelLevel)),
      borderWidth: 1, borderRadius: 4
    }]
  }), [vehicles]);

  const learningData = useMemo(() => ({
    labels: learningHistory.map(l => `${l.iteration}`),
    datasets: [{
      label: 'Accuracy', data: learningHistory.map(l => l.accuracy),
      borderColor: '#7b61ff', backgroundColor: '#7b61ff20', tension: 0.4, fill: true, pointRadius: 1, pointBackgroundColor: '#7b61ff'
    }]
  }), [learningHistory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="glass-card p-3">
        <h4 className="text-xs font-bold text-gray-300 mb-2">🚦 Traffic Congestion</h4>
        <div className="h-36"><Line data={congestionData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: true, labels: { color: '#888', font: { size: 8 } } } } }} /></div>
      </div>
      <div className="glass-card p-3">
        <h4 className="text-xs font-bold text-gray-300 mb-2">⛽ Fuel Levels</h4>
        <div className="h-36"><Bar data={fuelData} options={chartOpts} /></div>
      </div>
      <div className="glass-card p-3">
        <h4 className="text-xs font-bold text-gray-300 mb-2">🧠 AI Learning Progress</h4>
        <div className="h-36"><Line data={learningData} options={chartOpts} /></div>
      </div>
    </div>
  );
};

// ============================================
// NEGOTIATION LOG
// ============================================
const NegotiationLog: React.FC = () => {
  const negotiations = useStore(s => s.negotiations);
  const typeColors: Record<string, string> = { intersection: 'text-cyan-400 bg-cyan-500/10', merge: 'text-green-400 bg-green-500/10', emergency: 'text-red-400 bg-red-500/10', fuel_priority: 'text-orange-400 bg-orange-500/10', lane_change: 'text-purple-400 bg-purple-500/10' };

  return (
    <div className="glass-card p-3 h-56 overflow-y-auto">
      <h4 className="text-xs font-bold text-gray-300 mb-2 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-1">🤝 Negotiation Log</h4>
      <div className="space-y-1.5">
        {negotiations.slice(0, 15).map(neg => (
          <motion.div key={neg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className={`p-2 rounded-lg text-[10px] border ${neg.status === 'completed' ? 'border-green-800/50 bg-green-900/10' : neg.status === 'in_progress' ? 'border-yellow-800/50 bg-yellow-900/10' : 'border-gray-800 bg-gray-800/30'}`}>
            <div className="flex items-center justify-between">
              <span className={`px-1.5 py-0.5 rounded font-semibold ${typeColors[neg.type] || 'text-gray-400'}`}>{neg.type.replace('_', ' ')}</span>
              <span className={`${neg.status === 'completed' ? 'text-green-400' : neg.status === 'in_progress' ? 'text-yellow-400' : 'text-gray-500'}`}>{neg.status}</span>
            </div>
            <div className="text-gray-500 mt-0.5">Vehicles: {neg.vehicleIds.join(', ')}</div>
            {neg.outcome && <div className="text-gray-400 mt-0.5 truncate">{neg.outcome}</div>}
          </motion.div>
        ))}
        {negotiations.length === 0 && <div className="text-gray-600 text-center py-6 text-xs">No negotiations yet. Start simulation!</div>}
      </div>
    </div>
  );
};

// ============================================
// HAZARD ALERTS
// ============================================
const HazardPanel: React.FC = () => {
  const { hazards, removeHazard } = useStore();
  const active = hazards.filter(h => h.isActive);
  const sevColors: Record<string, string> = { critical: 'border-red-500 bg-red-900/20', high: 'border-orange-500 bg-orange-900/20', medium: 'border-yellow-500 bg-yellow-900/20', low: 'border-gray-500 bg-gray-900/20' };

  return (
    <div className="glass-card p-3 h-56 overflow-y-auto">
      <h4 className="text-xs font-bold text-gray-300 mb-2 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-1">⚠️ Active Hazards ({active.length})</h4>
      <div className="space-y-1.5">
        {active.map(h => (
          <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`p-2 rounded-lg text-[10px] border ${sevColors[h.severity]} ${h.severity === 'critical' ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="capitalize text-gray-300 font-semibold">{h.type.replace(/_/g, ' ')}</span>
              <button onClick={() => removeHazard(h.id)} className="text-gray-500 hover:text-white text-xs">✕</button>
            </div>
            <div className="text-gray-500">{h.segmentId} • {h.severity.toUpperCase()}</div>
          </motion.div>
        ))}
        {active.length === 0 && <div className="text-gray-600 text-center py-6 text-xs">No active hazards ✅</div>}
      </div>
    </div>
  );
};

// ============================================
// AI CONSOLE
// ============================================
const AIConsole: React.FC = () => {
  const { aiLogs, showAIConsole, toggleAIConsole } = useStore();
  if (!showAIConsole) return null;

  const typeStyles: Record<string, string> = {
    decision: 'bg-cyan-500/20 text-cyan-400', prediction: 'bg-purple-500/20 text-purple-400',
    learning: 'bg-blue-500/20 text-blue-400', optimization: 'bg-green-500/20 text-green-400',
    negotiation: 'bg-yellow-500/20 text-yellow-400', warning: 'bg-red-500/20 text-red-400',
    info: 'bg-gray-500/20 text-gray-400', voice: 'bg-pink-500/20 text-pink-400'
  };

  return (
    <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-16 w-96 max-h-[70vh] bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden z-40 shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <h3 className="text-xs font-bold text-cyan-400" style={{ fontFamily: 'Orbitron' }}>🧠 AI Reasoning Console</h3>
        <button onClick={toggleAIConsole} className="text-gray-500 hover:text-white text-xs">✕</button>
      </div>
      <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1.5">
        {aiLogs.slice(0, 30).map(log => (
          <motion.div key={log.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/30 rounded-lg p-2 text-[10px] border border-gray-800/50">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${typeStyles[log.type] || 'bg-gray-700 text-gray-400'}`}>{log.type.toUpperCase()}</span>
              <span className="text-gray-600">{format(log.timestamp, 'HH:mm:ss')}</span>
              {log.confidence && <span className="text-gray-600 ml-auto">{(log.confidence * 100).toFixed(0)}%</span>}
            </div>
            <div className="text-gray-300">{log.message}</div>
          </motion.div>
        ))}
        {aiLogs.length === 0 && <div className="text-gray-600 text-center py-8 text-xs">AI logs will appear here</div>}
      </div>
    </motion.div>
  );
};

// ============================================
// COMPARISON PANEL
// ============================================
const ComparisonPanel: React.FC = () => {
  const { showComparison, toggleComparison, comparison } = useStore();
  if (!showComparison) return null;

  const metrics = [
    { label: 'Fuel Used', withAI: `${comparison.withAI.fuelUsed.toFixed(1)}L`, withoutAI: `${comparison.withoutAI.fuelUsed.toFixed(1)}L`, saved: `${((1 - comparison.withAI.fuelUsed / comparison.withoutAI.fuelUsed) * 100).toFixed(0)}%`, icon: '⛽' },
    { label: 'Time', withAI: `${comparison.withAI.timeMin.toFixed(0)}min`, withoutAI: `${comparison.withoutAI.timeMin.toFixed(0)}min`, saved: `${((1 - comparison.withAI.timeMin / comparison.withoutAI.timeMin) * 100).toFixed(0)}%`, icon: '⏱️' },
    { label: 'Accidents', withAI: `${comparison.withAI.accidents}`, withoutAI: `${comparison.withoutAI.accidents}`, saved: `${comparison.withoutAI.accidents - comparison.withAI.accidents} prevented`, icon: '🛡️' },
    { label: 'Avg Speed', withAI: `${comparison.withAI.avgSpeed}km/h`, withoutAI: `${comparison.withoutAI.avgSpeed}km/h`, saved: `+${comparison.withAI.avgSpeed - comparison.withoutAI.avgSpeed}km/h`, icon: '🏎️' },
    { label: 'CO₂ Emissions', withAI: `${comparison.withAI.emissions.toFixed(1)}kg`, withoutAI: `${comparison.withoutAI.emissions.toFixed(1)}kg`, saved: `${((1 - comparison.withAI.emissions / comparison.withoutAI.emissions) * 100).toFixed(0)}%`, icon: '🌍' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[700px] bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 z-40 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>📊 AI Impact Comparison</h3>
        <button onClick={toggleComparison} className="text-gray-500 hover:text-white">✕</button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="text-center">
            <div className="text-xl mb-1">{m.icon}</div>
            <div className="text-[10px] text-gray-400 mb-2">{m.label}</div>
            <div className="bg-red-900/20 rounded-lg p-1.5 mb-1">
              <div className="text-[9px] text-red-400">Without AI</div>
              <div className="text-sm font-bold text-red-400">{m.withoutAI}</div>
            </div>
            <div className="bg-green-900/20 rounded-lg p-1.5 mb-1">
              <div className="text-[9px] text-green-400">With AI</div>
              <div className="text-sm font-bold text-green-400">{m.withAI}</div>
            </div>
            <div className="text-[10px] text-cyan-400 font-bold">{m.saved}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// HOW IT WORKS MODAL
// ============================================
const HowItWorksModal: React.FC = () => {
  const { showHowItWorks, toggleHowItWorks } = useStore();
  if (!showHowItWorks) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={toggleHowItWorks}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Orbitron' }}>🏗️ System Architecture</h2>
          <button onClick={toggleHowItWorks} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-6 text-sm">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-cyan-400 font-bold mb-3">🧠 AI Engine</h3>
            <pre className="text-[10px] text-gray-400 overflow-x-auto font-mono">
{`┌─────────────────────────────────────────┐
│           AI VEHICLE ECOSYSTEM          │
├──────────┬──────────┬───────────────────┤
│ Traffic  │  Fuel    │   Negotiation     │
│Predictor │Optimizer │    Engine         │
│ ├ WMA    │ ├ Route  │ ├ Intersection    │
│ ├ Anomaly│ ├ Refuel │ ├ Merge           │
│ └ Hazard │ └ Fleet  │ ├ Emergency       │
│          │          │ └ Consensus       │
├──────────┴──────────┴───────────────────┤
│         Self-Learning Layer             │
│    (Weight adjustment, accuracy         │
│     tracking, model retraining)         │
├─────────────────────────────────────────┤
│    Fleet Manager (8-12 vehicles)        │
│    Real-time WebSocket Updates          │
│    Historical Data & Playback           │
└─────────────────────────────────────────┘`}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: '🚦 Traffic Prediction', desc: 'Weighted moving average on 15+ road segments. Predicts congestion windows, detects anomalies, and finds optimal departure times.' },
              { title: '⛽ Fuel Optimization', desc: 'Calculates consumption based on speed, terrain, traffic stops. Finds cheapest stations with least detour and coordinates fleet refueling.' },
              { title: '🤝 V2V Negotiation', desc: 'Priority scoring based on urgency, fuel level, wait time, and vehicle type. Multi-vehicle consensus with weighted voting.' },
              { title: '🧠 Self-Learning', desc: 'Tracks prediction accuracy, adjusts model weights, and improves over time. Accuracy grows from ~65% to 99%+ over iterations.' },
              { title: '🎤 Voice Commands', desc: 'Web Speech API integration for hands-free control. Supports start/stop/scenarios/status queries.' },
              { title: '📊 Real-time Analytics', desc: 'Live charts for congestion, fuel, learning progress. Historical playback and data export.' }
            ].map((item, i) => (
              <div key={i} className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="text-white font-semibold text-xs mb-1">{item.title}</h4>
                <p className="text-gray-400 text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-cyan-400 font-bold mb-2">🔧 Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'TypeScript', 'Zustand', 'Three.js', 'Chart.js', 'Framer Motion', 'Tailwind CSS', 'Web Speech API', 'WebSocket', 'Canvas API', 'Vite'].map(t => (
                <span key={t} className="px-2 py-0.5 bg-gray-700/50 rounded-full text-[10px] text-gray-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// VOICE COMMAND PANEL
// ============================================
const VoiceCommandPanel: React.FC = () => {
  const { voice, processVoiceCommand, setVoiceListening } = useStore();
  const [inputCmd, setInputCmd] = useState('');
  const recognitionRef = useRef<any>(null);

  const startVoice = useCallback(() => {
    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) { toast.error('Speech recognition not supported'); return; }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const cmd = event.results[0][0].transcript;
        const response = processVoiceCommand(cmd);
        toast.success(`🎤 ${response}`);
        setVoiceListening(false);
      };
      recognition.onerror = () => { setVoiceListening(false); toast.error('Voice recognition error'); };
      recognition.onend = () => setVoiceListening(false);
      recognition.start();
      setVoiceListening(true);
      recognitionRef.current = recognition;
    } catch { toast.error('Voice not available'); }
  }, [processVoiceCommand, setVoiceListening]);

  const handleTextCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;
    const response = processVoiceCommand(inputCmd.trim());
    toast.success(response);
    setInputCmd('');
  };

  return (
    <div className="glass-card p-3">
      <h4 className="text-xs font-bold text-gray-300 mb-2" style={{ fontFamily: 'Orbitron' }}>🎤 Voice / Command</h4>
      <div className="flex gap-2 mb-2">
        <form onSubmit={handleTextCommand} className="flex-1 flex gap-1">
          <input value={inputCmd} onChange={e => setInputCmd(e.target.value)} placeholder="Type command..."
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" />
          <button type="submit" className="px-3 py-1.5 bg-cyan-500/80 hover:bg-cyan-500 rounded-lg text-xs text-white font-semibold">Send</button>
        </form>
        <button onClick={startVoice} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${voice.isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
          {voice.isListening ? '🔴 Listening...' : '🎤 Speak'}
        </button>
      </div>
      {voice.lastCommand && (
        <div className="text-[10px] space-y-0.5">
          <div className="text-gray-500">Last: <span className="text-cyan-400">"{voice.lastCommand}"</span></div>
          <div className="text-gray-500">→ <span className="text-green-400">{voice.lastResponse}</span></div>
        </div>
      )}
    </div>
  );
};

// ============================================
// HISTORICAL PLAYBACK
// ============================================
const PlaybackPanel: React.FC = () => {
  const { historicalData, isPlayingBack, playbackIndex, startPlayback, stopPlayback, setPlaybackIndex } = useStore();
  
  if (historicalData.length < 2) return null;

  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-300">⏮️ Historical Playback ({historicalData.length} snapshots)</h4>
        <button onClick={isPlayingBack ? stopPlayback : startPlayback}
          className={`px-2 py-1 rounded text-[10px] ${isPlayingBack ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
          {isPlayingBack ? '⏹ Stop' : '▶ Play'}
        </button>
      </div>
      <input type="range" min={0} max={historicalData.length - 1} value={playbackIndex}
        onChange={e => setPlaybackIndex(Number(e.target.value))}
        className="w-full h-1 accent-cyan-500" />
      <div className="text-[10px] text-gray-500 text-center mt-1">
        Frame {playbackIndex + 1} of {historicalData.length}
      </div>
    </div>
  );
};

// ============================================
// ALERT PANEL
// ============================================
const AlertPanel: React.FC = () => {
  const { alerts, dismissAlert } = useStore();
  const active = alerts.filter(a => !a.acknowledged).slice(0, 4);
  if (active.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-72 space-y-2 z-30">
      <AnimatePresence>
        {active.map(alert => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className={`p-3 rounded-lg border backdrop-blur-sm text-xs ${
              alert.severity === 'critical' ? 'bg-red-900/80 border-red-500' :
              alert.severity === 'high' ? 'bg-orange-900/80 border-orange-500' :
              'bg-gray-800/80 border-gray-600'
            }`}>
            <div className="flex items-start gap-2">
              <span>{alert.type === 'emergency' ? '🚨' : alert.type === 'hazard' ? '⚠️' : alert.type === 'fuel' ? '⛽' : '📢'}</span>
              <div className="flex-1">
                <div className="font-semibold text-white">{alert.title}</div>
                <div className="text-gray-300 text-[10px]">{alert.message}</div>
              </div>
              <button onClick={() => dismissAlert(alert.id)} className="text-gray-400 hover:text-white">✕</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// PARTICLES BACKGROUND
// ============================================
const ParticlesBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{
        width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
        background: ['#00f0ff', '#7b61ff', '#00ff88'][i % 3],
        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`
      }}
        animate={{ y: [0, -(100 + Math.random() * 200)], opacity: [0, 0.5, 0] }}
        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
      />
    ))}
  </div>
);

// ============================================
// MAIN APP
// ============================================
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const {
    isAuthenticated, vehicles, selectedVehicleId, selectVehicle,
    mapMode, showTraffic, showWeather, showHazards: showHazardsState,
    showHeatMap, heatMapType, isSimulating, isPaused, stepSimulation,
    recordSnapshot, simulationSpeed, isPlayingBack, playbackIndex,
    historicalData, setPlaybackIndex, roadSegments, fuelStations, hazards,
    setConnectionStatus, startSimulation, pauseSimulation, resumeSimulation,
    resetSimulation
  } = useStore();

  // Loading
  useEffect(() => {
    const t = setInterval(() => {
      setLoadProgress(p => {
        if (p >= 100) { clearInterval(t); setTimeout(() => setLoading(false), 300); return 100; }
        return p + Math.random() * 18 + 2;
      });
    }, 150);
    return () => clearInterval(t);
  }, []);

  // Simulate WS connection
  useEffect(() => {
    setTimeout(() => setConnectionStatus(true, Math.floor(Math.random() * 30 + 10)), 1000);
    const ping = setInterval(() => setConnectionStatus(true, Math.floor(Math.random() * 40 + 8)), 5000);
    return () => clearInterval(ping);
  }, [setConnectionStatus]);

  // Simulation loop
  useEffect(() => {
    if (!isSimulating || isPaused) return;
    const t = setInterval(() => { stepSimulation(); recordSnapshot(); }, 1000 / simulationSpeed);
    return () => clearInterval(t);
  }, [isSimulating, isPaused, simulationSpeed, stepSimulation, recordSnapshot]);

  // Historical playback
  useEffect(() => {
    if (!isPlayingBack || historicalData.length < 2) return;
    const t = setInterval(() => {
      const next = playbackIndex + 1;
      if (next >= historicalData.length) { useStore.getState().stopPlayback(); return; }
      setPlaybackIndex(next);
    }, 200);
    return () => clearInterval(t);
  }, [isPlayingBack, playbackIndex, historicalData.length, setPlaybackIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); isSimulating ? (isPaused ? resumeSimulation() : pauseSimulation()) : startSimulation(); break;
        case 'r': resetSimulation(); break;
        case 's': stepSimulation(); break;
        case 'escape': selectVehicle(null); break;
        case '1': case '2': case '3': case '4': case '5': useStore.getState().runScenario(`scenario_${e.key}`); break;
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isSimulating, isPaused, selectVehicle, startSimulation, pauseSimulation, resumeSimulation, resetSimulation, stepSimulation]);

  if (loading) return <LoadingScreen progress={Math.min(100, Math.round(loadProgress))} />;
  if (!isAuthenticated) return <><Toaster position="top-right" /><LoginScreen /></>;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid #333' } }} />
      <ParticlesBackground />
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Vehicle Cards */}
        <aside className="w-[270px] bg-gray-900/50 border-r border-gray-800/50 overflow-y-auto hidden lg:block flex-shrink-0 relative z-10">
          <div className="p-3">
            <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">🚗 Fleet ({vehicles.length})</h2>
            <div className="space-y-2">
              {vehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} isSelected={v.id === selectedVehicleId}
                  onClick={() => selectVehicle(v.id === selectedVehicleId ? null : v.id)} />
              ))}
            </div>
          </div>
        </aside>

        {/* Vehicle Detail Panel */}
        <AnimatePresence>{selectedVehicleId && <VehicleDetailPanel />}</AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          <Toolbar />

          {/* Map */}
          <div className="flex-1 relative map-container">
            {mapMode === '3d' ? (
              <Map3D vehicles={vehicles} roadSegments={roadSegments} fuelStations={fuelStations}
                hazards={hazards} selectedVehicleId={selectedVehicleId} onVehicleClick={selectVehicle}
                showTraffic={showTraffic} showWeather={showWeather} showHazards={showHazardsState}
                showHeatMap={showHeatMap} heatMapType={heatMapType} />
            ) : (
              <Map2D />
            )}
            
            {/* Map overlay info */}
            <div className="absolute top-3 right-3 z-10 text-[10px] text-gray-500 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1">
              {mapMode === '3d' ? 'Drag to rotate • Scroll to zoom' : 'Click vehicle to select'} | ⌨️ Space=Play R=Reset S=Step 1-5=Scenario
            </div>
          </div>

          {/* Bottom Panels */}
          <div className="max-h-[50vh] overflow-y-auto border-t border-gray-800/50 p-3 space-y-3">
            <ScenarioPanel />
            <VoiceCommandPanel />
            <StatsPanel />
            <ChartsPanel />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <NegotiationLog />
              <HazardPanel />
            </div>
            <PlaybackPanel />
          </div>
        </main>
      </div>

      {/* Mobile vehicle selector */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-1.5 z-20">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {vehicles.map(v => (
            <button key={v.id} onClick={() => selectVehicle(v.id)}
              className={`flex-shrink-0 p-1.5 rounded-lg text-lg ${selectedVehicleId === v.id ? 'bg-cyan-500/30 border border-cyan-500' : 'bg-gray-800'}`}>
              {getVehicleIcon(v.type)}
            </button>
          ))}
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        <AIConsole />
        <ComparisonPanel />
        <HowItWorksModal />
      </AnimatePresence>
      <AlertPanel />
      
      {/* Voice Commands & AR/VR Support */}
      <VoiceCommands showPanel={true} />
      <ARVRSupport />
    </div>
  );
};

export default App;
