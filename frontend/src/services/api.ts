import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginRequest,
  Token,
  User,
  Employee,
  AttendanceResponse,
  AttendanceLogCreate,
  EmployeeCreate,
  EmployeeEnrollmentRequest,
  MessageResponse,
  PresentEmployeesResponse,
  UserAccountCreate,
  FaceEmbedding,
  CameraInfo,
  CameraDiscoveryRequest,
  CameraDiscoveryResult,
  ApiError
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<Token> {
    const response: AxiosResponse<Token> = await this.api.post('/auth/login/json', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  async createUser(userData: UserAccountCreate): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post('/auth/users/create', userData);
    return response.data;
  }

  // Employee methods
  async enrollEmployee(enrollmentData: EmployeeEnrollmentRequest): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post('/employees/enroll', enrollmentData);
    return response.data;
  }

  async getEmployeeList(): Promise<Employee[]> {
    const response: AxiosResponse<Employee[]> = await this.api.get('/employees/list');
    return response.data;
  }

  async getEmployeeDirectory(): Promise<Employee[]> {
    const response: AxiosResponse<Employee[]> = await this.api.get('/employees/directory');
    return response.data;
  }

  async getPresentEmployees(): Promise<PresentEmployeesResponse> {
    const response: AxiosResponse<PresentEmployeesResponse> = await this.api.get('/employees/present');
    return response.data;
  }

  async updateEmployee(employeeId: string, updateData: Partial<EmployeeCreate>): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.put(`/employees/${employeeId}`, updateData);
    return response.data;
  }

  async deleteEmployee(employeeId: string): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.delete(`/employees/${employeeId}`);
    return response.data;
  }

  // Attendance methods
  async getMyAttendance(startDate?: string, endDate?: string): Promise<AttendanceResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response: AxiosResponse<AttendanceResponse> = await this.api.get(`/attendance/me?${params.toString()}`);
    return response.data;
  }

  async getAllAttendance(startDate?: string, endDate?: string, employeeId?: string): Promise<AttendanceResponse[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (employeeId) params.append('employee_id', employeeId);
    
    const response: AxiosResponse<AttendanceResponse[]> = await this.api.get(`/attendance/all?${params.toString()}`);
    return response.data;
  }

  async markAttendance(attendanceData: AttendanceLogCreate): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post('/attendance/mark', attendanceData);
    return response.data;
  }

  async deleteAttendanceRecord(recordId: number): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.delete(`/attendance/${recordId}`);
    return response.data;
  }

  // Face embeddings methods
  async getFaceEmbeddings(employeeId?: string): Promise<FaceEmbedding[]> {
    const params = employeeId ? `?employee_id=${employeeId}` : '';
    const response: AxiosResponse<FaceEmbedding[]> = await this.api.get(`/embeddings/${params}`);
    return response.data;
  }

  async deleteFaceEmbedding(embeddingId: number): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.delete(`/embeddings/${embeddingId}`);
    return response.data;
  }

  // Camera methods
  async getCameras(): Promise<CameraInfo[]> {
    const response: AxiosResponse<{ cameras: CameraInfo[] }> = await this.api.get('/cameras/');
    return response.data.cameras;
  }

  async discoverCameras(discoveryData: CameraDiscoveryRequest): Promise<CameraDiscoveryResult[]> {
    const response: AxiosResponse<{ discovered_cameras: CameraDiscoveryResult[] }> = 
      await this.api.post('/cameras/discover', discoveryData);
    return response.data.discovered_cameras;
  }

  async getCameraStatus(): Promise<any> {
    const response = await this.api.get('/stream/camera-status');
    return response.data;
  }

  // Streaming methods
  getLiveFeedUrl(): string {
    const token = localStorage.getItem('access_token');
    return `${API_BASE_URL}/stream/live-feed?token=${token}`;
  }

  // System methods
  async getSystemInfo(): Promise<any> {
    const response = await this.api.get('/');
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  setAuthToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // File upload helper
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const apiService = new ApiService();
export default apiService;