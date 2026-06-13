// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
Fuel Optimizer Module
Handles fuel consumption calculation, refuel strategy, and fleet fuel optimization
"""

import math
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class RefuelStop:
    """A planned refuel stop"""
    station_id: str
    station_name: str
    position: Dict[str, float]
    fuel_to_add: float  # liters
    cost: float
    wait_time: int  # minutes
    detour_distance: float  # km


@dataclass
class RefuelPlan:
    """Complete refuel plan for a trip"""
    stops: List[RefuelStop]
    total_cost: float
    total_time_added: int  # minutes
    total_detour: float  # km
    fuel_efficiency_score: float  # 0-100
    strategy: str


@dataclass
class FuelStrategy:
    """Fuel-saving strategy recommendation"""
    name: str
    description: str
    fuel_saved: float  # liters
    time_impact: int  # minutes (positive = delay, negative = faster)
    recommended: bool
    reasoning: str


class FuelOptimizer:
    """
    Fuel Optimization Engine
    Calculates consumption, plans refueling, and optimizes fleet fuel usage
    """
    
    def __init__(self):
        # Base consumption rates (liters per 100km at 60km/h)
        self.base_consumption = {
            'car': 7.0,
            'truck': 25.0,
            'ambulance': 12.0,
            'bus': 30.0,
            'van': 10.0,
            'suv': 9.0
        }
        
        # Terrain multipliers
        self.terrain_multipliers = {
            'flat': 1.0,
            'hilly': 1.2,
            'mountain': 1.5,
            'urban': 1.3,  # Stop-and-go traffic
            'highway': 0.9  # Consistent speed
        }
        
        # Decision log
        self.decision_log: List[Dict[str, Any]] = []
    
    def log_decision(self, decision_type: str, input_data: Dict, output: Any, reasoning: str):
        """Log optimization decision"""
        self.decision_log.append({
            'timestamp': datetime.utcnow().isoformat(),
            'type': decision_type,
            'input': input_data,
            'output': output if isinstance(output, dict) else str(output),
            'reasoning': reasoning
        })
        if len(self.decision_log) > 100:
            self.decision_log = self.decision_log[-100:]
    
    def calculate_fuel_consumption(self, 
                                   speed: float,
                                   distance: float,
                                   terrain: str = 'flat',
                                   vehicle_type: str = 'car',
                                   vehicle_weight: float = 1500,
                                   traffic_stop_frequency: float = 0,
                                   ac_on: bool = False,
                                   headwind: float = 0) -> Dict[str, Any]:
        """
        Calculate fuel consumption for a trip
        
        Args:
            speed: Average speed in km/h
            distance: Distance in km
            terrain: Type of terrain
            vehicle_type: Type of vehicle
            vehicle_weight: Weight in kg (affects trucks more)
            traffic_stop_frequency: Stops per km (0-1)
            ac_on: Air conditioning on
            headwind: Wind speed against vehicle (km/h)
        
        Returns:
            Dictionary with consumption details
        """
        # Get base consumption for vehicle type
        base = self.base_consumption.get(vehicle_type, 8.0)
        
        # Speed adjustment (optimal around 60-80 km/h)
        if speed < 30:
            speed_factor = 1.4  # Stop-and-go
        elif speed < 50:
            speed_factor = 1.15
        elif speed <= 80:
            speed_factor = 1.0  # Optimal range
        elif speed <= 100:
            speed_factor = 1.15
        elif speed <= 120:
            speed_factor = 1.35
        else:
            speed_factor = 1.6  # Very high speed
        
        # Terrain adjustment
        terrain_factor = self.terrain_multipliers.get(terrain, 1.0)
        
        # Weight adjustment (mainly for trucks)
        if vehicle_type == 'truck':
            weight_factor = 1 + (vehicle_weight - 5000) / 20000 * 0.3
        else:
            weight_factor = 1 + (vehicle_weight - 1500) / 5000 * 0.1
        weight_factor = max(0.8, min(1.5, weight_factor))
        
        # Traffic stops adjustment
        stop_factor = 1 + traffic_stop_frequency * 0.5
        
        # AC adjustment
        ac_factor = 1.1 if ac_on else 1.0
        
        # Headwind adjustment
        wind_factor = 1 + headwind / 200
        
        # Calculate total consumption
        adjusted_consumption = (
            base * speed_factor * terrain_factor * 
            weight_factor * stop_factor * ac_factor * wind_factor
        )
        
        # Liters consumed
        liters_consumed = (adjusted_consumption / 100) * distance
        
        # Cost estimate ($1.50 per liter average)
        estimated_cost = liters_consumed * 1.50
        
        # Efficiency rating
        if adjusted_consumption < base * 0.9:
            efficiency_rating = 'Excellent'
        elif adjusted_consumption < base * 1.1:
            efficiency_rating = 'Good'
        elif adjusted_consumption < base * 1.3:
            efficiency_rating = 'Average'
        else:
            efficiency_rating = 'Poor'
        
        result = {
            'liters_consumed': round(liters_consumed, 2),
            'consumption_rate': round(adjusted_consumption, 2),  # L/100km
            'estimated_cost': round(estimated_cost, 2),
            'efficiency_rating': efficiency_rating,
            'factors': {
                'speed': speed_factor,
                'terrain': terrain_factor,
                'weight': weight_factor,
                'traffic': stop_factor,
                'ac': ac_factor,
                'wind': wind_factor
            }
        }
        
        self.log_decision('fuel_consumption',
                         {'speed': speed, 'distance': distance, 'vehicle_type': vehicle_type},
                         result,
                         f"Calculated {liters_consumed:.2f}L for {distance}km at {speed}km/h")
        
        return result
    
    def find_optimal_refuel_strategy(self,
                                     vehicle: Dict[str, Any],
                                     route_distance: float,
                                     stations: List[Dict[str, Any]],
                                     fuel_prices_matter: bool = True) -> RefuelPlan:
        """
        Find optimal refueling strategy for a trip
        
        Args:
            vehicle: Vehicle data with current fuel
            route_distance: Total trip distance in km
            stations: List of available fuel stations
            fuel_prices_matter: If True, prioritize cheaper stations
        
        Returns:
            RefuelPlan with optimal stops
        """
        fuel_level = vehicle.get('fuelLevel', 50)
        fuel_capacity = vehicle.get('fuelCapacity', 60)
        vehicle_type = vehicle.get('type', 'car')
        position = vehicle.get('position', {'x': 0, 'y': 0})
        
        # Current fuel in liters
        current_fuel = (fuel_level / 100) * fuel_capacity
        
        # Estimated consumption for trip
        consumption = self.calculate_fuel_consumption(
            speed=60,
            distance=route_distance,
            vehicle_type=vehicle_type
        )
        fuel_needed = consumption['liters_consumed']
        
        stops: List[RefuelStop] = []
        total_cost = 0
        total_time = 0
        total_detour = 0
        
        # Do we need to refuel?
        if current_fuel >= fuel_needed * 1.2:  # 20% buffer
            strategy = "No refuel needed - sufficient fuel for trip with buffer"
        else:
            # Need to refuel - find best station(s)
            fuel_deficit = fuel_needed - current_fuel + (fuel_capacity * 0.2)  # End with 20%
            
            # Sort stations by score (distance + price factor)
            scored_stations = []
            for station in stations:
                if not station.get('isOpen', True):
                    continue
                
                station_pos = station.get('position', {'x': 0, 'y': 0})
                distance = math.sqrt(
                    (position['x'] - station_pos['x']) ** 2 +
                    (position['y'] - station_pos['y']) ** 2
                )
                
                price = station.get('fuelPrice', 1.50)
                wait_time = station.get('waitTime', 0)
                
                # Score: lower is better
                score = distance * 10  # Distance penalty
                if fuel_prices_matter:
                    score += (price - 1.30) * 50  # Price penalty (base $1.30)
                score += wait_time * 2  # Wait time penalty
                
                scored_stations.append({
                    'station': station,
                    'distance': distance,
                    'score': score
                })
            
            scored_stations.sort(key=lambda x: x['score'])
            
            # Select best station
            if scored_stations:
                best = scored_stations[0]
                station = best['station']
                
                # Calculate fuel to add
                fuel_to_add = min(
                    fuel_capacity - current_fuel,  # Max we can add
                    fuel_deficit + 10  # What we need plus buffer
                )
                
                cost = fuel_to_add * station.get('fuelPrice', 1.50)
                
                stops.append(RefuelStop(
                    station_id=station.get('id', 'unknown'),
                    station_name=station.get('name', 'Unknown Station'),
                    position=station.get('position', {'x': 0, 'y': 0}),
                    fuel_to_add=round(fuel_to_add, 1),
                    cost=round(cost, 2),
                    wait_time=station.get('waitTime', 5),
                    detour_distance=round(best['distance'] * 10, 1)  # Convert units
                ))
                
                total_cost = cost
                total_time = station.get('waitTime', 5) + 5  # Plus refueling time
                total_detour = best['distance'] * 10
                
                strategy = f"Single stop at {station.get('name')} - optimal price/distance balance"
            else:
                strategy = "WARNING: No suitable stations found"
        
        # Calculate efficiency score
        if total_cost == 0:
            efficiency_score = 100
        else:
            # Base score of 80, reduced by cost and time
            efficiency_score = max(0, 100 - (total_cost / 10) - (total_time / 2) - (total_detour / 5))
        
        plan = RefuelPlan(
            stops=stops,
            total_cost=round(total_cost, 2),
            total_time_added=round(total_time),
            total_detour=round(total_detour, 1),
            fuel_efficiency_score=round(efficiency_score, 1),
            strategy=strategy
        )
        
        self.log_decision('refuel_strategy',
                         {'vehicle_id': vehicle.get('id'), 'route_distance': route_distance},
                         {'stops': len(stops), 'cost': total_cost, 'strategy': strategy},
                         strategy)
        
        return plan
    
    def traffic_aware_fuel_saving(self,
                                   vehicle: Dict[str, Any],
                                   congestion_data: Dict[int, float],
                                   stations: List[Dict[str, Any]]) -> List[FuelStrategy]:
        """
        Generate fuel-saving strategies based on traffic conditions
        
        Args:
            vehicle: Vehicle data
            congestion_data: Dict of segment_id -> congestion level (0-100)
            stations: Available fuel stations
        
        Returns:
            List of strategy options with comparisons
        """
        strategies: List[FuelStrategy] = []
        
        fuel_level = vehicle.get('fuelLevel', 50)
        current_speed = vehicle.get('speed', 60)
        current_segment = vehicle.get('currentSegment', 0)
        
        # Get congestion ahead
        ahead_segments = [s for s in congestion_data.keys() if s > current_segment]
        if ahead_segments:
            max_congestion = max(congestion_data.get(s, 0) for s in ahead_segments[:3])
        else:
            max_congestion = 0
        
        # Strategy A: Slow down now, arrive when traffic clears
        if max_congestion > 60:
            time_saved = max_congestion // 10  # Minutes saved by avoiding peak
            fuel_saved = (current_speed - 40) * 0.05  # Liters saved by slower speed
            
            strategies.append(FuelStrategy(
                name="Slow Arrival",
                description=f"Reduce speed to 40km/h now. Arrive after congestion clears.",
                fuel_saved=round(fuel_saved, 2),
                time_impact=5,  # 5 min longer but smoother
                recommended=fuel_level < 40,
                reasoning=f"Traffic ahead is {max_congestion}% congested. Slowing saves fuel and avoids stop-and-go."
            ))
        
        # Strategy B: Take alternate route
        if max_congestion > 40:
            # Assume alternate is 20% longer but less congested
            strategies.append(FuelStrategy(
                name="Alternate Route",
                description="Take parallel road to avoid main congestion.",
                fuel_saved=round((max_congestion / 100) * 2, 2),  # Avoid stop-and-go waste
                time_impact=-3 if max_congestion > 70 else 5,  # Faster if main is really bad
                recommended=max_congestion > 70,
                reasoning=f"Alternate route is longer but flowing freely."
            ))
        
        # Strategy C: Stop at station, refuel, wait
        if max_congestion > 50 and fuel_level < 60 and stations:
            # Find nearest station
            position = vehicle.get('position', {'x': 0, 'y': 0})
            nearest = min(stations, key=lambda s: math.sqrt(
                (position['x'] - s.get('position', {}).get('x', 0)) ** 2 +
                (position['y'] - s.get('position', {}).get('y', 0)) ** 2
            ))
            
            strategies.append(FuelStrategy(
                name="Strategic Refuel Stop",
                description=f"Stop at {nearest.get('name', 'nearby station')}, refuel, let traffic clear.",
                fuel_saved=0,  # Not saving fuel, but productive use of time
                time_impact=0,  # Net zero - would wait in traffic anyway
                recommended=fuel_level < 35,
                reasoning=f"Use traffic delay productively - refuel while waiting for congestion to clear."
            ))
        
        # Strategy D: Continue as normal
        strategies.append(FuelStrategy(
            name="Continue Normal",
            description="Maintain current speed and route.",
            fuel_saved=0,
            time_impact=0,
            recommended=max_congestion < 40 and fuel_level > 50,
            reasoning="Traffic is manageable, no special action needed."
        ))
        
        # Sort by recommendation
        strategies.sort(key=lambda s: (not s.recommended, -s.fuel_saved))
        
        self.log_decision('traffic_fuel_strategy',
                         {'vehicle_id': vehicle.get('id'), 'congestion': max_congestion},
                         {'strategies': len(strategies), 'recommended': strategies[0].name if strategies else 'none'},
                         f"Generated {len(strategies)} strategies for {max_congestion}% congestion ahead")
        
        return strategies
    
    def fleet_fuel_optimization(self,
                                 vehicles: List[Dict[str, Any]],
                                 stations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Optimize refueling across entire fleet to avoid congestion at stations
        
        Args:
            vehicles: All fleet vehicles
            stations: All fuel stations
        
        Returns:
            Fleet refueling schedule
        """
        # Find vehicles that need fuel (< 30%)
        needs_fuel = [v for v in vehicles if v.get('fuelLevel', 100) < 30]
        
        # Sort by urgency (lower fuel = higher priority)
        needs_fuel.sort(key=lambda v: v.get('fuelLevel', 100))
        
        # Assign to stations, distributing load
        station_assignments: Dict[str, List[Dict[str, Any]]] = {
            s.get('id', str(i)): [] for i, s in enumerate(stations)
        }
        
        schedule = []
        
        for vehicle in needs_fuel:
            position = vehicle.get('position', {'x': 0, 'y': 0})
            
            # Find best station (considering current queue)
            best_station = None
            best_score = float('inf')
            
            for station in stations:
                if not station.get('isOpen', True):
                    continue
                
                station_id = station.get('id', 'unknown')
                station_pos = station.get('position', {'x': 0, 'y': 0})
                
                distance = math.sqrt(
                    (position['x'] - station_pos['x']) ** 2 +
                    (position['y'] - station_pos['y']) ** 2
                )
                
                # Current queue at this station
                current_queue = len(station_assignments.get(station_id, []))
                
                # Score: distance + queue penalty
                score = distance * 10 + current_queue * 15
                
                if score < best_score:
                    best_score = score
                    best_station = station
            
            if best_station:
                station_id = best_station.get('id', 'unknown')
                queue_position = len(station_assignments.get(station_id, []))
                
                station_assignments[station_id].append(vehicle)
                
                # Estimate wait time based on queue position
                wait_time = queue_position * 8  # 8 min per vehicle
                
                schedule.append({
                    'vehicleId': vehicle.get('id'),
                    'vehicleName': vehicle.get('name'),
                    'fuelLevel': vehicle.get('fuelLevel'),
                    'stationId': station_id,
                    'stationName': best_station.get('name'),
                    'queuePosition': queue_position,
                    'estimatedWait': wait_time,
                    'priority': 'critical' if vehicle.get('fuelLevel', 100) < 15 else 'normal'
                })
        
        # Summary stats
        total_vehicles = len(needs_fuel)
        stations_used = sum(1 for s in station_assignments.values() if len(s) > 0)
        max_queue = max(len(s) for s in station_assignments.values()) if station_assignments else 0
        
        result = {
            'schedule': schedule,
            'totalVehiclesNeedingFuel': total_vehicles,
            'stationsUsed': stations_used,
            'maxQueueLength': max_queue,
            'estimatedCompletionTime': max_queue * 8 + 10,  # minutes
            'stationLoad': {
                sid: len(vehicles) for sid, vehicles in station_assignments.items()
            }
        }
        
        self.log_decision('fleet_fuel_optimization',
                         {'total_vehicles': len(vehicles), 'needing_fuel': total_vehicles},
                         result,
                         f"Scheduled {total_vehicles} vehicles across {stations_used} stations")
        
        return result
    
    def get_eco_driving_tips(self, vehicle: Dict[str, Any]) -> List[Dict[str, str]]:
        """Get eco-driving tips based on current driving patterns"""
        tips = []
        
        speed = vehicle.get('speed', 60)
        fuel_level = vehicle.get('fuelLevel', 50)
        
        if speed > 100:
            tips.append({
                'tip': 'Reduce Speed',
                'description': 'Speeds over 100km/h significantly increase fuel consumption.',
                'impact': 'Save up to 15% fuel'
            })
        
        if fuel_level < 20:
            tips.append({
                'tip': 'Maintain Steady Speed',
                'description': 'Avoid rapid acceleration and braking to maximize remaining fuel.',
                'impact': 'Extend range by 10%'
            })
        
        tips.append({
            'tip': 'Anticipate Traffic',
            'description': 'Look ahead and coast to stops instead of braking hard.',
            'impact': 'Save 5-10% fuel'
        })
        
        tips.append({
            'tip': 'Check Tire Pressure',
            'description': 'Under-inflated tires increase rolling resistance.',
            'impact': 'Save 3% fuel'
        })
        
        return tips


# Create global instance
fuel_optimizer = FuelOptimizer()
