import React from 'react';
import { motion } from 'framer-motion';
import { useStore, VehicleData } from '../store/useStore';

const getVehicleIcon = (type: string) => {
  const icons: Record<string, string> = { ambulance: '🚑', truck: '🚚', bus: '🚌', van: '🚐', suv: '🚙', police: '🚓', fire_truck: '🚒', motorcycle: '🏍️' };
  return icons[type] || '🚗';
};

const getStatusColor = (status: string) => {
  const m: Record<string, string> = { moving: '#00ff88', emergency: '#ff3355', negotiating: '#ffaa00', refueling: '#ff8800', yielding: '#7b61ff', stopped: '#666', parking: '#4488ff', waiting: '#8888ff' };
  return m[status] || '#666';
};

const getFuelColor = (level: number) => level < 20 ? '#ff3355' : level < 50 ? '#ffaa00' : '#00ff88';

interface VehicleCardProps {
  vehicle: VehicleData;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { selectedVehicleId, selectVehicle } = useStore();
  const isSelected = selectedVehicleId === vehicle.id;

  return (
    <motion.div
      layout
      onClick={() => selectVehicle(isSelected ? null : vehicle.id)}
      className={`glass-card p-3 cursor-pointer transition-all duration-200 hover:border-cyan-500/30 ${isSelected ? 'ring-1 ring-cyan-400/50 border-cyan-500/40' : 'border-white/5'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Top row: icon, name, status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getVehicleIcon(vehicle.type)}</span>
          <div>
            <div className="text-sm font-semibold text-white truncate max-w-[100px]">{vehicle.name}</div>
            <div className="text-[10px] text-gray-500 font-mono">{vehicle.plateNumber}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: getStatusColor(vehicle.status) + '25', color: getStatusColor(vehicle.status) }}>
            {vehicle.status}
          </span>
          <span className="text-[10px] text-gray-500">⚡ {vehicle.urgency}/10</span>
        </div>
      </div>

      {/* Fuel bar */}
      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
          <span>Fuel</span>
          <span style={{ color: getFuelColor(vehicle.fuelLevel) }}>{vehicle.fuelLevel.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: getFuelColor(vehicle.fuelLevel) }}
            animate={{ width: `${vehicle.fuelLevel}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <div className="text-center">
          <div className="text-gray-500">Speed</div>
          <div className="text-white font-mono">{vehicle.speed.toFixed(0)}<span className="text-gray-600">km/h</span></div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">ETA</div>
          <div className="text-cyan-400 font-mono">{vehicle.eta}<span className="text-gray-600">min</span></div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">👥</div>
          <div className="text-white font-mono">{vehicle.passengerCount}</div>
        </div>
      </div>

      {/* Urgency bar */}
      <div className="mt-2 flex items-center gap-1">
        <span className="text-[9px] text-gray-500">Urgency</span>
        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${vehicle.urgency * 10}%`,
              backgroundColor: vehicle.urgency >= 8 ? '#ff3355' : vehicle.urgency >= 5 ? '#ffaa00' : '#00ff88',
            }}
          />
        </div>
      </div>

      {/* Health indicators when selected */}
      {isSelected && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 pt-2 border-t border-white/5 grid grid-cols-2 gap-1 text-[9px]">
          <div className="flex justify-between"><span className="text-gray-500">Engine</span><span className="text-orange-400">{vehicle.engineTemp}°C</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tires</span><span className="text-cyan-400">{vehicle.tirePressure} PSI</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Battery</span><span className="text-green-400">{vehicle.batteryLevel}%</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Health</span><span className="text-purple-400">{vehicle.healthScore}%</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="text-white">{vehicle.distanceTraveled.toFixed(0)}km</span></div>
          <div className="flex justify-between"><span className="text-gray-500">CO₂</span><span className="text-yellow-400">{vehicle.co2Emissions.toFixed(1)}kg</span></div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VehicleCard;
