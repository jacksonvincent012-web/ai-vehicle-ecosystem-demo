// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
Simulation Module
Generates realistic demo scenarios for hackathon presentation
"""

import random
import math
from typing import Dict, List, Any, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class ScenarioConfig:
    """Configuration for a demo scenario"""
    id: int
    name: str
    description: str
    duration_ticks: int
    difficulty: str  # easy, medium, hard, extreme
    setup_function: str
    events: List[Dict[str, Any]]


class DemoSimulation:
    """
    Demo Simulation Generator
    Creates realistic scenarios for hackathon presentations
    """
    
    def __init__(self):
        self.scenarios = self._define_scenarios()
        self.current_scenario: Optional[ScenarioConfig] = None
        self.scenario_tick = 0
        self.scenario_events: List[Dict[str, Any]] = []
    
    def _define_scenarios(self) -> Dict[int, ScenarioConfig]:
        """Define all demo scenarios"""
        return {
            1: ScenarioConfig(
                id=1,
                name="Fuel-Saving Arrival",
                description="Vehicle A heading to destination with heavy traffic ahead. "
                           "AI suggests slowing to 40km/h to arrive AFTER congestion clears, "
                           "saving significant fuel.",
                duration_ticks=100,
                difficulty="easy",
                setup_function="setup_fuel_saving",
                events=[
                    {"tick": 10, "type": "traffic_spike", "segment": 5, "level": 85},
                    {"tick": 20, "type": "ai_recommendation", "vehicle": "v1", 
                     "action": "slow_down", "target_speed": 40},
                    {"tick": 50, "type": "traffic_clear", "segment": 5, "level": 20},
                    {"tick": 60, "type": "ai_recommendation", "vehicle": "v1", 
                     "action": "resume_speed", "target_speed": 60},
                    {"tick": 90, "type": "arrival", "vehicle": "v1", "fuel_saved": 15}
                ]
            ),
            
            2: ScenarioConfig(
                id=2,
                name="Urgent Delivery",
                description="Vehicle B (delivery truck) has urgency=9 and must arrive ASAP. "
                           "AI finds fastest route, schedules quick refuel en route, "
                           "and other vehicles negotiate to give priority.",
                duration_ticks=120,
                difficulty="medium",
                setup_function="setup_urgent_delivery",
                events=[
                    {"tick": 5, "type": "urgency_increase", "vehicle": "v2", "level": 9},
                    {"tick": 10, "type": "route_optimization", "vehicle": "v2", 
                     "action": "fastest_route"},
                    {"tick": 25, "type": "negotiation", "vehicles": ["v2", "v1", "v5"], 
                     "result": "v2_priority"},
                    {"tick": 40, "type": "quick_refuel", "vehicle": "v2", "duration": 3},
                    {"tick": 60, "type": "negotiation", "vehicles": ["v2", "v7", "v8"], 
                     "result": "v2_priority"},
                    {"tick": 100, "type": "delivery_complete", "vehicle": "v2", 
                     "time_saved": 12}
                ]
            ),
            
            3: ScenarioConfig(
                id=3,
                name="Intersection Negotiation",
                description="4 vehicles approach intersection simultaneously: "
                           "emergency vehicle, low-fuel vehicle, and two normal vehicles. "
                           "Watch real-time negotiation and resolution.",
                duration_ticks=80,
                difficulty="medium",
                setup_function="setup_intersection",
                events=[
                    {"tick": 5, "type": "vehicles_approaching", 
                     "vehicles": ["v3", "v6", "v1", "v5"], "intersection": 1},
                    {"tick": 15, "type": "negotiation_start", 
                     "vehicles": ["v3", "v6", "v1", "v5"]},
                    {"tick": 20, "type": "priority_assigned", "order": ["v3", "v6", "v1", "v5"],
                     "reasoning": "Emergency > Low Fuel > Normal by arrival order"},
                    {"tick": 25, "type": "vehicle_proceeds", "vehicle": "v3", "speed": 80},
                    {"tick": 30, "type": "vehicle_proceeds", "vehicle": "v6", "speed": 50},
                    {"tick": 35, "type": "vehicle_proceeds", "vehicle": "v1", "speed": 55},
                    {"tick": 40, "type": "vehicle_proceeds", "vehicle": "v5", "speed": 60},
                    {"tick": 50, "type": "intersection_clear", "accidents_prevented": 1}
                ]
            ),
            
            4: ScenarioConfig(
                id=4,
                name="Slippery Road + Traffic",
                description="Rain detected on segment 5 with 3 vehicles approaching. "
                           "AI reduces speed, increases following distance, "
                           "reroutes 1 vehicle and slows 2 vehicles.",
                duration_ticks=90,
                difficulty="hard",
                setup_function="setup_weather",
                events=[
                    {"tick": 5, "type": "weather_change", "segment": 5, 
                     "condition": "rain", "slippery": 70},
                    {"tick": 10, "type": "hazard_detected", "segment": 5, 
                     "type": "slippery_road", "severity": "high"},
                    {"tick": 15, "type": "ai_analysis", "vehicles": ["v1", "v5", "v7"],
                     "risk_score": 75},
                    {"tick": 20, "type": "reroute", "vehicle": "v1", 
                     "reason": "alternate_safer_route"},
                    {"tick": 22, "type": "speed_reduction", "vehicle": "v5", 
                     "new_speed": 35, "reason": "slippery_conditions"},
                    {"tick": 24, "type": "speed_reduction", "vehicle": "v7", 
                     "new_speed": 40, "reason": "slippery_conditions"},
                    {"tick": 40, "type": "following_distance_increased", 
                     "vehicles": ["v5", "v7"], "distance": "3x_normal"},
                    {"tick": 70, "type": "weather_clear", "segment": 5},
                    {"tick": 80, "type": "normal_operations", "accidents_prevented": 2}
                ]
            ),
            
            5: ScenarioConfig(
                id=5,
                name="Fleet-Wide Emergency",
                description="Ambulance (v3) dispatched with 6 vehicles in its path. "
                           "Watch cascade of lane changes and speed reductions "
                           "as all vehicles coordinate to clear the way.",
                duration_ticks=100,
                difficulty="extreme",
                setup_function="setup_emergency",
                events=[
                    {"tick": 5, "type": "emergency_dispatch", "vehicle": "v3",
                     "priority": "critical", "siren": True},
                    {"tick": 10, "type": "fleet_alert", 
                     "affected": ["v1", "v2", "v4", "v5", "v7", "v8"],
                     "message": "Emergency vehicle approaching - prepare to yield"},
                    {"tick": 15, "type": "cascade_start", "wave": 1,
                     "vehicles": ["v1", "v5"]},
                    {"tick": 18, "type": "lane_change", "vehicle": "v1", 
                     "from": 1, "to": 2},
                    {"tick": 19, "type": "lane_change", "vehicle": "v5", 
                     "from": 1, "to": 2},
                    {"tick": 22, "type": "cascade_wave", "wave": 2,
                     "vehicles": ["v2", "v7"]},
                    {"tick": 25, "type": "speed_reduction", "vehicle": "v2", 
                     "new_speed": 30},
                    {"tick": 26, "type": "lane_change", "vehicle": "v7", 
                     "from": 1, "to": 2},
                    {"tick": 30, "type": "cascade_wave", "wave": 3,
                     "vehicles": ["v4", "v8"]},
                    {"tick": 33, "type": "lane_change", "vehicle": "v4", 
                     "from": 2, "to": 3},
                    {"tick": 35, "type": "speed_reduction", "vehicle": "v8", 
                     "new_speed": 25},
                    {"tick": 40, "type": "path_clear", "vehicle": "v3",
                     "clear_distance": 500},
                    {"tick": 45, "type": "emergency_passing", "vehicle": "v3",
                     "speed": 100},
                    {"tick": 60, "type": "emergency_passed", "vehicle": "v3"},
                    {"tick": 65, "type": "fleet_resume", 
                     "vehicles": ["v1", "v2", "v4", "v5", "v7", "v8"]},
                    {"tick": 80, "type": "normal_operations", "response_time": 35,
                     "accidents_prevented": 1, "lives_potentially_saved": 1}
                ]
            )
        }
    
    def get_scenario(self, scenario_id: int) -> Dict[str, Any]:
        """Get scenario details"""
        scenario = self.scenarios.get(scenario_id)
        if scenario:
            return {
                'id': scenario.id,
                'name': scenario.name,
                'description': scenario.description,
                'duration': scenario.duration_ticks,
                'difficulty': scenario.difficulty,
                'eventCount': len(scenario.events)
            }
        return None
    
    def start_scenario(self, scenario_id: int) -> Dict[str, Any]:
        """Start a scenario"""
        scenario = self.scenarios.get(scenario_id)
        if not scenario:
            return {'error': 'Scenario not found'}
        
        self.current_scenario = scenario
        self.scenario_tick = 0
        self.scenario_events = []
        
        return {
            'started': True,
            'scenario': self.get_scenario(scenario_id),
            'message': f"Started: {scenario.name}"
        }
    
    def tick_scenario(self) -> List[Dict[str, Any]]:
        """Process one tick of the current scenario"""
        if not self.current_scenario:
            return []
        
        self.scenario_tick += 1
        triggered_events = []
        
        for event in self.current_scenario.events:
            if event['tick'] == self.scenario_tick:
                triggered_events.append(event)
                self.scenario_events.append({
                    **event,
                    'triggered_at': datetime.utcnow().isoformat()
                })
        
        # Check if scenario complete
        if self.scenario_tick >= self.current_scenario.duration_ticks:
            triggered_events.append({
                'tick': self.scenario_tick,
                'type': 'scenario_complete',
                'scenario_id': self.current_scenario.id,
                'scenario_name': self.current_scenario.name,
                'total_events': len(self.scenario_events)
            })
            self.current_scenario = None
        
        return triggered_events
    
    def get_scenario_status(self) -> Dict[str, Any]:
        """Get current scenario status"""
        if not self.current_scenario:
            return {'active': False}
        
        return {
            'active': True,
            'scenario': self.get_scenario(self.current_scenario.id),
            'currentTick': self.scenario_tick,
            'progress': (self.scenario_tick / self.current_scenario.duration_ticks) * 100,
            'eventsTriggered': len(self.scenario_events),
            'upcomingEvents': sum(1 for e in self.current_scenario.events 
                                  if e['tick'] > self.scenario_tick)
        }
    
    def get_all_scenarios(self) -> List[Dict[str, Any]]:
        """Get all available scenarios"""
        return [self.get_scenario(sid) for sid in self.scenarios.keys()]


class RealisticDataGenerator:
    """
    Generates realistic simulation data
    """
    
    @staticmethod
    def generate_vehicle_name() -> str:
        """Generate realistic vehicle name"""
        prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 
                    'Golf', 'Hotel', 'India', 'Juliet']
        types = ['Car', 'Truck', 'Van', 'SUV', 'Sedan', 'Compact']
        return f"{random.choice(prefixes)} {random.choice(types)}"
    
    @staticmethod
    def generate_traffic_pattern(hour: int) -> float:
        """Generate realistic traffic congestion based on time of day"""
        # Rush hour peaks
        if 7 <= hour <= 9:
            base = 75
        elif 17 <= hour <= 19:
            base = 80
        elif 12 <= hour <= 14:
            base = 50
        elif hour < 6 or hour > 22:
            base = 15
        else:
            base = 40
        
        # Add randomness
        return max(0, min(100, base + random.gauss(0, 10)))
    
    @staticmethod
    def generate_fuel_consumption(speed: float, vehicle_type: str) -> float:
        """Calculate realistic fuel consumption"""
        base_rates = {
            'car': 7.0,
            'truck': 25.0,
            'ambulance': 12.0,
            'bus': 30.0,
            'van': 10.0,
            'suv': 9.0
        }
        
        base = base_rates.get(vehicle_type, 8.0)
        
        # Speed factor (optimal at 60-80 km/h)
        if speed < 30:
            factor = 1.3
        elif speed <= 80:
            factor = 1.0
        elif speed <= 100:
            factor = 1.2
        else:
            factor = 1.5
        
        return base * factor
    
    @staticmethod
    def generate_hazard() -> Dict[str, Any]:
        """Generate a random hazard"""
        hazard_types = [
            ('accident', 'high', 45),
            ('weather', 'medium', 60),
            ('road_damage', 'low', 30),
            ('obstacle', 'medium', 15),
            ('congestion', 'low', 20)
        ]
        
        hazard_type, severity, duration = random.choice(hazard_types)
        
        return {
            'type': hazard_type,
            'severity': severity,
            'estimatedDuration': duration,
            'position': {
                'x': random.uniform(50, 550),
                'y': random.uniform(50, 380)
            },
            'segmentId': random.randint(1, 15),
            'description': f"{hazard_type.replace('_', ' ').title()} detected",
            'recommendedAction': {
                'accident': 'Reduce speed, consider alternate route',
                'weather': 'Reduce speed by 40%, increase following distance',
                'road_damage': 'Slow down, avoid if possible',
                'obstacle': 'Change lane or reduce speed',
                'congestion': 'Adjust timing or take alternate route'
            }.get(hazard_type, 'Exercise caution')
        }
    
    @staticmethod
    def generate_negotiation_log() -> Dict[str, Any]:
        """Generate a realistic negotiation log entry"""
        types = ['intersection', 'merge', 'emergency', 'fuel', 'lane_change']
        outcomes = ['success', 'success', 'success', 'partial']  # Mostly successful
        
        neg_type = random.choice(types)
        num_vehicles = random.randint(2, 5)
        
        return {
            'type': neg_type,
            'vehicles': [f'v{i}' for i in random.sample(range(1, 9), num_vehicles)],
            'outcome': random.choice(outcomes),
            'durationMs': random.randint(10, 100),
            'reasoning': {
                'intersection': 'Priority based on urgency and fuel levels',
                'merge': 'Safe gap identified, speed adjustments applied',
                'emergency': 'All vehicles yielding to emergency',
                'fuel': 'Optimal refueling queue established',
                'lane_change': 'Safe lane change window identified'
            }.get(neg_type, 'Negotiation complete'),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def generate_ai_decision() -> Dict[str, Any]:
        """Generate a realistic AI decision log entry"""
        decision_types = [
            'traffic_prediction',
            'hazard_detection',
            'fuel_optimization',
            'speed_recommendation',
            'route_optimization',
            'negotiation_decision'
        ]
        
        dec_type = random.choice(decision_types)
        confidence = random.uniform(0.7, 0.99)
        
        return {
            'type': dec_type,
            'confidence': confidence,
            'reasoning': f"Analysis complete with {confidence:.1%} confidence",
            'input': {'sample': 'data'},
            'output': {'recommendation': 'applied'},
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def calculate_comparison_metrics(with_ai: bool) -> Dict[str, float]:
        """Calculate metrics for AI vs non-AI comparison"""
        if with_ai:
            return {
                'fuelUsed': random.uniform(25, 35),
                'avgSpeed': random.uniform(55, 65),
                'travelTime': random.uniform(40, 50),
                'accidents': 0,
                'nearMisses': random.randint(0, 2),
                'co2Emissions': random.uniform(15, 20)
            }
        else:
            return {
                'fuelUsed': random.uniform(40, 55),
                'avgSpeed': random.uniform(45, 55),
                'travelTime': random.uniform(55, 70),
                'accidents': random.randint(0, 2),
                'nearMisses': random.randint(3, 8),
                'co2Emissions': random.uniform(25, 35)
            }


# Create global instances
demo_simulation = DemoSimulation()
data_generator = RealisticDataGenerator()
