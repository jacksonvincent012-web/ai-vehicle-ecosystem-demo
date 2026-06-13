import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const getVehicleIcon = (type: string) => {
  const m: Record<string, string> = { ambulance: '🚑', truck: '🚚', bus: '🚌', van: '🚐', suv: '🚙', police: '🚓', fire_truck: '🚒', motorcycle: '🏍️' };
  return m[type] || '🚗';
};

const getFuelColor = (l: number) => l < 20 ? '#ff3355' : l < 50 ? '#ffaa00' : '#00ff88';

const VehicleDetailPanel: React.FC = () => {
  const { vehicles, selectedVehicleId, selectVehicle, optimizeRoute, triggerEmergency } = useStore();
  const vehicle = vehicles.find(v => v.id === selectedVehicleId);

  if (!vehicle) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-16 right-4 w-80 max-h-[calc(100vh-5rem)] overflow-y-auto z-30 glass-card border border-white/10 shadow-2xl custom-scrollbar"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0d0d2a]/90 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getVehicleIcon(vehicle.type)}</span>
          <div>
            <h3 className="text-sm font-bold text-white">{vehicle.name}</h3>
            <div className="text-[10px] text-gray-500 font-mono">{vehicle.plateNumber} · {vehicle.type}</div>
          </div>
        </div>
        <button onClick={() => selectVehicle(null)} className="text-gray-500 hover:text-white">✕</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Status</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            vehicle.status === 'emergency' ? 'bg-red-500/20 text-red-400 animate-pulse' :
            vehicle.status === 'moving' ? 'bg-green-500/20 text-green-400' :
            vehicle.status === 'negotiating' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>{vehicle.status}</span>
        </div>

        {/* Fuel Gauge */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Fuel Level</span>
            <span style={{ color: getFuelColor(vehicle.fuelLevel) }}>{vehicle.fuelLevel.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: getFuelColor(vehicle.fuelLevel) }}
              animate={{ width: `${vehicle.fuelLevel}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
            <span>{((vehicle.fuelLevel / 100) * vehicle.fuelCapacity).toFixed(1)}L</span>
            <span>{vehicle.fuelCapacity}L capacity</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Speed', value: `${vehicle.speed.toFixed(0)} km/h`, color: '#00f0ff' },
            { label: 'Recommended', value: `${vehicle.recommendedSpeed.toFixed(0)} km/h`, color: '#7b61ff' },
            { label: 'ETA', value: `${vehicle.eta} min`, color: '#ffaa00' },
            { label: 'Urgency', value: `${vehicle.urgency}/10`, color: vehicle.urgency >= 8 ? '#ff3355' : '#00ff88' },
            { label: 'Passengers', value: `${vehicle.passengerCount}`, color: '#4ecdc4' },
            { label: 'Distance', value: `${vehicle.distanceTraveled.toFixed(0)} km`, color: '#8888ff' },
          ].map(m => (
            <div key={m.label} className="p-2 rounded bg-white/[0.03] border border-white/5">
              <div className="text-[9px] text-gray-500">{m.label}</div>
              <div className="text-xs font-mono font-semibold" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Vehicle Health */}
        <div>
          <h4 className="text-[10px] text-gray-400 uppercase mb-2 font-semibold">Vehicle Health</h4>
          <div className="space-y-1.5">
            {[
              { label: 'Engine Temp', value: vehicle.engineTemp, max: 120, unit: '°C', color: vehicle.engineTemp > 100 ? '#ff3355' : '#00ff88' },
              { label: 'Tire Pressure', value: vehicle.tirePressure, max: 50, unit: 'PSI', color: '#00f0ff' },
              { label: 'Battery', value: vehicle.batteryLevel, max: 100, unit: '%', color: '#7b61ff' },
              { label: 'Health Score', value: vehicle.healthScore, max: 100, unit: '%', color: '#00ff88' },
            ].map(h => (
              <div key={h.label} className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500 w-20">{h.label}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(h.value / h.max) * 100}%`, backgroundColor: h.color }} />
                </div>
                <span className="text-[9px] font-mono w-12 text-right" style={{ color: h.color }}>{h.value}{h.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental */}
        <div className="p-2 rounded bg-green-500/5 border border-green-500/15">
          <div className="text-[10px] text-green-400 font-semibold mb-1">🌱 Environmental</div>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div><span className="text-gray-500">CO₂:</span> <span className="text-white">{vehicle.co2Emissions.toFixed(1)} kg</span></div>
            <div><span className="text-gray-500">Fuel Used:</span> <span className="text-white">{vehicle.fuelConsumed.toFixed(1)} L</span></div>
            <div><span className="text-gray-500">Odometer:</span> <span className="text-white">{vehicle.odometerKm.toLocaleString()} km</span></div>
            <div><span className="text-gray-500">Negotiations:</span> <span className="text-white">{vehicle.negotiationsParticipated}</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] text-gray-400 uppercase font-semibold">Quick Actions</h4>
          <div className="grid grid-cols-3 gap-1.5">
            <button onClick={() => optimizeRoute(vehicle.id, 'fuel_saving')} className="text-[9px] py-1.5 px-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">⛽ Eco</button>
            <button onClick={() => optimizeRoute(vehicle.id, 'fastest')} className="text-[9px] py-1.5 px-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">🏎️ Fast</button>
            <button onClick={() => optimizeRoute(vehicle.id, 'balanced')} className="text-[9px] py-1.5 px-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">⚖️ Balanced</button>
          </div>
          {(vehicle.type === 'ambulance' || vehicle.type === 'fire_truck' || vehicle.type === 'police') && (
            <button onClick={() => triggerEmergency(vehicle.id)} className="w-full text-[10px] py-2 rounded bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors animate-pulse">
              🚨 Dispatch Emergency
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleDetailPanel;
