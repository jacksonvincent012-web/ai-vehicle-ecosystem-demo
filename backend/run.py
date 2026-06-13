// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

#!/usr/bin/env python3
"""
Run script for AI-Powered Vehicle Ecosystem Backend
"""

import os
import sys

def main():
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   🚗 AI-Powered Vehicle Ecosystem v3.0                       ║
    ║   ═══════════════════════════════════════                    ║
    ║                                                              ║
    ║   Starting Flask Backend Server...                           ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Check for required packages
    try:
        import flask
        import flask_socketio
        import flask_cors
        import flask_sqlalchemy
        print("✅ All required packages found")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("\n📦 Installing required packages...")
        os.system(f"{sys.executable} -m pip install -r requirements.txt")
    
    # Import and run app
    from app import app, socketio, init_database
    
    # Initialize database
    init_database()
    
    # Get configuration
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    
    print(f"""
    🌐 Server Configuration:
    ─────────────────────────
    Host: {host}
    Port: {port}
    Debug: {debug}
    
    📡 Endpoints:
    ─────────────────────────
    REST API:   http://localhost:{port}/api
    WebSocket:  ws://localhost:{port}
    Health:     http://localhost:{port}/api/health
    
    🔐 Default Credentials:
    ─────────────────────────
    Admin:         admin / admin123
    Fleet Manager: fleet_manager / fleet123
    
    Press Ctrl+C to stop the server.
    """)
    
    # Run with SocketIO
    socketio.run(app, host=host, port=port, debug=debug)


if __name__ == '__main__':
    main()
