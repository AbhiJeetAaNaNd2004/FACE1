// Type definitions based on backend schemas

export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent'
}

export enum CameraStatus {
  DISCOVERED = 'discovered',
  CONFIGURED = 'configured',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  employee_id?: string;
  is_active: boolean;
}

export interface Employee {
  employee_id: string;
  name: string;
  department: string;
  role: string;
  date_joined: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLog {
  id: number;
  employee_id: string;
  timestamp: string;
  status: AttendanceStatus;
  confidence_score?: number;
  notes?: string;
  created_at: string;
}

export interface AttendanceResponse {
  employee_id: string;
  employee_name: string;
  attendance_logs: AttendanceLog[];
}

export interface FaceEmbedding {
  id: number;
  employee_id: string;
  image_path: string;
  quality_score?: number;
  created_at: string;
  is_active: boolean;
}

export interface CameraInfo {
  id: number;
  camera_id: number;
  camera_name: string;
  camera_type: string;
  ip_address: string;
  stream_url?: string;
  manufacturer?: string;
  model?: string;
  status: CameraStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface EmployeeCreate {
  employee_id: string;
  name: string;
  department: string;
  role: string;
  date_joined: string;
  email?: string;
  phone?: string;
}

export interface EmployeeEnrollmentRequest {
  employee: EmployeeCreate;
  image_data: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface PresentEmployeesResponse {
  present_employees: Employee[];
  total_count: number;
}

export interface UserAccountCreate {
  username: string;
  password: string;
  role: UserRole;
  employee_id?: string;
}

export interface AttendanceLogCreate {
  employee_id: string;
  status: AttendanceStatus;
  confidence_score?: number;
  notes?: string;
}

export interface CameraDiscoveryRequest {
  network_range: string;
  timeout: number;
}

export interface CameraDiscoveryResult {
  ip_address: string;
  port: number;
  manufacturer: string;
  model: string;
  firmware_version: string;
  stream_urls: string[];
  onvif_supported: boolean;
}

export interface ApiError {
  detail: string;
}