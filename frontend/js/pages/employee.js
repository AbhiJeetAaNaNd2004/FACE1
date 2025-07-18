/**
 * Employee Page Module
 * Handles employee-level functionality and views
 */

class EmployeePage {
    constructor(app) {
        this.app = app;
        this.api = app.getAPI();
        this.ui = app.getUI();
    }

    /**
     * Load My Attendance page
     */
    async loadMyAttendance(container) {
        try {
            const attendanceData = await this.api.getMyAttendance();
            
            const html = `
                <div class="page-header">
                    <h1>My Attendance</h1>
                    <p>View your attendance history and records</p>
                </div>

                <div class="content-card">
                    <div class="filters-container">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>Start Date</label>
                                <input type="date" id="start-date" class="form-control">
                            </div>
                            <div class="filter-group">
                                <label>End Date</label>
                                <input type="date" id="end-date" class="form-control">
                            </div>
                            <div class="filter-group">
                                <label>&nbsp;</label>
                                <button id="filter-attendance" class="btn btn-primary">
                                    <i class="fas fa-filter"></i>
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="attendance-stats"></div>
                <div id="attendance-table"></div>
            `;

            container.innerHTML = html;

            // Load attendance stats
            this.loadAttendanceStats(attendanceData);

            // Load attendance table
            this.loadAttendanceTable(attendanceData.attendance_logs);

            // Setup filter handler
            this.setupAttendanceFilters(container);

        } catch (error) {
            console.error('Failed to load my attendance:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load attendance data');
        }
    }

    /**
     * Load attendance statistics
     */
    loadAttendanceStats(data) {
        const attendanceLogs = data.attendance_logs || [];
        const totalDays = attendanceLogs.length;
        const presentDays = attendanceLogs.filter(log => log.status === 'present').length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // Calculate this month's stats
        const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const thisMonthLogs = attendanceLogs.filter(log => 
            log.timestamp.startsWith(thisMonth)
        );
        const thisMonthPresent = thisMonthLogs.filter(log => log.status === 'present').length;

        const stats = [
            { label: 'Total Records', value: totalDays },
            { label: 'Present Days', value: presentDays },
            { label: 'Attendance Rate', value: `${attendanceRate}%` },
            { label: 'This Month', value: thisMonthPresent }
        ];

        const statsContainer = document.getElementById('attendance-stats');
        this.ui.createStatsGrid(statsContainer, stats);
    }

    /**
     * Load attendance table
     */
    loadAttendanceTable(attendanceLogs) {
        const columns = [
            { key: 'timestamp', label: 'Date & Time', type: 'datetime' },
            { key: 'status', label: 'Status', type: 'status' },
            { key: 'confidence_score', label: 'Confidence', type: 'text' },
            { key: 'notes', label: 'Notes', type: 'text' }
        ];

        const tableContainer = document.getElementById('attendance-table');
        
        this.ui.createDataTable(tableContainer, {
            title: 'Attendance Records',
            data: attendanceLogs,
            columns: columns,
            searchable: true,
            sortable: true,
            pagination: true,
            pageSize: 15
        });
    }

    /**
     * Setup attendance filters
     */
    setupAttendanceFilters(container) {
        const filterBtn = container.querySelector('#filter-attendance');
        const startDateInput = container.querySelector('#start-date');
        const endDateInput = container.querySelector('#end-date');

        filterBtn.addEventListener('click', async () => {
            try {
                this.ui.showLoadingModal('Filtering attendance...');

                const startDate = startDateInput.value || null;
                const endDate = endDateInput.value || null;

                const attendanceData = await this.api.getMyAttendance(startDate, endDate);
                
                // Update stats and table
                this.loadAttendanceStats(attendanceData);
                this.loadAttendanceTable(attendanceData.attendance_logs);

                this.ui.hideLoadingModal();
                this.app.showNotification('Attendance data filtered successfully', 'success');

            } catch (error) {
                console.error('Failed to filter attendance:', error);
                this.ui.hideLoadingModal();
                this.app.showNotification('Failed to filter attendance data', 'error');
            }
        });
    }

    /**
     * Load My Profile page
     */
    async loadMyProfile(container) {
        try {
            const user = this.app.getCurrentUser();
            
            if (!user.employee_id) {
                container.innerHTML = `
                    <div class="content-card">
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="fas fa-user-times"></i>
                            </div>
                            <h3>No Employee Profile</h3>
                            <p>Your account is not linked to an employee profile.</p>
                        </div>
                    </div>
                `;
                return;
            }

            const employee = await this.api.getEmployee(user.employee_id);
            
            const html = `
                <div class="page-header">
                    <h1>My Profile</h1>
                    <p>View and manage your employee profile information</p>
                </div>

                <div class="content-card">
                    <h2>Personal Information</h2>
                    <div class="profile-info">
                        <div class="form-grid">
                            <div class="info-item">
                                <label>Employee ID</label>
                                <span>${employee.employee_id}</span>
                            </div>
                            <div class="info-item">
                                <label>Full Name</label>
                                <span>${employee.name}</span>
                            </div>
                            <div class="info-item">
                                <label>Department</label>
                                <span>${employee.department}</span>
                            </div>
                            <div class="info-item">
                                <label>Job Role</label>
                                <span>${employee.role}</span>
                            </div>
                            <div class="info-item">
                                <label>Date Joined</label>
                                <span>${this.ui.formatDate(employee.date_joined)}</span>
                            </div>
                            <div class="info-item">
                                <label>Email</label>
                                <span>${employee.email || 'Not provided'}</span>
                            </div>
                            <div class="info-item">
                                <label>Phone</label>
                                <span>${employee.phone || 'Not provided'}</span>
                            </div>
                            <div class="info-item">
                                <label>Status</label>
                                <span class="status-badge ${employee.is_active ? 'active' : 'inactive'}">
                                    ${employee.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <h2>Account Information</h2>
                    <div class="profile-info">
                        <div class="form-grid">
                            <div class="info-item">
                                <label>Username</label>
                                <span>${user.username}</span>
                            </div>
                            <div class="info-item">
                                <label>Role</label>
                                <span class="status-badge configured">${user.role.replace('_', ' ').toUpperCase()}</span>
                            </div>
                            <div class="info-item">
                                <label>Account Status</label>
                                <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                                    ${user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="recent-attendance"></div>
            `;

            container.innerHTML = html;

            // Load recent attendance
            await this.loadRecentAttendance();

        } catch (error) {
            console.error('Failed to load my profile:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load profile data');
        }
    }

    /**
     * Load recent attendance for profile page
     */
    async loadRecentAttendance() {
        try {
            const attendanceData = await this.api.getMyAttendance();
            const recentLogs = attendanceData.attendance_logs.slice(0, 5);

            const columns = [
                { key: 'timestamp', label: 'Date & Time', type: 'datetime' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'confidence_score', label: 'Confidence', type: 'text' }
            ];

            const container = document.getElementById('recent-attendance');
            
            const html = `
                <div class="content-card">
                    <h2>Recent Attendance</h2>
                    <div id="recent-attendance-table"></div>
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="btn btn-secondary" onclick="window.app.getRouter().navigateTo('my-attendance')">
                            <i class="fas fa-eye"></i>
                            View All Attendance
                        </button>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            const tableContainer = container.querySelector('#recent-attendance-table');
            
            this.ui.createDataTable(tableContainer, {
                title: '',
                data: recentLogs,
                columns: columns,
                searchable: false,
                sortable: false,
                pagination: false
            });

        } catch (error) {
            console.error('Failed to load recent attendance:', error);
            // Don't show error for recent attendance as it's supplementary
        }
    }

    /**
     * Load Present Employees page
     */
    async loadPresentEmployees(container) {
        try {
            const presentData = await this.api.getPresentEmployees();
            
            const html = `
                <div class="page-header">
                    <h1>Present Today</h1>
                    <p>Employees currently present in the office</p>
                </div>

                <div id="present-stats"></div>
                <div id="present-employees-table"></div>
            `;

            container.innerHTML = html;

            // Load present employees stats
            this.loadPresentStats(presentData);

            // Load present employees table
            this.loadPresentEmployeesTable(presentData.present_employees);

        } catch (error) {
            console.error('Failed to load present employees:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load present employees data');
        }
    }

    /**
     * Load present employees statistics
     */
    loadPresentStats(data) {
        const totalPresent = data.total_count || 0;
        const currentTime = new Date().toLocaleTimeString();
        
        const stats = [
            { label: 'Total Present', value: totalPresent },
            { label: 'Last Updated', value: currentTime },
            { label: 'Status', value: 'Live' }
        ];

        const statsContainer = document.getElementById('present-stats');
        this.ui.createStatsGrid(statsContainer, stats);
    }

    /**
     * Load present employees table
     */
    loadPresentEmployeesTable(employees) {
        const columns = [
            { key: 'employee_id', label: 'Employee ID', type: 'text' },
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'department', label: 'Department', type: 'text' },
            { key: 'role', label: 'Job Role', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' }
        ];

        const tableContainer = document.getElementById('present-employees-table');
        
        this.ui.createDataTable(tableContainer, {
            title: 'Present Employees',
            data: employees,
            columns: columns,
            searchable: true,
            sortable: true,
            pagination: true,
            pageSize: 20,
            actions: [
                {
                    id: 'refresh',
                    label: 'Refresh',
                    icon: 'fas fa-sync-alt',
                    class: 'btn-primary'
                }
            ],
            onAction: this.handlePresentEmployeesAction.bind(this)
        });
    }

    /**
     * Handle present employees table actions
     */
    async handlePresentEmployeesAction(action, id, button) {
        if (action === 'refresh') {
            try {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

                const presentData = await this.api.getPresentEmployees();
                
                // Update stats and table
                this.loadPresentStats(presentData);
                this.loadPresentEmployeesTable(presentData.present_employees);

                this.app.showNotification('Present employees list refreshed', 'success');

            } catch (error) {
                console.error('Failed to refresh present employees:', error);
                this.app.showNotification('Failed to refresh data', 'error');
            } finally {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            }
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmployeePage;
}