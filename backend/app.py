// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
AI-Powered Vehicle Ecosystem - Flask Backend
Full-featured API with WebSocket real-time updates and database persistence
"""

import os
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Optional

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

# Import our modules
from config import get_config
from models import db, Vehicle, RoadSegment, FuelStation, Negotiation, Hazard, FleetStats, SimulationSnapshot, User
from ai_engine import ai_engine
from fuel_optimizer import fuel_optimizer
from negotiation_engine import negotiation_engine
from traffic_predictor import traffic_predictor
from fleet_manager import fleet_manager

# Initialize Flask app
app = Flask(__name__)
config = get_config()
app.config.from_object(config)
app.secret_key = config.SECRET_KEY

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize database
db.init_app(app)

# Simulation thread control
simulation_running = False
simulation_thread = None


# ==============================================
# Authentication Helpers
# ==============================================

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(password: str, stored: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, hashed = stored.split(':')
        return hashlib.sha256((password + salt).encode()).hexdigest() == hashed
    except:
        return False


def login_required(f):
    """Decorator for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated


# ==============================================
# Database Initialization
# ==============================================

def init_database():
    """Initialize database with default data"""
    with app.app_context():
        db.create_all()
        
        # Check if already initialized
        if User.query.first() is None:
            # Create default users
            admin = User(
                username='admin',
                password_hash=hash_password('admin123'),
                role='admin',
                display_name='Administrator'
            )
            db.session.add(admin)
            
            fleet_mgr = User(
                username='fleet_manager',
                password_hash=hash_password('fleet123'),
                role='fleet_manager',
                display_name='Fleet Manager'
            )
            db.session.add(fleet_mgr)
            
            # Create initial fleet stats
            stats = FleetStats()
            db.session.add(stats)
            
            db.session.commit()
            print("✅ Database initialized with default data")


# ==============================================
# REST API Routes
# ==============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '3.0.0',
        'database': config.DATABASE_TYPE
    })


# --- Authentication ---

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if user and verify_password(password, user.password_hash):
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role
        
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """User logout"""
    session.clear()
    return jsonify({'success': True})


@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get current user info"""
    if 'user_id' not in session:
        return jsonify({'authenticated': False})
    
    user = User.query.get(session['user_id'])
    if user:
        return jsonify({
            'authenticated': True,
            'user': user.to_dict()
        })
    
    return jsonify({'authenticated': False})


# --- Vehicles ---

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    """Get all vehicles"""
    vehicles = fleet_manager.get_all_vehicles()
    return jsonify({
        'success': True,
        'vehicles': vehicles,
        'count': len(vehicles)
    })


@app.route('/api/vehicles/<vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    """Get specific vehicle"""
    vehicle = fleet_manager.get_vehicle(vehicle_id)
    if vehicle:
        return jsonify({'success': True, 'vehicle': vehicle})
    return jsonify({'error': 'Vehicle not found'}), 404


@app.route('/api/vehicles/<vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    """Update vehicle properties"""
    data = request.get_json()
    vehicle = fleet_manager.update_vehicle(vehicle_id, data)
    if vehicle:
        socketio.emit('vehicle_updated', {'vehicle': vehicle}, broadcast=True)
        return jsonify({'success': True, 'vehicle': vehicle})
    return jsonify({'error': 'Vehicle not found'}), 404


# --- Traffic ---

@app.route('/api/traffic', methods=['GET'])
def get_traffic():
    """Get current traffic data"""
    segments = traffic_predictor.get_road_network()
    return jsonify({
        'success': True,
        'segments': segments,
        'count': len(segments)
    })


@app.route('/api/traffic/forecast', methods=['GET'])
def get_traffic_forecast():
    """Get traffic forecast"""
    hours = request.args.get('hours', 2, type=int)
    forecast = traffic_predictor.get_traffic_forecast(hours)
    return jsonify({
        'success': True,
        'forecast': forecast
    })


@app.route('/api/traffic/heatmap', methods=['GET'])
def get_heatmap():
    """Get traffic heatmap data"""
    heatmap = traffic_predictor.get_heatmap_data()
    return jsonify({
        'success': True,
        'heatmap': heatmap
    })


# --- Fuel Stations ---

@app.route('/api/fuel-stations', methods=['GET'])
def get_fuel_stations():
    """Get all fuel stations"""
    stations = fleet_manager.get_all_fuel_stations()
    return jsonify({
        'success': True,
        'stations': stations,
        'count': len(stations)
    })


# --- Negotiations ---

@app.route('/api/negotiate', methods=['POST'])
def negotiate():
    """Perform negotiation"""
    data = request.get_json()
    vehicle_ids = data.get('vehicle_ids', [])
    intersection_id = data.get('intersection_id', 0)
    scenario_type = data.get('scenario_type', 'intersection')
    
    # Get vehicles
    vehicles = [fleet_manager.get_vehicle(vid) for vid in vehicle_ids]
    vehicles = [v for v in vehicles if v]  # Filter None
    
    if not vehicles:
        return jsonify({'error': 'No valid vehicles provided'}), 400
    
    if scenario_type == 'intersection':
        result = negotiation_engine.negotiate_intersection(vehicles, intersection_id)
    elif scenario_type == 'merge':
        # Split into lane and merging
        in_lane = vehicles[:len(vehicles)//2]
        merging = vehicles[len(vehicles)//2:]
        result = negotiation_engine.negotiate_merge(in_lane, merging)
    elif scenario_type == 'emergency':
        emergency = vehicles[0]
        others = vehicles[1:]
        result = negotiation_engine.negotiate_emergency_response(emergency, others)
    elif scenario_type == 'fuel':
        stations = fleet_manager.get_all_fuel_stations()
        if stations:
            result = negotiation_engine.negotiate_fuel_priority(vehicles, stations[0])
        else:
            return jsonify({'error': 'No fuel stations available'}), 400
    else:
        return jsonify({'error': 'Unknown scenario type'}), 400
    
    # Convert dataclass to dict
    if hasattr(result, '__dict__'):
        result_dict = result.__dict__ if hasattr(result, '__dict__') else result
    else:
        result_dict = result
    
    # Update metrics
    fleet_manager.metrics.total_negotiations += 1
    
    # Save to database
    negotiation = Negotiation(
        negotiation_type=scenario_type,
        vehicle_ids=vehicle_ids,
        intersection_id=intersection_id,
        outcome='success'
    )
    db.session.add(negotiation)
    db.session.commit()
    
    # Broadcast via WebSocket
    socketio.emit('negotiation_complete', {
        'type': scenario_type,
        'vehicles': vehicle_ids,
        'result': str(result_dict)
    }, broadcast=True)
    
    return jsonify({
        'success': True,
        'result': result_dict if isinstance(result_dict, dict) else str(result_dict)
    })


# --- Route Optimization ---

@app.route('/api/optimize-route', methods=['POST'])
def optimize_route():
    """Optimize route for vehicle"""
    data = request.get_json()
    vehicle_id = data.get('vehicle_id')
    mode = data.get('mode', 'balanced')  # fuel_saving, fastest, balanced
    
    vehicle = fleet_manager.get_vehicle(vehicle_id)
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404
    
    stations = fleet_manager.get_all_fuel_stations()
    
    # Get fuel optimization
    refuel_plan = fuel_optimizer.find_optimal_refuel_strategy(
        vehicle, 100, stations, fuel_prices_matter=(mode != 'fastest')
    )
    
    # Get speed recommendation
    traffic_level = traffic_predictor.get_current_congestion(
        vehicle.get('currentSegment', 1)
    )
    
    speed_rec = ai_engine.calculate_optimal_speed(
        vehicle,
        traffic_level,
        {'speed_limit': 60, 'visibility': 100, 'slippery_score': 0},
        vehicle.get('fuelLevel', 50)
    )
    
    return jsonify({
        'success': True,
        'vehicleId': vehicle_id,
        'mode': mode,
        'refuelPlan': {
            'stops': len(refuel_plan.stops),
            'totalCost': refuel_plan.total_cost,
            'timeAdded': refuel_plan.total_time_added,
            'strategy': refuel_plan.strategy
        },
        'speedRecommendation': {
            'recommended': speed_rec.recommended_speed,
            'current': speed_rec.current_speed,
            'reasoning': speed_rec.reasoning
        }
    })


# --- Predictions ---

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Get AI predictions"""
    # Traffic forecast
    traffic_forecast = {}
    for i in range(1, 6):
        prediction = ai_engine.predict_traffic(i, 30)
        traffic_forecast[i] = {
            'level': prediction.value,
            'confidence': prediction.confidence
        }
    
    # Hazard alerts
    hazards = fleet_manager.get_active_hazards()
    
    # Fuel depletion estimates
    fuel_estimates = []
    for vehicle in fleet_manager.vehicles.values():
        if vehicle.fuel_level < 40:
            pred = ai_engine.predict_fuel_depletion(vehicle.to_dict())
            fuel_estimates.append({
                'vehicleId': vehicle.id,
                'vehicleName': vehicle.name,
                'kmRemaining': pred.km_remaining,
                'recommendation': pred.refuel_recommendation
            })
    
    return jsonify({
        'success': True,
        'trafficForecast': traffic_forecast,
        'hazardAlerts': hazards,
        'fuelDepletionEstimates': fuel_estimates,
        'aiAccuracy': ai_engine.prediction_accuracy
    })


# --- Emergency ---

@app.route('/api/emergency', methods=['POST'])
def handle_emergency():
    """Handle emergency vehicle dispatch"""
    data = request.get_json()
    emergency_vehicle_id = data.get('emergency_vehicle_id', 'v3')
    
    emergency = fleet_manager.get_vehicle(emergency_vehicle_id)
    if not emergency:
        return jsonify({'error': 'Emergency vehicle not found'}), 404
    
    other_vehicles = [v for v in fleet_manager.vehicles.values() 
                      if v.id != emergency_vehicle_id]
    
    response = negotiation_engine.negotiate_emergency_response(
        emergency, [v.to_dict() for v in other_vehicles]
    )
    
    # Update fleet manager
    fleet_manager.metrics.total_negotiations += len(response.affected_vehicles)
    fleet_manager.metrics.accidents_prevented += 1
    
    # Broadcast emergency
    socketio.emit('emergency_alert', {
        'emergencyVehicle': emergency_vehicle_id,
        'affectedVehicles': response.affected_vehicles,
        'clearTime': response.estimated_clear_time
    }, broadcast=True)
    
    return jsonify({
        'success': True,
        'emergencyVehicle': emergency_vehicle_id,
        'affectedVehicles': response.affected_vehicles,
        'laneChanges': response.lane_changes,
        'speedReductions': response.speed_reductions,
        'estimatedClearTime': response.estimated_clear_time
    })


# --- Fleet Stats ---

@app.route('/api/fleet-stats', methods=['GET'])
def get_fleet_stats():
    """Get fleet statistics"""
    metrics = fleet_manager.get_metrics()
    
    # Add AI metrics
    ai_metrics = ai_engine.get_learning_metrics()
    metrics['aiLearning'] = ai_metrics
    
    # Add negotiation stats
    neg_stats = negotiation_engine.get_statistics()
    metrics['negotiations'] = neg_stats
    
    return jsonify({
        'success': True,
        'stats': metrics
    })


# --- Simulation ---

@app.route('/api/simulation/step', methods=['GET'])
def simulation_step():
    """Advance simulation by one step"""
    result = fleet_manager.simulate_step()
    traffic_predictor.simulate_traffic_step()
    
    # Broadcast update
    socketio.emit('simulation_update', {
        'tick': result['tick'],
        'vehicles': fleet_manager.get_all_vehicles(),
        'hazards': fleet_manager.get_active_hazards(),
        'events': result['events']
    }, broadcast=True)
    
    return jsonify({
        'success': True,
        **result
    })


@app.route('/api/simulation/reset', methods=['POST'])
def simulation_reset():
    """Reset simulation"""
    result = fleet_manager.reset()
    
    socketio.emit('simulation_reset', result, broadcast=True)
    
    return jsonify({
        'success': True,
        **result
    })


@app.route('/api/simulation/scenario/<int:scenario_id>', methods=['POST'])
def run_scenario(scenario_id):
    """Run a specific scenario"""
    result = fleet_manager.run_scenario(scenario_id)
    
    socketio.emit('scenario_started', {
        'scenarioId': scenario_id,
        **result
    }, broadcast=True)
    
    return jsonify({
        'success': True,
        **result
    })


# --- Road Conditions ---

@app.route('/api/road-conditions', methods=['GET'])
def get_road_conditions():
    """Get road conditions"""
    segments = traffic_predictor.get_road_network()
    
    # Add weather and condition data
    for segment in segments:
        segment['weather'] = 'clear'
        segment['visibility'] = 100
        segment['slipperyScore'] = 0
        segment['hazardObjects'] = []
    
    # Check for weather hazards
    for hazard in fleet_manager.get_active_hazards():
        if hazard['type'] == 'weather':
            seg_id = hazard.get('segmentId', 1)
            for segment in segments:
                if segment['id'] == seg_id:
                    segment['weather'] = 'rain'
                    segment['visibility'] = 60
                    segment['slipperyScore'] = 70
    
    return jsonify({
        'success': True,
        'segments': segments
    })


# --- Historical Data ---

@app.route('/api/history/snapshots', methods=['GET'])
def get_snapshots():
    """Get simulation snapshots for playback"""
    limit = request.args.get('limit', 50, type=int)
    snapshots = fleet_manager.get_snapshots(limit)
    return jsonify({
        'success': True,
        'snapshots': snapshots,
        'count': len(snapshots)
    })


@app.route('/api/history/snapshot/<int:tick>', methods=['GET'])
def get_snapshot(tick):
    """Get snapshot at specific tick"""
    snapshot = fleet_manager.get_snapshot_at_tick(tick)
    if snapshot:
        return jsonify({'success': True, 'snapshot': snapshot})
    return jsonify({'error': 'Snapshot not found'}), 404


# --- AI Decisions ---

@app.route('/api/ai/decisions', methods=['GET'])
def get_ai_decisions():
    """Get recent AI decisions"""
    limit = request.args.get('limit', 50, type=int)
    decisions = ai_engine.get_decision_log(limit)
    return jsonify({
        'success': True,
        'decisions': decisions,
        'count': len(decisions)
    })


@app.route('/api/ai/metrics', methods=['GET'])
def get_ai_metrics():
    """Get AI learning metrics"""
    metrics = ai_engine.get_learning_metrics()
    return jsonify({
        'success': True,
        'metrics': metrics
    })


# --- Export ---

@app.route('/api/export/json', methods=['GET'])
def export_json():
    """Export all data as JSON"""
    data = {
        'exportedAt': datetime.utcnow().isoformat(),
        'vehicles': fleet_manager.get_all_vehicles(),
        'fuelStations': fleet_manager.get_all_fuel_stations(),
        'roadSegments': traffic_predictor.get_road_network(),
        'hazards': fleet_manager.get_active_hazards(),
        'fleetStats': fleet_manager.get_metrics(),
        'aiMetrics': ai_engine.get_learning_metrics()
    }
    
    return jsonify(data)


@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export vehicles as CSV"""
    vehicles = fleet_manager.get_all_vehicles()
    
    csv_lines = ['id,name,type,posX,posY,speed,fuelLevel,status,urgency']
    for v in vehicles:
        pos = v.get('position', {})
        line = f"{v['id']},{v['name']},{v['type']},{pos.get('x',0)},{pos.get('y',0)}," \
               f"{v['speed']},{v['fuelLevel']},{v['status']},{v['urgency']}"
        csv_lines.append(line)
    
    return '\n'.join(csv_lines), 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=vehicles.csv'
    }


# ==============================================
# WebSocket Events
# ==============================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"✅ Client connected: {request.sid}")
    emit('connected', {
        'message': 'Connected to Vehicle Ecosystem',
        'timestamp': datetime.utcnow().isoformat()
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"❌ Client disconnected: {request.sid}")


@socketio.on('join_room')
def handle_join_room(data):
    """Join a WebSocket room"""
    room = data.get('room', 'default')
    join_room(room)
    emit('room_joined', {'room': room})


@socketio.on('leave_room')
def handle_leave_room(data):
    """Leave a WebSocket room"""
    room = data.get('room', 'default')
    leave_room(room)
    emit('room_left', {'room': room})


@socketio.on('request_update')
def handle_request_update():
    """Handle client request for current state"""
    emit('state_update', {
        'vehicles': fleet_manager.get_all_vehicles(),
        'hazards': fleet_manager.get_active_hazards(),
        'stats': fleet_manager.get_metrics(),
        'tick': fleet_manager.tick
    })


@socketio.on('vehicle_action')
def handle_vehicle_action(data):
    """Handle vehicle action from client"""
    vehicle_id = data.get('vehicleId')
    action = data.get('action')
    
    if action == 'emergency':
        # Trigger emergency for this vehicle
        vehicle = fleet_manager.vehicles.get(vehicle_id)
        if vehicle:
            vehicle.status = 'emergency'
            vehicle.urgency = 10
            emit('vehicle_updated', {'vehicle': vehicle.to_dict()}, broadcast=True)
    
    elif action == 'refuel':
        vehicle = fleet_manager.vehicles.get(vehicle_id)
        if vehicle:
            vehicle.status = 'refueling'
            emit('vehicle_updated', {'vehicle': vehicle.to_dict()}, broadcast=True)


@socketio.on('start_simulation')
def handle_start_simulation(data):
    """Start continuous simulation"""
    global simulation_running
    simulation_running = True
    speed = data.get('speed', 1.0)
    fleet_manager.speed_multiplier = speed
    emit('simulation_started', {'speed': speed}, broadcast=True)


@socketio.on('stop_simulation')
def handle_stop_simulation():
    """Stop continuous simulation"""
    global simulation_running
    simulation_running = False
    emit('simulation_stopped', {}, broadcast=True)


# ==============================================
# Background Tasks
# ==============================================

def simulation_loop():
    """Background simulation loop"""
    global simulation_running
    import time
    
    while True:
        if simulation_running:
            with app.app_context():
                result = fleet_manager.simulate_step()
                traffic_predictor.simulate_traffic_step()
                
                socketio.emit('simulation_update', {
                    'tick': result['tick'],
                    'vehicles': fleet_manager.get_all_vehicles(),
                    'hazards': fleet_manager.get_active_hazards(),
                    'events': result['events']
                })
        
        time.sleep(1.0 / fleet_manager.speed_multiplier)


# ==============================================
# Main Entry Point
# ==============================================

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   🚗 AI-Powered Vehicle Ecosystem v3.0                       ║
    ║   ═══════════════════════════════════════                    ║
    ║                                                              ║
    ║   Flask Backend Server                                       ║
    ║   WebSocket: Enabled                                         ║
    ║   Database: """ + config.DATABASE_TYPE.upper() + """                                          ║
    ║                                                              ║
    ║   API: http://localhost:5000/api                             ║
    ║   WebSocket: ws://localhost:5000                             ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Start background simulation thread
    import threading
    sim_thread = threading.Thread(target=simulation_loop, daemon=True)
    sim_thread.start()
    
    # Run server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
