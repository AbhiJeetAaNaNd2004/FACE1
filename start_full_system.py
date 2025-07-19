#!/usr/bin/env python3
"""
Complete Face Recognition Attendance System Startup Script
Starts the backend server with face detection system auto-startup
"""

import os
import sys
import subprocess
import argparse
import time
import threading
from pathlib import Path

def print_banner():
    """Print startup banner"""
    print("=" * 60)
    print("🎯 Face Recognition Attendance System")
    print("   Complete System Startup")
    print("=" * 60)

def check_requirements():
    """Check if all required packages are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import psycopg2
        import passlib
        import jose
        import cv2
        import numpy
        import faiss
        import torch
        import insightface
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Please install requirements with: pip install -r requirements.txt")
        return False

def setup_environment():
    """Setup environment variables and paths"""
    backend_path = Path(__file__).parent / "backend"
    
    # Add backend to Python path
    if str(backend_path) not in sys.path:
        sys.path.insert(0, str(backend_path))
    
    # Set environment variables for auto-start
    os.environ.setdefault('AUTO_START_FTS', 'true')
    os.environ.setdefault('DEBUG', 'true')
    
    return backend_path

def initialize_database():
    """Initialize database if needed"""
    try:
        backend_path = setup_environment()
        init_script = backend_path / "init_db.py"
        
        if init_script.exists():
            print("🔄 Initializing database...")
            result = subprocess.run([sys.executable, str(init_script)], 
                                  cwd=str(backend_path), 
                                  capture_output=True, 
                                  text=True)
            
            if result.returncode == 0:
                print("✅ Database initialized successfully")
                return True
            else:
                print(f"❌ Database initialization failed: {result.stderr}")
                return False
        else:
            print("❌ Database initialization script not found")
            return False
    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        return False

def start_backend_server(host="0.0.0.0", port=8000, reload=False):
    """Start the FastAPI backend server"""
    try:
        backend_path = setup_environment()
        
        print(f"🚀 Starting backend server on http://{host}:{port}")
        print(f"📚 API Documentation: http://{host}:{port}/docs")
        print("🔍 Face detection system will auto-start with the backend")
        
        # Change to backend directory
        original_cwd = os.getcwd()
        os.chdir(backend_path)
        
        # Build uvicorn command
        cmd = [
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--host", host,
            "--port", str(port)
        ]
        
        if reload:
            cmd.append("--reload")
        
        print("Backend server starting...")
        print("Press Ctrl+C to stop the system")
        
        # Start server
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend server: {e}")
    finally:
        # Restore original directory
        if 'original_cwd' in locals():
            os.chdir(original_cwd)

def start_frontend_server(port=3000):
    """Start the frontend HTTP server"""
    try:
        frontend_path = Path(__file__).parent / "frontend"
        
        if not frontend_path.exists():
            print("❌ Frontend directory not found")
            return
        
        print(f"🌐 Starting frontend server on http://localhost:{port}")
        
        # Change to frontend directory
        original_cwd = os.getcwd()
        os.chdir(frontend_path)
        
        # Start Python HTTP server
        subprocess.run([sys.executable, "-m", "http.server", str(port)])
        
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped by user")
    except Exception as e:
        print(f"❌ Error starting frontend server: {e}")
    finally:
        # Restore original directory
        if 'original_cwd' in locals():
            os.chdir(original_cwd)

def start_both_servers(backend_port=8000, frontend_port=3000, reload=False):
    """Start both backend and frontend servers"""
    def start_frontend():
        time.sleep(2)  # Wait for backend to start
        start_frontend_server(frontend_port)
    
    # Start frontend in a separate thread
    frontend_thread = threading.Thread(target=start_frontend, daemon=True)
    frontend_thread.start()
    
    # Start backend in main thread
    start_backend_server(port=backend_port, reload=reload)

def main():
    """Main function with command line argument parsing"""
    parser = argparse.ArgumentParser(
        description="Face Recognition Attendance System - Complete Startup"
    )
    
    parser.add_argument(
        "--backend-port", 
        type=int, 
        default=8000, 
        help="Backend server port (default: 8000)"
    )
    
    parser.add_argument(
        "--frontend-port", 
        type=int, 
        default=3000, 
        help="Frontend server port (default: 3000)"
    )
    
    parser.add_argument(
        "--backend-only", 
        action="store_true", 
        help="Start only the backend server"
    )
    
    parser.add_argument(
        "--frontend-only", 
        action="store_true", 
        help="Start only the frontend server"
    )
    
    parser.add_argument(
        "--reload", 
        action="store_true", 
        help="Enable auto-reload for development"
    )
    
    parser.add_argument(
        "--skip-checks", 
        action="store_true", 
        help="Skip pre-startup checks"
    )
    
    parser.add_argument(
        "--init-db", 
        action="store_true", 
        help="Initialize database and exit"
    )
    
    args = parser.parse_args()
    
    print_banner()
    
    # Initialize database only
    if args.init_db:
        if not check_requirements():
            sys.exit(1)
        
        if not initialize_database():
            sys.exit(1)
        
        print("✅ Database initialization completed")
        return
    
    # Pre-startup checks
    if not args.skip_checks:
        print("🔍 Running pre-startup checks...")
        
        if not check_requirements():
            sys.exit(1)
    
    # Start servers based on arguments
    try:
        if args.backend_only:
            start_backend_server(port=args.backend_port, reload=args.reload)
        elif args.frontend_only:
            start_frontend_server(port=args.frontend_port)
        else:
            print("🚀 Starting complete system (Backend + Frontend)...")
            start_both_servers(
                backend_port=args.backend_port, 
                frontend_port=args.frontend_port,
                reload=args.reload
            )
    except KeyboardInterrupt:
        print("\n🛑 System shutdown requested")
    except Exception as e:
        print(f"❌ System startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()