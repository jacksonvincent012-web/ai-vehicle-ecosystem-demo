/**
 * Backend API Service
 * Connects to Flask backend with WebSocket support
 */

// @ts-ignore
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';
// @ts-ignore
const WS_URL = (import.meta.env?.VITE_WS_URL as string) || 'ws://localhost:5000';

// Types
export interface Vehicle {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  destination: { x: number; y: number };
  speed: number;
  targetSpeed: number;
  heading: number;
  fuelLevel: number;
  fuelCapacity: number;
  fuelConsumptionRate: number;
  status: string;
  urgency: number;
  currentSegment: number;
  lane: number;
  health: {
    engine: number;
    tires: number;
    brakes: number;
    battery: number;
  };
  route: number[];
  routeIndex: number;
  eta: number;
}

export interface RoadSegment {
  id: number;
  name: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  congestionLevel: number;
  avgSpeed: number;
  speedLimit: number;
  lanes: number;
  roadType: string;
  weather?: string;
  visibility?: number;
  slipperyScore?: number;
}

export interface FuelStation {
  id: string;
  name: string;
  position: { x: number; y: number };
  fuelPrice: number;
  fuelAvailable: number;
  isOpen: boolean;
  waitTime: number;
  queueLength: number;
}

export interface Hazard {
  id: string;
  type: string;
  severity: string;
  position: { x: number; y: number };
  segmentId: number;
  description: string;
  recommendedAction: string;
}

export interface FleetStats {
  totalVehicles: number;
  activeVehicles: number;
  avgFuelLevel: number;
  totalNegotiations: number;
  accidentsPrevented: number;
  fuelSavedLiters: number;
  timeSavedMinutes: number;
  co2ReducedKg: number;
  efficiencyScore: number;
  safetyScore: number;
  aiAccuracy: number;
  learningIterations: number;
}

export interface NegotiationResult {
  id: string;
  type: string;
  vehicles: string[];
  outcome: string;
  reasoning: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  displayName?: string;
}

// WebSocket event handlers
type EventHandler = (data: any) => void;

class BackendAPIService {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  // ==============================================
  // WebSocket Management
  // ==============================================

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Try Socket.IO first (if Flask-SocketIO is being used)
        const socketUrl = `${WS_URL}/socket.io/?EIO=4&transport=websocket`;
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = () => {
          console.log('✅ WebSocket connected to Flask backend');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionListeners(true);
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (e) {
            // Socket.IO messages have different format
            this.handleSocketIOMessage(event.data);
          }
        };

        this.socket.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.isConnected = false;
          this.notifyConnectionListeners(false);
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        console.warn('WebSocket connection failed, falling back to polling');
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    const eventType = data.type || data.event;
    if (eventType) {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.forEach(handler => handler(data.data || data));
      }
    }
  }

  private handleSocketIOMessage(rawData: string) {
    // Socket.IO message format: "42["event",{data}]"
    if (rawData.startsWith('42')) {
      try {
        const jsonPart = rawData.substring(2);
        const [event, data] = JSON.parse(jsonPart);
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      } catch (e) {
        // Ignore parsing errors for heartbeat messages
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Socket.IO format
      this.socket.send(`42${JSON.stringify([event, data])}`);
    }
  }

  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.add(listener);
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // ==============================================
  // REST API Methods
  // ==============================================

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // --- Health Check ---
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request('/api/health');
  }

  // --- Authentication ---
  async login(username: string, password: string): Promise<{ success: boolean; user?: User }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<{ authenticated: boolean; user?: User }> {
    return this.request('/api/auth/me');
  }

  // --- Vehicles ---
  async getVehicles(): Promise<{ vehicles: Vehicle[]; count: number }> {
    return this.request('/api/vehicles');
  }

  async getVehicle(vehicleId: string): Promise<{ vehicle: Vehicle }> {
    return this.request(`/api/vehicles/${vehicleId}`);
  }

  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<{ vehicle: Vehicle }> {
    return this.request(`/api/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // --- Traffic ---
  async getTraffic(): Promise<{ segments: RoadSegment[] }> {
    return this.request('/api/traffic');
  }

  async getTrafficForecast(hours: number = 2): Promise<{ forecast: Record<number, any[]> }> {
    return this.request(`/api/traffic/forecast?hours=${hours}`);
  }

  async getHeatmap(): Promise<{ heatmap: any[] }> {
    return this.request('/api/traffic/heatmap');
  }

  // --- Fuel Stations ---
  async getFuelStations(): Promise<{ stations: FuelStation[] }> {
    return this.request('/api/fuel-stations');
  }

  // --- Negotiations ---
  async negotiate(
    vehicleIds: string[],
    intersectionId: number = 0,
    scenarioType: 'intersection' | 'merge' | 'emergency' | 'fuel' = 'intersection'
  ): Promise<{ result: NegotiationResult }> {
    return this.request('/api/negotiate', {
      method: 'POST',
      body: JSON.stringify({
        vehicle_ids: vehicleIds,
        intersection_id: intersectionId,
        scenario_type: scenarioType,
      }),
    });
  }

  // --- Route Optimization ---
  async optimizeRoute(
    vehicleId: string,
    mode: 'fuel_saving' | 'fastest' | 'balanced' = 'balanced'
  ): Promise<any> {
    return this.request('/api/optimize-route', {
      method: 'POST',
      body: JSON.stringify({ vehicle_id: vehicleId, mode }),
    });
  }

  // --- Predictions ---
  async getPredictions(): Promise<{
    trafficForecast: Record<number, { level: number; confidence: number }>;
    hazardAlerts: Hazard[];
    fuelDepletionEstimates: any[];
    aiAccuracy: number;
  }> {
    return this.request('/api/predictions');
  }

  // --- Emergency ---
  async triggerEmergency(emergencyVehicleId: string): Promise<{
    emergencyVehicle: string;
    affectedVehicles: string[];
    laneChanges: Record<string, number>;
    speedReductions: Record<string, number>;
    estimatedClearTime: number;
  }> {
    return this.request('/api/emergency', {
      method: 'POST',
      body: JSON.stringify({ emergency_vehicle_id: emergencyVehicleId }),
    });
  }

  // --- Fleet Stats ---
  async getFleetStats(): Promise<{ stats: FleetStats }> {
    return this.request('/api/fleet-stats');
  }

  // --- Simulation ---
  async simulationStep(): Promise<{
    tick: number;
    events: any[];
    vehicleCount: number;
    hazardCount: number;
  }> {
    return this.request('/api/simulation/step');
  }

  async resetSimulation(): Promise<{ status: string; tick: number }> {
    return this.request('/api/simulation/reset', { method: 'POST' });
  }

  async runScenario(scenarioId: number): Promise<any> {
    return this.request(`/api/simulation/scenario/${scenarioId}`, { method: 'POST' });
  }

  // --- Road Conditions ---
  async getRoadConditions(): Promise<{ segments: RoadSegment[] }> {
    return this.request('/api/road-conditions');
  }

  // --- History ---
  async getSnapshots(limit: number = 50): Promise<{ snapshots: any[] }> {
    return this.request(`/api/history/snapshots?limit=${limit}`);
  }

  async getSnapshotAtTick(tick: number): Promise<{ snapshot: any }> {
    return this.request(`/api/history/snapshot/${tick}`);
  }

  // --- AI ---
  async getAIDecisions(limit: number = 50): Promise<{ decisions: any[] }> {
    return this.request(`/api/ai/decisions?limit=${limit}`);
  }

  async getAIMetrics(): Promise<{ metrics: any }> {
    return this.request('/api/ai/metrics');
  }

  // --- Export ---
  async exportJSON(): Promise<any> {
    return this.request('/api/export/json');
  }

  async exportCSV(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/export/csv`, {
      credentials: 'include',
    });
    return response.text();
  }
}

// Create and export singleton
export const backendAPI = new BackendAPIService();

// Also export types
export type { EventHandler };
