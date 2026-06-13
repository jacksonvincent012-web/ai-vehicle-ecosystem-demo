// ============================================
// SIMULATION ENGINE v3.0
// Self-Learning Vehicle Ecosystem
// ============================================

import type {
  VehicleData,
  FuelStationData,
} from '../store/useStore';

// ============================================
// AI PREDICTION MODELS
// ============================================

export class TrafficPredictor {
  private history: Map<string, number[]> = new Map();

  predict(segmentId: string, currentLevel: number, timeHorizon: number = 30): number {
    const hist = this.history.get(segmentId) || [];
    hist.push(currentLevel);
    if (hist.length > 60) hist.shift();
    this.history.set(segmentId, hist);

    // Weighted moving average with trend extrapolation
    const recent = hist.slice(-10);
    if (recent.length < 3) return currentLevel;

    const weights = recent.map((_, i) => (i + 1) / recent.length);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const wma = recent.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;

    // Trend from recent changes
    const trend = (recent[recent.length - 1] - recent[0]) / recent.length;
    const predicted = wma + trend * (timeHorizon / 5);

    return Math.max(0, Math.min(100, predicted));
  }

  detectAnomaly(segmentId: string, currentLevel: number): { isAnomaly: boolean; confidence: number; type: string } {
    const hist = this.history.get(segmentId) || [];
    if (hist.length < 5) return { isAnomaly: false, confidence: 0, type: 'none' };

    const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
    const stdDev = Math.sqrt(hist.reduce((sum, val) => sum + (val - avg) ** 2, 0) / hist.length);
    const zScore = Math.abs(currentLevel - avg) / (stdDev || 1);

    if (zScore > 2.5) {
      return {
        isAnomaly: true,
        confidence: Math.min(0.99, 0.7 + zScore * 0.1),
        type: currentLevel > avg ? 'sudden_congestion' : 'unusual_clearance',
      };
    }
    return { isAnomaly: false, confidence: 0, type: 'none' };
  }
}

export class FuelOptimizer {
  calculateConsumption(speed: number, distance: number, terrain: number = 1.0, weight: number = 1500, stopFrequency: number = 0): number {
    // Base consumption (L/100km) varies with speed
    const optimalSpeed = 55;
    const speedFactor = 1 + Math.pow((speed - optimalSpeed) / optimalSpeed, 2) * 0.3;
    const baseConsumption = 6.5 * speedFactor;
    const weightFactor = weight / 1500;
    const terrainFactor = terrain;
    const stopFactor = 1 + stopFrequency * 0.05;

    return (baseConsumption * weightFactor * terrainFactor * stopFactor * distance) / 100;
  }

  findOptimalRefuelStrategy(
    vehicle: VehicleData,
    stations: FuelStationData[]
  ): { stationId: string; priority: number; reason: string } | null {
    if (vehicle.fuelLevel > 30) return null;

    const scored = stations
      .filter(s => s.isOpen && s.availablePumps > 0)
      .map(s => {
        const dist = Math.sqrt(
          (vehicle.position.x - s.position.x) ** 2 + (vehicle.position.y - s.position.y) ** 2
        );
        const priceFactor = (2 - s.fuelPrice) * 30;
        const distFactor = (1 - dist / 800) * 40;
        const waitFactor = (1 - s.waitTime / 20) * 20;
        const ratingFactor = (s.rating / 5) * 10;
        return {
          stationId: s.id,
          score: priceFactor + distFactor + waitFactor + ratingFactor,
          reason: `Price: $${s.fuelPrice}, Distance: ${dist.toFixed(0)}px, Wait: ${s.waitTime}min`,
        };
      })
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;
    return { stationId: scored[0].stationId, priority: scored[0].score, reason: scored[0].reason };
  }

  trafficAwareSaving(
    vehicle: VehicleData,
    congestionAhead: number
  ): { strategy: string; speedRecommendation: number; fuelSaving: number } {
    if (congestionAhead > 70) {
      return {
        strategy: 'SLOW_AND_WAIT',
        speedRecommendation: vehicle.maxSpeed * 0.35,
        fuelSaving: 2.3,
      };
    } else if (congestionAhead > 40) {
      return {
        strategy: 'MODERATE_APPROACH',
        speedRecommendation: vehicle.maxSpeed * 0.55,
        fuelSaving: 1.1,
      };
    }
    return {
      strategy: 'NORMAL',
      speedRecommendation: vehicle.maxSpeed * 0.7,
      fuelSaving: 0,
    };
  }
}

export class NegotiationEngine {
  negotiateIntersection(
    vehicles: VehicleData[]
  ): { priorityOrder: string[]; speedAdjustments: { vehicleId: string; newSpeed: number }[]; reasoning: string[] } {
    const scored = vehicles.map(v => {
      let priority = 0;
      if (v.status === 'emergency' || v.type === 'ambulance' || v.type === 'fire_truck' || v.type === 'police') priority += 100;
      if (v.fuelLevel < 15) priority += 40;
      if (v.fuelLevel < 25) priority += 20;
      priority += v.urgency * 8;
      priority += v.passengerCount * 2;
      if (v.type === 'bus') priority += 15;
      return { id: v.id, priority, vehicle: v };
    }).sort((a, b) => b.priority - a.priority);

    const reasoning = scored.map((s, i) => {
      const reasons: string[] = [];
      if (s.vehicle.status === 'emergency') reasons.push('EMERGENCY');
      if (s.vehicle.fuelLevel < 20) reasons.push('LOW_FUEL');
      if (s.vehicle.urgency >= 8) reasons.push('HIGH_URGENCY');
      if (s.vehicle.type === 'bus') reasons.push('PUBLIC_TRANSIT');
      return `#${i + 1} ${s.vehicle.name}: score=${s.priority} [${reasons.join(', ') || 'NORMAL'}]`;
    });

    return {
      priorityOrder: scored.map(s => s.id),
      speedAdjustments: scored.map((s, i) => ({
        vehicleId: s.id,
        newSpeed: i === 0 ? s.vehicle.speed : Math.max(10, s.vehicle.speed * (0.3 + (i * 0.15))),
      })),
      reasoning,
    };
  }

  negotiateEmergency(
    emergencyVehicle: VehicleData,
    nearbyVehicles: VehicleData[]
  ): { adjustments: { vehicleId: string; action: string; newSpeed: number }[] } {
    return {
      adjustments: nearbyVehicles.map(v => {
        const dist = Math.sqrt(
          (v.position.x - emergencyVehicle.position.x) ** 2 +
          (v.position.y - emergencyVehicle.position.y) ** 2
        );
        if (dist < 100) {
          return { vehicleId: v.id, action: 'PULL_OVER', newSpeed: 0 };
        } else if (dist < 200) {
          return { vehicleId: v.id, action: 'SLOW_AND_YIELD', newSpeed: Math.max(15, v.speed * 0.3) };
        }
        return { vehicleId: v.id, action: 'REDUCE_SPEED', newSpeed: v.speed * 0.6 };
      }),
    };
  }
}

export class HazardDetector {
  assessRisk(
    roadCondition: { slipperyScore: number; visibility: number },
    weather: string,
    speed: number,
    vehicleDensity: number
  ): { riskScore: number; hazardType: string; recommendedAction: string } {
    let risk = 0;
    risk += roadCondition.slipperyScore * 0.35;
    risk += (100 - roadCondition.visibility) * 0.25;
    risk += (speed / 120) * 20;
    risk += vehicleDensity * 0.15;

    const weatherMultiplier: Record<string, number> = {
      clear: 1.0, rain: 1.4, heavy_rain: 1.8, snow: 2.0, fog: 1.6, storm: 2.2, ice: 2.5,
    };
    risk *= weatherMultiplier[weather] || 1.0;
    risk = Math.min(100, risk);

    let hazardType = 'low_risk';
    let recommendedAction = 'maintain_course';

    if (risk > 80) {
      hazardType = 'critical_danger';
      recommendedAction = 'emergency_slow_down_reroute';
    } else if (risk > 60) {
      hazardType = 'high_risk';
      recommendedAction = 'reduce_speed_increase_distance';
    } else if (risk > 40) {
      hazardType = 'moderate_risk';
      recommendedAction = 'caution_advisory';
    }

    return { riskScore: Math.round(risk), hazardType, recommendedAction };
  }
}

// ============================================
// MAIN SIMULATION ENGINE
// ============================================

export class SimulationEngine {
  trafficPredictor: TrafficPredictor;
  fuelOptimizer: FuelOptimizer;
  negotiationEngine: NegotiationEngine;
  hazardDetector: HazardDetector;
  private learningWeights: number[] = [0.5, 0.3, 0.2];
  private predictionAccuracyLog: number[] = [];

  constructor() {
    this.trafficPredictor = new TrafficPredictor();
    this.fuelOptimizer = new FuelOptimizer();
    this.negotiationEngine = new NegotiationEngine();
    this.hazardDetector = new HazardDetector();
  }

  // Self-learning: adjust weights based on prediction accuracy
  selfLearn(predicted: number, actual: number): { newAccuracy: number; weightAdjustment: number[] } {
    const error = Math.abs(predicted - actual) / (actual || 1);
    const accuracy = Math.max(0, 1 - error) * 100;
    this.predictionAccuracyLog.push(accuracy);
    if (this.predictionAccuracyLog.length > 100) this.predictionAccuracyLog.shift();

    // Adjust weights toward better performance
    const avgAccuracy = this.predictionAccuracyLog.reduce((a, b) => a + b, 0) / this.predictionAccuracyLog.length;
    const adjustment = error * 0.01;
    this.learningWeights = this.learningWeights.map((w, i) =>
      Math.max(0.05, Math.min(0.9, w + (i === 0 ? adjustment : -adjustment / 2)))
    );

    return { newAccuracy: avgAccuracy, weightAdjustment: [...this.learningWeights] };
  }

  getAccuracyHistory(): number[] {
    return [...this.predictionAccuracyLog];
  }

  calculateOptimalSpeed(
    vehicle: VehicleData,
    congestionAhead: number,
    slipperyScore: number,
    fuelLevel: number
  ): { speed: number; reasoning: string } {
    let speed = vehicle.maxSpeed;

    // Safety factor
    const safetyFactor = Math.max(0.3, 1 - slipperyScore / 120);
    speed *= safetyFactor;

    // Congestion factor
    const congestionFactor = Math.max(0.2, 1 - congestionAhead / 130);
    speed *= congestionFactor;

    // Fuel efficiency factor
    if (fuelLevel < 25) {
      speed *= 0.65; // Eco mode
    } else if (fuelLevel < 40) {
      speed *= 0.8;
    }

    speed = Math.max(10, Math.min(vehicle.maxSpeed, speed));

    const reasoning = `Safety(${(safetyFactor * 100).toFixed(0)}%) × Congestion(${(congestionFactor * 100).toFixed(0)}%) × Fuel(${fuelLevel > 40 ? '100' : fuelLevel > 25 ? '80' : '65'}%) = ${speed.toFixed(0)} km/h`;

    return { speed: Math.round(speed), reasoning };
  }
}

export default SimulationEngine;
