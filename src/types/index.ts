// ============================================
// COMPREHENSIVE TYPE DEFINITIONS
// AI-Powered Vehicle Ecosystem v2.0
// ============================================

// ============================================
// GEOGRAPHIC TYPES
// ============================================
export interface GeoLocation {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface GeoCoordinate {
  x: number;
  y: number;
  z?: number;
}

// ============================================
// VEHICLE TYPES
// ============================================
export type VehicleType = 'car' | 'truck' | 'ambulance' | 'bus' | 'motorcycle' | 'van' | 'suv' | 'police' | 'fire_truck';
export type VehicleStatus = 'moving' | 'stopped' | 'negotiating' | 'refueling' | 'yielding' | 'emergency' | 'parking' | 'waiting' | 'charging';
export type DrivingStyle = 'aggressive' | 'normal' | 'eco' | 'cautious';

export interface VehicleSensors {
  frontDistance: number;
  rearDistance: number;
  leftDistance: number;
  rightDistance: number;
  speed: number;
  acceleration: number;
  steeringAngle: number;
  engineTemp: number;
  tirePreassure: number[];
  brakeHealth: number;
  batteryVoltage: number;
}

export interface VehicleTelemetry {
  timestamp: number;
  location: GeoLocation;
  speed: number;
  heading: number;
  acceleration: number;
  fuelLevel: number;
  engineRPM: number;
  throttlePosition: number;
  brakePosition: number;
  steeringAngle: number;
  gForce: { x: number; y: number; z: number };
  tirePressure: number[];
  engineTemperature: number;
  oilPressure: number;
  batteryVoltage: number;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  speed: number;
  maxSpeed: number;
  recommendedSpeed: number;
  fuelLevel: number;
  fuelCapacity: number;
  fuelConsumptionRate: number;
  location: GeoLocation;
  position: GeoCoordinate;
  destination: GeoLocation;
  destinationPosition: GeoCoordinate;
  urgency: number;
  status: VehicleStatus;
  eta: number;
  currentSegment: string;
  lane: number;
  heading: number;
  acceleration: number;
  drivingStyle: DrivingStyle;
  passengerCount: number;
  weight: number;
  color: string;
  plateNumber: string;
  route: string[];
  routeProgress: number;
  distanceTraveled: number;
  fuelConsumed: number;
  negotiationsParticipated: number;
  hazardsAvoided: number;
  sensors: VehicleSensors;
  telemetryHistory: VehicleTelemetry[];
  createdAt: number;
  lastUpdated: number;
  ownerId?: string;
  fleetId?: string;
}

// ============================================
// ROAD & TRAFFIC TYPES
// ============================================
export type RoadType = 'highway' | 'main' | 'secondary' | 'residential' | 'intersection';
export type WeatherCondition = 'clear' | 'rain' | 'heavy_rain' | 'snow' | 'fog' | 'storm' | 'wind' | 'ice';
export type TrafficDensity = 'free' | 'light' | 'moderate' | 'heavy' | 'gridlock';

export interface RoadCondition {
  slipperyScore: number;
  visibility: number;
  surfaceQuality: number;
  waterLevel: number;
  iceLevel: number;
  debrisPresent: boolean;
  constructionZone: boolean;
  speedLimit: number;
}

export interface TrafficSegment {
  id: string;
  name: string;
  type: RoadType;
  startPoint: GeoCoordinate;
  endPoint: GeoCoordinate;
  length: number;
  lanes: number;
  congestionLevel: number;
  avgSpeed: number;
  vehicleCount: number;
  maxCapacity: number;
  density: TrafficDensity;
  incidentDetected: boolean;
  incidentType?: string;
  weather: WeatherCondition;
  condition: RoadCondition;
  speedLimit: number;
  connectedSegments: string[];
  historicalCongestion: number[];
  predictedCongestion: number[];
}

export interface Intersection {
  id: string;
  name: string;
  position: GeoCoordinate;
  connectedSegments: string[];
  trafficLight: TrafficLight;
  vehiclesApproaching: string[];
  activeNegotiation: boolean;
  lastNegotiationTime: number;
}

export interface TrafficLight {
  currentPhase: 'red' | 'yellow' | 'green';
  timeRemaining: number;
  phases: { direction: string; duration: number }[];
  isAdaptive: boolean;
  aiControlled: boolean;
}

// ============================================
// FUEL & ENERGY TYPES
// ============================================
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'hydrogen';
export type StationType = 'gas_station' | 'charging_station' | 'hydrogen_station';

export interface FuelStation {
  id: string;
  name: string;
  type: StationType;
  location: GeoLocation;
  position: GeoCoordinate;
  fuelTypes: { type: FuelType; price: number; available: boolean }[];
  pumpCount: number;
  availablePumps: number;
  currentQueue: string[];
  waitTime: number;
  rating: number;
  amenities: string[];
  operatingHours: { open: string; close: string };
  isOpen: boolean;
  historicalPrices: { date: number; prices: { [key: string]: number } }[];
}

export interface RefuelPlan {
  stationId: string;
  estimatedArrival: number;
  fuelAmount: number;
  cost: number;
  waitTime: number;
  detourDistance: number;
  detourTime: number;
  priority: number;
}

// ============================================
// HAZARD & ALERT TYPES
// ============================================
export type HazardType = 'accident' | 'debris' | 'weather' | 'construction' | 'animal' | 'pedestrian' | 'vehicle_breakdown' | 'road_damage' | 'flooding' | 'fire';
export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'hazard' | 'traffic' | 'fuel' | 'negotiation' | 'emergency' | 'system' | 'weather' | 'maintenance';

export interface Hazard {
  id: string;
  type: HazardType;
  severity: HazardSeverity;
  location: GeoLocation;
  position: GeoCoordinate;
  segmentId: string;
  description: string;
  affectedLanes: number[];
  reportedAt: number;
  expectedClearTime: number;
  verifiedBy: string[];
  responseUnits: string[];
  isActive: boolean;
  impactRadius: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: HazardSeverity;
  title: string;
  message: string;
  timestamp: number;
  vehicleIds: string[];
  segmentIds: string[];
  hazardId?: string;
  acknowledged: boolean;
  autoResolve: boolean;
  resolvedAt?: number;
}

// ============================================
// NEGOTIATION TYPES
// ============================================
export type NegotiationType = 'intersection' | 'merge' | 'emergency' | 'fuel_priority' | 'lane_change' | 'overtake' | 'parking';
export type NegotiationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface NegotiationParticipant {
  vehicleId: string;
  priority: number;
  urgency: number;
  fuelCritical: boolean;
  isEmergency: boolean;
  requestedAction: string;
  assignedAction: string;
  speedAdjustment: number;
  laneAssignment: number;
  waitTime: number;
  consent: boolean;
}

export interface Negotiation {
  id: string;
  type: NegotiationType;
  status: NegotiationStatus;
  locationId: string;
  participants: NegotiationParticipant[];
  initiatedAt: number;
  completedAt?: number;
  duration: number;
  outcome: string;
  reasoning: string[];
  consensusReached: boolean;
  conflictsResolved: number;
  aiDecisions: AIDecision[];
}

export interface AIDecision {
  timestamp: number;
  decision: string;
  reasoning: string;
  confidence: number;
  factors: { name: string; weight: number; value: number }[];
  outcome?: string;
}

// ============================================
// ANALYTICS & METRICS TYPES
// ============================================
export interface FleetStatistics {
  totalVehicles: number;
  activeVehicles: number;
  idleVehicles: number;
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
  systemUptime: number;
  lastUpdated: number;
}

export interface HeatMapData {
  segmentId: string;
  value: number;
  intensity: number;
  type: 'congestion' | 'speed' | 'incidents' | 'fuel_consumption';
}

export interface PredictiveGraph {
  timestamps: number[];
  actual: number[];
  predicted: number[];
  confidence: number[];
  labels: string[];
}

export interface HistoricalDataPoint {
  timestamp: number;
  vehicles: Vehicle[];
  traffic: TrafficSegment[];
  negotiations: Negotiation[];
  hazards: Hazard[];
  stats: FleetStatistics;
}

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================
export type UserRole = 'admin' | 'fleet_manager' | 'driver' | 'analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  fleetIds: string[];
  vehicleIds: string[];
  permissions: string[];
  preferences: UserPreferences;
  createdAt: number;
  lastLogin: number;
  isActive: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    types: AlertType[];
  };
  dashboard: {
    layout: string;
    widgets: string[];
    refreshRate: number;
  };
  map: {
    style: '2d' | '3d';
    showTraffic: boolean;
    showWeather: boolean;
    showHazards: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface Fleet {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  managerIds: string[];
  vehicleIds: string[];
  statistics: FleetStatistics;
  settings: FleetSettings;
  createdAt: number;
}

export interface FleetSettings {
  maxVehicles: number;
  fuelThreshold: number;
  emergencyProtocol: string;
  negotiationStrategy: string;
  learningEnabled: boolean;
  autoDispatch: boolean;
}

// ============================================
// WEBSOCKET & REAL-TIME TYPES
// ============================================
export type WebSocketEventType = 
  | 'vehicle_update'
  | 'traffic_update'
  | 'negotiation_start'
  | 'negotiation_complete'
  | 'hazard_detected'
  | 'hazard_resolved'
  | 'alert_new'
  | 'alert_resolved'
  | 'fuel_critical'
  | 'emergency_dispatch'
  | 'system_status'
  | 'user_action';

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: unknown;
  timestamp: number;
  senderId?: string;
  targetIds?: string[];
}

export interface ConnectionStatus {
  isConnected: boolean;
  latency: number;
  lastPing: number;
  reconnectAttempts: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

// ============================================
// SIMULATION & SCENARIO TYPES
// ============================================
export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  currentTime: number;
  startTime: number;
  elapsedTime: number;
  stepCount: number;
  scenario: Scenario | null;
  vehicles: Vehicle[];
  traffic: TrafficSegment[];
  intersections: Intersection[];
  fuelStations: FuelStation[];
  hazards: Hazard[];
  negotiations: Negotiation[];
  alerts: Alert[];
  statistics: FleetStatistics;
  history: HistoricalDataPoint[];
  aiLogs: AILogEntry[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  objectives: ScenarioObjective[];
  initialState: Partial<SimulationState>;
  events: ScenarioEvent[];
  duration: number;
  completed: boolean;
  score?: number;
}

export interface ScenarioObjective {
  id: string;
  description: string;
  type: 'fuel_efficiency' | 'time_optimization' | 'safety' | 'negotiations' | 'emergency_response';
  target: number;
  current: number;
  completed: boolean;
}

export interface ScenarioEvent {
  id: string;
  triggerTime: number;
  triggerCondition?: string;
  action: string;
  params: Record<string, unknown>;
  triggered: boolean;
}

// ============================================
// AI & MACHINE LEARNING TYPES
// ============================================
export interface AIModel {
  id: string;
  name: string;
  type: 'traffic_prediction' | 'fuel_optimization' | 'hazard_detection' | 'negotiation' | 'route_planning';
  version: string;
  accuracy: number;
  trainedIterations: number;
  lastTrained: number;
  weights: number[];
  hyperparameters: Record<string, number>;
}

export interface AILogEntry {
  id: string;
  timestamp: number;
  type: 'decision' | 'prediction' | 'learning' | 'optimization' | 'negotiation';
  module: string;
  action: string;
  reasoning: string;
  confidence: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  outcome?: 'success' | 'failure' | 'pending';
  accuracy?: number;
}

export interface LearningMetrics {
  totalIterations: number;
  currentAccuracy: number;
  accuracyHistory: { iteration: number; accuracy: number }[];
  lossHistory: { iteration: number; loss: number }[];
  improvements: { metric: string; before: number; after: number; change: number }[];
  lastImprovement: number;
}

// ============================================
// EXPORT & REPORTING TYPES
// ============================================
export type ExportFormat = 'json' | 'csv' | 'pdf' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  dateRange: { start: number; end: number };
  includeVehicles: boolean;
  includeTraffic: boolean;
  includeNegotiations: boolean;
  includeHazards: boolean;
  includeStatistics: boolean;
  includeAILogs: boolean;
  filters: Record<string, unknown>;
}

export interface Report {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: number;
  dateRange: { start: number; end: number };
  statistics: FleetStatistics;
  highlights: string[];
  recommendations: string[];
  charts: { type: string; data: unknown }[];
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// 3D MAP TYPES
// ============================================
export interface Map3DConfig {
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  zoom: number;
  rotation: number;
  tilt: number;
  lighting: {
    ambient: number;
    directional: number;
    shadows: boolean;
  };
  effects: {
    fog: boolean;
    bloom: boolean;
    particles: boolean;
  };
}

export interface Map3DObject {
  id: string;
  type: 'vehicle' | 'building' | 'road' | 'station' | 'hazard' | 'marker';
  position: GeoCoordinate;
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  model: string;
  color: string;
  opacity: number;
  visible: boolean;
  interactive: boolean;
  data?: unknown;
}
