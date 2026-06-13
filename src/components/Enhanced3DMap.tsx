// ============================================
// ENHANCED 3D MAP v4.0
// Three.js Scene with Detailed Vehicles
// ============================================

import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, RoadSegmentData, FuelStationData, HazardData } from '../store/useStore';
import { Vehicle3D } from './Vehicle3DModels';

// ============================================
// ROAD COMPONENT
// ============================================

interface RoadProps {
  segment: RoadSegmentData;
}

const Road: React.FC<RoadProps> = ({ segment }) => {
  const start = new THREE.Vector3(segment.startPoint.x * 0.1, 0.01, segment.startPoint.y * 0.1);
  const end = new THREE.Vector3(segment.endPoint.x * 0.1, 0.01, segment.endPoint.y * 0.1);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const center = start.clone().add(direction.multiplyScalar(0.5));
  const angle = Math.atan2(end.z - start.z, end.x - start.x);
  
  // Color based on congestion
  const getColor = () => {
    if (segment.congestionLevel > 70) return '#ff3355';
    if (segment.congestionLevel > 40) return '#ffaa00';
    return '#00ff88';
  };
  
  const roadWidth = segment.lanes * 0.3;
  
  return (
    <group position={[center.x, 0, center.z]} rotation={[0, -angle, 0]}>
      {/* Road surface */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[length, 0.02, roadWidth]} />
        <meshStandardMaterial 
          color="#333333" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Road markings - center line */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[length, 0.01, 0.03]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Edge lines */}
      <mesh position={[0, 0.03, roadWidth / 2 - 0.05]}>
        <boxGeometry args={[length, 0.01, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.03, -roadWidth / 2 + 0.05]}>
        <boxGeometry args={[length, 0.01, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Dashed lane markers */}
      {segment.lanes > 1 && [...Array(Math.floor(length / 0.5))].map((_, i) => (
        i % 2 === 0 && (
          <mesh key={i} position={[-length / 2 + i * 0.5 + 0.25, 0.03, roadWidth / 4]}>
            <boxGeometry args={[0.2, 0.01, 0.02]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        )
      ))}
      
      {/* Congestion indicator glow */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[length, 0.01, roadWidth]} />
        <meshBasicMaterial 
          color={getColor()} 
          transparent 
          opacity={0.15 + segment.congestionLevel * 0.003}
        />
      </mesh>
    </group>
  );
};

// ============================================
// FUEL STATION COMPONENT
// ============================================

interface FuelStationProps {
  station: FuelStationData;
}

const FuelStation: React.FC<FuelStationProps> = ({ station }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02 + 0.5;
    }
  });
  
  return (
    <group ref={groupRef} position={[station.position.x * 0.1, 0.5, station.position.y * 0.1]}>
      {/* Station building */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1, 0.8, 0.6]} />
        <meshStandardMaterial color="#1a365d" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Roof/Canopy */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Support pillars */}
      {[[-0.6, 0.4], [0.6, 0.4], [-0.6, -0.4], [0.6, -0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#718096" metalness={0.8} />
        </mesh>
      ))}
      
      {/* Fuel pumps */}
      {[-0.3, 0.3].map((x, i) => (
        <group key={i} position={[x, 0, 0.3]}>
          <mesh>
            <boxGeometry args={[0.15, 0.4, 0.1]} />
            <meshStandardMaterial color={station.isOpen ? '#2ecc71' : '#e74c3c'} />
          </mesh>
          {/* Pump hose */}
          <mesh position={[0.1, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
      
      {/* Fuel price sign */}
      <mesh position={[0.8, 0.8, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshStandardMaterial color="#27ae60" emissive="#27ae60" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Info label */}
      <Html position={[0, 1.2, 0]} center>
        <div className="bg-gray-900/90 px-2 py-1 rounded text-xs whitespace-nowrap border border-cyan-500/30">
          <div className="text-cyan-400 font-bold">⛽ {station.name}</div>
          <div className="text-green-400">${station.fuelPrice.toFixed(2)}/L</div>
          <div className="text-gray-400">{station.availablePumps}/{station.totalPumps} pumps</div>
        </div>
      </Html>
      
      {/* Glow effect */}
      <pointLight position={[0, 0.8, 0]} intensity={0.5} distance={3} color="#00ff88" />
    </group>
  );
};

// ============================================
// HAZARD COMPONENT
// ============================================

interface HazardProps {
  hazard: HazardData;
}

const Hazard: React.FC<HazardProps> = ({ hazard }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  
  const getSeverityColor = () => {
    switch (hazard.severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffcc00';
      default: return '#00ccff';
    }
  };
  
  const getHazardIcon = () => {
    switch (hazard.type) {
      case 'accident': return '💥';
      case 'construction': return '🚧';
      case 'weather': return '⛈️';
      case 'flooding': return '🌊';
      case 'fire': return '🔥';
      default: return '⚠️';
    }
  };
  
  useFrame((state) => {
    if (pulseRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      pulseRef.current.scale.set(scale, 1, scale);
    }
  });
  
  if (!hazard.isActive) return null;
  
  return (
    <group ref={groupRef} position={[hazard.position.x * 0.1, 0.1, hazard.position.y * 0.1]}>
      {/* Hazard marker */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.2, 0.5, 4]} />
        <meshStandardMaterial 
          color={getSeverityColor()} 
          emissive={getSeverityColor()} 
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Warning stripes */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 8]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
      
      {/* Pulse ring */}
      <mesh ref={pulseRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial 
          color={getSeverityColor()} 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Info label */}
      <Html position={[0, 0.8, 0]} center>
        <div className={`bg-gray-900/90 px-2 py-1 rounded text-xs whitespace-nowrap border ${
          hazard.severity === 'critical' ? 'border-red-500 animate-pulse' : 'border-yellow-500/30'
        }`}>
          <div className="text-center">{getHazardIcon()}</div>
          <div className="text-yellow-400 font-bold">{hazard.type.toUpperCase()}</div>
          <div className="text-gray-400">{hazard.severity}</div>
        </div>
      </Html>
      
      {/* Warning light */}
      <pointLight 
        position={[0, 0.5, 0]} 
        intensity={hazard.severity === 'critical' ? 2 : 1} 
        distance={5} 
        color={getSeverityColor()} 
      />
    </group>
  );
};

// ============================================
// CITY ENVIRONMENT
// ============================================

const CityEnvironment: React.FC = () => {
  // Create a simple city grid of buildings
  const buildings = useMemo(() => {
    const result = [];
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        // Skip center area for roads
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
        
        const height = 0.5 + Math.random() * 2;
        const width = 0.3 + Math.random() * 0.3;
        
        result.push({
          position: [x * 2, height / 2, z * 2] as [number, number, number],
          size: [width, height, width] as [number, number, number],
          color: `hsl(${220 + Math.random() * 20}, 30%, ${20 + Math.random() * 15}%)`
        });
      }
    }
    return result;
  }, []);
  
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0a1628" />
      </mesh>
      
      {/* Grid lines */}
      <gridHelper args={[100, 100, '#1a3a5c', '#0d2840']} position={[0, 0.01, 0]} />
      
      {/* Buildings */}
      {buildings.map((building, i) => (
        <mesh key={i} position={building.position} castShadow receiveShadow>
          <boxGeometry args={building.size} />
          <meshStandardMaterial color={building.color} metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
      
      {/* Building windows (emissive dots) */}
      {buildings.map((building, i) => (
        <group key={`windows-${i}`} position={building.position}>
          {[...Array(Math.floor(building.size[1] * 3))].map((_, j) => (
            Math.random() > 0.3 && (
              <mesh key={j} position={[
                building.size[0] / 2 + 0.01,
                -building.size[1] / 2 + 0.1 + j * 0.15,
                (Math.random() - 0.5) * building.size[2] * 0.8
              ]}>
                <planeGeometry args={[0.05, 0.08]} />
                <meshBasicMaterial color="#ffee88" transparent opacity={0.5 + Math.random() * 0.5} />
              </mesh>
            )
          ))}
        </group>
      ))}
    </group>
  );
};

// ============================================
// WEATHER EFFECTS
// ============================================

interface WeatherEffectsProps {
  type: 'clear' | 'rain' | 'heavy_rain' | 'snow' | 'fog' | 'storm';
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ type }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = type === 'heavy_rain' || type === 'storm' ? 5000 : 
                       type === 'rain' ? 2000 : 
                       type === 'snow' ? 3000 : 0;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, [particleCount]);
  
  useFrame((_, delta) => {
    if (particlesRef.current && particleCount > 0) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const speed = type === 'snow' ? 0.5 : type === 'storm' ? 4 : 2;
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= speed * delta * 10;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 20;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  if (type === 'clear') return null;
  
  if (type === 'fog') {
    return <fog attach="fog" args={['#0a1628', 5, 30]} />;
  }
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);
  
  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={type === 'snow' ? 0.1 : 0.03}
        color={type === 'snow' ? '#ffffff' : '#88ccff'}
        transparent
        opacity={0.6}
      />
    </points>
  );
};

// ============================================
// CAMERA CONTROLLER
// ============================================

const CameraController: React.FC<{ target: { x: number; y: number } | null }> = ({ target }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (target) {
      const x = target.x * 0.1;
      const z = target.y * 0.1;
      camera.lookAt(x, 0, z);
    }
  }, [target, camera]);
  
  return null;
};

// ============================================
// MAIN 3D MAP COMPONENT
// ============================================

interface Enhanced3DMapProps {
  className?: string;
}

export const Enhanced3DMap: React.FC<Enhanced3DMapProps> = ({ className = '' }) => {
  const { 
    vehicles, 
    roadSegments, 
    fuelStations, 
    hazards,
    selectedVehicleId,
    selectVehicle,
    showWeather
  } = useStore();
  
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  
  // Determine weather from road segments
  const currentWeather = roadSegments.find(s => s.weather !== 'clear')?.weather || 'clear';
  
  return (
    <div className={`relative ${className}`} style={{ height: '100%', minHeight: '400px' }}>
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00f0ff" />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#7b61ff" />
          
          {/* Environment */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <CityEnvironment />
          
          {/* Weather */}
          {showWeather && <WeatherEffects type={currentWeather} />}
          
          {/* Roads */}
          {roadSegments.map(segment => (
            <Road key={segment.id} segment={segment} />
          ))}
          
          {/* Vehicles */}
          {vehicles.map(vehicle => (
            <Vehicle3D
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={vehicle.id === selectedVehicleId}
              showLights={true}
              onClick={() => selectVehicle(vehicle.id === selectedVehicleId ? null : vehicle.id)}
            />
          ))}
          
          {/* Fuel Stations */}
          {fuelStations.map(station => (
            <FuelStation key={station.id} station={station} />
          ))}
          
          {/* Hazards */}
          {hazards.filter(h => h.isActive).map(hazard => (
            <Hazard key={hazard.id} hazard={hazard} />
          ))}
          
          {/* Camera controls */}
          <OrbitControls 
            enablePan 
            enableZoom 
            enableRotate
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.2}
          />
          <CameraController target={selectedVehicle?.position || null} />
        </Suspense>
      </Canvas>
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          className="p-2 bg-gray-900/80 rounded-lg hover:bg-gray-800 transition-colors border border-cyan-500/30"
          title="Reset View"
        >
          🔄
        </button>
        <button 
          className="p-2 bg-gray-900/80 rounded-lg hover:bg-gray-800 transition-colors border border-cyan-500/30"
          title="Zoom In"
        >
          ➕
        </button>
        <button 
          className="p-2 bg-gray-900/80 rounded-lg hover:bg-gray-800 transition-colors border border-cyan-500/30"
          title="Zoom Out"
        >
          ➖
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-card p-3 text-xs">
        <div className="font-bold text-cyan-400 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500 rounded" />
            <span>Low Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-yellow-500 rounded" />
            <span>Medium Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500 rounded" />
            <span>High Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⛽</span>
            <span>Fuel Station</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Hazard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DMap;
