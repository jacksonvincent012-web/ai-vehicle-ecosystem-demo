// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
Fleet Manager Module
Manages all vehicles in the fleet, coordinates movement, and tracks metrics
"""

import math
import random
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import uuid


@dataclass
class VehicleState:
    """Complete vehicle state"""
    id: str
    name: str
    vehicle_type: str
    position: Dict[str, float]
    destination: Dict[str, float]
    speed: float
    target_speed: float
    heading: float
    fuel_level: float
    fuel_capacity: float
    fuel_consumption_rate: float
    status: str
    urgency: int
    current_segment: int
    lane: int
    health: Dict[str, float]
    route: List[int]
    route_index: int
    eta: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'type': self.vehicle_type,
            'position': self.position,
            'destination': self.destination,
            'speed': self.speed,
            'targetSpeed': self.target_speed,
            'heading': self.heading,
            'fuelLevel': self.fuel_level,
            'fuelCapacity': self.fuel_capacity,
            'fuelConsumptionRate': self.fuel_consumption_rate,
            'status': self.status,
            'urgency': self.urgency,
            'currentSegment': self.current_segment,
            'lane': self.lane,
            'health': self.health,
            'route': self.route,
            'routeIndex': self.route_index,
            'eta': self.eta
        }


@dataclass
class FleetMetrics:
    """Fleet-wide metrics"""
    total_vehicles: int = 0
    active_vehicles: int = 0
    avg_fuel_level: float = 0
    total_negotiations: int = 0
    accidents_prevented: int = 0
    fuel_saved_liters: float = 0
    time_saved_minutes: float = 0
    co2_reduced_kg: float = 0
    efficiency_score: float = 0
    safety_score: float = 0
    ai_accuracy: float = 65.0
    learning_iterations: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'totalVehicles': self.total_vehicles,
            'activeVehicles': self.active_vehicles,
            'avgFuelLevel': round(self.avg_fuel_level, 1),
            'totalNegotiations': self.total_negotiations,
            'accidentsPrevented': self.accidents_prevented,
            'fuelSavedLiters': round(self.fuel_saved_liters, 1),
            'timeSavedMinutes': round(self.time_saved_minutes, 1),
            'co2ReducedKg': round(self.co2_reduced_kg, 1),
            'efficiencyScore': round(self.efficiency_score, 1),
            'safetyScore': round(self.safety_score, 1),
            'aiAccuracy': round(self.ai_accuracy, 1),
            'learningIterations': self.learning_iterations
        }


@dataclass
class FuelStation:
    """Fuel station data"""
    id: str
    name: str
    position: Dict[str, float]
    fuel_price: float
    fuel_available: float
    is_open: bool
    wait_time: int
    queue_length: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'fuelPrice': self.fuel_price,
            'fuelAvailable': self.fuel_available,
            'isOpen': self.is_open,
            'waitTime': self.wait_time,
            'queueLength': self.queue_length
        }


class FleetManager:
    """
    Fleet Management System
    Manages vehicles, coordinates operations, and tracks performance
    """
    
    def __init__(self):
        # Vehicles
        self.vehicles: Dict[str, VehicleState] = {}
        
        # Fuel stations
        self.fuel_stations: Dict[str, FuelStation] = {}
        
        # Metrics
        self.metrics = FleetMetrics()
        
        # Simulation state
        self.tick = 0
        self.is_running = False
        self.speed_multiplier = 1.0
        
        # Hazards
        self.active_hazards: List[Dict[str, Any]] = []
        
        # Snapshots for playback
        self.snapshots: List[Dict[str, Any]] = []
        
        # Initialize default fleet
        self._initialize_fleet()
        self._initialize_fuel_stations()
    
    def _initialize_fleet(self):
        """Initialize the default fleet of 8 vehicles"""
        vehicles_data = [
            {
                'id': 'v1',
                'name': 'Alpha Car',
                'type': 'car',
                'position': {'x': 50, 'y': 200},
                'destination': {'x': 550, 'y': 300},
                'urgency': 3,
                'fuel_level': 75,
                'fuel_capacity': 50,
                'speed': 55
            },
            {
                'id': 'v2',
                'name': 'Beta Truck',
                'type': 'truck',
                'position': {'x': 100, 'y': 50},
                'destination': {'x': 500, 'y': 350},
                'urgency': 7,
                'fuel_level': 45,
                'fuel_capacity': 120,
                'speed': 50
            },
            {
                'id': 'v3',
                'name': 'Emergency-01',
                'type': 'ambulance',
                'position': {'x': 300, 'y': 100},
                'destination': {'x': 100, 'y': 350},
                'urgency': 10,
                'fuel_level': 60,
                'fuel_capacity': 80,
                'speed': 80
            },
            {
                'id': 'v4',
                'name': 'City Bus 42',
                'type': 'bus',
                'position': {'x': 200, 'y': 350},
                'destination': {'x': 500, 'y': 50},
                'urgency': 5,
                'fuel_level': 30,
                'fuel_capacity': 200,
                'speed': 40
            },
            {
                'id': 'v5',
                'name': 'Delta Sedan',
                'type': 'car',
                'position': {'x': 450, 'y': 200},
                'destination': {'x': 50, 'y': 300},
                'urgency': 2,
                'fuel_level': 90,
                'fuel_capacity': 45,
                'speed': 60
            },
            {
                'id': 'v6',
                'name': 'Echo Van',
                'type': 'van',
                'position': {'x': 350, 'y': 300},
                'destination': {'x': 100, 'y': 50},
                'urgency': 6,
                'fuel_level': 15,
                'fuel_capacity': 70,
                'speed': 45
            },
            {
                'id': 'v7',
                'name': 'Foxtrot SUV',
                'type': 'suv',
                'position': {'x': 500, 'y': 100},
                'destination': {'x': 150, 'y': 350},
                'urgency': 4,
                'fuel_level': 55,
                'fuel_capacity': 65,
                'speed': 65
            },
            {
                'id': 'v8',
                'name': 'Golf Compact',
                'type': 'car',
                'position': {'x': 150, 'y': 250},
                'destination': {'x': 500, 'y': 150},
                'urgency': 1,
                'fuel_level': 80,
                'fuel_capacity': 40,
                'speed': 50
            }
        ]
        
        for vd in vehicles_data:
            vehicle = VehicleState(
                id=vd['id'],
                name=vd['name'],
                vehicle_type=vd['type'],
                position=vd['position'],
                destination=vd['destination'],
                speed=vd['speed'],
                target_speed=60,
                heading=0,
                fuel_level=vd['fuel_level'],
                fuel_capacity=vd['fuel_capacity'],
                fuel_consumption_rate=0.1,
                status='idle',
                urgency=vd['urgency'],
                current_segment=1,
                lane=1,
                health={'engine': 100, 'tires': 95, 'brakes': 98, 'battery': 100},
                route=[1, 2, 3],
                route_index=0,
                eta=30
            )
            self.vehicles[vd['id']] = vehicle
        
        self.metrics.total_vehicles = len(self.vehicles)
    
    def _initialize_fuel_stations(self):
        """Initialize fuel stations"""
        stations_data = [
            {
                'id': 'fs1',
                'name': 'QuickFuel North',
                'position': {'x': 150, 'y': 80},
                'fuel_price': 1.45,
                'wait_time': 5
            },
            {
                'id': 'fs2',
                'name': 'GasPlus Central',
                'position': {'x': 300, 'y': 220},
                'fuel_price': 1.52,
                'wait_time': 10
            },
            {
                'id': 'fs3',
                'name': 'EcoFuel East',
                'position': {'x': 520, 'y': 150},
                'fuel_price': 1.38,
                'wait_time': 3
            },
            {
                'id': 'fs4',
                'name': 'CityGas South',
                'position': {'x': 250, 'y': 380},
                'fuel_price': 1.49,
                'wait_time': 8
            }
        ]
        
        for sd in stations_data:
            station = FuelStation(
                id=sd['id'],
                name=sd['name'],
                position=sd['position'],
                fuel_price=sd['fuel_price'],
                fuel_available=10000,
                is_open=True,
                wait_time=sd['wait_time'],
                queue_length=random.randint(0, 3)
            )
            self.fuel_stations[sd['id']] = station
    
    def get_all_vehicles(self) -> List[Dict[str, Any]]:
        """Get all vehicles as dictionaries"""
        return [v.to_dict() for v in self.vehicles.values()]
    
    def get_vehicle(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific vehicle"""
        vehicle = self.vehicles.get(vehicle_id)
        return vehicle.to_dict() if vehicle else None
    
    def get_all_fuel_stations(self) -> List[Dict[str, Any]]:
        """Get all fuel stations"""
        return [s.to_dict() for s in self.fuel_stations.values()]
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get fleet metrics"""
        # Update dynamic metrics
        if self.vehicles:
            self.metrics.avg_fuel_level = sum(v.fuel_level for v in self.vehicles.values()) / len(self.vehicles)
            self.metrics.active_vehicles = sum(1 for v in self.vehicles.values() if v.status == 'moving')
        
        return self.metrics.to_dict()
    
    def simulate_step(self) -> Dict[str, Any]:
        """
        Advance simulation by one step
        Updates vehicle positions, fuel levels, traffic
        """
        self.tick += 1
        
        events = []
        
        for vehicle_id, vehicle in self.vehicles.items():
            # Skip if not moving
            if vehicle.status not in ['moving', 'idle']:
                continue
            
            # Update status to moving
            if vehicle.status == 'idle':
                vehicle.status = 'moving'
            
            # Calculate direction to destination
            dx = vehicle.destination['x'] - vehicle.position['x']
            dy = vehicle.destination['y'] - vehicle.position['y']
            distance = math.sqrt(dx * dx + dy * dy)
            
            if distance < 5:
                # Arrived at destination
                vehicle.status = 'idle'
                events.append({
                    'type': 'arrival',
                    'vehicleId': vehicle_id,
                    'message': f'{vehicle.name} arrived at destination'
                })
                
                # Set new random destination
                vehicle.destination = {
                    'x': random.uniform(50, 550),
                    'y': random.uniform(50, 380)
                }
                continue
            
            # Move toward destination
            speed_factor = (vehicle.speed / 60) * self.speed_multiplier * 0.5
            move_x = (dx / distance) * speed_factor
            move_y = (dy / distance) * speed_factor
            
            vehicle.position['x'] += move_x
            vehicle.position['y'] += move_y
            
            # Update heading
            vehicle.heading = math.degrees(math.atan2(dy, dx))
            
            # Consume fuel
            consumption = vehicle.fuel_consumption_rate * speed_factor * 0.1
            vehicle.fuel_level -= consumption
            vehicle.fuel_level = max(0, vehicle.fuel_level)
            
            # Check fuel level
            if vehicle.fuel_level < 10 and vehicle.status != 'refueling':
                events.append({
                    'type': 'fuel_critical',
                    'vehicleId': vehicle_id,
                    'message': f'{vehicle.name} fuel critical: {vehicle.fuel_level:.1f}%'
                })
                
                # Auto-refuel for demo
                if vehicle.fuel_level < 5:
                    vehicle.fuel_level = 80
                    vehicle.status = 'refueling'
                    self.metrics.fuel_saved_liters += 5
                    events.append({
                        'type': 'refueling',
                        'vehicleId': vehicle_id,
                        'message': f'{vehicle.name} auto-refueling'
                    })
            
            if vehicle.status == 'refueling':
                vehicle.fuel_level = min(100, vehicle.fuel_level + 5)
                if vehicle.fuel_level >= 80:
                    vehicle.status = 'moving'
            
            # Update ETA
            if vehicle.speed > 0:
                vehicle.eta = (distance / vehicle.speed) * 60  # minutes
        
        # Random hazard generation
        if random.random() < 0.02:  # 2% chance per tick
            hazard = self._generate_random_hazard()
            self.active_hazards.append(hazard)
            self.metrics.accidents_prevented += 1
            events.append({
                'type': 'hazard',
                'hazardId': hazard['id'],
                'message': f"Hazard detected: {hazard['type']}"
            })
        
        # Clear old hazards
        self.active_hazards = [h for h in self.active_hazards 
                               if self.tick - h.get('tick', 0) < 50]
        
        # Update metrics
        self.metrics.learning_iterations = self.tick // 10
        self.metrics.ai_accuracy = min(99, 65 + self.metrics.learning_iterations * 0.5)
        self.metrics.efficiency_score = min(100, 50 + self.tick * 0.1)
        self.metrics.safety_score = min(100, 70 + self.metrics.accidents_prevented * 2)
        
        # Take snapshot every 10 ticks
        if self.tick % 10 == 0:
            self._take_snapshot()
        
        return {
            'tick': self.tick,
            'events': events,
            'vehicleCount': len(self.vehicles),
            'hazardCount': len(self.active_hazards)
        }
    
    def _generate_random_hazard(self) -> Dict[str, Any]:
        """Generate a random hazard"""
        hazard_types = ['accident', 'weather', 'road_damage', 'obstacle', 'congestion']
        severities = ['low', 'medium', 'high', 'critical']
        
        return {
            'id': str(uuid.uuid4())[:8],
            'type': random.choice(hazard_types),
            'severity': random.choice(severities),
            'position': {
                'x': random.uniform(50, 550),
                'y': random.uniform(50, 380)
            },
            'segmentId': random.randint(1, 15),
            'description': f"Hazard detected on road segment",
            'recommendedAction': "Reduce speed and exercise caution",
            'tick': self.tick,
            'createdAt': datetime.utcnow().isoformat()
        }
    
    def _take_snapshot(self):
        """Take a simulation snapshot for playback"""
        snapshot = {
            'tick': self.tick,
            'timestamp': datetime.utcnow().isoformat(),
            'vehicles': self.get_all_vehicles(),
            'hazards': self.active_hazards.copy(),
            'metrics': self.metrics.to_dict()
        }
        
        self.snapshots.append(snapshot)
        
        # Keep last 100 snapshots
        if len(self.snapshots) > 100:
            self.snapshots = self.snapshots[-100:]
    
    def get_snapshots(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get historical snapshots"""
        return self.snapshots[-limit:]
    
    def get_snapshot_at_tick(self, tick: int) -> Optional[Dict[str, Any]]:
        """Get snapshot at specific tick"""
        for snapshot in reversed(self.snapshots):
            if snapshot['tick'] <= tick:
                return snapshot
        return self.snapshots[0] if self.snapshots else None
    
    def global_optimization(self) -> Dict[str, Any]:
        """
        Optimize all vehicles collectively
        Avoid clustering, distribute across routes
        """
        optimizations = []
        
        # Group vehicles by destination quadrant
        quadrants: Dict[str, List[VehicleState]] = {
            'NE': [], 'NW': [], 'SE': [], 'SW': []
        }
        
        for vehicle in self.vehicles.values():
            x, y = vehicle.destination['x'], vehicle.destination['y']
            quadrant = ('N' if y < 200 else 'S') + ('E' if x > 300 else 'W')
            quadrants[quadrant].append(vehicle)
        
        # If too many in one quadrant, suggest alternatives
        for quadrant, vehicles in quadrants.items():
            if len(vehicles) > 3:
                for v in vehicles[3:]:
                    optimizations.append({
                        'vehicleId': v.id,
                        'suggestion': 'Consider alternate route',
                        'reason': f'High vehicle density in {quadrant} quadrant'
                    })
        
        # Check fuel station clustering
        station_proximity: Dict[str, int] = {s.id: 0 for s in self.fuel_stations.values()}
        
        for vehicle in self.vehicles.values():
            if vehicle.fuel_level < 30:
                # Find nearest station
                nearest = min(
                    self.fuel_stations.values(),
                    key=lambda s: math.sqrt(
                        (s.position['x'] - vehicle.position['x']) ** 2 +
                        (s.position['y'] - vehicle.position['y']) ** 2
                    )
                )
                station_proximity[nearest.id] += 1
        
        # Redistribute if too many heading to same station
        for station_id, count in station_proximity.items():
            if count > 2:
                optimizations.append({
                    'stationId': station_id,
                    'suggestion': 'Redistribute refueling',
                    'reason': f'{count} vehicles targeting same station'
                })
        
        return {
            'optimizations': optimizations,
            'vehiclesAnalyzed': len(self.vehicles),
            'quadrantDistribution': {q: len(v) for q, v in quadrants.items()},
            'stationLoad': station_proximity
        }
    
    def run_scenario(self, scenario_id: int) -> Dict[str, Any]:
        """
        Run a predefined scenario
        """
        scenarios = {
            1: self._scenario_fuel_saving,
            2: self._scenario_urgent_delivery,
            3: self._scenario_intersection,
            4: self._scenario_weather,
            5: self._scenario_emergency
        }
        
        scenario_func = scenarios.get(scenario_id, self._scenario_fuel_saving)
        return scenario_func()
    
    def _scenario_fuel_saving(self) -> Dict[str, Any]:
        """Scenario 1: Fuel-Saving Arrival"""
        # Set vehicle 6 to critical fuel
        if 'v6' in self.vehicles:
            self.vehicles['v6'].fuel_level = 12
            self.vehicles['v6'].speed = 40
        
        self.metrics.fuel_saved_liters += 15
        
        return {
            'scenario': 'Fuel-Saving Arrival',
            'description': 'Vehicle slows down to optimize fuel and arrive after congestion clears',
            'affectedVehicles': ['v6'],
            'fuelSaved': 15
        }
    
    def _scenario_urgent_delivery(self) -> Dict[str, Any]:
        """Scenario 2: Urgent Delivery"""
        if 'v2' in self.vehicles:
            self.vehicles['v2'].urgency = 9
            self.vehicles['v2'].speed = 80
            self.vehicles['v2'].status = 'moving'
        
        self.metrics.total_negotiations += 1
        
        return {
            'scenario': 'Urgent Delivery',
            'description': 'High-priority vehicle gets route optimization and priority',
            'affectedVehicles': ['v2'],
            'priorityGranted': True
        }
    
    def _scenario_intersection(self) -> Dict[str, Any]:
        """Scenario 3: Intersection Negotiation"""
        # Move multiple vehicles toward same point
        intersection = {'x': 300, 'y': 200}
        
        affected = []
        for vid in ['v1', 'v5', 'v7', 'v8']:
            if vid in self.vehicles:
                self.vehicles[vid].destination = intersection.copy()
                self.vehicles[vid].status = 'negotiating'
                affected.append(vid)
        
        self.metrics.total_negotiations += 1
        self.metrics.accidents_prevented += 1
        
        return {
            'scenario': 'Intersection Negotiation',
            'description': '4 vehicles negotiate right-of-way at intersection',
            'affectedVehicles': affected,
            'negotiationSuccess': True
        }
    
    def _scenario_weather(self) -> Dict[str, Any]:
        """Scenario 4: Slippery Road + Traffic"""
        # Add weather hazard
        hazard = {
            'id': 'weather-1',
            'type': 'weather',
            'severity': 'high',
            'position': {'x': 350, 'y': 250},
            'segmentId': 5,
            'description': 'Heavy rain causing slippery conditions',
            'recommendedAction': 'Reduce speed by 40%',
            'tick': self.tick,
            'createdAt': datetime.utcnow().isoformat()
        }
        self.active_hazards.append(hazard)
        
        # Slow down affected vehicles
        affected = []
        for vid, vehicle in self.vehicles.items():
            if abs(vehicle.position['x'] - 350) < 150:
                vehicle.speed *= 0.6
                affected.append(vid)
        
        return {
            'scenario': 'Slippery Road Conditions',
            'description': 'Rain detected - vehicles slow down automatically',
            'affectedVehicles': affected,
            'hazardAdded': hazard['id']
        }
    
    def _scenario_emergency(self) -> Dict[str, Any]:
        """Scenario 5: Fleet-Wide Emergency"""
        if 'v3' in self.vehicles:
            self.vehicles['v3'].status = 'emergency'
            self.vehicles['v3'].speed = 100
            self.vehicles['v3'].urgency = 10
        
        # Other vehicles yield
        affected = []
        for vid, vehicle in self.vehicles.items():
            if vid != 'v3':
                vehicle.lane = 2 if vehicle.lane == 1 else 1
                vehicle.speed *= 0.5
                affected.append(vid)
        
        self.metrics.total_negotiations += len(affected)
        self.metrics.accidents_prevented += 1
        
        return {
            'scenario': 'Fleet-Wide Emergency',
            'description': 'Emergency vehicle dispatched - all vehicles yield',
            'emergencyVehicle': 'v3',
            'yieldingVehicles': affected
        }
    
    def reset(self):
        """Reset simulation to initial state"""
        self.tick = 0
        self.active_hazards = []
        self.snapshots = []
        self.metrics = FleetMetrics()
        
        self._initialize_fleet()
        self._initialize_fuel_stations()
        
        return {'status': 'reset', 'tick': 0}
    
    def update_vehicle(self, vehicle_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update vehicle properties"""
        vehicle = self.vehicles.get(vehicle_id)
        if not vehicle:
            return None
        
        for key, value in updates.items():
            if hasattr(vehicle, key):
                setattr(vehicle, key, value)
        
        return vehicle.to_dict()
    
    def get_active_hazards(self) -> List[Dict[str, Any]]:
        """Get all active hazards"""
        return self.active_hazards


# Create global instance
fleet_manager = FleetManager()
