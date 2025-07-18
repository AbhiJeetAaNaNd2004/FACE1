#!/usr/bin/env python3
"""
Minimal test backend server for connectivity testing
This version uses SQLite and simplified dependencies
"""

import sys
import os
from fastapi import FastAPI, HTTPException, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
from typing import Dict, Any, Optional

# Add backend path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Security scheme
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token - mock implementation for testing"""
    token = credentials.credentials
    if token in ["mock_token_123", "mock_admin_token_456"]:
        return {"valid": True, "role": "employee" if token == "mock_token_123" else "admin"}
    raise HTTPException(status_code=401, detail="Invalid token")

# Create FastAPI app
app = FastAPI(
    title="Face Recognition Test API",
    description="Minimal API for testing frontend connectivity",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test endpoints
@app.get("/")
async def root():
    return {"message": "Face Recognition Test API is running", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "face_recognition_api"}

@app.post("/auth/login")
async def test_login(username: str = Form(...), password: str = Form(...)):
    """Test login endpoint that returns mock data"""
    
    # Mock authentication for testing
    if username == "test" and password == "test":
        return {
            "access_token": "mock_token_123",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "username": "test",
                "role": "employee",
                "employee_id": 1,
                "is_active": True
            }
        }
    elif username == "admin" and password == "admin":
        return {
            "access_token": "mock_admin_token_456",
            "token_type": "bearer",
            "user": {
                "id": 2,
                "username": "admin",
                "role": "admin",
                "employee_id": 2,
                "is_active": True
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user(token_data: dict = Depends(verify_token)):
    """Mock current user endpoint"""
    return {
        "id": 1,
        "username": "test",
        "role": token_data["role"],
        "employee_id": 1,
        "is_active": True
    }

@app.get("/employees/me")
async def get_my_employee_data(token_data: dict = Depends(verify_token)):
    """Mock employee data endpoint"""
    return {
        "id": 1,
        "employee_id": "EMP001",
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "phone": "123-456-7890",
        "department": "IT",
        "position": "Developer",
        "is_active": True,
        "created_at": "2024-01-01T00:00:00Z"
    }

@app.get("/attendance/my-records")
async def get_my_attendance(token_data: dict = Depends(verify_token)):
    """Mock attendance records"""
    return {
        "records": [
            {
                "id": 1,
                "employee_id": 1,
                "check_in": "2024-01-15T09:00:00Z",
                "check_out": "2024-01-15T17:00:00Z",
                "date": "2024-01-15",
                "hours_worked": 8.0
            },
            {
                "id": 2,
                "employee_id": 1,
                "check_in": "2024-01-14T09:15:00Z",
                "check_out": "2024-01-14T17:30:00Z",
                "date": "2024-01-14",
                "hours_worked": 8.25
            }
        ],
        "total_records": 2,
        "total_hours": 16.25
    }

@app.get("/employees/present")
async def get_present_employees(token_data: dict = Depends(verify_token)):
    """Mock present employees"""
    return {
        "employees": [
            {
                "id": 1,
                "employee_id": "EMP001",
                "first_name": "Test",
                "last_name": "User",
                "check_in": "2024-01-15T09:00:00Z",
                "status": "present"
            },
            {
                "id": 2,
                "employee_id": "EMP002", 
                "first_name": "Admin",
                "last_name": "User",
                "check_in": "2024-01-15T08:30:00Z",
                "status": "present"
            }
        ],
        "total_present": 2
    }

@app.get("/employees")
@app.get("/employees/")
async def get_all_employees(token_data: dict = Depends(verify_token)):
    """Mock all employees endpoint"""
    if token_data["role"] not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return [
        {
            "id": 1,
            "employee_id": "EMP001",
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "department": "IT",
            "is_active": True
        },
        {
            "id": 2,
            "employee_id": "EMP002",
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@example.com",
            "department": "Administration",
            "is_active": True
        }
    ]

@app.get("/employees/present/current")
async def get_present_employees_current(token_data: dict = Depends(verify_token)):
    """Mock current present employees"""
    return {
        "employees": [
            {
                "id": 1,
                "employee_id": "EMP001",
                "first_name": "Test",
                "last_name": "User",
                "status": "present"
            }
        ],
        "total_count": 1
    }

@app.get("/cameras")
@app.get("/cameras/")
async def get_cameras(token_data: dict = Depends(verify_token)):
    """Mock cameras endpoint"""
    if token_data["role"] not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    cameras = [
        {
            "id": 1,
            "name": "Main Entrance",
            "ip_address": "192.168.1.100",
            "status": "active",
            "is_streaming": True
        },
        {
            "id": 2,
            "name": "Exit Door",
            "ip_address": "192.168.1.101",
            "status": "active",
            "is_streaming": False
        }
    ]
    
    # Add active count for dashboard
    active_cameras = [cam for cam in cameras if cam["status"] == "active"]
    return {
        "cameras": cameras,
        "active_count": len(active_cameras),
        "total_count": len(cameras)
    }

if __name__ == "__main__":
    print("🚀 Starting Face Recognition Test Backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔧 Health Check: http://localhost:8000/health")
    print("\n📝 Test Credentials:")
    print("   Employee: test/test")
    print("   Admin: admin/admin")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )