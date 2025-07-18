/**
 * Super Admin Page Module
 * Handles super admin-level functionality and system management
 */

class SuperAdminPage {
    constructor(app) {
        this.app = app;
        this.api = app.getAPI();
        this.ui = app.getUI();
    }

    /**
     * Load User Management page
     */
    async loadUserManagement(container) {
        try {
            const usersData = await this.api.getUsers();
            
            const html = `
                <div class="page-header">
                    <h1>User Management</h1>
                    <p>Manage system users and permissions</p>
                    <div class="page-actions">
                        <button id="add-user" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Add User
                        </button>
                        <button id="bulk-user-import" class="btn btn-secondary">
                            <i class="fas fa-upload"></i>
                            Bulk Import
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="filters-container">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>Search</label>
                                <input type="text" id="user-search" class="form-control" placeholder="Search by username or email">
                            </div>
                            <div class="filter-group">
                                <label>Role</label>
                                <select id="role-filter" class="form-control">
                                    <option value="">All Roles</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Status</label>
                                <select id="user-status-filter" class="form-control">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="locked">Locked</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="users-stats"></div>
                <div id="users-table"></div>

                <!-- Add User Modal -->
                <div id="add-user-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Add New User</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <form id="add-user-form" class="modal-body">
                            <div class="form-group">
                                <label for="new-username">Username *</label>
                                <input type="text" id="new-username" name="username" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="new-email">Email *</label>
                                <input type="email" id="new-email" name="email" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="new-password">Password *</label>
                                <input type="password" id="new-password" name="password" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="new-role">Role *</label>
                                <select id="new-role" name="role" class="form-control" required>
                                    <option value="">Select Role</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="new-employee-id">Link to Employee ID</label>
                                <input type="text" id="new-employee-id" name="employee_id" class="form-control" placeholder="Optional">
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                            <button type="submit" form="add-user-form" class="btn btn-primary">Create User</button>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Load user stats
            this.loadUserStats(usersData);

            // Load users table
            this.loadUsersTable(usersData.users);

            // Setup event handlers
            this.setupUserManagementHandlers(container);

        } catch (error) {
            console.error('Failed to load user management:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load user management data');
        }
    }

    /**
     * Load Camera Discovery page
     */
    async loadCameraDiscovery(container) {
        try {
            const html = `
                <div class="page-header">
                    <h1>Camera Discovery</h1>
                    <p>Discover and configure network cameras</p>
                    <div class="page-actions">
                        <button id="scan-network" class="btn btn-primary">
                            <i class="fas fa-search"></i>
                            Scan Network
                        </button>
                        <button id="add-manual-camera" class="btn btn-secondary">
                            <i class="fas fa-plus"></i>
                            Add Manually
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="scan-controls">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ip-range">IP Range</label>
                                <input type="text" id="ip-range" class="form-control" value="192.168.1.1-192.168.1.254" placeholder="e.g., 192.168.1.1-192.168.1.254">
                            </div>
                            <div class="form-group">
                                <label for="port-range">Port Range</label>
                                <input type="text" id="port-range" class="form-control" value="80,8080,554,1935" placeholder="e.g., 80,8080,554">
                            </div>
                            <div class="form-group">
                                <label for="scan-timeout">Timeout (ms)</label>
                                <input type="number" id="scan-timeout" class="form-control" value="5000" min="1000" max="30000">
                            </div>
                        </div>
                    </div>
                </div>

                <div id="discovery-status" class="status-card" style="display: none;">
                    <div class="status-header">
                        <h3>Scanning Network...</h3>
                        <div class="progress-bar">
                            <div id="scan-progress" class="progress-fill"></div>
                        </div>
                    </div>
                    <div id="scan-details" class="status-details"></div>
                </div>

                <div id="discovered-cameras"></div>

                <!-- Manual Camera Modal -->
                <div id="manual-camera-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Add Camera Manually</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <form id="manual-camera-form" class="modal-body">
                            <div class="form-group">
                                <label for="camera-name">Camera Name *</label>
                                <input type="text" id="camera-name" name="name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="camera-ip">IP Address *</label>
                                <input type="text" id="camera-ip" name="ip" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="camera-port">Port</label>
                                <input type="number" id="camera-port" name="port" class="form-control" value="80">
                            </div>
                            <div class="form-group">
                                <label for="camera-username">Username</label>
                                <input type="text" id="camera-username" name="username" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="camera-password">Password</label>
                                <input type="password" id="camera-password" name="password" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="camera-stream-url">Stream URL</label>
                                <input type="text" id="camera-stream-url" name="stream_url" class="form-control" placeholder="e.g., /stream, /video">
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                            <button type="button" id="test-camera" class="btn btn-info">Test Connection</button>
                            <button type="submit" form="manual-camera-form" class="btn btn-primary">Add Camera</button>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            this.setupCameraDiscoveryHandlers(container);

        } catch (error) {
            console.error('Failed to load camera discovery:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load camera discovery');
        }
    }

    /**
     * Load System Logs page
     */
    async loadSystemLogs(container) {
        try {
            const logsData = await this.api.getSystemLogs();
            
            const html = `
                <div class="page-header">
                    <h1>System Logs</h1>
                    <p>View and monitor system activity logs</p>
                    <div class="page-actions">
                        <button id="refresh-logs" class="btn btn-primary">
                            <i class="fas fa-sync"></i>
                            Refresh
                        </button>
                        <button id="export-logs" class="btn btn-secondary">
                            <i class="fas fa-download"></i>
                            Export
                        </button>
                        <button id="clear-logs" class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                            Clear Logs
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="filters-container">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>Log Level</label>
                                <select id="log-level-filter" class="form-control">
                                    <option value="">All Levels</option>
                                    <option value="error">Error</option>
                                    <option value="warning">Warning</option>
                                    <option value="info">Info</option>
                                    <option value="debug">Debug</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Module</label>
                                <select id="module-filter" class="form-control">
                                    <option value="">All Modules</option>
                                    <option value="auth">Authentication</option>
                                    <option value="face_detection">Face Detection</option>
                                    <option value="camera">Camera</option>
                                    <option value="attendance">Attendance</option>
                                    <option value="system">System</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Date Range</label>
                                <input type="date" id="start-date" class="form-control">
                            </div>
                            <div class="filter-group">
                                <label>&nbsp;</label>
                                <input type="date" id="end-date" class="form-control">
                            </div>
                        </div>
                    </div>
                </div>

                <div id="logs-stats"></div>
                <div id="logs-container">
                    <div class="logs-viewer">
                        <div class="logs-header">
                            <div class="auto-refresh">
                                <label>
                                    <input type="checkbox" id="auto-refresh"> Auto Refresh (10s)
                                </label>
                            </div>
                        </div>
                        <div id="logs-content" class="logs-content"></div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Load logs stats
            this.loadLogsStats(logsData);

            // Load logs content
            this.loadLogsContent(logsData.logs);

            // Setup event handlers
            this.setupSystemLogsHandlers(container);

        } catch (error) {
            console.error('Failed to load system logs:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load system logs');
        }
    }

    /**
     * Load user statistics
     */
    loadUserStats(data) {
        const users = data.users || [];
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.status === 'active').length;
        const adminUsers = users.filter(user => user.role === 'admin' || user.role === 'super_admin').length;
        const linkedUsers = users.filter(user => user.employee_id).length;

        const stats = [
            { label: 'Total Users', value: totalUsers },
            { label: 'Active', value: activeUsers },
            { label: 'Admins', value: adminUsers },
            { label: 'Linked to Employees', value: linkedUsers }
        ];

        const statsContainer = document.getElementById('users-stats');
        this.ui.createStatsGrid(statsContainer, stats);
    }

    /**
     * Load users table
     */
    loadUsersTable(users) {
        const columns = [
            { key: 'username', label: 'Username' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (value) => `<span class="role-badge role-${value.replace('_', '-')}">${value.replace('_', ' ')}</span>` },
            { key: 'status', label: 'Status', render: (value) => `<span class="status-badge status-${value}">${value}</span>` },
            { key: 'employee_id', label: 'Employee ID', render: (value) => value || '-' },
            { key: 'last_login', label: 'Last Login', render: (value) => value ? new Date(value).toLocaleDateString() : 'Never' },
            { key: 'actions', label: 'Actions', render: (value, row) => `
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary edit-user" data-id="${row.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning reset-password" data-id="${row.id}">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${row.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` }
        ];

        const tableContainer = document.getElementById('users-table');
        this.ui.createDataTable(tableContainer, users, columns, {
            searchable: true,
            sortable: true,
            pagination: true
        });
    }

    /**
     * Setup user management handlers
     */
    setupUserManagementHandlers(container) {
        // Add user button
        const addUserBtn = container.querySelector('#add-user');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showAddUserModal();
            });
        }

        // Add user form
        const addUserForm = container.querySelector('#add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', this.handleAddUser.bind(this));
        }

        // Modal controls
        this.ui.setupModalControls(container.querySelector('#add-user-modal'));

        // Action buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-user')) {
                const userId = e.target.dataset.id;
                this.editUser(userId);
            } else if (e.target.classList.contains('reset-password')) {
                const userId = e.target.dataset.id;
                this.resetUserPassword(userId);
            } else if (e.target.classList.contains('delete-user')) {
                const userId = e.target.dataset.id;
                this.deleteUser(userId);
            }
        });
    }

    /**
     * Setup camera discovery handlers
     */
    setupCameraDiscoveryHandlers(container) {
        // Scan network button
        const scanBtn = container.querySelector('#scan-network');
        if (scanBtn) {
            scanBtn.addEventListener('click', this.startNetworkScan.bind(this));
        }

        // Add manual camera button
        const addManualBtn = container.querySelector('#add-manual-camera');
        if (addManualBtn) {
            addManualBtn.addEventListener('click', this.showManualCameraModal.bind(this));
        }

        // Manual camera form
        const manualForm = container.querySelector('#manual-camera-form');
        if (manualForm) {
            manualForm.addEventListener('submit', this.handleAddManualCamera.bind(this));
        }

        // Test camera button
        const testBtn = container.querySelector('#test-camera');
        if (testBtn) {
            testBtn.addEventListener('click', this.testCameraConnection.bind(this));
        }

        // Modal controls
        this.ui.setupModalControls(container.querySelector('#manual-camera-modal'));
    }

    /**
     * Setup system logs handlers
     */
    setupSystemLogsHandlers(container) {
        // Refresh logs button
        const refreshBtn = container.querySelector('#refresh-logs');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadSystemLogs(container);
            });
        }

        // Auto refresh checkbox
        const autoRefreshCheckbox = container.querySelector('#auto-refresh');
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.addEventListener('change', this.toggleAutoRefresh.bind(this));
        }

        // Export logs button
        const exportBtn = container.querySelector('#export-logs');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.exportLogs.bind(this));
        }

        // Clear logs button
        const clearBtn = container.querySelector('#clear-logs');
        if (clearBtn) {
            clearBtn.addEventListener('click', this.clearLogs.bind(this));
        }
    }

    /**
     * Utility methods and handlers
     */
    showAddUserModal() {
        const modal = document.getElementById('add-user-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    async handleAddUser(e) {
        e.preventDefault();
        console.log('Add user');
    }

    async editUser(userId) {
        console.log('Edit user:', userId);
    }

    async resetUserPassword(userId) {
        console.log('Reset password for user:', userId);
    }

    async deleteUser(userId) {
        console.log('Delete user:', userId);
    }

    showManualCameraModal() {
        const modal = document.getElementById('manual-camera-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    async handleAddManualCamera(e) {
        e.preventDefault();
        console.log('Add manual camera');
    }

    async testCameraConnection() {
        console.log('Test camera connection');
    }

    async startNetworkScan() {
        console.log('Start network scan');
    }

    loadLogsStats(data) {
        console.log('Load logs stats:', data);
    }

    loadLogsContent(logs) {
        console.log('Load logs content:', logs);
    }

    toggleAutoRefresh(e) {
        console.log('Toggle auto refresh:', e.target.checked);
    }

    async exportLogs() {
        console.log('Export logs');
    }

    async clearLogs() {
        console.log('Clear logs');
    }
}