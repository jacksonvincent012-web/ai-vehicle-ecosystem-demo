// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
AI Engine for Vehicle Ecosystem
Handles traffic prediction, hazard detection, fuel optimization, and self-learning
"""

import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass, field


@dataclass
class PredictionResult:
    """Result of an AI prediction"""
    value: float
    confidence: float
    reasoning: str
    factors: Dict[str, float] = field(default_factory=dict)


@dataclass
class HazardPrediction:
    """Hazard prediction result"""
    risk_score: float
    hazard_type: str
    severity: str
    recommended_action: str
    confidence: float


@dataclass
class FuelPrediction:
    """Fuel depletion prediction"""
    km_remaining: float
    time_remaining_minutes: float
    will_reach_destination: bool
    nearest_station: Optional[Dict[str, Any]]
    refuel_recommendation: str


@dataclass
class SpeedRecommendation:
    """Optimal speed recommendation"""
    recommended_speed: float
    current_speed: float
    reasoning: str
    fuel_impact: str
    safety_impact: str
    time_impact: str


class AIEngine:
    """
    Main AI Engine for the Vehicle Ecosystem
    Implements traffic prediction, hazard detection, and self-learning
    """
    
    def __init__(self):
        # Learning parameters
        self.learning_rate = 0.01
        self.prediction_accuracy = 0.65  # Starting accuracy
        self.learning_iterations = 0
        
        # Historical data storage
        self.traffic_history: Dict[int, List[float]] = {}
        self.prediction_history: List[Dict[str, Any]] = []
        self.actual_outcomes: List[Dict[str, Any]] = []
        
        # Weights for predictions (learned over time)
        self.traffic_weights = {
            'current_trend': 0.4,
            'time_of_day': 0.25,
            'day_of_week': 0.15,
            'historical_avg': 0.2
        }
        
        self.hazard_weights = {
            'slippery_coefficient': 0.3,
            'visibility': 0.25,
            'vehicle_density': 0.2,
            'speed_differential': 0.15,
            'weather': 0.1
        }
        
        # Decision log
        self.decision_log: List[Dict[str, Any]] = []
    
    def log_decision(self, decision_type: str, input_data: Dict, output: Any, reasoning: str):
        """Log an AI decision for transparency"""
        self.decision_log.append({
            'timestamp': datetime.utcnow().isoformat(),
            'type': decision_type,
            'input': input_data,
            'output': str(output) if not isinstance(output, dict) else output,
            'reasoning': reasoning,
            'accuracy': self.prediction_accuracy
        })
        
        # Keep only last 100 decisions
        if len(self.decision_log) > 100:
            self.decision_log = self.decision_log[-100:]
    
    def predict_traffic(self, segment_id: int, time_horizon_minutes: int = 30) -> PredictionResult:
        """
        Predict traffic congestion for a road segment
        Uses weighted moving average on historical patterns
        """
        # Get current time factors
        now = datetime.now()
        hour = now.hour
        day = now.weekday()
        
        # Time of day factor (rush hours)
        time_factor = self._get_time_of_day_factor(hour)
        
        # Day of week factor (weekends less traffic)
        day_factor = 0.7 if day >= 5 else 1.0
        
        # Get historical average for this segment
        history = self.traffic_history.get(segment_id, [50.0])
        historical_avg = sum(history[-10:]) / min(len(history), 10)
        
        # Current trend (last 3 readings)
        if len(history) >= 3:
            trend = (history[-1] - history[-3]) / 3
        else:
            trend = 0
        
        # Calculate prediction
        prediction = (
            self.traffic_weights['current_trend'] * (historical_avg + trend * time_horizon_minutes / 5) +
            self.traffic_weights['time_of_day'] * time_factor * 100 +
            self.traffic_weights['day_of_week'] * day_factor * historical_avg +
            self.traffic_weights['historical_avg'] * historical_avg
        )
        
        # Clamp to valid range
        prediction = max(0, min(100, prediction))
        
        # Add some realistic variance
        prediction += random.gauss(0, 5)
        prediction = max(0, min(100, prediction))
        
        # Calculate confidence based on data availability
        confidence = min(0.95, 0.5 + len(history) * 0.05)
        
        reasoning = f"Traffic prediction for segment {segment_id}: " \
                   f"Current trend {'increasing' if trend > 0 else 'decreasing'}, " \
                   f"{'Rush hour' if time_factor > 0.7 else 'Off-peak'}, " \
                   f"Historical avg: {historical_avg:.1f}%"
        
        result = PredictionResult(
            value=prediction,
            confidence=confidence,
            reasoning=reasoning,
            factors={
                'time_factor': time_factor,
                'day_factor': day_factor,
                'historical_avg': historical_avg,
                'trend': trend
            }
        )
        
        self.log_decision('traffic_prediction', 
                         {'segment_id': segment_id, 'time_horizon': time_horizon_minutes},
                         {'prediction': prediction, 'confidence': confidence},
                         reasoning)
        
        return result
    
    def _get_time_of_day_factor(self, hour: int) -> float:
        """Get traffic factor based on time of day"""
        # Morning rush: 7-9 AM
        if 7 <= hour <= 9:
            return 0.9
        # Evening rush: 5-7 PM
        elif 17 <= hour <= 19:
            return 0.95
        # Midday
        elif 10 <= hour <= 16:
            return 0.6
        # Night
        elif hour < 6 or hour > 21:
            return 0.2
        # Transition periods
        else:
            return 0.5
    
    def predict_hazard(self, road_conditions: Dict[str, Any], weather: str, 
                      speed: float, vehicle_density: float = 50) -> HazardPrediction:
        """
        Calculate hazard risk score based on multiple factors
        """
        # Extract conditions
        slippery = road_conditions.get('slippery_score', 0)
        visibility = road_conditions.get('visibility', 100)
        condition = road_conditions.get('condition', 'good')
        
        # Weather factor
        weather_risk = {
            'clear': 0,
            'cloudy': 5,
            'rain': 30,
            'heavy_rain': 50,
            'fog': 40,
            'snow': 60,
            'ice': 80
        }.get(weather, 10)
        
        # Speed differential risk (speeding increases risk)
        speed_limit = road_conditions.get('speed_limit', 60)
        speed_diff = max(0, speed - speed_limit)
        speed_risk = speed_diff * 2  # 2 points per km/h over limit
        
        # Calculate weighted risk score
        risk_score = (
            self.hazard_weights['slippery_coefficient'] * slippery +
            self.hazard_weights['visibility'] * (100 - visibility) +
            self.hazard_weights['vehicle_density'] * vehicle_density * 0.5 +
            self.hazard_weights['speed_differential'] * speed_risk +
            self.hazard_weights['weather'] * weather_risk
        )
        
        risk_score = max(0, min(100, risk_score))
        
        # Determine hazard type and severity
        if risk_score >= 80:
            severity = 'critical'
            hazard_type = 'multiple_hazards'
        elif risk_score >= 60:
            severity = 'high'
            hazard_type = 'severe_conditions' if weather_risk > 30 else 'high_traffic'
        elif risk_score >= 40:
            severity = 'medium'
            hazard_type = 'moderate_risk'
        elif risk_score >= 20:
            severity = 'low'
            hazard_type = 'minor_hazard'
        else:
            severity = 'minimal'
            hazard_type = 'normal_conditions'
        
        # Recommended action
        if risk_score >= 70:
            recommended_action = "REDUCE SPEED IMMEDIATELY. Consider alternate route."
        elif risk_score >= 50:
            recommended_action = "Reduce speed by 20%. Increase following distance."
        elif risk_score >= 30:
            recommended_action = "Exercise caution. Monitor conditions."
        else:
            recommended_action = "Continue with normal precautions."
        
        confidence = self.prediction_accuracy
        
        reasoning = f"Risk assessment: Slippery={slippery:.0f}%, Visibility={visibility:.0f}%, " \
                   f"Weather={weather}, Speed={speed:.0f}km/h (limit {speed_limit})"
        
        self.log_decision('hazard_prediction',
                         {'conditions': road_conditions, 'weather': weather, 'speed': speed},
                         {'risk_score': risk_score, 'severity': severity},
                         reasoning)
        
        return HazardPrediction(
            risk_score=risk_score,
            hazard_type=hazard_type,
            severity=severity,
            recommended_action=recommended_action,
            confidence=confidence
        )
    
    def predict_fuel_depletion(self, vehicle: Dict[str, Any], 
                               route_distance: float = 50,
                               traffic_factor: float = 1.0,
                               stations: List[Dict[str, Any]] = None) -> FuelPrediction:
        """
        Predict when vehicle will run out of fuel
        """
        fuel_level = vehicle.get('fuelLevel', 50)
        fuel_capacity = vehicle.get('fuelCapacity', 60)
        speed = vehicle.get('speed', 60)
        consumption_rate = vehicle.get('fuelConsumptionRate', 0.1)
        
        # Liters of fuel remaining
        fuel_liters = (fuel_level / 100) * fuel_capacity
        
        # Consumption adjusted for speed and traffic
        # Higher speed = more fuel consumption (exponential)
        speed_factor = 1 + ((speed / 60) ** 2 - 1) * 0.3
        adjusted_consumption = consumption_rate * speed_factor * traffic_factor
        
        # Distance remaining on current fuel
        if adjusted_consumption > 0:
            km_remaining = fuel_liters / (adjusted_consumption / 10)  # L per 10km
        else:
            km_remaining = 999
        
        # Time remaining at current speed
        if speed > 0:
            time_remaining = (km_remaining / speed) * 60  # minutes
        else:
            time_remaining = 999
        
        # Can reach destination?
        will_reach = km_remaining >= route_distance
        
        # Find nearest station if needed
        nearest_station = None
        refuel_recommendation = "No refueling needed"
        
        if fuel_level < 30 and stations:
            # Find nearest station
            vehicle_pos = vehicle.get('position', {'x': 0, 'y': 0})
            min_distance = float('inf')
            
            for station in stations:
                station_pos = station.get('position', {'x': 0, 'y': 0})
                distance = math.sqrt(
                    (vehicle_pos['x'] - station_pos['x']) ** 2 +
                    (vehicle_pos['y'] - station_pos['y']) ** 2
                )
                if distance < min_distance:
                    min_distance = distance
                    nearest_station = station
            
            if fuel_level < 15:
                refuel_recommendation = f"CRITICAL: Refuel immediately at {nearest_station['name'] if nearest_station else 'nearest station'}"
            elif fuel_level < 20:
                refuel_recommendation = f"WARNING: Plan refuel stop at {nearest_station['name'] if nearest_station else 'nearest station'}"
            else:
                refuel_recommendation = f"Consider refueling at next opportunity"
        
        reasoning = f"Fuel analysis: {fuel_level:.1f}% remaining ({fuel_liters:.1f}L), " \
                   f"Est. range: {km_remaining:.1f}km, Time: {time_remaining:.0f}min"
        
        self.log_decision('fuel_prediction',
                         {'vehicle_id': vehicle.get('id'), 'fuel_level': fuel_level},
                         {'km_remaining': km_remaining, 'will_reach': will_reach},
                         reasoning)
        
        return FuelPrediction(
            km_remaining=km_remaining,
            time_remaining_minutes=time_remaining,
            will_reach_destination=will_reach,
            nearest_station=nearest_station,
            refuel_recommendation=refuel_recommendation
        )
    
    def calculate_optimal_speed(self, vehicle: Dict[str, Any],
                                traffic_ahead: float,
                                road_condition: Dict[str, Any],
                                fuel_level: float) -> SpeedRecommendation:
        """
        Calculate optimal speed balancing time, fuel, and safety
        """
        current_speed = vehicle.get('speed', 60)
        urgency = vehicle.get('urgency', 5)
        vehicle_type = vehicle.get('type', 'car')
        speed_limit = road_condition.get('speed_limit', 60)
        slippery = road_condition.get('slippery_score', 0)
        visibility = road_condition.get('visibility', 100)
        
        # Base recommendation is speed limit
        optimal = speed_limit
        
        # Traffic adjustment
        if traffic_ahead > 70:
            optimal *= 0.5
            time_impact = "Significant delay due to traffic"
        elif traffic_ahead > 40:
            optimal *= 0.75
            time_impact = "Minor delay expected"
        else:
            time_impact = "Normal travel time"
        
        # Safety adjustments
        if slippery > 50:
            optimal *= 0.7
            safety_impact = "Reduced for slippery conditions"
        elif visibility < 50:
            optimal *= 0.6
            safety_impact = "Reduced for low visibility"
        elif slippery > 20 or visibility < 80:
            optimal *= 0.85
            safety_impact = "Slight reduction for conditions"
        else:
            safety_impact = "Safe conditions"
        
        # Fuel adjustments
        if fuel_level < 20:
            # Eco mode - slower is more efficient
            optimal = min(optimal, 50)
            fuel_impact = "Eco mode - maximizing fuel efficiency"
        elif fuel_level < 35:
            optimal = min(optimal, speed_limit * 0.9)
            fuel_impact = "Fuel-conscious driving"
        else:
            fuel_impact = "Normal fuel consumption"
        
        # Urgency boost (but not beyond safety)
        if urgency >= 9 and vehicle_type == 'ambulance':
            optimal = min(speed_limit * 1.3, optimal * 1.4)
            time_impact = "EMERGENCY - Priority routing"
        elif urgency >= 8:
            optimal = min(speed_limit, optimal * 1.15)
            time_impact = "Urgent - Optimized routing"
        
        # Vehicle type limits
        type_limits = {
            'truck': 80,
            'bus': 70,
            'ambulance': 120,
            'car': 120,
            'suv': 110,
            'van': 90
        }
        optimal = min(optimal, type_limits.get(vehicle_type, 100))
        
        # Never below 20 or above 140
        optimal = max(20, min(140, optimal))
        
        reasoning = f"Speed recommendation: {optimal:.0f}km/h based on " \
                   f"traffic={traffic_ahead:.0f}%, conditions={road_condition.get('condition', 'good')}, " \
                   f"fuel={fuel_level:.0f}%, urgency={urgency}/10"
        
        self.log_decision('speed_recommendation',
                         {'vehicle_id': vehicle.get('id'), 'traffic': traffic_ahead, 'fuel': fuel_level},
                         {'recommended': optimal, 'current': current_speed},
                         reasoning)
        
        return SpeedRecommendation(
            recommended_speed=optimal,
            current_speed=current_speed,
            reasoning=reasoning,
            fuel_impact=fuel_impact,
            safety_impact=safety_impact,
            time_impact=time_impact
        )
    
    def self_learn(self, predicted: Dict[str, Any], actual: Dict[str, Any]) -> Dict[str, Any]:
        """
        Learn from prediction outcomes to improve accuracy
        """
        self.learning_iterations += 1
        
        # Calculate error
        errors = {}
        for key in predicted:
            if key in actual:
                pred_val = predicted[key]
                actual_val = actual[key]
                if isinstance(pred_val, (int, float)) and isinstance(actual_val, (int, float)):
                    errors[key] = abs(pred_val - actual_val)
        
        # Average error
        if errors:
            avg_error = sum(errors.values()) / len(errors)
            
            # Update accuracy (moving average)
            error_rate = min(avg_error / 100, 0.5)
            new_accuracy = 1 - error_rate
            self.prediction_accuracy = (
                self.prediction_accuracy * 0.9 + new_accuracy * 0.1
            )
            
            # Adjust weights based on which predictions were off
            for key, error in errors.items():
                if error > 20:  # Significant error
                    # Reduce weight on this factor
                    if key in self.traffic_weights:
                        self.traffic_weights[key] *= (1 - self.learning_rate)
                elif error < 5:  # Good prediction
                    # Increase weight
                    if key in self.traffic_weights:
                        self.traffic_weights[key] *= (1 + self.learning_rate)
            
            # Normalize weights
            self._normalize_weights(self.traffic_weights)
            self._normalize_weights(self.hazard_weights)
        
        # Store for analysis
        self.prediction_history.append({
            'timestamp': datetime.utcnow().isoformat(),
            'predicted': predicted,
            'actual': actual,
            'errors': errors,
            'accuracy_after': self.prediction_accuracy
        })
        
        # Keep only recent history
        if len(self.prediction_history) > 1000:
            self.prediction_history = self.prediction_history[-1000:]
        
        reasoning = f"Learning iteration {self.learning_iterations}: " \
                   f"Updated accuracy to {self.prediction_accuracy:.2%}"
        
        self.log_decision('self_learning',
                         {'predicted': predicted, 'actual': actual},
                         {'new_accuracy': self.prediction_accuracy, 'errors': errors},
                         reasoning)
        
        return {
            'iterations': self.learning_iterations,
            'accuracy': self.prediction_accuracy,
            'errors': errors,
            'weights_updated': True
        }
    
    def _normalize_weights(self, weights: Dict[str, float]):
        """Normalize weights to sum to 1.0"""
        total = sum(weights.values())
        if total > 0:
            for key in weights:
                weights[key] /= total
    
    def update_traffic_history(self, segment_id: int, congestion: float):
        """Update traffic history for a segment"""
        if segment_id not in self.traffic_history:
            self.traffic_history[segment_id] = []
        self.traffic_history[segment_id].append(congestion)
        # Keep last 100 readings
        if len(self.traffic_history[segment_id]) > 100:
            self.traffic_history[segment_id] = self.traffic_history[segment_id][-100:]
    
    def get_learning_metrics(self) -> Dict[str, Any]:
        """Get current learning metrics"""
        return {
            'accuracy': self.prediction_accuracy,
            'iterations': self.learning_iterations,
            'traffic_weights': self.traffic_weights,
            'hazard_weights': self.hazard_weights,
            'history_size': len(self.prediction_history),
            'recent_decisions': len(self.decision_log)
        }
    
    def get_decision_log(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent AI decisions"""
        return self.decision_log[-limit:]


# Create global instance
ai_engine = AIEngine()
