# Backend Analysis: Face Recognition Attendance System

## Overview
The backend is a FastAPI-based system for face recognition attendance tracking with comprehensive role-based access control. It features JWT authentication, PostgreSQL database, and a well-structured API for managing employees, attendance, cameras, and system operations.

## Technology Stack
- **Framework**: FastAPI with Uvicorn
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with OAuth2PasswordBearer and bcrypt
- **Security**: Role-based access control (RBAC)
- **Language**: Python 3.8+

## Database Models

### Core Models
1. **Employee** - Core employee information
   - `employee_id` (Primary Key, String)
   - `name`, `department`, `role`, `date_joined`
   - `email`, `phone`, `is_active`
   - Relationships: face_embeddings, attendance_logs

2. **UserAccount** - Authentication and authorization
   - `id` (Primary Key, Integer)
   - `username`, `hashed_password`, `role`
   - `employee_id` (Optional Foreign Key)
   - `is_active`, `last_login`
   - Roles: 'employee', 'admin', 'super_admin'

3. **FaceEmbedding** - Face recognition data
   - `id` (Primary Key, Integer)
   - `employee_id` (Foreign Key)
   - `image_path`, `embedding_vector` (Binary)
   - `quality_score`, `is_active`

4. **AttendanceLog** - Attendance tracking
   - `id` (Primary Key, Integer)
   - `employee_id` (Foreign Key)
   - `timestamp`, `status` ('present'/'absent')
   - `confidence_score`, `notes`

5. **CameraConfig** - Camera management
   - `id` (Primary Key, Integer)
   - `camera_id` (Unique Integer)
   - `camera_name`, `camera_type`, `ip_address`
   - `stream_url`, `resolution`, `fps`, `status`
   - Relationships: tripwires

6. **Tripwire** - Camera detection zones
   - `id` (Primary Key, Integer)
   - `camera_id` (Foreign Key)
   - `name`, `position`, `direction`, `detection_type`

## User Roles & Permissions

### Employee Role
**Access Level**: Basic user access to own data
- View own attendance records (`GET /attendance/me`)
- View own profile (`GET /employees/{employee_id}` - own ID only)
- View currently present employees (`GET /employees/present/current`)
- Access own user info (`GET /auth/me`)

### Admin Role
**Access Level**: Employee management and system operations
- **All Employee permissions plus:**
- Enroll new employees (`POST /employees/enroll`)
- Manage all employee records (`GET`, `PUT`, `DELETE /employees/`)
- View all attendance records (`GET /attendance/all`)
- Mark attendance manually (`POST /attendance/mark`)
- Manage face embeddings (`GET`, `DELETE /embeddings/`)
- Camera management (`GET`, `POST`, `PUT`, `DELETE /cameras/`)
- System control (`POST /system/start`, `POST /system/stop`)
- View system status and live feeds (`GET /system/status`, `/system/live-faces`)
- Access streaming endpoints (`GET /streaming/live-feed`)

### Super Admin Role
**Access Level**: Full system administration
- **All Admin permissions plus:**
- Create user accounts (`POST /auth/users/create`)
- Assign roles (`PATCH /auth/users/{user_id}/role`)
- Delete user accounts (`DELETE /auth/users/{user_id}`)
- List all users (`GET /auth/users`)
- Camera discovery (`POST /cameras/discover`)
- Advanced camera configuration and activation
- System logs access (`GET /system/logs`)

## API Endpoints by Module

### Authentication (`/auth`)
- `POST /auth/login` - Login with OAuth2PasswordRequestForm
- `POST /auth/login/json` - Login with JSON data
- `GET /auth/me` - Get current user info
- `POST /auth/users/create` - Create user (Super Admin)
- `PATCH /auth/users/{user_id}/role` - Assign role (Super Admin)
- `GET /auth/users` - List users (Super Admin)
- `DELETE /auth/users/{user_id}` - Delete user (Super Admin)

### Employee Management (`/employees`)
- `POST /employees/enroll` - Enroll employee with face data (Admin+)
- `GET /employees/` - List all employees (Admin+)
- `GET /employees/{employee_id}` - Get employee details (Own data or Admin+)
- `PUT /employees/{employee_id}` - Update employee (Admin+)
- `DELETE /employees/{employee_id}` - Delete employee (Admin+)
- `GET /employees/present/current` - Get currently present employees (All)
- `POST /employees/{employee_id}/face-image` - Upload face image (Admin+)

### Attendance Management (`/attendance`)
- `GET /attendance/me` - Get own attendance (Employee+)
- `GET /attendance/all` - Get all attendance records (Admin+)
- `GET /attendance/{employee_id}` - Get employee attendance (Own data or Admin+)
- `POST /attendance/mark` - Mark attendance manually (Admin+)
- `GET /attendance/summary/daily` - Daily attendance summary (Admin+)
- `DELETE /attendance/{log_id}` - Delete attendance record (Admin+)
- `GET /attendance/employee/{employee_id}/latest` - Latest attendance (Own data or Admin+)

### Face Embeddings (`/embeddings`)
- `GET /embeddings/` - List all embeddings (Admin+)
- `GET /embeddings/{embedding_id}` - Get embedding details (Admin+)
- `DELETE /embeddings/{embedding_id}` - Delete embedding (Admin+)
- `GET /embeddings/employee/{employee_id}` - Get employee embeddings (Admin+)
- `DELETE /embeddings/employee/{employee_id}/all` - Delete all employee embeddings (Admin+)
- `GET /embeddings/stats/summary` - Embedding statistics (Admin+)

### Camera Management (`/cameras`)
- `POST /cameras/discover` - Discover network cameras (Super Admin)
- `GET /cameras/` - List cameras (Admin+)
- `GET /cameras/{camera_id}` - Get camera details (Admin+)
- `POST /cameras/` - Create camera (Admin+)
- `PUT /cameras/{camera_id}` - Update camera (Admin+)
- `POST /cameras/{camera_id}/configure` - Configure camera (Admin+)
- `POST /cameras/{camera_id}/activate` - Activate/deactivate camera (Admin+)
- `DELETE /cameras/{camera_id}` - Delete camera (Admin+)
- `GET /cameras/{camera_id}/status` - Camera status (Admin+)
- `POST /cameras/{camera_id}/tripwires` - Create tripwire (Admin+)
- `GET /cameras/{camera_id}/tripwires` - List tripwires (Admin+)
- `PUT /cameras/tripwires/{tripwire_id}` - Update tripwire (Admin+)
- `DELETE /cameras/tripwires/{tripwire_id}` - Delete tripwire (Admin+)
- `POST /cameras/reload-configurations` - Reload camera configs (Admin+)

### System Management (`/system`)
- `POST /system/start` - Start face detection system (Admin+)
- `POST /system/stop` - Stop face detection system (Admin+)
- `GET /system/status` - Get system status (Admin+)
- `GET /system/live-faces` - Get live face detection data (Admin+)
- `GET /system/attendance-data` - Get live attendance data (Admin+)
- `GET /system/logs` - Get system logs (Super Admin)
- `GET /system/camera-feed/{camera_id}` - Camera feed stream (Admin+)

### Streaming (`/streaming`)
- `GET /streaming/live-feed` - Live MJPEG stream (Admin+)
- `GET /streaming/camera-status` - Camera streaming status (Admin+)
- `GET /streaming/health` - Streaming health check (Admin+)

## Security Features
1. **JWT Authentication** with configurable expiration
2. **Role-based Access Control** with three distinct permission levels
3. **Password Hashing** using bcrypt
4. **Token Validation** on all protected endpoints
5. **CORS Configuration** for frontend integration
6. **Request Logging** and security middleware

## Configuration
- Environment-based configuration via `.env` file
- PostgreSQL connection settings
- JWT security parameters
- File upload and storage paths
- Camera and face recognition settings
- CORS and API documentation settings

## API Response Formats
- **Success Responses**: Standard JSON with data
- **Error Responses**: HTTP status codes with error details
- **Pagination**: Available for list endpoints
- **File Uploads**: Base64 encoding for images
- **Streaming**: MJPEG for live video feeds

## Development & Production Features
- **Automatic API Documentation** at `/docs` (development only)
- **Health Check** endpoint at `/health`
- **Request Logging** with performance metrics
- **Database Migration** support
- **Environment-specific** configurations
- **Background Tasks** for long-running operations

This backend provides a robust foundation for a comprehensive face recognition attendance system with enterprise-level security and role-based access control.