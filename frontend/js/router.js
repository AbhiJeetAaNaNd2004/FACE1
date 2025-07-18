/**
 * Router Module
 * Handles SPA navigation and page content loading
 */

class Router {
    constructor(app) {
        this.app = app;
        this.currentPage = null;
        this.pageLoaders = new Map();
        this.history = [];
        
        this.setupPageLoaders();
        this.setupHistoryHandling();
    }

    /**
     * Setup page loader functions
     */
    setupPageLoaders() {
        // Dashboard home
        this.pageLoaders.set('dashboard-home', () => {
            this.showContentPage('dashboard-home');
            this.app.loadDashboardData();
        });

        // Employee pages
        this.pageLoaders.set('my-attendance', () => this.loadMyAttendancePage());
        this.pageLoaders.set('my-profile', () => this.loadMyProfilePage());
        this.pageLoaders.set('present-employees', () => this.loadPresentEmployeesPage());

        // Admin pages
        this.pageLoaders.set('employees', () => this.loadEmployeesPage());
        this.pageLoaders.set('enroll-employee', () => this.loadEnrollEmployeePage());
        this.pageLoaders.set('attendance-records', () => this.loadAttendanceRecordsPage());
        this.pageLoaders.set('face-embeddings', () => this.loadFaceEmbeddingsPage());

        // System pages
        this.pageLoaders.set('cameras', () => this.loadCamerasPage());
        this.pageLoaders.set('system-control', () => this.loadSystemControlPage());
        this.pageLoaders.set('live-feed', () => this.loadLiveFeedPage());

        // Super admin pages
        this.pageLoaders.set('user-management', () => this.loadUserManagementPage());
        this.pageLoaders.set('camera-discovery', () => this.loadCameraDiscoveryPage());
        this.pageLoaders.set('system-logs', () => this.loadSystemLogsPage());
    }

    /**
     * Setup browser history handling
     */
    setupHistoryHandling() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigateTo(event.state.page, false);
            }
        });
    }

    /**
     * Navigate to a specific page
     */
    navigateTo(pageId, pushState = true) {
        // Check if user has permission to access this page
        if (!this.canAccessPage(pageId)) {
            this.app.showNotification('You do not have permission to access this page', 'error');
            return;
        }

        // Update browser history
        if (pushState) {
            const title = this.getPageTitle(pageId);
            history.pushState({ page: pageId }, title, `#${pageId}`);
        }

        // Update navigation UI
        this.updateNavigationUI(pageId);

        // Load page content
        const loader = this.pageLoaders.get(pageId);
        if (loader) {
            try {
                loader();
                this.currentPage = pageId;
                this.history.push(pageId);
            } catch (error) {
                console.error(`Failed to load page ${pageId}:`, error);
                this.app.showNotification('Failed to load page', 'error');
            }
        } else {
            console.warn(`No loader found for page: ${pageId}`);
            this.app.showNotification('Page not found', 'error');
        }
    }

    /**
     * Check if user can access a specific page
     */
    canAccessPage(pageId) {
        const user = this.app.getCurrentUser();
        if (!user) return false;

        const role = user.role;
        const rolePermissions = {
            'employee': [
                'dashboard-home', 'my-attendance', 'my-profile', 'present-employees'
            ],
            'admin': [
                'dashboard-home', 'my-attendance', 'my-profile', 'present-employees',
                'employees', 'enroll-employee', 'attendance-records', 'face-embeddings',
                'cameras', 'system-control', 'live-feed'
            ],
            'super_admin': [
                'dashboard-home', 'my-attendance', 'my-profile', 'present-employees',
                'employees', 'enroll-employee', 'attendance-records', 'face-embeddings',
                'cameras', 'system-control', 'live-feed',
                'user-management', 'camera-discovery', 'system-logs'
            ]
        };

        const allowedPages = rolePermissions[role] || [];
        return allowedPages.includes(pageId);
    }

    /**
     * Get page title
     */
    getPageTitle(pageId) {
        const titles = {
            'dashboard-home': 'Dashboard',
            'my-attendance': 'My Attendance',
            'my-profile': 'My Profile',
            'present-employees': 'Present Employees',
            'employees': 'All Employees',
            'enroll-employee': 'Enroll Employee',
            'attendance-records': 'Attendance Records',
            'face-embeddings': 'Face Embeddings',
            'cameras': 'Camera Management',
            'system-control': 'System Control',
            'live-feed': 'Live Feed',
            'user-management': 'User Management',
            'camera-discovery': 'Camera Discovery',
            'system-logs': 'System Logs'
        };

        return titles[pageId] || 'Page';
    }

    /**
     * Update navigation UI to show active page
     */
    updateNavigationUI(pageId) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current page nav item
        const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    /**
     * Show content page
     */
    showContentPage(pageId) {
        // Hide all content pages
        document.querySelectorAll('.content-page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    /**
     * Load My Attendance page
     */
    async loadMyAttendancePage() {
        const container = document.getElementById('my-attendance');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('my-attendance');

        try {
            // Load page module if not already loaded
            if (!this.app.modules.pages.attendance) {
                this.app.modules.pages.attendance = new AttendancePage(this.app);
            }

            await this.app.modules.pages.attendance.loadMyAttendance(container);
        } catch (error) {
            console.error('Failed to load my attendance page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load attendance data');
        }
    }

    /**
     * Load My Profile page
     */
    async loadMyProfilePage() {
        const container = document.getElementById('my-profile');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('my-profile');

        try {
            // Load page module if not already loaded
            if (!this.app.modules.pages.employee) {
                this.app.modules.pages.employee = new EmployeePage(this.app);
            }

            await this.app.modules.pages.employee.loadMyProfile(container);
        } catch (error) {
            console.error('Failed to load my profile page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load profile data');
        }
    }

    /**
     * Load Present Employees page
     */
    async loadPresentEmployeesPage() {
        const container = document.getElementById('present-employees');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('present-employees');

        try {
            if (!this.app.modules.pages.employee) {
                this.app.modules.pages.employee = new EmployeePage(this.app);
            }

            await this.app.modules.pages.employee.loadPresentEmployees(container);
        } catch (error) {
            console.error('Failed to load present employees page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load employee data');
        }
    }

    /**
     * Load Employees page (Admin+)
     */
    async loadEmployeesPage() {
        const container = document.getElementById('employees');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('employees');

        try {
            if (!this.app.modules.pages.admin) {
                this.app.modules.pages.admin = new AdminPage(this.app);
            }

            await this.app.modules.pages.admin.loadEmployees(container);
        } catch (error) {
            console.error('Failed to load employees page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load employee data');
        }
    }

    /**
     * Load Enroll Employee page (Admin+)
     */
    async loadEnrollEmployeePage() {
        const container = document.getElementById('enroll-employee');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('enroll-employee');

        try {
            if (!this.app.modules.pages.admin) {
                this.app.modules.pages.admin = new AdminPage(this.app);
            }

            await this.app.modules.pages.admin.loadEnrollEmployee(container);
        } catch (error) {
            console.error('Failed to load enroll employee page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load enrollment form');
        }
    }

    /**
     * Load Attendance Records page (Admin+)
     */
    async loadAttendanceRecordsPage() {
        const container = document.getElementById('attendance-records');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('attendance-records');

        try {
            if (!this.app.modules.pages.attendance) {
                this.app.modules.pages.attendance = new AttendancePage(this.app);
            }

            await this.app.modules.pages.attendance.loadAllAttendance(container);
        } catch (error) {
            console.error('Failed to load attendance records page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load attendance records');
        }
    }

    /**
     * Load Face Embeddings page (Admin+)
     */
    async loadFaceEmbeddingsPage() {
        const container = document.getElementById('face-embeddings');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('face-embeddings');

        try {
            if (!this.app.modules.pages.admin) {
                this.app.modules.pages.admin = new AdminPage(this.app);
            }

            await this.app.modules.pages.admin.loadFaceEmbeddings(container);
        } catch (error) {
            console.error('Failed to load face embeddings page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load face embedding data');
        }
    }

    /**
     * Load Cameras page (Admin+)
     */
    async loadCamerasPage() {
        const container = document.getElementById('cameras');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('cameras');

        try {
            if (!this.app.modules.pages.cameras) {
                this.app.modules.pages.cameras = new CamerasPage(this.app);
            }

            await this.app.modules.pages.cameras.loadCameras(container);
        } catch (error) {
            console.error('Failed to load cameras page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load camera data');
        }
    }

    /**
     * Load System Control page (Admin+)
     */
    async loadSystemControlPage() {
        const container = document.getElementById('system-control');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('system-control');

        try {
            if (!this.app.modules.pages.system) {
                this.app.modules.pages.system = new SystemPage(this.app);
            }

            await this.app.modules.pages.system.loadSystemControl(container);
        } catch (error) {
            console.error('Failed to load system control page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load system control');
        }
    }

    /**
     * Load Live Feed page (Admin+)
     */
    async loadLiveFeedPage() {
        const container = document.getElementById('live-feed');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('live-feed');

        try {
            if (!this.app.modules.pages.system) {
                this.app.modules.pages.system = new SystemPage(this.app);
            }

            await this.app.modules.pages.system.loadLiveFeed(container);
        } catch (error) {
            console.error('Failed to load live feed page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load live feed');
        }
    }

    /**
     * Load User Management page (Super Admin)
     */
    async loadUserManagementPage() {
        const container = document.getElementById('user-management');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('user-management');

        try {
            if (!this.app.modules.pages.superadmin) {
                this.app.modules.pages.superadmin = new SuperAdminPage(this.app);
            }

            await this.app.modules.pages.superadmin.loadUserManagement(container);
        } catch (error) {
            console.error('Failed to load user management page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load user management');
        }
    }

    /**
     * Load Camera Discovery page (Super Admin)
     */
    async loadCameraDiscoveryPage() {
        const container = document.getElementById('camera-discovery');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('camera-discovery');

        try {
            if (!this.app.modules.pages.superadmin) {
                this.app.modules.pages.superadmin = new SuperAdminPage(this.app);
            }

            await this.app.modules.pages.superadmin.loadCameraDiscovery(container);
        } catch (error) {
            console.error('Failed to load camera discovery page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load camera discovery');
        }
    }

    /**
     * Load System Logs page (Super Admin)
     */
    async loadSystemLogsPage() {
        const container = document.getElementById('system-logs');
        container.innerHTML = this.getLoadingHTML();
        this.showContentPage('system-logs');

        try {
            if (!this.app.modules.pages.superadmin) {
                this.app.modules.pages.superadmin = new SuperAdminPage(this.app);
            }

            await this.app.modules.pages.superadmin.loadSystemLogs(container);
        } catch (error) {
            console.error('Failed to load system logs page:', error);
            container.innerHTML = this.getErrorHTML('Failed to load system logs');
        }
    }

    /**
     * Get loading HTML template
     */
    getLoadingHTML() {
        return `
            <div class="content-card">
                <div class="table-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        `;
    }

    /**
     * Get error HTML template
     */
    getErrorHTML(message) {
        return `
            <div class="content-card">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Retry
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Go back to previous page
     */
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current page
            const previousPage = this.history[this.history.length - 1];
            this.navigateTo(previousPage);
        } else {
            this.navigateTo('dashboard-home');
        }
    }

    /**
     * Get current page ID
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Refresh current page
     */
    refresh() {
        if (this.currentPage) {
            this.navigateTo(this.currentPage, false);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}