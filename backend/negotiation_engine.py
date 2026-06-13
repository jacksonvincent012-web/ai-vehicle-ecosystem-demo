// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
Negotiation Engine Module
Handles vehicle-to-vehicle negotiations for intersections, merges, emergencies, and fuel priority
"""

import math
import random
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime
import uuid


@dataclass
class NegotiationResult:
    """Result of a negotiation"""
    id: str
    negotiation_type: str
    vehicle_ids: List[str]
    priority_order: List[str]
    speed_adjustments: Dict[str, float]
    lane_assignments: Dict[str, int]
    timing_sequence: List[Dict[str, Any]]
    outcome: str  # success, partial, failed
    reasoning: str
    duration_ms: int


@dataclass
class MergePlan:
    """Plan for a merge maneuver"""
    merge_order: List[str]
    gap_creations: List[Dict[str, Any]]
    speed_changes: Dict[str, float]
    timing: List[Dict[str, Any]]
    safety_score: float


@dataclass
class EmergencyResponse:
    """Fleet-wide emergency response plan"""
    emergency_vehicle_id: str
    affected_vehicles: List[str]
    lane_changes: Dict[str, int]
    speed_reductions: Dict[str, float]
    yield_positions: List[Dict[str, Any]]
    estimated_clear_time: int  # seconds


@dataclass
class ConsensusDecision:
    """Multi-vehicle consensus decision"""
    decision: str
    votes: Dict[str, str]
    dissenting_vehicles: List[str]
    compromise_actions: Dict[str, str]
    confidence: float


class NegotiationEngine:
    """
    Vehicle-to-Vehicle Negotiation Engine
    Handles priority scoring, conflict resolution, and multi-vehicle coordination
    """
    
    def __init__(self):
        # Priority weights for different factors
        self.priority_weights = {
            'emergency_vehicle': 100,
            'low_fuel': 25,
            'high_urgency': 15,
            'waiting_time': 10,
            'passenger_count': 5,
            'vehicle_size': 3
        }
        
        # Negotiation history
        self.negotiation_history: List[NegotiationResult] = []
        self.total_negotiations = 0
        self.successful_negotiations = 0
        
        # Decision log
        self.decision_log: List[Dict[str, Any]] = []
    
    def log_decision(self, decision_type: str, input_data: Dict, output: Any, reasoning: str):
        """Log negotiation decision"""
        self.decision_log.append({
            'timestamp': datetime.utcnow().isoformat(),
            'type': decision_type,
            'input': input_data,
            'output': output if isinstance(output, dict) else str(output),
            'reasoning': reasoning
        })
        if len(self.decision_log) > 100:
            self.decision_log = self.decision_log[-100:]
    
    def calculate_priority_score(self, vehicle: Dict[str, Any], context: Dict[str, Any] = None) -> float:
        """
        Calculate priority score for a vehicle
        
        Args:
            vehicle: Vehicle data
            context: Additional context (intersection type, waiting time, etc.)
        
        Returns:
            Priority score (higher = more priority)
        """
        score = 50  # Base score
        
        vehicle_type = vehicle.get('type', 'car')
        urgency = vehicle.get('urgency', 5)
        fuel_level = vehicle.get('fuelLevel', 50)
        status = vehicle.get('status', 'moving')
        
        # Emergency vehicle bonus
        if vehicle_type == 'ambulance' or status == 'emergency':
            score += self.priority_weights['emergency_vehicle']
        
        # Low fuel bonus (need to reach station)
        if fuel_level < 15:
            score += self.priority_weights['low_fuel']
        elif fuel_level < 25:
            score += self.priority_weights['low_fuel'] * 0.5
        
        # Urgency bonus
        if urgency >= 9:
            score += self.priority_weights['high_urgency'] * 2
        elif urgency >= 7:
            score += self.priority_weights['high_urgency']
        elif urgency >= 5:
            score += self.priority_weights['high_urgency'] * 0.5
        
        # Waiting time bonus (if provided in context)
        if context and 'waiting_time' in context:
            waiting = context['waiting_time'].get(vehicle.get('id'), 0)
            score += min(waiting * 2, self.priority_weights['waiting_time'])
        
        # Passenger count (buses get priority)
        if vehicle_type == 'bus':
            score += self.priority_weights['passenger_count'] * 5
        elif vehicle_type == 'van':
            score += self.priority_weights['passenger_count'] * 2
        
        # Vehicle size (larger vehicles harder to stop)
        size_bonus = {
            'truck': 10,
            'bus': 8,
            'ambulance': 5,
            'van': 3,
            'suv': 2,
            'car': 0
        }
        score += size_bonus.get(vehicle_type, 0)
        
        return score
    
    def negotiate_intersection(self, vehicles_approaching: List[Dict[str, Any]],
                               intersection_id: int = 0) -> NegotiationResult:
        """
        Negotiate right-of-way at an intersection
        
        Args:
            vehicles_approaching: List of vehicles approaching the intersection
            intersection_id: ID of the intersection
        
        Returns:
            NegotiationResult with priority order and adjustments
        """
        start_time = datetime.utcnow()
        self.total_negotiations += 1
        
        if not vehicles_approaching:
            return NegotiationResult(
                id=str(uuid.uuid4()),
                negotiation_type='intersection',
                vehicle_ids=[],
                priority_order=[],
                speed_adjustments={},
                lane_assignments={},
                timing_sequence=[],
                outcome='success',
                reasoning='No vehicles to negotiate',
                duration_ms=0
            )
        
        # Calculate priority scores
        scored_vehicles = []
        for vehicle in vehicles_approaching:
            score = self.calculate_priority_score(vehicle)
            scored_vehicles.append({
                'vehicle': vehicle,
                'score': score
            })
        
        # Sort by priority (highest first)
        scored_vehicles.sort(key=lambda x: x['score'], reverse=True)
        
        # Generate priority order
        priority_order = [sv['vehicle'].get('id') for sv in scored_vehicles]
        
        # Generate speed adjustments
        speed_adjustments = {}
        timing_sequence = []
        base_time = 0
        
        for i, sv in enumerate(scored_vehicles):
            vehicle = sv['vehicle']
            vehicle_id = vehicle.get('id')
            current_speed = vehicle.get('speed', 60)
            
            if i == 0:
                # First vehicle proceeds at full speed
                speed_adjustments[vehicle_id] = current_speed
                timing_sequence.append({
                    'vehicleId': vehicle_id,
                    'action': 'proceed',
                    'time': base_time,
                    'speed': current_speed
                })
            else:
                # Others slow down or stop
                wait_time = i * 3  # 3 seconds between each
                if i == 1:
                    new_speed = current_speed * 0.5
                else:
                    new_speed = 0  # Stop and wait
                
                speed_adjustments[vehicle_id] = new_speed
                timing_sequence.append({
                    'vehicleId': vehicle_id,
                    'action': 'yield' if new_speed > 0 else 'stop',
                    'time': base_time + wait_time,
                    'speed': new_speed
                })
        
        # Lane assignments (maintain current lanes)
        lane_assignments = {
            v.get('id'): v.get('lane', 1) for v in vehicles_approaching
        }
        
        # Build reasoning
        reasoning_parts = []
        for sv in scored_vehicles[:3]:  # Top 3
            v = sv['vehicle']
            reasoning_parts.append(f"{v.get('name', v.get('id'))}: score={sv['score']:.0f}")
        reasoning = f"Priority at intersection {intersection_id}: " + ", ".join(reasoning_parts)
        
        duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        result = NegotiationResult(
            id=str(uuid.uuid4()),
            negotiation_type='intersection',
            vehicle_ids=[v.get('id') for v in vehicles_approaching],
            priority_order=priority_order,
            speed_adjustments=speed_adjustments,
            lane_assignments=lane_assignments,
            timing_sequence=timing_sequence,
            outcome='success',
            reasoning=reasoning,
            duration_ms=duration
        )
        
        self.successful_negotiations += 1
        self.negotiation_history.append(result)
        
        self.log_decision('intersection_negotiation',
                         {'intersection': intersection_id, 'vehicles': len(vehicles_approaching)},
                         {'priority': priority_order[:3], 'outcome': 'success'},
                         reasoning)
        
        return result
    
    def negotiate_merge(self, vehicles_in_lane: List[Dict[str, Any]],
                        vehicles_merging: List[Dict[str, Any]]) -> MergePlan:
        """
        Negotiate merge maneuver
        
        Args:
            vehicles_in_lane: Vehicles already in the target lane
            vehicles_merging: Vehicles wanting to merge in
        
        Returns:
            MergePlan with merge order and speed adjustments
        """
        self.total_negotiations += 1
        
        # Find gaps in the target lane
        # Sort by position (x coordinate as proxy for position along road)
        sorted_in_lane = sorted(vehicles_in_lane, key=lambda v: v.get('position', {}).get('x', 0))
        
        # Calculate gaps between vehicles
        gaps = []
        for i in range(len(sorted_in_lane) - 1):
            v1 = sorted_in_lane[i]
            v2 = sorted_in_lane[i + 1]
            gap_size = (v2.get('position', {}).get('x', 0) - v1.get('position', {}).get('x', 0))
            if gap_size > 15:  # Minimum safe gap
                gaps.append({
                    'after_vehicle': v1.get('id'),
                    'before_vehicle': v2.get('id'),
                    'size': gap_size,
                    'position': (v1.get('position', {}).get('x', 0) + v2.get('position', {}).get('x', 0)) / 2
                })
        
        # Sort merging vehicles by priority
        merging_with_scores = [
            {'vehicle': v, 'score': self.calculate_priority_score(v)}
            for v in vehicles_merging
        ]
        merging_with_scores.sort(key=lambda x: x['score'], reverse=True)
        
        # Assign merging vehicles to gaps
        merge_order = []
        gap_creations = []
        speed_changes = {}
        timing = []
        
        for i, mv in enumerate(merging_with_scores):
            vehicle = mv['vehicle']
            vehicle_id = vehicle.get('id')
            
            if i < len(gaps):
                # Use existing gap
                gap = gaps[i]
                merge_order.append(vehicle_id)
                timing.append({
                    'vehicleId': vehicle_id,
                    'action': 'merge',
                    'afterVehicle': gap['after_vehicle'],
                    'time': i * 2
                })
                speed_changes[vehicle_id] = 50  # Merge at safe speed
            else:
                # Need to create gap
                if sorted_in_lane:
                    # Ask a vehicle in lane to slow down
                    target = sorted_in_lane[i % len(sorted_in_lane)]
                    target_id = target.get('id')
                    gap_creations.append({
                        'vehicleId': target_id,
                        'action': 'slow_to_create_gap',
                        'newSpeed': target.get('speed', 60) * 0.7
                    })
                    speed_changes[target_id] = target.get('speed', 60) * 0.7
                
                merge_order.append(vehicle_id)
                speed_changes[vehicle_id] = 40  # Slower merge
                timing.append({
                    'vehicleId': vehicle_id,
                    'action': 'wait_and_merge',
                    'time': (len(gaps) + i) * 3
                })
        
        # Calculate safety score
        safety_score = 100 - (len(gap_creations) * 10)  # Penalty for forced gaps
        safety_score = max(50, min(100, safety_score))
        
        plan = MergePlan(
            merge_order=merge_order,
            gap_creations=gap_creations,
            speed_changes=speed_changes,
            timing=timing,
            safety_score=safety_score
        )
        
        self.successful_negotiations += 1
        
        self.log_decision('merge_negotiation',
                         {'in_lane': len(vehicles_in_lane), 'merging': len(vehicles_merging)},
                         {'merge_order': merge_order, 'safety': safety_score},
                         f"Merge plan: {len(merge_order)} vehicles, safety {safety_score}%")
        
        return plan
    
    def negotiate_emergency_response(self, emergency_vehicle: Dict[str, Any],
                                     nearby_vehicles: List[Dict[str, Any]]) -> EmergencyResponse:
        """
        Coordinate emergency vehicle passage
        
        Args:
            emergency_vehicle: The emergency vehicle (ambulance)
            nearby_vehicles: All vehicles in the vicinity
        
        Returns:
            EmergencyResponse with fleet-wide adjustments
        """
        self.total_negotiations += 1
        
        emergency_id = emergency_vehicle.get('id')
        emergency_lane = emergency_vehicle.get('lane', 1)
        emergency_pos = emergency_vehicle.get('position', {'x': 0, 'y': 0})
        
        affected_vehicles = []
        lane_changes = {}
        speed_reductions = {}
        yield_positions = []
        
        for vehicle in nearby_vehicles:
            if vehicle.get('id') == emergency_id:
                continue
            
            vehicle_id = vehicle.get('id')
            vehicle_lane = vehicle.get('lane', 1)
            vehicle_pos = vehicle.get('position', {'x': 0, 'y': 0})
            vehicle_speed = vehicle.get('speed', 60)
            
            # Calculate distance to emergency vehicle
            distance = math.sqrt(
                (vehicle_pos['x'] - emergency_pos['x']) ** 2 +
                (vehicle_pos['y'] - emergency_pos['y']) ** 2
            )
            
            # Affect vehicles within 100 units
            if distance < 100:
                affected_vehicles.append(vehicle_id)
                
                # If in same lane, move to side
                if vehicle_lane == emergency_lane:
                    # Change to adjacent lane
                    new_lane = vehicle_lane + 1 if vehicle_lane == 1 else vehicle_lane - 1
                    lane_changes[vehicle_id] = new_lane
                    speed_reductions[vehicle_id] = vehicle_speed * 0.5
                    
                    yield_positions.append({
                        'vehicleId': vehicle_id,
                        'action': 'change_lane_and_slow',
                        'fromLane': vehicle_lane,
                        'toLane': new_lane,
                        'newSpeed': vehicle_speed * 0.5
                    })
                else:
                    # Just slow down
                    speed_reductions[vehicle_id] = vehicle_speed * 0.7
                    yield_positions.append({
                        'vehicleId': vehicle_id,
                        'action': 'slow_down',
                        'newSpeed': vehicle_speed * 0.7
                    })
        
        # Estimate clear time based on number of affected vehicles
        clear_time = len(affected_vehicles) * 2 + 5  # seconds
        
        response = EmergencyResponse(
            emergency_vehicle_id=emergency_id,
            affected_vehicles=affected_vehicles,
            lane_changes=lane_changes,
            speed_reductions=speed_reductions,
            yield_positions=yield_positions,
            estimated_clear_time=clear_time
        )
        
        self.successful_negotiations += 1
        
        self.log_decision('emergency_response',
                         {'emergency_id': emergency_id, 'nearby': len(nearby_vehicles)},
                         {'affected': len(affected_vehicles), 'clear_time': clear_time},
                         f"Emergency response: {len(affected_vehicles)} vehicles yielding")
        
        return response
    
    def negotiate_fuel_priority(self, vehicles_needing_fuel: List[Dict[str, Any]],
                                station: Dict[str, Any]) -> Dict[str, Any]:
        """
        Negotiate fuel station access priority
        
        Args:
            vehicles_needing_fuel: Vehicles that need to refuel
            station: The target fuel station
        
        Returns:
            Dictionary with refuel queue and reroute suggestions
        """
        self.total_negotiations += 1
        
        # Score by fuel criticality and distance to station
        station_pos = station.get('position', {'x': 0, 'y': 0})
        
        scored = []
        for vehicle in vehicles_needing_fuel:
            fuel_level = vehicle.get('fuelLevel', 50)
            vehicle_pos = vehicle.get('position', {'x': 0, 'y': 0})
            
            distance = math.sqrt(
                (vehicle_pos['x'] - station_pos['x']) ** 2 +
                (vehicle_pos['y'] - station_pos['y']) ** 2
            )
            
            # Criticality score (lower fuel = higher priority)
            criticality = 100 - fuel_level
            
            # Distance score (closer = higher priority)
            distance_score = max(0, 50 - distance)
            
            # Combined score
            score = criticality * 2 + distance_score
            
            scored.append({
                'vehicle': vehicle,
                'score': score,
                'fuelLevel': fuel_level,
                'distance': distance
            })
        
        # Sort by score (highest first)
        scored.sort(key=lambda x: x['score'], reverse=True)
        
        # Station capacity (assume 2 pumps, 5 min each)
        station_capacity = 2
        service_time = 5  # minutes
        
        refuel_queue = []
        reroute_suggestions = []
        
        for i, sv in enumerate(scored):
            vehicle = sv['vehicle']
            vehicle_id = vehicle.get('id')
            
            if i < station_capacity * 2:  # Can service within reasonable time
                wait_time = (i // station_capacity) * service_time
                refuel_queue.append({
                    'vehicleId': vehicle_id,
                    'vehicleName': vehicle.get('name'),
                    'position': i + 1,
                    'estimatedWait': wait_time,
                    'fuelLevel': sv['fuelLevel'],
                    'priority': 'critical' if sv['fuelLevel'] < 15 else 'normal'
                })
            else:
                # Suggest rerouting to different station
                reroute_suggestions.append({
                    'vehicleId': vehicle_id,
                    'vehicleName': vehicle.get('name'),
                    'reason': 'Queue too long',
                    'suggestion': 'Consider alternate station',
                    'currentWaitEstimate': i * service_time / station_capacity
                })
        
        result = {
            'stationId': station.get('id'),
            'stationName': station.get('name'),
            'refuelQueue': refuel_queue,
            'rerouteSuggestions': reroute_suggestions,
            'totalWaitTime': len(refuel_queue) * service_time / station_capacity,
            'queueLength': len(refuel_queue)
        }
        
        self.successful_negotiations += 1
        
        self.log_decision('fuel_priority',
                         {'vehicles': len(vehicles_needing_fuel), 'station': station.get('name')},
                         {'queue_length': len(refuel_queue), 'reroutes': len(reroute_suggestions)},
                         f"Fuel queue: {len(refuel_queue)} vehicles at {station.get('name')}")
        
        return result
    
    def multi_vehicle_consensus(self, scenario: str,
                                vehicles: List[Dict[str, Any]],
                                options: List[str] = None) -> ConsensusDecision:
        """
        Collective decision making for multi-vehicle scenarios
        
        Args:
            scenario: Description of the scenario
            vehicles: Participating vehicles
            options: Available options (if None, generates basic options)
        
        Returns:
            ConsensusDecision with outcome
        """
        self.total_negotiations += 1
        
        if not options:
            options = ['proceed', 'wait', 'reroute', 'slow_down']
        
        # Each vehicle "votes" based on their situation
        votes = {}
        weighted_votes: Dict[str, float] = {opt: 0 for opt in options}
        
        for vehicle in vehicles:
            vehicle_id = vehicle.get('id')
            priority = self.calculate_priority_score(vehicle)
            
            # Decision logic based on vehicle state
            fuel_level = vehicle.get('fuelLevel', 50)
            urgency = vehicle.get('urgency', 5)
            
            if urgency >= 8:
                vote = 'proceed'
            elif fuel_level < 20:
                vote = 'reroute'  # Find fuel
            elif urgency <= 3:
                vote = 'wait'
            else:
                vote = 'slow_down'
            
            votes[vehicle_id] = vote
            weighted_votes[vote] += priority
        
        # Find winning option
        winning_option = max(weighted_votes.keys(), key=lambda k: weighted_votes[k])
        
        # Identify dissenters
        dissenting = [vid for vid, vote in votes.items() if vote != winning_option]
        
        # Generate compromise actions for dissenters
        compromise_actions = {}
        for vid in dissenting:
            original_vote = votes[vid]
            if original_vote == 'proceed' and winning_option == 'wait':
                compromise_actions[vid] = 'proceed_slowly'
            elif original_vote == 'wait' and winning_option == 'proceed':
                compromise_actions[vid] = 'proceed_with_caution'
            else:
                compromise_actions[vid] = f'follow_{winning_option}'
        
        # Calculate confidence
        total_weight = sum(weighted_votes.values())
        if total_weight > 0:
            confidence = weighted_votes[winning_option] / total_weight
        else:
            confidence = 0.5
        
        decision = ConsensusDecision(
            decision=winning_option,
            votes=votes,
            dissenting_vehicles=dissenting,
            compromise_actions=compromise_actions,
            confidence=confidence
        )
        
        self.successful_negotiations += 1
        
        self.log_decision('consensus',
                         {'scenario': scenario, 'vehicles': len(vehicles)},
                         {'decision': winning_option, 'confidence': f'{confidence:.1%}'},
                         f"Consensus: {winning_option} ({confidence:.1%} confidence)")
        
        return decision
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get negotiation statistics"""
        success_rate = (self.successful_negotiations / self.total_negotiations * 100
                       if self.total_negotiations > 0 else 0)
        
        return {
            'total_negotiations': self.total_negotiations,
            'successful_negotiations': self.successful_negotiations,
            'success_rate': round(success_rate, 1),
            'history_size': len(self.negotiation_history),
            'recent_decisions': len(self.decision_log)
        }
    
    def get_recent_negotiations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent negotiation results"""
        recent = self.negotiation_history[-limit:]
        return [
            {
                'id': n.id,
                'type': n.negotiation_type,
                'vehicles': n.vehicle_ids,
                'outcome': n.outcome,
                'reasoning': n.reasoning,
                'duration_ms': n.duration_ms
            }
            for n in recent
        ]


# Create global instance
negotiation_engine = NegotiationEngine()
