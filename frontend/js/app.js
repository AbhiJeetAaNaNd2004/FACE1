/**
 * Main Application Module
 * Handles app initialization, state management, and module coordination
 */

class App {
    constructor() {
        this.config = {
            apiBaseUrl: 'http://localhost:8000',
            version: '1.0.0'
        };
        
        this.state = {
            user: null,
            isAuthenticated: false,
            currentPage: 'dashboard-home',
            loading: false
        };
        
        this.modules = {};
        this.eventListeners = new Map();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Face Recognition Attendance System');
            
            // Initialize modules
            this.initModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check authentication status
            await this.checkAuthStatus();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('✅ Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    /**
     * Initialize all modules
     */
    initModules() {
        // Initialize API module
        this.modules.api = new APIService(this.config.apiBaseUrl);
        
        // Initialize authentication module
        this.modules.auth = new AuthService(this.modules.api);
        
        // Initialize router module
        this.modules.router = new Router(this);
        
        // Initialize UI module
        this.modules.ui = new UIService(this);
        
        // Initialize page modules (will be loaded when needed)
        this.modules.pages = {};
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', this.handleNavigation.bind(this));
        });

        // Modal close functionality
        this.setupModalListeners();

        // Global error handling
        window.addEventListener('unhandledrejection', this.handleGlobalError.bind(this));
        window.addEventListener('error', this.handleGlobalError.bind(this));
    }

    /**
     * Setup modal event listeners
     */
    setupModalListeners() {
        // Confirmation modal
        const confirmationModal = document.getElementById('confirmation-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        const confirmBtn = document.getElementById('confirm-btn');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideModal('confirmation-modal');
            });
        }

        // Close modal when clicking outside
        if (confirmationModal) {
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) {
                    this.hideModal('confirmation-modal');
                }
            });
        }
    }

    /**
     * Check authentication status on app load
     */
    async checkAuthStatus() {
        const token = this.modules.auth.getToken();
        
        if (token) {
            try {
                const user = await this.modules.auth.getCurrentUser();
                if (user) {
                    this.setUser(user);
                    this.showDashboard();
                } else {
                    this.showLogin();
                }
            } catch (error) {
                console.warn('Invalid token, redirecting to login');
                this.modules.auth.clearToken();
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            this.setLoading(true);
            this.hideError('login-error');
            
            const result = await this.modules.auth.login(credentials);
            
            if (result.success) {
                this.setUser(result.user);
                this.showDashboard();
                this.showNotification('Login successful', 'success');
            } else {
                this.showError('login-error', result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login-error', 'An error occurred during login');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            await this.modules.auth.logout();
            this.setUser(null);
            this.showLogin();
            this.showNotification('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error during logout', 'error');
        }
    }

    /**
     * Handle navigation clicks
     */
    handleNavigation(event) {
        event.preventDefault();
        
        const pageId = event.currentTarget.dataset.page;
        if (pageId) {
            this.modules.router.navigateTo(pageId);
        }
    }

    /**
     * Set current user
     */
    setUser(user) {
        this.state.user = user;
        this.state.isAuthenticated = !!user;
        
        if (user) {
            this.updateUserUI(user);
            this.updateNavigationForRole(user.role);
        }
    }

    /**
     * Update user information in UI
     */
    updateUserUI(user) {
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.getElementById('user-role');
        
        if (userNameEl) {
            userNameEl.textContent = user.username;
        }
        
        if (userRoleEl) {
            userRoleEl.textContent = user.role.replace('_', ' ').toUpperCase();
        }
    }

    /**
     * Update navigation based on user role
     */
    updateNavigationForRole(role) {
        const navSections = document.querySelectorAll('.nav-section');
        
        navSections.forEach(section => {
            const allowedRoles = section.dataset.roles?.split(',') || [];
            
            if (allowedRoles.includes(role)) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    /**
     * Show login page
     */
    showLogin() {
        this.showPage('login-page');
        document.body.classList.add('login-active');
    }

    /**
     * Show dashboard
     */
    showDashboard() {
        this.showPage('dashboard-page');
        document.body.classList.remove('login-active');
        
        // Load dashboard data
        this.loadDashboardData();
    }

    /**
     * Show specific page
     */
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Load dashboard statistics
            const stats = await this.loadDashboardStats();
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    /**
     * Load dashboard statistics
     */
    async loadDashboardStats() {
        const stats = {
            totalEmployees: 0,
            presentToday: 0,
            activeCameras: 0,
            attendanceRate: 0
        };

        try {
            // Get employees count (if admin/super_admin)
            if (this.hasRole(['admin', 'super_admin'])) {
                const employees = await this.modules.api.get('/employees/');
                stats.totalEmployees = employees.length;
            }

            // Get present employees
            const presentEmployees = await this.modules.api.get('/employees/present/current');
            stats.presentToday = presentEmployees.total_count || 0;

            // Get cameras count (if admin/super_admin)
            if (this.hasRole(['admin', 'super_admin'])) {
                const cameras = await this.modules.api.get('/cameras/');
                stats.activeCameras = cameras.active_count || 0;
            }

            // Calculate attendance rate
            if (stats.totalEmployees > 0) {
                stats.attendanceRate = Math.round((stats.presentToday / stats.totalEmployees) * 100);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }

        return stats;
    }

    /**
     * Update dashboard statistics in UI
     */
    updateDashboardStats(stats) {
        const elements = {
            'total-employees': stats.totalEmployees,
            'present-today': stats.presentToday,
            'active-cameras': stats.activeCameras,
            'attendance-rate': `${stats.attendanceRate}%`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Check if current user has specific role(s)
     */
    hasRole(roles) {
        if (!this.state.user) return false;
        
        const userRole = this.state.user.role;
        if (Array.isArray(roles)) {
            return roles.includes(userRole);
        }
        return userRole === roles;
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.state.loading = loading;
        
        const loadingModal = document.getElementById('loading-modal');
        if (loadingModal) {
            if (loading) {
                loadingModal.classList.add('active');
            } else {
                loadingModal.classList.remove('active');
            }
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen && app) {
            loadingScreen.style.display = 'none';
            app.style.display = 'block';
        }
    }

    /**
     * Show error message
     */
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Hide error message
     */
    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        this.modules.ui.showNotification(message, type, duration);
    }

    /**
     * Show confirmation modal
     */
    showConfirmation(title, message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const titleEl = document.getElementById('confirmation-title');
        const messageEl = document.getElementById('confirmation-message');
        const confirmBtn = document.getElementById('confirm-btn');

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        // Remove existing listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Add new listener
        newConfirmBtn.addEventListener('click', () => {
            this.hideModal('confirmation-modal');
            if (onConfirm) onConfirm();
        });

        this.showModal('confirmation-modal');
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        console.error('Global error:', event);
        
        if (event.reason || event.error) {
            const error = event.reason || event.error;
            if (error.message && !error.message.includes('Loading chunk')) {
                this.showNotification('An unexpected error occurred', 'error');
            }
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.state.user;
    }

    /**
     * Get API service
     */
    getAPI() {
        return this.modules.api;
    }

    /**
     * Get authentication service
     */
    getAuth() {
        return this.modules.auth;
    }

    /**
     * Get router
     */
    getRouter() {
        return this.modules.router;
    }

    /**
     * Get UI service
     */
    getUI() {
        return this.modules.ui;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}