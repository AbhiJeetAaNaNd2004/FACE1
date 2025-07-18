/**
 * API Service Module
 * Handles all HTTP requests to the backend API
 */

class APIService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.token = null;
        this.refreshing = false;
        this.failedQueue = [];
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
    }

    /**
     * Get default headers
     */
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Handle HTTP response
     */
    async handleResponse(response) {
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        }

        // Handle specific error status codes
        if (response.status === 401) {
            this.clearToken();
            if (window.app) {
                window.app.showLogin();
            }
            throw new APIError('Unauthorized access', 401);
        }

        if (response.status === 403) {
            throw new APIError('Access forbidden', 403);
        }

        if (response.status === 404) {
            throw new APIError('Resource not found', 404);
        }

        if (response.status >= 500) {
            throw new APIError('Server error', response.status);
        }

        // Try to get error message from response
        let errorMessage = 'Request failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
            // If JSON parsing fails, use default message
        }

        throw new APIError(errorMessage, response.status);
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: this.getHeaders(options.headers),
            ...options
        };

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            
            // Network or other errors
            console.error('API request failed:', error);
            throw new APIError('Network error or server unavailable', 0);
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data = null, options = {}) {
        const config = {
            method: 'POST',
            ...options
        };

        if (data) {
            if (data instanceof FormData) {
                // Don't set Content-Type for FormData
                delete config.headers;
                config.headers = this.getHeaders({ ...options.headers });
                delete config.headers['Content-Type'];
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }

        return this.request(endpoint, config);
    }

    /**
     * PUT request
     */
    async put(endpoint, data = null, options = {}) {
        const config = {
            method: 'PUT',
            ...options
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        return this.request(endpoint, config);
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data = null, options = {}) {
        const config = {
            method: 'PATCH',
            ...options
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        return this.request(endpoint, config);
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options
        });
    }

    /**
     * Login request (special handling for form data)
     */
    async login(credentials) {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        return this.request('/auth/login', {
            method: 'POST',
            body: formData,
            headers: {} // Don't include default headers for form data
        });
    }

    /**
     * Upload file
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        return this.post(endpoint, formData);
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.get('/health');
            return { status: 'ok', data: response };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    // Authentication endpoints
    async getCurrentUser() {
        return this.get('/auth/me');
    }

    async createUser(userData) {
        return this.post('/auth/users/create', userData);
    }

    async updateUserRole(userId, role) {
        return this.patch(`/auth/users/${userId}/role`, { role });
    }

    async deleteUser(userId) {
        return this.delete(`/auth/users/${userId}`);
    }

    async listUsers() {
        return this.get('/auth/users');
    }

    // Employee endpoints
    async getEmployees() {
        return this.get('/employees/');
    }

    async getEmployee(employeeId) {
        return this.get(`/employees/${employeeId}`);
    }

    async createEmployee(employeeData) {
        return this.post('/employees/enroll', employeeData);
    }

    async updateEmployee(employeeId, employeeData) {
        return this.put(`/employees/${employeeId}`, employeeData);
    }

    async deleteEmployee(employeeId) {
        return this.delete(`/employees/${employeeId}`);
    }

    async getPresentEmployees() {
        return this.get('/employees/present/current');
    }

    async uploadEmployeeFaceImage(employeeId, imageFile) {
        return this.uploadFile(`/employees/${employeeId}/face-image`, imageFile);
    }

    // Attendance endpoints
    async getMyAttendance(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        
        return this.get('/attendance/me', params);
    }

    async getAllAttendance(startDate = null, endDate = null, employeeId = null) {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (employeeId) params.employee_id = employeeId;
        
        return this.get('/attendance/all', params);
    }

    async getEmployeeAttendance(employeeId, startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        
        return this.get(`/attendance/${employeeId}`, params);
    }

    async markAttendance(attendanceData) {
        return this.post('/attendance/mark', attendanceData);
    }

    async getDailyAttendanceSummary(date = null) {
        const params = {};
        if (date) params.date = date;
        
        return this.get('/attendance/summary/daily', params);
    }

    async deleteAttendanceLog(logId) {
        return this.delete(`/attendance/${logId}`);
    }

    // Face embeddings endpoints
    async getFaceEmbeddings() {
        return this.get('/embeddings/');
    }

    async getFaceEmbedding(embeddingId) {
        return this.get(`/embeddings/${embeddingId}`);
    }

    async deleteFaceEmbedding(embeddingId) {
        return this.delete(`/embeddings/${embeddingId}`);
    }

    async getEmployeeFaceEmbeddings(employeeId) {
        return this.get(`/embeddings/employee/${employeeId}`);
    }

    async deleteAllEmployeeFaceEmbeddings(employeeId) {
        return this.delete(`/embeddings/employee/${employeeId}/all`);
    }

    async getFaceEmbeddingStats() {
        return this.get('/embeddings/stats/summary');
    }

    // Camera endpoints
    async discoverCameras(discoveryRequest) {
        return this.post('/cameras/discover', discoveryRequest);
    }

    async getCameras(statusFilter = null, activeOnly = false) {
        const params = {};
        if (statusFilter) params.status_filter = statusFilter;
        if (activeOnly) params.active_only = activeOnly;
        
        return this.get('/cameras/', params);
    }

    async getCamera(cameraId) {
        return this.get(`/cameras/${cameraId}`);
    }

    async createCamera(cameraData) {
        return this.post('/cameras/', cameraData);
    }

    async updateCamera(cameraId, cameraData) {
        return this.put(`/cameras/${cameraId}`, cameraData);
    }

    async configureCamera(cameraId, configData) {
        return this.post(`/cameras/${cameraId}/configure`, configData);
    }

    async activateCamera(cameraId, isActive) {
        return this.post(`/cameras/${cameraId}/activate`, { is_active: isActive });
    }

    async deleteCamera(cameraId) {
        return this.delete(`/cameras/${cameraId}`);
    }

    async getCameraStatus(cameraId) {
        return this.get(`/cameras/${cameraId}/status`);
    }

    async createTripwire(cameraId, tripwireData) {
        return this.post(`/cameras/${cameraId}/tripwires`, tripwireData);
    }

    async getTripwires(cameraId) {
        return this.get(`/cameras/${cameraId}/tripwires`);
    }

    async updateTripwire(tripwireId, tripwireData) {
        return this.put(`/cameras/tripwires/${tripwireId}`, tripwireData);
    }

    async deleteTripwire(tripwireId) {
        return this.delete(`/cameras/tripwires/${tripwireId}`);
    }

    async reloadCameraConfigurations() {
        return this.post('/cameras/reload-configurations');
    }

    // System endpoints
    async startFaceDetectionSystem() {
        return this.post('/system/start');
    }

    async stopFaceDetectionSystem() {
        return this.post('/system/stop');
    }

    async getSystemStatus() {
        return this.get('/system/status');
    }

    async getLiveFaces() {
        return this.get('/system/live-faces');
    }

    async getAttendanceData() {
        return this.get('/system/attendance-data');
    }

    async getSystemLogs() {
        return this.get('/system/logs');
    }

    // Streaming endpoints
    async getStreamingHealth() {
        return this.get('/streaming/health');
    }

    async getCameraStreamingStatus() {
        return this.get('/streaming/camera-status');
    }

    /**
     * Get live feed URL
     */
    getLiveFeedUrl() {
        return `${this.baseUrl}/streaming/live-feed`;
    }

    /**
     * Get camera feed URL
     */
    getCameraFeedUrl(cameraId) {
        return `${this.baseUrl}/system/camera-feed/${cameraId}`;
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService, APIError };
}