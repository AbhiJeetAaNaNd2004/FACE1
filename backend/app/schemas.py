from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# Enums for better type safety
class UserRole(str, Enum):
    EMPLOYEE = "employee"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"

# Base schemas
class EmployeeBase(BaseModel):
    employee_id: str = Field(..., description="Unique employee identifier")
    name: str = Field(..., description="Employee full name")
    department: str = Field(..., description="Department name")
    role: str = Field(..., description="Job role/position")
    date_joined: date = Field(..., description="Date when employee joined")
    email: Optional[str] = Field(None, description="Employee email address")
    phone: Optional[str] = Field(None, description="Employee phone number")

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class Employee(EmployeeBase):
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Face Embedding schemas
class FaceEmbeddingBase(BaseModel):
    employee_id: str
    image_path: str
    quality_score: Optional[float] = None

class FaceEmbeddingCreate(FaceEmbeddingBase):
    embedding_vector: bytes

class FaceEmbedding(FaceEmbeddingBase):
    id: int
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Attendance Log schemas
class AttendanceLogBase(BaseModel):
    employee_id: str
    status: AttendanceStatus
    confidence_score: Optional[float] = None
    notes: Optional[str] = None

class AttendanceLogCreate(AttendanceLogBase):
    pass

class AttendanceLog(AttendanceLogBase):
    id: int
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# User Account schemas
class UserAccountBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    role: UserRole
    employee_id: Optional[str] = None

class UserAccountCreate(UserAccountBase):
    password: str = Field(..., min_length=6)

class UserAccountUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    employee_id: Optional[str] = None

class UserAccount(UserAccountBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class CurrentUser(BaseModel):
    id: int
    username: str
    role: UserRole
    employee_id: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# Employee enrollment schema
class EmployeeEnrollmentRequest(BaseModel):
    employee: EmployeeCreate
    image_data: str = Field(..., description="Base64 encoded image data")

# Response schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class AttendanceResponse(BaseModel):
    employee_id: str
    employee_name: str
    attendance_logs: List[AttendanceLog]

class PresentEmployeesResponse(BaseModel):
    present_employees: List[Employee]
    total_count: int

# Role assignment schema
class RoleAssignmentRequest(BaseModel):
    role: UserRole

# Validation
class EmployeeCreate(EmployeeBase):
    @validator('employee_id')
    def validate_employee_id(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Employee ID cannot be empty')
        return v.strip()

    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Name cannot be empty')
        return v.strip()

    @validator('department')
    def validate_department(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Department cannot be empty')
        return v.strip()

    @validator('role')
    def validate_role(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Role cannot be empty')
        return v.strip()