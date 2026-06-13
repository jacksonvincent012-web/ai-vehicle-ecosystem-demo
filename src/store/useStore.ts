// ============================================
// ZUSTAND GLOBAL STATE STORE v3.0
// Full-stack Vehicle Ecosystem
// ============================================

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface VehicleData {
  id: string;
  name: string;
  type: 'car' | 'truck' | 'ambulance' | 'bus' | 'motorcycle' | 'van' | 'suv' | 'police' | 'fire_truck';
  speed: number;
  maxSpeed: number;
  recommendedSpeed: number;
  fuelLevel: number;
  fuelCapacity: number;
  fuelConsumptionRate: number;
  position: { x: number; y: number };
  destination: { x: number; y: number };
  urgency: number;
  status: 'moving' | 'stopped' | 'negotiating' | 'refueling' | 'yielding' | 'emergency' | 'parking' | 'waiting';
  eta: number;
  currentSegment: string;
  lane: number;
  heading: number;
  passengerCount: number;
  color: string;
  plateNumber: string;
  route: string[];
  routeProgress: number;
  distanceTraveled: number;
  fuelConsumed: number;
  negotiationsParticipated: number;
  hazardsAvoided: number;
  engineTemp: number;
  tirePressure: number;
  batteryLevel: number;
  odometerKm: number;
  co2Emissions: number;
  healthScore: number;
}

export interface RoadSegmentData {
  id: string;
  name: string;
  type: 'highway' | 'main' | 'secondary' | 'residential' | 'intersection';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  length: number;
  lanes: number;
  congestionLevel: number;
  avgSpeed: number;
  vehicleCount: number;
  maxCapacity: number;
  weather: 'clear' | 'rain' | 'heavy_rain' | 'snow' | 'fog' | 'storm';
  slipperyScore: number;
  visibility: number;
  speedLimit: number;
  connectedSegments: string[];
}

export interface FuelStationData {
  id: string;
  name: string;
  position: { x: number; y: number };
  fuelPrice: number;
  availablePumps: number;
  totalPumps: number;
  waitTime: number;
  rating: number;
  isOpen: boolean;
  currentQueue: string[];
}

export interface HazardData {
  id: string;
  type: 'accident' | 'debris' | 'weather' | 'construction' | 'animal' | 'pedestrian' | 'vehicle_breakdown' | 'road_damage' | 'flooding' | 'fire';
  severity: 'low' | 'medium' | 'high' | 'critical';
  position: { x: number; y: number };
  segmentId: string;
  description: string;
  reportedAt: number;
  expectedClearTime: number;
  isActive: boolean;
}

export interface NegotiationData {
  id: string;
  type: 'intersection' | 'merge' | 'emergency' | 'fuel_priority' | 'lane_change';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  vehicleIds: string[];
  locationId: string;
  initiatedAt: number;
  completedAt?: number;
  outcome: string;
  reasoning: string[];
  priorityOrder: string[];
  speedAdjustments: { vehicleId: string; newSpeed: number }[];
}

export interface AlertData {
  id: string;
  type: 'hazard' | 'traffic' | 'fuel' | 'negotiation' | 'emergency' | 'system' | 'weather' | 'voice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface AILogData {
  id: string;
  timestamp: number;
  type: 'decision' | 'prediction' | 'learning' | 'optimization' | 'negotiation' | 'warning' | 'info' | 'voice';
  module: string;
  action: string;
  message: string;
  details?: string;
  confidence?: number;
  vehicleId?: string;
}

export interface FleetStatsData {
  totalVehicles: number;
  activeVehicles: number;
  emergencyVehicles: number;
  avgFuelLevel: number;
  avgSpeed: number;
  totalDistance: number;
  totalFuelConsumed: number;
  totalNegotiations: number;
  successfulNegotiations: number;
  accidentsPreventedCount: number;
  hazardsDetected: number;
  hazardsAvoided: number;
  fuelSavedLiters: number;
  fuelSavedPercentage: number;
  timeSavedMinutes: number;
  delayReduction: number;
  efficiencyScore: number;
  safetyScore: number;
  learningIterations: number;
  predictionAccuracy: number;
  co2Reduced: number;
  uptimePercent: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'fleet_manager' | 'driver' | 'analyst' | 'viewer';
  fleetIds: string[];
  isActive: boolean;
}

export interface ScenarioData {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  duration: number;
}

export interface HistoricalSnapshot {
  timestamp: number;
  vehicles: VehicleData[];
  traffic: RoadSegmentData[];
  hazards: HazardData[];
  stats: FleetStatsData;
}

export interface VoiceState {
  isListening: boolean;
  lastCommand: string;
  lastResponse: string;
  available: boolean;
  commandHistory: { command: string; response: string; timestamp: number }[];
}

export interface ComparisonData {
  withAI: { fuelUsed: number; timeMin: number; accidents: number; avgSpeed: number; emissions: number };
  withoutAI: { fuelUsed: number; timeMin: number; accidents: number; avgSpeed: number; emissions: number };
}

// ============================================
// STORE INTERFACE
// ============================================

interface AppState {
  isAuthenticated: boolean;
  user: UserData | null;
  authToken: string | null;
  
  isSimulating: boolean;
  isPaused: boolean;
  simulationSpeed: number;
  currentTime: number;
  stepCount: number;
  
  vehicles: VehicleData[];
  roadSegments: RoadSegmentData[];
  fuelStations: FuelStationData[];
  hazards: HazardData[];
  negotiations: NegotiationData[];
  alerts: AlertData[];
  aiLogs: AILogData[];
  stats: FleetStatsData;
  
  scenarios: ScenarioData[];
  activeScenario: string | null;
  
  historicalData: HistoricalSnapshot[];
  isPlayingBack: boolean;
  playbackIndex: number;
  
  selectedVehicleId: string | null;
  selectedSegmentId: string | null;
  mapMode: '2d' | '3d';
  showTraffic: boolean;
  showWeather: boolean;
  showHazards: boolean;
  showHeatMap: boolean;
  heatMapType: 'congestion' | 'speed' | 'incidents' | 'fuel';
  soundEnabled: boolean;
  showAIConsole: boolean;
  showComparison: boolean;
  showHowItWorks: boolean;
  sidebarCollapsed: boolean;
  activeTab: 'vehicles' | 'analytics' | 'settings';
  
  isConnected: boolean;
  connectionLatency: number;
  
  voice: VoiceState;
  comparison: ComparisonData;
  
  congestionHistory: { time: number; segments: { id: string; level: number }[] }[];
  fuelHistory: { time: number; vehicles: { id: string; level: number }[] }[];
  learningHistory: { iteration: number; accuracy: number }[];
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  startSimulation: () => void;
  stopSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  
  runScenario: (scenarioId: string) => void;
  
  updateVehicle: (id: string, updates: Partial<VehicleData>) => void;
  updateSegment: (id: string, updates: Partial<RoadSegmentData>) => void;
  addHazard: (hazard: HazardData) => void;
  removeHazard: (id: string) => void;
  addNegotiation: (negotiation: NegotiationData) => void;
  completeNegotiation: (id: string, outcome: string) => void;
  addAlert: (alert: AlertData) => void;
  dismissAlert: (id: string) => void;
  addAILog: (log: AILogData) => void;
  updateStats: (updates: Partial<FleetStatsData>) => void;
  
  selectVehicle: (id: string | null) => void;
  selectSegment: (id: string | null) => void;
  setMapMode: (mode: '2d' | '3d') => void;
  toggleTraffic: () => void;
  toggleWeather: () => void;
  toggleHazards: () => void;
  toggleHeatMap: () => void;
  setHeatMapType: (type: 'congestion' | 'speed' | 'incidents' | 'fuel') => void;
  toggleSound: () => void;
  toggleAIConsole: () => void;
  toggleComparison: () => void;
  toggleHowItWorks: () => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'vehicles' | 'analytics' | 'settings') => void;
  
  recordSnapshot: () => void;
  startPlayback: () => void;
  stopPlayback: () => void;
  setPlaybackIndex: (index: number) => void;
  
  exportData: (format: 'json' | 'csv') => void;
  
  setConnectionStatus: (connected: boolean, latency: number) => void;
  
  processVoiceCommand: (command: string) => string;
  setVoiceListening: (listening: boolean) => void;
  
  triggerEmergency: (vehicleId: string) => void;
  optimizeRoute: (vehicleId: string, mode: 'fuel_saving' | 'fastest' | 'balanced') => void;
}

// ============================================
// INITIAL DATA
// ============================================

const INITIAL_VEHICLES: VehicleData[] = [
  {
    id: 'v1', name: 'Alpha Car', type: 'car', speed: 55, maxSpeed: 120, recommendedSpeed: 60,
    fuelLevel: 75, fuelCapacity: 50, fuelConsumptionRate: 8,
    position: { x: 100, y: 200 }, destination: { x: 700, y: 400 },
    urgency: 3, status: 'moving', eta: 15, currentSegment: 'seg_1', lane: 1, heading: 45,
    passengerCount: 2, color: '#00f0ff', plateNumber: 'ABC-1234',
    route: ['seg_1', 'seg_3', 'seg_5'], routeProgress: 0.3,
    distanceTraveled: 45, fuelConsumed: 4.5, negotiationsParticipated: 5, hazardsAvoided: 2,
    engineTemp: 85, tirePressure: 32, batteryLevel: 95, odometerKm: 45200, co2Emissions: 12.4, healthScore: 92
  },
  {
    id: 'v2', name: 'Beta Truck', type: 'truck', speed: 45, maxSpeed: 90, recommendedSpeed: 50,
    fuelLevel: 45, fuelCapacity: 120, fuelConsumptionRate: 15,
    position: { x: 300, y: 150 }, destination: { x: 600, y: 500 },
    urgency: 7, status: 'moving', eta: 22, currentSegment: 'seg_2', lane: 0, heading: 90,
    passengerCount: 1, color: '#ffaa00', plateNumber: 'TRK-5678',
    route: ['seg_2', 'seg_4', 'seg_6'], routeProgress: 0.5,
    distanceTraveled: 78, fuelConsumed: 12.3, negotiationsParticipated: 8, hazardsAvoided: 3,
    engineTemp: 92, tirePressure: 35, batteryLevel: 88, odometerKm: 128000, co2Emissions: 28.6, healthScore: 85
  },
  {
    id: 'v3', name: 'Emergency-01', type: 'ambulance', speed: 80, maxSpeed: 150, recommendedSpeed: 85,
    fuelLevel: 60, fuelCapacity: 80, fuelConsumptionRate: 12,
    position: { x: 400, y: 300 }, destination: { x: 200, y: 100 },
    urgency: 10, status: 'emergency', eta: 5, currentSegment: 'seg_3', lane: 1, heading: 270,
    passengerCount: 3, color: '#ff3355', plateNumber: 'EMG-911',
    route: ['seg_3', 'seg_1'], routeProgress: 0.2,
    distanceTraveled: 120, fuelConsumed: 15.6, negotiationsParticipated: 12, hazardsAvoided: 5,
    engineTemp: 78, tirePressure: 33, batteryLevel: 90, odometerKm: 67000, co2Emissions: 18.2, healthScore: 96
  },
  {
    id: 'v4', name: 'City Bus 42', type: 'bus', speed: 35, maxSpeed: 80, recommendedSpeed: 40,
    fuelLevel: 30, fuelCapacity: 200, fuelConsumptionRate: 25,
    position: { x: 500, y: 250 }, destination: { x: 100, y: 450 },
    urgency: 5, status: 'moving', eta: 18, currentSegment: 'seg_4', lane: 0, heading: 180,
    passengerCount: 28, color: '#00ff88', plateNumber: 'BUS-042',
    route: ['seg_4', 'seg_6', 'seg_8'], routeProgress: 0.4,
    distanceTraveled: 95, fuelConsumed: 22.5, negotiationsParticipated: 6, hazardsAvoided: 2,
    engineTemp: 88, tirePressure: 40, batteryLevel: 82, odometerKm: 234000, co2Emissions: 42.1, healthScore: 78
  },
  {
    id: 'v5', name: 'Delta Sedan', type: 'car', speed: 65, maxSpeed: 140, recommendedSpeed: 70,
    fuelLevel: 90, fuelCapacity: 55, fuelConsumptionRate: 7,
    position: { x: 200, y: 400 }, destination: { x: 700, y: 100 },
    urgency: 2, status: 'moving', eta: 12, currentSegment: 'seg_5', lane: 1, heading: 30,
    passengerCount: 4, color: '#7b61ff', plateNumber: 'DEL-9012',
    route: ['seg_5', 'seg_7', 'seg_9'], routeProgress: 0.6,
    distanceTraveled: 65, fuelConsumed: 5.2, negotiationsParticipated: 3, hazardsAvoided: 1,
    engineTemp: 82, tirePressure: 31, batteryLevel: 97, odometerKm: 18000, co2Emissions: 8.9, healthScore: 98
  },
  {
    id: 'v6', name: 'Echo Van', type: 'van', speed: 40, maxSpeed: 100, recommendedSpeed: 45,
    fuelLevel: 15, fuelCapacity: 70, fuelConsumptionRate: 10,
    position: { x: 600, y: 350 }, destination: { x: 150, y: 200 },
    urgency: 6, status: 'moving', eta: 25, currentSegment: 'seg_6', lane: 0, heading: 225,
    passengerCount: 1, color: '#ff6b6b', plateNumber: 'ECH-3456',
    route: ['seg_6', 'seg_4', 'seg_2'], routeProgress: 0.1,
    distanceTraveled: 110, fuelConsumed: 18.9, negotiationsParticipated: 9, hazardsAvoided: 4,
    engineTemp: 90, tirePressure: 29, batteryLevel: 75, odometerKm: 89000, co2Emissions: 22.1, healthScore: 72
  },
  {
    id: 'v7', name: 'Foxtrot SUV', type: 'suv', speed: 60, maxSpeed: 130, recommendedSpeed: 65,
    fuelLevel: 55, fuelCapacity: 75, fuelConsumptionRate: 11,
    position: { x: 350, y: 450 }, destination: { x: 650, y: 150 },
    urgency: 4, status: 'moving', eta: 14, currentSegment: 'seg_7', lane: 1, heading: 315,
    passengerCount: 5, color: '#4ecdc4', plateNumber: 'FOX-7890',
    route: ['seg_7', 'seg_9', 'seg_11'], routeProgress: 0.35,
    distanceTraveled: 88, fuelConsumed: 10.2, negotiationsParticipated: 7, hazardsAvoided: 3,
    engineTemp: 84, tirePressure: 33, batteryLevel: 91, odometerKm: 55000, co2Emissions: 16.8, healthScore: 88
  },
  {
    id: 'v8', name: 'Golf Compact', type: 'car', speed: 50, maxSpeed: 110, recommendedSpeed: 55,
    fuelLevel: 80, fuelCapacity: 40, fuelConsumptionRate: 6,
    position: { x: 450, y: 100 }, destination: { x: 300, y: 500 },
    urgency: 1, status: 'moving', eta: 20, currentSegment: 'seg_8', lane: 0, heading: 150,
    passengerCount: 1, color: '#95e1d3', plateNumber: 'GLF-1357',
    route: ['seg_8', 'seg_10', 'seg_12'], routeProgress: 0.45,
    distanceTraveled: 55, fuelConsumed: 3.8, negotiationsParticipated: 2, hazardsAvoided: 1,
    engineTemp: 80, tirePressure: 32, batteryLevel: 99, odometerKm: 12000, co2Emissions: 6.2, healthScore: 99
  }
];

const INITIAL_ROAD_SEGMENTS: RoadSegmentData[] = [
  { id: 'seg_1', name: 'Highway North', type: 'highway', startPoint: { x: 50, y: 150 }, endPoint: { x: 250, y: 150 }, length: 200, lanes: 3, congestionLevel: 25, avgSpeed: 80, vehicleCount: 12, maxCapacity: 50, weather: 'clear', slipperyScore: 5, visibility: 100, speedLimit: 100, connectedSegments: ['seg_2', 'seg_3'] },
  { id: 'seg_2', name: 'Main Street', type: 'main', startPoint: { x: 250, y: 150 }, endPoint: { x: 450, y: 150 }, length: 200, lanes: 2, congestionLevel: 55, avgSpeed: 45, vehicleCount: 18, maxCapacity: 35, weather: 'clear', slipperyScore: 10, visibility: 95, speedLimit: 60, connectedSegments: ['seg_1', 'seg_4', 'seg_5'] },
  { id: 'seg_3', name: 'West Avenue', type: 'main', startPoint: { x: 250, y: 150 }, endPoint: { x: 250, y: 350 }, length: 200, lanes: 2, congestionLevel: 35, avgSpeed: 50, vehicleCount: 10, maxCapacity: 30, weather: 'rain', slipperyScore: 45, visibility: 70, speedLimit: 50, connectedSegments: ['seg_1', 'seg_6', 'seg_7'] },
  { id: 'seg_4', name: 'Central Park Rd', type: 'secondary', startPoint: { x: 450, y: 150 }, endPoint: { x: 650, y: 150 }, length: 200, lanes: 2, congestionLevel: 70, avgSpeed: 30, vehicleCount: 22, maxCapacity: 30, weather: 'clear', slipperyScore: 8, visibility: 100, speedLimit: 50, connectedSegments: ['seg_2', 'seg_8', 'seg_9'] },
  { id: 'seg_5', name: 'Market District', type: 'secondary', startPoint: { x: 450, y: 150 }, endPoint: { x: 450, y: 350 }, length: 200, lanes: 2, congestionLevel: 45, avgSpeed: 40, vehicleCount: 15, maxCapacity: 30, weather: 'clear', slipperyScore: 12, visibility: 90, speedLimit: 45, connectedSegments: ['seg_2', 'seg_10', 'seg_11'] },
  { id: 'seg_6', name: 'Residential West', type: 'residential', startPoint: { x: 50, y: 350 }, endPoint: { x: 250, y: 350 }, length: 200, lanes: 1, congestionLevel: 15, avgSpeed: 35, vehicleCount: 5, maxCapacity: 20, weather: 'rain', slipperyScore: 40, visibility: 75, speedLimit: 35, connectedSegments: ['seg_3', 'seg_12'] },
  { id: 'seg_7', name: 'Industrial Zone', type: 'main', startPoint: { x: 250, y: 350 }, endPoint: { x: 450, y: 350 }, length: 200, lanes: 2, congestionLevel: 40, avgSpeed: 45, vehicleCount: 14, maxCapacity: 35, weather: 'clear', slipperyScore: 15, visibility: 85, speedLimit: 55, connectedSegments: ['seg_3', 'seg_5', 'seg_13'] },
  { id: 'seg_8', name: 'Highway East', type: 'highway', startPoint: { x: 650, y: 150 }, endPoint: { x: 750, y: 250 }, length: 140, lanes: 3, congestionLevel: 30, avgSpeed: 75, vehicleCount: 16, maxCapacity: 50, weather: 'clear', slipperyScore: 5, visibility: 100, speedLimit: 100, connectedSegments: ['seg_4', 'seg_14'] },
  { id: 'seg_9', name: 'Business Center', type: 'main', startPoint: { x: 650, y: 150 }, endPoint: { x: 650, y: 350 }, length: 200, lanes: 2, congestionLevel: 65, avgSpeed: 35, vehicleCount: 20, maxCapacity: 30, weather: 'clear', slipperyScore: 10, visibility: 95, speedLimit: 50, connectedSegments: ['seg_4', 'seg_15'] },
  { id: 'seg_10', name: 'Shopping District', type: 'secondary', startPoint: { x: 450, y: 350 }, endPoint: { x: 650, y: 350 }, length: 200, lanes: 2, congestionLevel: 80, avgSpeed: 25, vehicleCount: 25, maxCapacity: 30, weather: 'clear', slipperyScore: 8, visibility: 100, speedLimit: 40, connectedSegments: ['seg_5', 'seg_9', 'seg_7'] },
  { id: 'seg_11', name: 'University Road', type: 'secondary', startPoint: { x: 450, y: 450 }, endPoint: { x: 650, y: 450 }, length: 200, lanes: 2, congestionLevel: 50, avgSpeed: 40, vehicleCount: 17, maxCapacity: 35, weather: 'clear', slipperyScore: 12, visibility: 90, speedLimit: 45, connectedSegments: ['seg_5', 'seg_10'] },
  { id: 'seg_12', name: 'Suburb Lane', type: 'residential', startPoint: { x: 50, y: 450 }, endPoint: { x: 250, y: 450 }, length: 200, lanes: 1, congestionLevel: 10, avgSpeed: 30, vehicleCount: 3, maxCapacity: 15, weather: 'rain', slipperyScore: 50, visibility: 65, speedLimit: 30, connectedSegments: ['seg_6'] },
  { id: 'seg_13', name: 'Tech Park Ave', type: 'main', startPoint: { x: 250, y: 450 }, endPoint: { x: 450, y: 450 }, length: 200, lanes: 2, congestionLevel: 35, avgSpeed: 50, vehicleCount: 11, maxCapacity: 30, weather: 'clear', slipperyScore: 8, visibility: 95, speedLimit: 55, connectedSegments: ['seg_7', 'seg_11'] },
  { id: 'seg_14', name: 'Airport Connector', type: 'highway', startPoint: { x: 750, y: 250 }, endPoint: { x: 750, y: 450 }, length: 200, lanes: 3, congestionLevel: 20, avgSpeed: 85, vehicleCount: 10, maxCapacity: 50, weather: 'clear', slipperyScore: 5, visibility: 100, speedLimit: 110, connectedSegments: ['seg_8'] },
  { id: 'seg_15', name: 'Downtown Core', type: 'intersection', startPoint: { x: 650, y: 350 }, endPoint: { x: 750, y: 350 }, length: 100, lanes: 4, congestionLevel: 75, avgSpeed: 20, vehicleCount: 28, maxCapacity: 40, weather: 'clear', slipperyScore: 10, visibility: 90, speedLimit: 35, connectedSegments: ['seg_9', 'seg_10', 'seg_14'] }
];

const INITIAL_FUEL_STATIONS: FuelStationData[] = [
  { id: 'station_1', name: 'QuickFuel Station', position: { x: 150, y: 200 }, fuelPrice: 1.45, availablePumps: 4, totalPumps: 6, waitTime: 3, rating: 4.5, isOpen: true, currentQueue: [] },
  { id: 'station_2', name: 'GreenEnergy Hub', position: { x: 550, y: 180 }, fuelPrice: 1.52, availablePumps: 2, totalPumps: 4, waitTime: 8, rating: 4.2, isOpen: true, currentQueue: [] },
  { id: 'station_3', name: 'Highway Services', position: { x: 700, y: 300 }, fuelPrice: 1.38, availablePumps: 6, totalPumps: 8, waitTime: 2, rating: 4.7, isOpen: true, currentQueue: [] },
  { id: 'station_4', name: 'CityGas Express', position: { x: 320, y: 420 }, fuelPrice: 1.48, availablePumps: 3, totalPumps: 5, waitTime: 5, rating: 4.0, isOpen: true, currentQueue: [] }
];

const INITIAL_SCENARIOS: ScenarioData[] = [
  { id: 'scenario_1', name: 'Fuel-Saving Arrival', description: 'Optimize arrival time to avoid traffic and save fuel', icon: '⛽', difficulty: 'easy', duration: 60 },
  { id: 'scenario_2', name: 'Urgent Delivery', description: 'High-priority delivery with time constraints', icon: '📦', difficulty: 'medium', duration: 45 },
  { id: 'scenario_3', name: 'Intersection Negotiation', description: '4 vehicles approach intersection simultaneously', icon: '🔀', difficulty: 'medium', duration: 30 },
  { id: 'scenario_4', name: 'Slippery Road Alert', description: 'Weather hazards affecting multiple vehicles', icon: '🌧️', difficulty: 'hard', duration: 90 },
  { id: 'scenario_5', name: 'Fleet Emergency', description: 'Ambulance dispatch with fleet-wide coordination', icon: '🚨', difficulty: 'extreme', duration: 120 }
];

const INITIAL_STATS: FleetStatsData = {
  totalVehicles: 8, activeVehicles: 7, emergencyVehicles: 1,
  avgFuelLevel: 56.25, avgSpeed: 53.75, totalDistance: 656, totalFuelConsumed: 93,
  totalNegotiations: 52, successfulNegotiations: 49, accidentsPreventedCount: 12,
  hazardsDetected: 8, hazardsAvoided: 7, fuelSavedLiters: 45.8, fuelSavedPercentage: 18.5,
  timeSavedMinutes: 125, delayReduction: 22.5, efficiencyScore: 87.3, safetyScore: 94.2,
  learningIterations: 156, predictionAccuracy: 89.7, co2Reduced: 34.2, uptimePercent: 99.8
};

// ============================================
// AI REASONING ENGINE
// ============================================

function aiDecision(context: string, factors: Record<string, number>): { decision: string; confidence: number; reasoning: string } {
  const totalWeight = Object.values(factors).reduce((s, v) => s + Math.abs(v), 0);
  const confidence = Math.min(0.98, 0.7 + totalWeight / 100);
  const factorStr = Object.entries(factors).map(([k, v]) => `${k}=${v.toFixed(1)}`).join(', ');
  return { decision: context, confidence, reasoning: `Evaluated: ${factorStr}` };
}

// ============================================
// CREATE STORE
// ============================================

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        user: null,
        authToken: null,
        isSimulating: false,
        isPaused: false,
        simulationSpeed: 1,
        currentTime: Date.now(),
        stepCount: 0,
        vehicles: INITIAL_VEHICLES,
        roadSegments: INITIAL_ROAD_SEGMENTS,
        fuelStations: INITIAL_FUEL_STATIONS,
        hazards: [],
        negotiations: [],
        alerts: [],
        aiLogs: [],
        stats: INITIAL_STATS,
        scenarios: INITIAL_SCENARIOS,
        activeScenario: null,
        historicalData: [],
        isPlayingBack: false,
        playbackIndex: 0,
        selectedVehicleId: null,
        selectedSegmentId: null,
        mapMode: '2d',
        showTraffic: true,
        showWeather: true,
        showHazards: true,
        showHeatMap: false,
        heatMapType: 'congestion',
        soundEnabled: false,
        showAIConsole: false,
        showComparison: false,
        showHowItWorks: false,
        sidebarCollapsed: false,
        activeTab: 'vehicles',
        isConnected: true,
        connectionLatency: 25,
        voice: { isListening: false, lastCommand: '', lastResponse: '', available: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window, commandHistory: [] },
        comparison: {
          withAI: { fuelUsed: 42.3, timeMin: 35, accidents: 0, avgSpeed: 62, emissions: 28.4 },
          withoutAI: { fuelUsed: 68.7, timeMin: 52, accidents: 3, avgSpeed: 41, emissions: 52.1 }
        },
        congestionHistory: [],
        fuelHistory: [],
        learningHistory: Array.from({ length: 20 }, (_, i) => ({ iteration: i * 10, accuracy: 65 + Math.random() * 5 + i * 1.2 })),

        // ============================================
        // ACTIONS
        // ============================================

        login: async (email: string, password: string) => {
          if (email && password.length >= 4) {
            const user: UserData = {
              id: 'user_' + Date.now(),
              email,
              name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              role: email.includes('admin') ? 'admin' : 'fleet_manager',
              fleetIds: ['fleet_main'],
              isActive: true
            };
            set({ isAuthenticated: true, user, authToken: 'jwt_' + Date.now() });
            return true;
          }
          return false;
        },

        logout: () => set({ isAuthenticated: false, user: null, authToken: null }),

        startSimulation: () => {
          set({ isSimulating: true, isPaused: false });
          get().addAILog({ id: `log_${Date.now()}`, timestamp: Date.now(), type: 'info', module: 'Simulation', action: 'START', message: '🟢 Simulation started - AI systems online' });
        },

        stopSimulation: () => {
          set({ isSimulating: false, isPaused: false });
          get().addAILog({ id: `log_${Date.now()}`, timestamp: Date.now(), type: 'info', module: 'Simulation', action: 'STOP', message: '🔴 Simulation stopped' });
        },

        pauseSimulation: () => set({ isPaused: true }),
        resumeSimulation: () => set({ isPaused: false }),
        setSimulationSpeed: (speed: number) => set({ simulationSpeed: speed }),

        stepSimulation: () => {
          const state = get();
          const step = state.stepCount;
          
          // Move vehicles with realistic physics
          const updatedVehicles = state.vehicles.map(vehicle => {
            if (vehicle.status === 'refueling') {
              const newFuel = Math.min(100, vehicle.fuelLevel + 2);
              if (newFuel >= 80) {
                return { ...vehicle, fuelLevel: newFuel, status: 'moving' as const };
              }
              return { ...vehicle, fuelLevel: newFuel };
            }
            
            if (vehicle.status !== 'moving' && vehicle.status !== 'emergency') return vehicle;

            const speedFactor = vehicle.speed / 3600;
            const rad = vehicle.heading * Math.PI / 180;
            const dx = Math.cos(rad) * speedFactor * 50 * state.simulationSpeed;
            const dy = Math.sin(rad) * speedFactor * 50 * state.simulationSpeed;

            let newX = vehicle.position.x + dx;
            let newY = vehicle.position.y + dy;
            let newHeading = vehicle.heading;

            // Bounce off boundaries with direction change
            if (newX < 50 || newX > 750) { newHeading = 180 - newHeading; newX = Math.max(50, Math.min(750, newX)); }
            if (newY < 50 || newY > 500) { newHeading = -newHeading; newY = Math.max(50, Math.min(500, newY)); }
            
            // Normalize heading
            newHeading = ((newHeading % 360) + 360) % 360;

            // Fuel consumption affected by speed and terrain
            const fuelMultiplier = vehicle.speed > 80 ? 1.5 : vehicle.speed > 60 ? 1.2 : 1.0;
            const fuelConsumed = (vehicle.fuelConsumptionRate / 3600) * state.simulationSpeed * 0.08 * fuelMultiplier;
            const newFuel = Math.max(0, vehicle.fuelLevel - fuelConsumed);

            // Auto-refuel when critically low
            let newStatus: VehicleData['status'] = vehicle.status;
            if (newFuel < 10 && vehicle.status !== 'emergency') {
              newStatus = 'refueling';
              const nearestStation = state.fuelStations.reduce((nearest, s) => {
                const dist = Math.hypot(s.position.x - newX, s.position.y - newY);
                const nDist = Math.hypot(nearest.position.x - newX, nearest.position.y - newY);
                return dist < nDist ? s : nearest;
              });
              newX = nearestStation.position.x + (Math.random() - 0.5) * 20;
              newY = nearestStation.position.y + (Math.random() - 0.5) * 20;
              
              if (step % 10 === 0) {
                get().addAILog({
                  id: `log_fuel_${Date.now()}_${vehicle.id}`,
                  timestamp: Date.now(),
                  type: 'decision',
                  module: 'Fuel Optimizer',
                  action: 'REFUEL',
                  message: `⛽ ${vehicle.name} fuel critical (${newFuel.toFixed(1)}%). Routing to ${nearestStation.name}`,
                  confidence: 0.95,
                  vehicleId: vehicle.id
                });
              }
            }

            // Speed variation based on traffic
            const currentSeg = state.roadSegments.find(s => s.id === vehicle.currentSegment);
            let newSpeed = vehicle.speed + (Math.random() - 0.5) * 3;
            if (currentSeg && currentSeg.congestionLevel > 60) {
              newSpeed = Math.max(15, newSpeed - 5);
            }
            newSpeed = Math.max(10, Math.min(vehicle.maxSpeed, newSpeed));
            
            // Engine temp
            const newEngineTemp = Math.max(70, Math.min(110, vehicle.engineTemp + (Math.random() - 0.48) * 2));

            return {
              ...vehicle,
              position: { x: newX, y: newY },
              heading: newHeading,
              fuelLevel: newFuel,
              status: newStatus,
              speed: Math.round(newSpeed),
              distanceTraveled: vehicle.distanceTraveled + Math.abs(dx) + Math.abs(dy),
              fuelConsumed: vehicle.fuelConsumed + fuelConsumed * 0.01,
              routeProgress: Math.min(1, vehicle.routeProgress + 0.005 * state.simulationSpeed),
              engineTemp: Math.round(newEngineTemp * 10) / 10,
              co2Emissions: vehicle.co2Emissions + fuelConsumed * 0.002,
              odometerKm: vehicle.odometerKm + Math.abs(dx) + Math.abs(dy)
            };
          });

          // Update traffic segments dynamically
          const updatedSegments = state.roadSegments.map(segment => {
            const timeOfDay = (Date.now() / 60000) % 24;
            const rushHourFactor = (timeOfDay > 7 && timeOfDay < 9) || (timeOfDay > 16 && timeOfDay < 18) ? 15 : 0;
            return {
              ...segment,
              congestionLevel: Math.max(0, Math.min(100, 
                segment.congestionLevel + (Math.random() - 0.48) * 4 + rushHourFactor * 0.01
              )),
              avgSpeed: Math.max(10, Math.min(segment.speedLimit, 
                segment.avgSpeed + (Math.random() - 0.5) * 2
              )),
              slipperyScore: segment.weather !== 'clear' 
                ? Math.min(100, segment.slipperyScore + Math.random() * 2)
                : Math.max(0, segment.slipperyScore - 0.5)
            };
          });

          // Calculate stats
          const avgFuel = updatedVehicles.reduce((s, v) => s + v.fuelLevel, 0) / updatedVehicles.length;
          const avgSpeed = updatedVehicles.reduce((s, v) => s + v.speed, 0) / updatedVehicles.length;
          const activeCount = updatedVehicles.filter(v => v.status === 'moving' || v.status === 'emergency').length;

          // Record congestion history
          const newCongestionHistory = [...state.congestionHistory, {
            time: Date.now(),
            segments: updatedSegments.map(s => ({ id: s.id, level: s.congestionLevel }))
          }].slice(-100);

          // Record fuel history
          const newFuelHistory = [...state.fuelHistory, {
            time: Date.now(),
            vehicles: updatedVehicles.map(v => ({ id: v.id, level: v.fuelLevel }))
          }].slice(-100);

          // Update comparison data gradually
          const newComparison = {
            withAI: {
              fuelUsed: state.comparison.withAI.fuelUsed + 0.02,
              timeMin: state.comparison.withAI.timeMin + 0.01,
              accidents: state.comparison.withAI.accidents,
              avgSpeed: Math.round(avgSpeed),
              emissions: state.comparison.withAI.emissions + 0.01
            },
            withoutAI: {
              fuelUsed: state.comparison.withoutAI.fuelUsed + 0.06,
              timeMin: state.comparison.withoutAI.timeMin + 0.03,
              accidents: state.comparison.withoutAI.accidents + (Math.random() < 0.002 ? 1 : 0),
              avgSpeed: Math.max(20, Math.round(avgSpeed * 0.7)),
              emissions: state.comparison.withoutAI.emissions + 0.04
            }
          };

          set({
            vehicles: updatedVehicles,
            roadSegments: updatedSegments,
            stepCount: step + 1,
            currentTime: Date.now(),
            congestionHistory: newCongestionHistory,
            fuelHistory: newFuelHistory,
            comparison: newComparison,
            stats: {
              ...state.stats,
              avgFuelLevel: Math.round(avgFuel * 10) / 10,
              avgSpeed: Math.round(avgSpeed * 10) / 10,
              activeVehicles: activeCount,
              learningIterations: state.stats.learningIterations + 0.1,
              predictionAccuracy: Math.min(99.5, state.stats.predictionAccuracy + 0.005),
              efficiencyScore: Math.min(99, state.stats.efficiencyScore + 0.01),
              fuelSavedLiters: state.stats.fuelSavedLiters + 0.02,
              fuelSavedPercentage: Math.min(35, state.stats.fuelSavedPercentage + 0.005),
              co2Reduced: state.stats.co2Reduced + 0.01,
              timeSavedMinutes: state.stats.timeSavedMinutes + 0.05
            }
          });

          // Random negotiation events
          if (Math.random() < 0.04) {
            const movingVehicles = updatedVehicles.filter(v => v.status === 'moving' || v.status === 'emergency');
            const participants = movingVehicles.slice(0, Math.floor(Math.random() * 3) + 2).map(v => v.id);
            if (participants.length >= 2) {
              const types: NegotiationData['type'][] = ['intersection', 'merge', 'lane_change', 'fuel_priority'];
              const type = types[Math.floor(Math.random() * types.length)];
              const negId = `neg_${Date.now()}`;
              
              const ai = aiDecision(`${type} negotiation`, { urgency: Math.random() * 10, proximity: Math.random() * 50, fuel: Math.random() * 100 });
              
              get().addNegotiation({
                id: negId,
                type,
                status: 'in_progress',
                vehicleIds: participants,
                locationId: 'int_' + Math.floor(Math.random() * 5),
                initiatedAt: Date.now(),
                outcome: '',
                reasoning: [ai.reasoning],
                priorityOrder: participants,
                speedAdjustments: participants.map(id => ({ vehicleId: id, newSpeed: 40 + Math.random() * 30 }))
              });

              setTimeout(() => {
                get().completeNegotiation(negId, `✅ ${type} resolved: All ${participants.length} vehicles coordinated safely`);
              }, 1500 + Math.random() * 2000);
            }
          }

          // Random hazard events
          if (Math.random() < 0.015) {
            const hazardTypes: HazardData['type'][] = ['debris', 'weather', 'construction', 'accident', 'animal', 'road_damage'];
            const severities: HazardData['severity'][] = ['low', 'medium', 'high', 'critical'];
            const hazard: HazardData = {
              id: `haz_${Date.now()}`,
              type: hazardTypes[Math.floor(Math.random() * hazardTypes.length)],
              severity: severities[Math.floor(Math.random() * severities.length)],
              position: { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 },
              segmentId: `seg_${Math.floor(Math.random() * 15) + 1}`,
              description: 'AI detected hazard on road segment',
              reportedAt: Date.now(),
              expectedClearTime: Date.now() + 120000 + Math.random() * 180000,
              isActive: true
            };
            get().addHazard(hazard);

            // Auto-clear hazards after their expected time
            setTimeout(() => {
              get().removeHazard(hazard.id);
            }, 30000 + Math.random() * 60000);
          }

          // AI learning log periodically
          if (step % 25 === 0 && step > 0) {
            const newAccuracy = Math.min(99, state.stats.predictionAccuracy + Math.random() * 0.5);
            set(s => ({
              learningHistory: [...s.learningHistory, { iteration: step, accuracy: newAccuracy }].slice(-50)
            }));
            
            get().addAILog({
              id: `log_learn_${Date.now()}`,
              timestamp: Date.now(),
              type: 'learning',
              module: 'Neural Network',
              action: 'TRAIN',
              message: `🧠 Model retrained: accuracy ${newAccuracy.toFixed(1)}% (+${(Math.random() * 0.3).toFixed(2)}%)`,
              confidence: newAccuracy / 100
            });
          }
        },

        resetSimulation: () => {
          set({
            vehicles: INITIAL_VEHICLES,
            roadSegments: INITIAL_ROAD_SEGMENTS,
            fuelStations: INITIAL_FUEL_STATIONS,
            hazards: [],
            negotiations: [],
            alerts: [],
            aiLogs: [],
            stepCount: 0,
            stats: INITIAL_STATS,
            activeScenario: null,
            congestionHistory: [],
            fuelHistory: [],
            learningHistory: Array.from({ length: 20 }, (_, i) => ({ iteration: i * 10, accuracy: 65 + Math.random() * 5 + i * 1.2 })),
            comparison: {
              withAI: { fuelUsed: 42.3, timeMin: 35, accidents: 0, avgSpeed: 62, emissions: 28.4 },
              withoutAI: { fuelUsed: 68.7, timeMin: 52, accidents: 3, avgSpeed: 41, emissions: 52.1 }
            }
          });
        },

        runScenario: (scenarioId: string) => {
          const state = get();
          set({ activeScenario: scenarioId, isSimulating: true, isPaused: false });
          
          const scenario = state.scenarios.find(s => s.id === scenarioId);
          if (!scenario) return;

          get().addAILog({ id: `log_${Date.now()}`, timestamp: Date.now(), type: 'info', module: 'Scenario Engine', action: 'RUN', message: `🎬 Running: ${scenario.name} - ${scenario.description}` });

          // Scenario-specific vehicle updates
          if (scenarioId === 'scenario_1') {
            get().updateVehicle('v1', { speed: 40, recommendedSpeed: 40 });
            get().addAILog({ id: `log_${Date.now()}_s1`, timestamp: Date.now(), type: 'optimization', module: 'Fuel Optimizer', action: 'SLOW_DOWN', message: '⛽ Alpha Car slowing to 40km/h - arriving after congestion clears saves 2.3L fuel', confidence: 0.94 });
          } else if (scenarioId === 'scenario_2') {
            get().updateVehicle('v2', { urgency: 9, speed: 75, status: 'moving' });
            get().addAILog({ id: `log_${Date.now()}_s2`, timestamp: Date.now(), type: 'decision', module: 'Route Planner', action: 'PRIORITY', message: '📦 Beta Truck urgency raised to 9 - fastest route calculated, other vehicles yielding', confidence: 0.91 });
          } else if (scenarioId === 'scenario_3') {
            ['v1', 'v3', 'v5', 'v7'].forEach(id => get().updateVehicle(id, { status: 'negotiating' }));
            setTimeout(() => {
              get().addNegotiation({
                id: `neg_scenario_${Date.now()}`, type: 'intersection', status: 'in_progress',
                vehicleIds: ['v1', 'v3', 'v5', 'v7'], locationId: 'int_main',
                initiatedAt: Date.now(), outcome: '', reasoning: ['Emergency vehicle has highest priority', 'Analyzing approach speeds and angles'],
                priorityOrder: ['v3', 'v1', 'v5', 'v7'],
                speedAdjustments: [{ vehicleId: 'v1', newSpeed: 30 }, { vehicleId: 'v5', newSpeed: 25 }, { vehicleId: 'v7', newSpeed: 20 }]
              });
            }, 1000);
          } else if (scenarioId === 'scenario_4') {
            ['seg_3', 'seg_6', 'seg_12'].forEach(id => get().updateSegment(id, { weather: 'heavy_rain', slipperyScore: 75, visibility: 40 }));
            get().addHazard({ id: `haz_rain_${Date.now()}`, type: 'weather', severity: 'high', position: { x: 250, y: 350 }, segmentId: 'seg_3', description: 'Heavy rain causing slippery conditions', reportedAt: Date.now(), expectedClearTime: Date.now() + 600000, isActive: true });
          } else if (scenarioId === 'scenario_5') {
            get().triggerEmergency('v3');
          }
        },

        updateVehicle: (id, updates) => set(s => ({ vehicles: s.vehicles.map(v => v.id === id ? { ...v, ...updates } : v) })),
        updateSegment: (id, updates) => set(s => ({ roadSegments: s.roadSegments.map(seg => seg.id === id ? { ...seg, ...updates } : seg) })),

        addHazard: (hazard) => {
          set(s => ({ hazards: [...s.hazards, hazard], stats: { ...s.stats, hazardsDetected: s.stats.hazardsDetected + 1 } }));
          get().addAlert({ id: `alert_haz_${Date.now()}`, type: 'hazard', severity: hazard.severity, title: `⚠️ ${hazard.type.replace(/_/g, ' ').toUpperCase()}`, message: hazard.description, timestamp: Date.now(), acknowledged: false });
          get().addAILog({ id: `log_haz_${Date.now()}`, timestamp: Date.now(), type: 'warning', module: 'Hazard Detection', action: 'DETECT', message: `⚠️ ${hazard.severity.toUpperCase()} hazard: ${hazard.type} on ${hazard.segmentId}`, confidence: 0.92 });
        },

        removeHazard: (id) => set(s => ({ hazards: s.hazards.filter(h => h.id !== id), stats: { ...s.stats, hazardsAvoided: s.stats.hazardsAvoided + 1 } })),

        addNegotiation: (neg) => {
          set(s => ({ negotiations: [neg, ...s.negotiations.slice(0, 49)] }));
          get().addAILog({ id: `log_neg_${Date.now()}`, timestamp: Date.now(), type: 'negotiation', module: 'Negotiation Engine', action: 'START', message: `🤝 ${neg.type} negotiation: ${neg.vehicleIds.length} vehicles coordinating`, confidence: 0.88 });
        },

        completeNegotiation: (id, outcome) => {
          set(s => ({
            negotiations: s.negotiations.map(n => n.id === id ? { ...n, status: 'completed' as const, completedAt: Date.now(), outcome } : n),
            stats: { ...s.stats, totalNegotiations: s.stats.totalNegotiations + 1, successfulNegotiations: outcome.includes('✅') ? s.stats.successfulNegotiations + 1 : s.stats.successfulNegotiations, accidentsPreventedCount: s.stats.accidentsPreventedCount + (Math.random() < 0.3 ? 1 : 0) }
          }));
        },

        addAlert: (alert) => set(s => ({ alerts: [alert, ...s.alerts.slice(0, 29)] })),
        dismissAlert: (id) => set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a) })),
        addAILog: (log) => set(s => ({ aiLogs: [log, ...s.aiLogs.slice(0, 99)] })),
        updateStats: (updates) => set(s => ({ stats: { ...s.stats, ...updates } })),

        selectVehicle: (id) => set({ selectedVehicleId: id }),
        selectSegment: (id) => set({ selectedSegmentId: id }),
        setMapMode: (mode) => set({ mapMode: mode }),
        toggleTraffic: () => set(s => ({ showTraffic: !s.showTraffic })),
        toggleWeather: () => set(s => ({ showWeather: !s.showWeather })),
        toggleHazards: () => set(s => ({ showHazards: !s.showHazards })),
        toggleHeatMap: () => set(s => ({ showHeatMap: !s.showHeatMap })),
        setHeatMapType: (type) => set({ heatMapType: type }),
        toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
        toggleAIConsole: () => set(s => ({ showAIConsole: !s.showAIConsole })),
        toggleComparison: () => set(s => ({ showComparison: !s.showComparison })),
        toggleHowItWorks: () => set(s => ({ showHowItWorks: !s.showHowItWorks })),
        toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        setActiveTab: (tab) => set({ activeTab: tab }),

        recordSnapshot: () => {
          const s = get();
          if (s.stepCount % 5 !== 0) return; // Record every 5 steps
          const snapshot: HistoricalSnapshot = { timestamp: Date.now(), vehicles: [...s.vehicles], traffic: [...s.roadSegments], hazards: [...s.hazards], stats: { ...s.stats } };
          set(state => ({ historicalData: [...state.historicalData, snapshot].slice(-200) }));
        },

        startPlayback: () => set({ isPlayingBack: true, playbackIndex: 0, isSimulating: false }),
        stopPlayback: () => set({ isPlayingBack: false }),
        setPlaybackIndex: (index) => {
          const s = get();
          if (index >= 0 && index < s.historicalData.length) {
            const snap = s.historicalData[index];
            set({ playbackIndex: index, vehicles: snap.vehicles, roadSegments: snap.traffic, hazards: snap.hazards, stats: snap.stats });
          }
        },

        exportData: (format) => {
          const s = get();
          const data = { exportedAt: new Date().toISOString(), vehicles: s.vehicles, roadSegments: s.roadSegments, hazards: s.hazards, negotiations: s.negotiations, stats: s.stats, aiLogs: s.aiLogs.slice(0, 50), historicalSnapshots: s.historicalData.length };
          if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `fleet_export_${Date.now()}.json`; a.click();
          } else {
            const headers = 'id,name,type,speed,fuelLevel,status,urgency,lat,lng\n';
            const rows = s.vehicles.map(v => `${v.id},${v.name},${v.type},${v.speed},${v.fuelLevel.toFixed(1)},${v.status},${v.urgency},${v.position.x},${v.position.y}`).join('\n');
            const blob = new Blob([headers + rows], { type: 'text/csv' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `fleet_export_${Date.now()}.csv`; a.click();
          }
        },

        setConnectionStatus: (connected, latency) => set({ isConnected: connected, connectionLatency: latency }),

        processVoiceCommand: (command: string) => {
          const cmd = command.toLowerCase().trim();
          let response = '';

          if (cmd.includes('start') || cmd.includes('begin') || cmd.includes('go')) {
            get().startSimulation(); response = 'Simulation started. All vehicles are now in motion.';
          } else if (cmd.includes('stop') || cmd.includes('halt')) {
            get().stopSimulation(); response = 'Simulation stopped.';
          } else if (cmd.includes('pause')) {
            get().pauseSimulation(); response = 'Simulation paused.';
          } else if (cmd.includes('resume') || cmd.includes('continue')) {
            get().resumeSimulation(); response = 'Simulation resumed.';
          } else if (cmd.includes('reset')) {
            get().resetSimulation(); response = 'System reset to initial state.';
          } else if (cmd.includes('emergency')) {
            get().triggerEmergency('v3'); response = 'Emergency protocol activated for Emergency-01.';
          } else if (cmd.includes('scenario 1') || cmd.includes('fuel saving')) {
            get().runScenario('scenario_1'); response = 'Running Fuel-Saving Arrival scenario.';
          } else if (cmd.includes('scenario 2') || cmd.includes('urgent')) {
            get().runScenario('scenario_2'); response = 'Running Urgent Delivery scenario.';
          } else if (cmd.includes('scenario 3') || cmd.includes('intersection')) {
            get().runScenario('scenario_3'); response = 'Running Intersection Negotiation scenario.';
          } else if (cmd.includes('scenario 4') || cmd.includes('weather') || cmd.includes('rain')) {
            get().runScenario('scenario_4'); response = 'Running Slippery Road Alert scenario.';
          } else if (cmd.includes('scenario 5') || cmd.includes('fleet emergency')) {
            get().runScenario('scenario_5'); response = 'Running Fleet Emergency scenario.';
          } else if (cmd.includes('status') || cmd.includes('report')) {
            const s = get().stats;
            response = `Fleet status: ${s.activeVehicles} active vehicles, average fuel ${s.avgFuelLevel.toFixed(0)}%, ${s.totalNegotiations} negotiations completed, efficiency ${s.efficiencyScore.toFixed(1)}%.`;
          } else if (cmd.includes('speed up') || cmd.includes('faster')) {
            const newSpeed = Math.min(10, get().simulationSpeed * 2);
            get().setSimulationSpeed(newSpeed); response = `Speed set to ${newSpeed}x.`;
          } else if (cmd.includes('slow down') || cmd.includes('slower')) {
            const newSpeed = Math.max(1, get().simulationSpeed / 2);
            get().setSimulationSpeed(newSpeed); response = `Speed set to ${newSpeed}x.`;
          } else if (cmd.includes('3d') || cmd.includes('three d')) {
            get().setMapMode('3d'); response = 'Switched to 3D map view.';
          } else if (cmd.includes('2d') || cmd.includes('two d')) {
            get().setMapMode('2d'); response = 'Switched to 2D map view.';
          } else if (cmd.includes('export')) {
            get().exportData('json'); response = 'Exporting fleet data as JSON.';
          } else {
            response = `Command not recognized: "${command}". Try: start, stop, pause, status, emergency, scenario 1-5, speed up, slow down, 3d, 2d, export.`;
          }

          const entry = { command, response, timestamp: Date.now() };
          set(s => ({ voice: { ...s.voice, lastCommand: command, lastResponse: response, commandHistory: [entry, ...s.voice.commandHistory.slice(0, 19)] } }));
          get().addAILog({ id: `log_voice_${Date.now()}`, timestamp: Date.now(), type: 'voice', module: 'Voice Control', action: 'COMMAND', message: `🎤 "${command}" → ${response}` });
          
          return response;
        },

        setVoiceListening: (listening) => set(s => ({ voice: { ...s.voice, isListening: listening } })),

        triggerEmergency: (vehicleId) => {
          get().updateVehicle(vehicleId, { status: 'emergency', urgency: 10, speed: 90 });
          const state = get();
          
          // All other vehicles yield
          state.vehicles.filter(v => v.id !== vehicleId && v.status === 'moving').forEach(v => {
            get().updateVehicle(v.id, { status: 'yielding', speed: Math.max(15, v.speed - 20), recommendedSpeed: 20 });
            setTimeout(() => get().updateVehicle(v.id, { status: 'moving', speed: v.speed }), 8000 + Math.random() * 4000);
          });

          get().addNegotiation({
            id: `neg_emg_${Date.now()}`, type: 'emergency', status: 'in_progress',
            vehicleIds: state.vehicles.map(v => v.id), locationId: 'fleet_wide',
            initiatedAt: Date.now(), outcome: '', reasoning: ['Emergency vehicle dispatched', 'All vehicles instructed to yield', 'Lane clearance protocol activated'],
            priorityOrder: [vehicleId, ...state.vehicles.filter(v => v.id !== vehicleId).map(v => v.id)],
            speedAdjustments: state.vehicles.map(v => ({ vehicleId: v.id, newSpeed: v.id === vehicleId ? 90 : 20 }))
          });

          get().addAlert({ id: `alert_emg_${Date.now()}`, type: 'emergency', severity: 'critical', title: '🚨 EMERGENCY DISPATCH', message: `${state.vehicles.find(v => v.id === vehicleId)?.name} dispatched - all vehicles yielding`, timestamp: Date.now(), acknowledged: false });
          get().addAILog({ id: `log_emg_${Date.now()}`, timestamp: Date.now(), type: 'decision', module: 'Emergency Protocol', action: 'DISPATCH', message: `🚨 EMERGENCY: Fleet-wide yield order issued. ${state.vehicles.length - 1} vehicles adjusting.`, confidence: 0.99 });
        },

        optimizeRoute: (vehicleId, mode) => {
          const v = get().vehicles.find(veh => veh.id === vehicleId);
          if (!v) return;
          const modeConfig = { fuel_saving: { speed: v.maxSpeed * 0.5, msg: 'eco-driving' }, fastest: { speed: v.maxSpeed * 0.85, msg: 'fastest route' }, balanced: { speed: v.maxSpeed * 0.65, msg: 'balanced optimization' } };
          const cfg = modeConfig[mode];
          get().updateVehicle(vehicleId, { recommendedSpeed: cfg.speed, speed: cfg.speed });
          get().addAILog({ id: `log_route_${Date.now()}`, timestamp: Date.now(), type: 'optimization', module: 'Route Optimizer', action: 'OPTIMIZE', message: `🗺️ ${v.name}: ${cfg.msg} applied. New speed: ${cfg.speed.toFixed(0)} km/h`, confidence: 0.93, vehicleId });
        }
      }),
      {
        name: 'vehicle-ecosystem-v3',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          authToken: state.authToken,
          soundEnabled: state.soundEnabled,
          mapMode: state.mapMode
        })
      }
    ),
    { name: 'VehicleEcosystem' }
  )
);

export default useStore;
