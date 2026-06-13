// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
Database Models for AI-Powered Vehicle Ecosystem
Supports SQLAlchemy (SQLite/PostgreSQL) and MongoDB
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from flask_sqlalchemy import SQLAlchemy
from dataclasses import dataclass, field, asdict
import json
import uuid

db = SQLAlchemy()

# ============================================
# SQLAlchemy Models (SQLite / PostgreSQL)
# ============================================

class Vehicle(db.Model):
    """Vehicle model for SQL databases"""
    __tablename__ = 'vehicles'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    vehicle_type = db.Column(db.String(50), default='car')  # car, truck, ambulance, bus, van, suv
    
    # Position
    position_x = db.Column(db.Float, default=0.0)
    position_y = db.Column(db.Float, default=0.0)
    lat = db.Column(db.Float, default=0.0)
    lng = db.Column(db.Float, default=0.0)
    
    # Movement
    speed = db.Column(db.Float, default=0.0)
    target_speed = db.Column(db.Float, default=60.0)
    heading = db.Column(db.Float, default=0.0)
    
    # Destination
    destination_x = db.Column(db.Float, default=0.0)
    destination_y = db.Column(db.Float, default=0.0)
    
    # Fuel
    fuel_level = db.Column(db.Float, default=100.0)
    fuel_capacity = db.Column(db.Float, default=60.0)
    fuel_consumption_rate = db.Column(db.Float, default=0.1)
    
    # Status
    status = db.Column(db.String(50), default='idle')  # idle, moving, negotiating, refueling, emergency, yielding
    urgency = db.Column(db.Integer, default=5)  # 1-10
    current_segment = db.Column(db.Integer, default=0)
    lane = db.Column(db.Integer, default=1)
    
    # Health
    engine_health = db.Column(db.Float, default=100.0)
    tire_health = db.Column(db.Float, default=100.0)
    brake_health = db.Column(db.Float, default=100.0)
    battery_health = db.Column(db.Float, default=100.0)
    
    # Route
    route_json = db.Column(db.Text, default='[]')
    route_index = db.Column(db.Integer, default=0)
    eta_minutes = db.Column(db.Float, default=0.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def route(self):
        return json.loads(self.route_json) if self.route_json else []
    
    @route.setter
    def route(self, value):
        self.route_json = json.dumps(value)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.vehicle_type,
            'position': {'x': self.position_x, 'y': self.position_y},
            'location': {'lat': self.lat, 'lng': self.lng},
            'speed': self.speed,
            'targetSpeed': self.target_speed,
            'heading': self.heading,
            'destination': {'x': self.destination_x, 'y': self.destination_y},
            'fuelLevel': self.fuel_level,
            'fuelCapacity': self.fuel_capacity,
            'fuelConsumptionRate': self.fuel_consumption_rate,
            'status': self.status,
            'urgency': self.urgency,
            'currentSegment': self.current_segment,
            'lane': self.lane,
            'health': {
                'engine': self.engine_health,
                'tires': self.tire_health,
                'brakes': self.brake_health,
                'battery': self.battery_health
            },
            'route': self.route,
            'routeIndex': self.route_index,
            'eta': self.eta_minutes,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class RoadSegment(db.Model):
    """Road segment model for SQL databases"""
    __tablename__ = 'road_segments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    
    # Geometry
    start_x = db.Column(db.Float, default=0.0)
    start_y = db.Column(db.Float, default=0.0)
    end_x = db.Column(db.Float, default=0.0)
    end_y = db.Column(db.Float, default=0.0)
    
    # Traffic
    congestion_level = db.Column(db.Float, default=0.0)  # 0-100
    avg_speed = db.Column(db.Float, default=60.0)
    vehicle_count = db.Column(db.Integer, default=0)
    
    # Conditions
    road_condition = db.Column(db.String(50), default='good')  # good, wet, icy, damaged
    weather = db.Column(db.String(50), default='clear')  # clear, rain, fog, snow
    visibility = db.Column(db.Float, default=100.0)  # 0-100
    slippery_score = db.Column(db.Float, default=0.0)  # 0-100
    
    # Properties
    speed_limit = db.Column(db.Float, default=60.0)
    lanes = db.Column(db.Integer, default=2)
    road_type = db.Column(db.String(50), default='main')  # main, highway, residential
    
    # Hazards
    has_incident = db.Column(db.Boolean, default=False)
    incident_type = db.Column(db.String(100), nullable=True)
    
    # Timestamps
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'start': {'x': self.start_x, 'y': self.start_y},
            'end': {'x': self.end_x, 'y': self.end_y},
            'congestionLevel': self.congestion_level,
            'avgSpeed': self.avg_speed,
            'vehicleCount': self.vehicle_count,
            'roadCondition': self.road_condition,
            'weather': self.weather,
            'visibility': self.visibility,
            'slipperyScore': self.slippery_score,
            'speedLimit': self.speed_limit,
            'lanes': self.lanes,
            'roadType': self.road_type,
            'hasIncident': self.has_incident,
            'incidentType': self.incident_type,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class FuelStation(db.Model):
    """Fuel station model for SQL databases"""
    __tablename__ = 'fuel_stations'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    
    # Position
    position_x = db.Column(db.Float, default=0.0)
    position_y = db.Column(db.Float, default=0.0)
    lat = db.Column(db.Float, default=0.0)
    lng = db.Column(db.Float, default=0.0)
    
    # Fuel
    fuel_price = db.Column(db.Float, default=1.50)
    fuel_available = db.Column(db.Float, default=10000.0)  # liters
    
    # Status
    is_open = db.Column(db.Boolean, default=True)
    wait_time = db.Column(db.Integer, default=0)  # minutes
    queue_length = db.Column(db.Integer, default=0)
    
    # Amenities
    has_shop = db.Column(db.Boolean, default=True)
    has_restroom = db.Column(db.Boolean, default=True)
    has_ev_charging = db.Column(db.Boolean, default=False)
    
    # Timestamps
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'position': {'x': self.position_x, 'y': self.position_y},
            'location': {'lat': self.lat, 'lng': self.lng},
            'fuelPrice': self.fuel_price,
            'fuelAvailable': self.fuel_available,
            'isOpen': self.is_open,
            'waitTime': self.wait_time,
            'queueLength': self.queue_length,
            'amenities': {
                'shop': self.has_shop,
                'restroom': self.has_restroom,
                'evCharging': self.has_ev_charging
            },
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class Negotiation(db.Model):
    """Negotiation record model"""
    __tablename__ = 'negotiations'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Type
    negotiation_type = db.Column(db.String(50), nullable=False)  # intersection, merge, emergency, fuel
    scenario = db.Column(db.String(100), nullable=True)
    
    # Participants
    vehicle_ids_json = db.Column(db.Text, default='[]')
    intersection_id = db.Column(db.Integer, nullable=True)
    
    # Result
    priority_order_json = db.Column(db.Text, default='[]')
    speed_adjustments_json = db.Column(db.Text, default='{}')
    outcome = db.Column(db.String(50), default='success')  # success, partial, failed
    reasoning = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    duration_ms = db.Column(db.Integer, default=0)
    
    @property
    def vehicle_ids(self):
        return json.loads(self.vehicle_ids_json) if self.vehicle_ids_json else []
    
    @vehicle_ids.setter
    def vehicle_ids(self, value):
        self.vehicle_ids_json = json.dumps(value)
    
    @property
    def priority_order(self):
        return json.loads(self.priority_order_json) if self.priority_order_json else []
    
    @priority_order.setter
    def priority_order(self, value):
        self.priority_order_json = json.dumps(value)
    
    @property
    def speed_adjustments(self):
        return json.loads(self.speed_adjustments_json) if self.speed_adjustments_json else {}
    
    @speed_adjustments.setter
    def speed_adjustments(self, value):
        self.speed_adjustments_json = json.dumps(value)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.negotiation_type,
            'scenario': self.scenario,
            'vehicleIds': self.vehicle_ids,
            'intersectionId': self.intersection_id,
            'priorityOrder': self.priority_order,
            'speedAdjustments': self.speed_adjustments,
            'outcome': self.outcome,
            'reasoning': self.reasoning,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'durationMs': self.duration_ms
        }


class Hazard(db.Model):
    """Hazard record model"""
    __tablename__ = 'hazards'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Type
    hazard_type = db.Column(db.String(50), nullable=False)  # accident, weather, road_damage, obstacle
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    
    # Location
    position_x = db.Column(db.Float, default=0.0)
    position_y = db.Column(db.Float, default=0.0)
    segment_id = db.Column(db.Integer, nullable=True)
    
    # Details
    description = db.Column(db.Text, nullable=True)
    recommended_action = db.Column(db.Text, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.hazard_type,
            'severity': self.severity,
            'position': {'x': self.position_x, 'y': self.position_y},
            'segmentId': self.segment_id,
            'description': self.description,
            'recommendedAction': self.recommended_action,
            'isActive': self.is_active,
            'detectedAt': self.detected_at.isoformat() if self.detected_at else None,
            'resolvedAt': self.resolved_at.isoformat() if self.resolved_at else None
        }


class FleetStats(db.Model):
    """Fleet statistics model"""
    __tablename__ = 'fleet_stats'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Counts
    total_negotiations = db.Column(db.Integer, default=0)
    accidents_prevented = db.Column(db.Integer, default=0)
    emergency_responses = db.Column(db.Integer, default=0)
    
    # Savings
    fuel_saved_liters = db.Column(db.Float, default=0.0)
    time_saved_minutes = db.Column(db.Float, default=0.0)
    co2_reduced_kg = db.Column(db.Float, default=0.0)
    
    # Scores
    efficiency_score = db.Column(db.Float, default=0.0)
    safety_score = db.Column(db.Float, default=0.0)
    
    # AI
    ai_accuracy = db.Column(db.Float, default=65.0)
    learning_iterations = db.Column(db.Integer, default=0)
    
    # Timestamps
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'totalNegotiations': self.total_negotiations,
            'accidentsPrevented': self.accidents_prevented,
            'emergencyResponses': self.emergency_responses,
            'fuelSavedLiters': self.fuel_saved_liters,
            'timeSavedMinutes': self.time_saved_minutes,
            'co2ReducedKg': self.co2_reduced_kg,
            'efficiencyScore': self.efficiency_score,
            'safetyScore': self.safety_score,
            'aiAccuracy': self.ai_accuracy,
            'learningIterations': self.learning_iterations,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class SimulationSnapshot(db.Model):
    """Simulation state snapshot for historical playback"""
    __tablename__ = 'simulation_snapshots'
    
    id = db.Column(db.Integer, primary_key=True)
    tick = db.Column(db.Integer, nullable=False)
    
    # State
    vehicles_json = db.Column(db.Text, default='[]')
    road_segments_json = db.Column(db.Text, default='[]')
    hazards_json = db.Column(db.Text, default='[]')
    stats_json = db.Column(db.Text, default='{}')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @property
    def vehicles(self):
        return json.loads(self.vehicles_json) if self.vehicles_json else []
    
    @vehicles.setter
    def vehicles(self, value):
        self.vehicles_json = json.dumps(value)
    
    @property
    def road_segments(self):
        return json.loads(self.road_segments_json) if self.road_segments_json else []
    
    @road_segments.setter
    def road_segments(self, value):
        self.road_segments_json = json.dumps(value)
    
    @property
    def hazards(self):
        return json.loads(self.hazards_json) if self.hazards_json else []
    
    @hazards.setter
    def hazards(self, value):
        self.hazards_json = json.dumps(value)
    
    @property
    def stats(self):
        return json.loads(self.stats_json) if self.stats_json else {}
    
    @stats.setter
    def stats(self, value):
        self.stats_json = json.dumps(value)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tick': self.tick,
            'vehicles': self.vehicles,
            'roadSegments': self.road_segments,
            'hazards': self.hazards,
            'stats': self.stats,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='viewer')  # admin, fleet_manager, viewer
    
    # Profile
    display_name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'displayName': self.display_name,
            'email': self.email,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }


# ============================================
# MongoDB Document Schemas (for MongoDB mode)
# ============================================

MONGO_VEHICLE_SCHEMA = {
    '_id': str,
    'name': str,
    'type': str,
    'position': {'x': float, 'y': float},
    'location': {'lat': float, 'lng': float},
    'speed': float,
    'targetSpeed': float,
    'heading': float,
    'destination': {'x': float, 'y': float},
    'fuelLevel': float,
    'fuelCapacity': float,
    'fuelConsumptionRate': float,
    'status': str,
    'urgency': int,
    'currentSegment': int,
    'lane': int,
    'health': {
        'engine': float,
        'tires': float,
        'brakes': float,
        'battery': float
    },
    'route': list,
    'routeIndex': int,
    'eta': float,
    'createdAt': datetime,
    'updatedAt': datetime
}


def init_mongodb(mongo_client, db_name):
    """Initialize MongoDB collections with indexes"""
    db = mongo_client[db_name]
    
    # Create collections
    vehicles = db['vehicles']
    road_segments = db['road_segments']
    fuel_stations = db['fuel_stations']
    negotiations = db['negotiations']
    hazards = db['hazards']
    fleet_stats = db['fleet_stats']
    snapshots = db['simulation_snapshots']
    users = db['users']
    
    # Create indexes
    vehicles.create_index('name')
    road_segments.create_index('id')
    fuel_stations.create_index('name')
    negotiations.create_index([('createdAt', -1)])
    hazards.create_index([('isActive', 1), ('severity', 1)])
    snapshots.create_index([('tick', -1)])
    users.create_index('username', unique=True)
    
    return db
