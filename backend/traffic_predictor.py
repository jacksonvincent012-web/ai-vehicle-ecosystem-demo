// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
Traffic Predictor Module
Generates road network and predicts traffic patterns
"""

import math
import random
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta


@dataclass
class RoadSegment:
    """Road segment data"""
    id: int
    name: str
    start: Tuple[float, float]
    end: Tuple[float, float]
    length: float
    speed_limit: float
    lanes: int
    road_type: str  # main, highway, residential
    connections: List[int]  # Connected segment IDs


@dataclass
class CongestionWindow:
    """Predicted congestion window"""
    segment_id: int
    start_time: datetime
    end_time: datetime
    peak_level: float
    duration_minutes: int


@dataclass
class TrafficAnomaly:
    """Detected traffic anomaly"""
    segment_id: int
    anomaly_type: str  # accident, construction, event, unknown
    severity: str
    confidence: float
    detected_at: datetime
    estimated_duration: int  # minutes


class TrafficPredictor:
    """
    Traffic Prediction Engine
    Generates road network and predicts congestion patterns
    """
    
    def __init__(self):
        # Road network
        self.road_segments: Dict[int, RoadSegment] = {}
        self.segment_traffic: Dict[int, List[float]] = {}  # Historical congestion
        
        # Time-based patterns (hour -> base congestion modifier)
        self.hourly_patterns = {
            0: 0.1, 1: 0.05, 2: 0.05, 3: 0.05, 4: 0.1, 5: 0.2,
            6: 0.4, 7: 0.8, 8: 0.95, 9: 0.7, 10: 0.5, 11: 0.5,
            12: 0.6, 13: 0.55, 14: 0.5, 15: 0.55, 16: 0.7, 17: 0.9,
            18: 0.85, 19: 0.6, 20: 0.4, 21: 0.3, 22: 0.2, 23: 0.15
        }
        
        # Initialize road network
        self._generate_road_network()
        
        # Decision log
        self.decision_log: List[Dict[str, Any]] = []
    
    def _generate_road_network(self):
        """Generate a realistic road network with 15-20 segments"""
        
        # Create a grid-like city road network
        segments = [
            # Main roads (horizontal)
            RoadSegment(1, "Main Street West", (0, 200), (200, 200), 200, 50, 2, "main", [2, 5]),
            RoadSegment(2, "Main Street Central", (200, 200), (400, 200), 200, 50, 2, "main", [1, 3, 6]),
            RoadSegment(3, "Main Street East", (400, 200), (600, 200), 200, 50, 2, "main", [2, 7]),
            
            # Highway (top)
            RoadSegment(4, "Highway 1 West", (0, 50), (300, 50), 300, 100, 3, "highway", [5, 8]),
            RoadSegment(5, "Highway 1 East", (300, 50), (600, 50), 300, 100, 3, "highway", [4, 9, 1]),
            
            # Vertical connectors
            RoadSegment(6, "1st Avenue", (200, 50), (200, 400), 350, 40, 2, "main", [2, 4, 11]),
            RoadSegment(7, "2nd Avenue", (400, 50), (400, 400), 350, 40, 2, "main", [3, 5, 12]),
            
            # Highway ramps
            RoadSegment(8, "Highway 1 Ramp A", (150, 50), (200, 100), 70, 60, 1, "highway", [4, 6]),
            RoadSegment(9, "Highway 1 Ramp B", (400, 50), (450, 100), 70, 60, 1, "highway", [5, 7]),
            
            # Residential streets
            RoadSegment(10, "Oak Street", (50, 300), (200, 300), 150, 30, 1, "residential", [11, 14]),
            RoadSegment(11, "Pine Street", (200, 300), (400, 300), 200, 30, 1, "residential", [6, 10, 12]),
            RoadSegment(12, "Cedar Street", (400, 300), (550, 300), 150, 30, 1, "residential", [7, 11, 15]),
            
            # South connector
            RoadSegment(13, "South Boulevard", (100, 350), (500, 350), 400, 50, 2, "main", [10, 14, 15]),
            
            # Side streets
            RoadSegment(14, "Elm Lane", (100, 250), (100, 400), 150, 25, 1, "residential", [10, 13]),
            RoadSegment(15, "Maple Drive", (500, 250), (500, 400), 150, 25, 1, "residential", [12, 13]),
            
            # Additional roads
            RoadSegment(16, "Commerce Way", (250, 150), (350, 150), 100, 40, 2, "main", [2, 6]),
            RoadSegment(17, "Industrial Road", (450, 150), (550, 150), 100, 40, 2, "main", [3, 7]),
            RoadSegment(18, "Park Avenue", (250, 250), (350, 250), 100, 30, 1, "residential", [11, 16]),
        ]
        
        for segment in segments:
            self.road_segments[segment.id] = segment
            self.segment_traffic[segment.id] = [30.0]  # Initial base traffic
    
    def get_road_network(self) -> List[Dict[str, Any]]:
        """Get all road segments as dictionaries"""
        return [
            {
                'id': s.id,
                'name': s.name,
                'start': {'x': s.start[0], 'y': s.start[1]},
                'end': {'x': s.end[0], 'y': s.end[1]},
                'length': s.length,
                'speedLimit': s.speed_limit,
                'lanes': s.lanes,
                'roadType': s.road_type,
                'connections': s.connections,
                'congestionLevel': self.get_current_congestion(s.id),
                'avgSpeed': self.get_average_speed(s.id)
            }
            for s in self.road_segments.values()
        ]
    
    def get_current_congestion(self, segment_id: int) -> float:
        """Get current congestion level for a segment"""
        history = self.segment_traffic.get(segment_id, [30])
        base = history[-1] if history else 30
        
        # Add time-based modifier
        hour = datetime.now().hour
        modifier = self.hourly_patterns.get(hour, 0.5)
        
        # Add some randomness
        current = base * modifier * (1 + random.gauss(0, 0.1))
        return max(0, min(100, current))
    
    def get_average_speed(self, segment_id: int) -> float:
        """Get average speed on a segment based on congestion"""
        segment = self.road_segments.get(segment_id)
        if not segment:
            return 50
        
        congestion = self.get_current_congestion(segment_id)
        
        # Speed decreases as congestion increases
        speed_factor = 1 - (congestion / 100) * 0.7
        return segment.speed_limit * max(0.2, speed_factor)
    
    def predict_congestion_window(self, segment_id: int) -> CongestionWindow:
        """
        Predict when congestion will start and end for a segment
        
        Args:
            segment_id: Road segment ID
        
        Returns:
            CongestionWindow with predicted times
        """
        now = datetime.now()
        current_hour = now.hour
        
        # Find next peak hour
        peak_hours = [8, 17, 18]  # Morning and evening rush
        
        next_peak = None
        for h in peak_hours:
            if h > current_hour:
                next_peak = h
                break
        
        if next_peak is None:
            # Wrap to tomorrow
            next_peak = peak_hours[0]
            start_time = now.replace(hour=next_peak - 1, minute=0, second=0) + timedelta(days=1)
        else:
            start_time = now.replace(hour=next_peak - 1, minute=0, second=0)
        
        # Peak duration varies by segment type
        segment = self.road_segments.get(segment_id)
        if segment and segment.road_type == 'highway':
            duration = 120  # 2 hours
            peak_level = 85
        elif segment and segment.road_type == 'main':
            duration = 90  # 1.5 hours
            peak_level = 75
        else:
            duration = 60  # 1 hour
            peak_level = 60
        
        end_time = start_time + timedelta(minutes=duration)
        
        return CongestionWindow(
            segment_id=segment_id,
            start_time=start_time,
            end_time=end_time,
            peak_level=peak_level,
            duration_minutes=duration
        )
    
    def find_congestion_free_window(self, route_segments: List[int],
                                     departure_flexibility_hours: int = 4) -> Dict[str, Any]:
        """
        Find best departure time to avoid congestion on route
        
        Args:
            route_segments: List of segment IDs in the route
            departure_flexibility_hours: How flexible is departure time
        
        Returns:
            Dictionary with best departure time and expected conditions
        """
        now = datetime.now()
        best_time = now
        best_avg_congestion = 100
        
        # Check each hour in the flexibility window
        for offset in range(departure_flexibility_hours * 2):  # Check every 30 min
            check_time = now + timedelta(minutes=offset * 30)
            check_hour = check_time.hour
            
            # Calculate average congestion at this time
            total_congestion = 0
            for seg_id in route_segments:
                base_modifier = self.hourly_patterns.get(check_hour, 0.5)
                segment = self.road_segments.get(seg_id)
                
                # Highway more affected by rush hour
                if segment and segment.road_type == 'highway':
                    modifier = base_modifier * 1.2
                else:
                    modifier = base_modifier
                
                total_congestion += modifier * 100
            
            avg_congestion = total_congestion / max(1, len(route_segments))
            
            if avg_congestion < best_avg_congestion:
                best_avg_congestion = avg_congestion
                best_time = check_time
        
        return {
            'bestDepartureTime': best_time.isoformat(),
            'expectedCongestion': round(best_avg_congestion, 1),
            'avoidedCongestion': round(100 - best_avg_congestion, 1),
            'timeSaved': round((100 - best_avg_congestion) / 10, 0),  # Estimated minutes
            'confidence': 0.75,
            'reasoning': f"Departing at {best_time.strftime('%H:%M')} avoids peak traffic"
        }
    
    def detect_anomaly(self, segment_id: int) -> Optional[TrafficAnomaly]:
        """
        Detect sudden traffic anomalies (possible accidents)
        
        Args:
            segment_id: Road segment ID
        
        Returns:
            TrafficAnomaly if detected, None otherwise
        """
        history = self.segment_traffic.get(segment_id, [])
        
        if len(history) < 5:
            return None
        
        # Check for sudden spike
        recent_avg = sum(history[-3:]) / 3
        previous_avg = sum(history[-6:-3]) / 3 if len(history) >= 6 else recent_avg
        
        spike = recent_avg - previous_avg
        
        if spike > 30:  # Significant increase
            # Determine type based on spike magnitude
            if spike > 50:
                anomaly_type = 'accident'
                severity = 'high'
                duration = 45
            elif spike > 40:
                anomaly_type = 'accident'
                severity = 'medium'
                duration = 30
            else:
                anomaly_type = 'congestion_spike'
                severity = 'low'
                duration = 15
            
            confidence = min(0.95, 0.5 + spike / 100)
            
            return TrafficAnomaly(
                segment_id=segment_id,
                anomaly_type=anomaly_type,
                severity=severity,
                confidence=confidence,
                detected_at=datetime.now(),
                estimated_duration=duration
            )
        
        return None
    
    def update_traffic(self, segment_id: int, congestion: float):
        """Update traffic data for a segment"""
        if segment_id not in self.segment_traffic:
            self.segment_traffic[segment_id] = []
        
        self.segment_traffic[segment_id].append(congestion)
        
        # Keep last 100 readings
        if len(self.segment_traffic[segment_id]) > 100:
            self.segment_traffic[segment_id] = self.segment_traffic[segment_id][-100:]
    
    def simulate_traffic_step(self):
        """Simulate one step of traffic changes"""
        for segment_id in self.road_segments:
            current = self.get_current_congestion(segment_id)
            
            # Random walk with mean reversion
            change = random.gauss(0, 5)
            
            # Mean reversion toward time-based expected level
            hour = datetime.now().hour
            expected = self.hourly_patterns.get(hour, 0.5) * 50
            reversion = (expected - current) * 0.1
            
            new_level = current + change + reversion
            new_level = max(0, min(100, new_level))
            
            self.update_traffic(segment_id, new_level)
    
    def get_traffic_forecast(self, hours_ahead: int = 2) -> Dict[int, List[Dict[str, Any]]]:
        """
        Get traffic forecast for all segments
        
        Args:
            hours_ahead: How many hours to forecast
        
        Returns:
            Dictionary mapping segment_id to forecast data
        """
        forecast = {}
        now = datetime.now()
        
        for segment_id in self.road_segments:
            segment_forecast = []
            
            for offset in range(0, hours_ahead * 60, 30):  # Every 30 min
                forecast_time = now + timedelta(minutes=offset)
                hour = forecast_time.hour
                
                base_level = self.hourly_patterns.get(hour, 0.5) * 100
                
                # Add segment-specific adjustment
                segment = self.road_segments.get(segment_id)
                if segment and segment.road_type == 'highway':
                    base_level *= 1.1
                
                segment_forecast.append({
                    'time': forecast_time.isoformat(),
                    'hour': hour,
                    'congestionLevel': round(min(100, base_level), 1)
                })
            
            forecast[segment_id] = segment_forecast
        
        return forecast
    
    def get_heatmap_data(self) -> List[Dict[str, Any]]:
        """Get traffic heatmap data for visualization"""
        heatmap = []
        
        for segment_id, segment in self.road_segments.items():
            congestion = self.get_current_congestion(segment_id)
            
            # Calculate midpoint for heatmap
            mid_x = (segment.start[0] + segment.end[0]) / 2
            mid_y = (segment.start[1] + segment.end[1]) / 2
            
            heatmap.append({
                'segmentId': segment_id,
                'position': {'x': mid_x, 'y': mid_y},
                'intensity': congestion / 100,
                'radius': 30 + congestion * 0.5
            })
        
        return heatmap
    
    def log_decision(self, decision_type: str, input_data: Dict, output: Any, reasoning: str):
        """Log prediction decision"""
        self.decision_log.append({
            'timestamp': datetime.utcnow().isoformat(),
            'type': decision_type,
            'input': input_data,
            'output': output if isinstance(output, dict) else str(output),
            'reasoning': reasoning
        })
        if len(self.decision_log) > 100:
            self.decision_log = self.decision_log[-100:]


# Create global instance
traffic_predictor = TrafficPredictor()
