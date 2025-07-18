/**
 * Authentication Service Module
 * Handles login, logout, token management, and user session
 */

class AuthService {
    constructor(apiService) {
        this.api = apiService;
        this.tokenKey = 'attendance_system_token';
        this.userKey = 'attendance_system_user';
        
        // Load token from storage on initialization
        this.loadTokenFromStorage();
    }

    /**
     * Login user with credentials
     */
    async login(credentials) {
        try {
            const response = await this.api.login(credentials);
            
            if (response.access_token) {
                // Store token
                this.setToken(response.access_token);
                
                // Get user information
                const user = await this.getCurrentUser();
                
                if (user) {
                    this.setUser(user);
                    return {
                        success: true,
                        user: user,
                        token: response.access_token
                    };
                } else {
                    return {
                        success: false,
                        message: 'Failed to retrieve user information'
                    };
                }
            } else {
                return {
                    success: false,
                    message: 'Invalid response from server'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let message = 'Login failed';
            if (error.status === 401) {
                message = 'Invalid username or password';
            } else if (error.status === 0) {
                message = 'Unable to connect to server';
            } else if (error.message) {
                message = error.message;
            }
            
            return {
                success: false,
                message: message
            };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Clear local storage
            this.clearToken();
            this.clearUser();
            
            // Note: Backend doesn't have a logout endpoint, 
            // so we just clear local data
            
            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch (error) {
            console.error('Logout error:', error);
            
            // Even if there's an error, clear local data
            this.clearToken();
            this.clearUser();
            
            return {
                success: true,
                message: 'Logged out (with errors)'
            };
        }
    }

    /**
     * Get current user information
     */
    async getCurrentUser() {
        try {
            const user = await this.api.getCurrentUser();
            this.setUser(user);
            return user;
        } catch (error) {
            console.error('Failed to get current user:', error);
            
            // If we can't get user info, token might be invalid
            if (error.status === 401) {
                this.clearToken();
                this.clearUser();
            }
            
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken() && !!this.getUser();
    }

    /**
     * Get stored token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Set and store token
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
        this.api.setToken(token);
    }

    /**
     * Clear stored token
     */
    clearToken() {
        localStorage.removeItem(this.tokenKey);
        this.api.clearToken();
    }

    /**
     * Load token from storage and set in API service
     */
    loadTokenFromStorage() {
        const token = this.getToken();
        if (token) {
            this.api.setToken(token);
        }
    }

    /**
     * Get stored user
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                this.clearUser();
                return null;
            }
        }
        return null;
    }

    /**
     * Set and store user
     */
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * Clear stored user
     */
    clearUser() {
        localStorage.removeItem(this.userKey);
    }

    /**
     * Check if current user has specific role
     */
    hasRole(role) {
        const user = this.getUser();
        if (!user) return false;
        
        return user.role === role;
    }

    /**
     * Check if current user has any of the specified roles
     */
    hasAnyRole(roles) {
        const user = this.getUser();
        if (!user || !Array.isArray(roles)) return false;
        
        return roles.includes(user.role);
    }

    /**
     * Check if current user is admin or above
     */
    isAdmin() {
        return this.hasAnyRole(['admin', 'super_admin']);
    }

    /**
     * Check if current user is super admin
     */
    isSuperAdmin() {
        return this.hasRole('super_admin');
    }

    /**
     * Check if current user is employee
     */
    isEmployee() {
        return this.hasRole('employee');
    }

    /**
     * Get user's employee ID if available
     */
    getEmployeeId() {
        const user = this.getUser();
        return user ? user.employee_id : null;
    }

    /**
     * Get user's username
     */
    getUsername() {
        const user = this.getUser();
        return user ? user.username : null;
    }

    /**
     * Get user's role
     */
    getUserRole() {
        const user = this.getUser();
        return user ? user.role : null;
    }

    /**
     * Check if user can access employee data
     */
    canAccessEmployeeData(employeeId) {
        const user = this.getUser();
        if (!user) return false;
        
        // Admins and super admins can access all employee data
        if (this.isAdmin()) {
            return true;
        }
        
        // Employees can only access their own data
        return user.employee_id === employeeId;
    }

    /**
     * Refresh user data
     */
    async refreshUser() {
        try {
            const user = await this.getCurrentUser();
            return user;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            throw error;
        }
    }

    /**
     * Check token validity
     */
    async validateToken() {
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            if (error.status === 401) {
                this.clearToken();
                this.clearUser();
                return false;
            }
            throw error;
        }
    }

    /**
     * Get formatted user display name
     */
    getUserDisplayName() {
        const user = this.getUser();
        if (!user) return 'Unknown User';
        
        return user.username;
    }

    /**
     * Get formatted role display name
     */
    getRoleDisplayName() {
        const role = this.getUserRole();
        if (!role) return 'Unknown Role';
        
        return role.replace('_', ' ').toUpperCase();
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        if (error.status === 401) {
            // Token expired or invalid
            this.clearToken();
            this.clearUser();
            
            if (window.app) {
                window.app.showLogin();
                window.app.showNotification('Your session has expired. Please login again.', 'warning');
            }
        } else if (error.status === 403) {
            // Access forbidden
            if (window.app) {
                window.app.showNotification('You do not have permission to access this resource.', 'error');
            }
        }
    }

    /**
     * Auto-refresh token (if backend supports refresh tokens)
     * Note: Current backend doesn't support refresh tokens, 
     * but this method is prepared for future implementation
     */
    async refreshToken() {
        // Placeholder for future refresh token implementation
        throw new Error('Token refresh not implemented');
    }

    /**
     * Setup automatic token validation
     */
    setupTokenValidation(intervalMinutes = 30) {
        setInterval(async () => {
            if (this.isAuthenticated()) {
                try {
                    await this.validateToken();
                } catch (error) {
                    console.warn('Token validation failed:', error);
                    this.handleAuthError(error);
                }
            }
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Clear all authentication data
     */
    clearAll() {
        this.clearToken();
        this.clearUser();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}