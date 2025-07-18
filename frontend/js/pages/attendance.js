/**
 * Attendance Page Module
 * Handles attendance tracking, records, and reporting
 */

class AttendancePage {
    constructor(app) {
        this.app = app;
        this.api = app.getAPI();
        this.ui = app.getUI();
    }

    /**
     * Load All Attendance Records page
     */
    async loadAllAttendance(container) {
        try {
            const attendanceData = await this.api.getAllAttendance();
            
            const html = `
                <div class="page-header">
                    <h1>Attendance Records</h1>
                    <p>View and manage employee attendance records</p>
                    <div class="page-actions">
                        <button id="export-attendance" class="btn btn-primary">
                            <i class="fas fa-download"></i>
                            Export Records
                        </button>
                        <button id="generate-report" class="btn btn-secondary">
                            <i class="fas fa-chart-bar"></i>
                            Generate Report
                        </button>
                        <button id="manual-entry" class="btn btn-info">
                            <i class="fas fa-plus"></i>
                            Manual Entry
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="filters-container">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>Employee</label>
                                <select id="employee-filter" class="form-control">
                                    <option value="">All Employees</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Department</label>
                                <select id="department-filter" class="form-control">
                                    <option value="">All Departments</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Start Date</label>
                                <input type="date" id="start-date" class="form-control">
                            </div>
                            <div class="filter-group">
                                <label>End Date</label>
                                <input type="date" id="end-date" class="form-control">
                            </div>
                            <div class="filter-group">
                                <label>Status</label>
                                <select id="status-filter" class="form-control">
                                    <option value="">All Status</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="early_leave">Early Leave</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>&nbsp;</label>
                                <button id="apply-filters" class="btn btn-primary">
                                    <i class="fas fa-filter"></i>
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="attendance-dashboard">
                    <div class="dashboard-row">
                        <div id="attendance-stats"></div>
                        <div id="attendance-chart" class="chart-container"></div>
                    </div>
                </div>

                <div id="attendance-table"></div>

                <!-- Manual Entry Modal -->
                <div id="manual-entry-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Manual Attendance Entry</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <form id="manual-entry-form" class="modal-body">
                            <div class="form-group">
                                <label for="manual-employee">Employee *</label>
                                <select id="manual-employee" name="employee_id" class="form-control" required>
                                    <option value="">Select Employee</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="manual-date">Date *</label>
                                <input type="date" id="manual-date" name="date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="manual-check-in">Check In Time</label>
                                <input type="time" id="manual-check-in" name="check_in" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="manual-check-out">Check Out Time</label>
                                <input type="time" id="manual-check-out" name="check_out" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="manual-status">Status *</label>
                                <select id="manual-status" name="status" class="form-control" required>
                                    <option value="">Select Status</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="early_leave">Early Leave</option>
                                    <option value="half_day">Half Day</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="manual-notes">Notes</label>
                                <textarea id="manual-notes" name="notes" class="form-control" rows="3" placeholder="Optional notes..."></textarea>
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                            <button type="submit" form="manual-entry-form" class="btn btn-primary">Save Entry</button>
                        </div>
                    </div>
                </div>

                <!-- Report Generation Modal -->
                <div id="report-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Generate Attendance Report</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <form id="report-form" class="modal-body">
                            <div class="form-group">
                                <label for="report-type">Report Type *</label>
                                <select id="report-type" name="report_type" class="form-control" required>
                                    <option value="">Select Report Type</option>
                                    <option value="daily">Daily Summary</option>
                                    <option value="monthly">Monthly Summary</option>
                                    <option value="employee">Employee Report</option>
                                    <option value="department">Department Report</option>
                                    <option value="detailed">Detailed Report</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="report-start-date">Start Date *</label>
                                <input type="date" id="report-start-date" name="start_date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="report-end-date">End Date *</label>
                                <input type="date" id="report-end-date" name="end_date" class="form-control" required>
                            </div>
                            <div class="form-group" id="report-employee-group" style="display: none;">
                                <label for="report-employee">Employee</label>
                                <select id="report-employee" name="employee_id" class="form-control">
                                    <option value="">Select Employee</option>
                                </select>
                            </div>
                            <div class="form-group" id="report-department-group" style="display: none;">
                                <label for="report-department">Department</label>
                                <select id="report-department" name="department" class="form-control">
                                    <option value="">Select Department</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="report-format">Format *</label>
                                <select id="report-format" name="format" class="form-control" required>
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                            <button type="submit" form="report-form" class="btn btn-primary">Generate Report</button>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Load attendance dashboard
            this.loadAttendanceDashboard(attendanceData);

            // Load attendance table
            this.loadAttendanceTable(attendanceData.attendance_records);

            // Populate filter dropdowns
            this.populateFilterDropdowns(attendanceData);

            // Setup event handlers
            this.setupAttendanceHandlers(container);

        } catch (error) {
            console.error('Failed to load attendance records:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load attendance data');
        }
    }

    /**
     * Load attendance dashboard with stats and charts
     */
    loadAttendanceDashboard(data) {
        // Load stats
        this.loadAttendanceStats(data);
        
        // Load chart
        this.loadAttendanceChart(data);
    }

    /**
     * Load attendance statistics
     */
    loadAttendanceStats(data) {
        const records = data.attendance_records || [];
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate stats
        const totalRecords = records.length;
        const presentToday = records.filter(r => r.date === today && r.status === 'present').length;
        const absentToday = records.filter(r => r.date === today && r.status === 'absent').length;
        const lateToday = records.filter(r => r.date === today && r.status === 'late').length;
        
        // This month stats
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthRecords = records.filter(r => r.date.startsWith(thisMonth));
        const avgAttendance = thisMonthRecords.length > 0 ? 
            Math.round((thisMonthRecords.filter(r => r.status === 'present').length / thisMonthRecords.length) * 100) : 0;

        const stats = [
            { label: 'Present Today', value: presentToday, color: 'success' },
            { label: 'Absent Today', value: absentToday, color: 'danger' },
            { label: 'Late Today', value: lateToday, color: 'warning' },
            { label: 'This Month Avg', value: `${avgAttendance}%`, color: 'info' }
        ];

        const statsContainer = document.getElementById('attendance-stats');
        this.ui.createStatsGrid(statsContainer, stats);
    }

    /**
     * Load attendance chart
     */
    loadAttendanceChart(data) {
        const chartContainer = document.getElementById('attendance-chart');
        
        // Create a simple chart representation
        chartContainer.innerHTML = `
            <div class="chart-header">
                <h3>Weekly Attendance Trend</h3>
            </div>
            <div class="chart-placeholder">
                <i class="fas fa-chart-line"></i>
                <p>Chart visualization would be displayed here</p>
                <small>Integration with Chart.js or similar library needed</small>
            </div>
        `;
    }

    /**
     * Load attendance table
     */
    loadAttendanceTable(records) {
        const columns = [
            { key: 'date', label: 'Date', render: (value) => new Date(value).toLocaleDateString() },
            { key: 'employee_name', label: 'Employee' },
            { key: 'employee_id', label: 'ID' },
            { key: 'department', label: 'Department' },
            { key: 'check_in', label: 'Check In', render: (value) => value || '-' },
            { key: 'check_out', label: 'Check Out', render: (value) => value || '-' },
            { key: 'hours_worked', label: 'Hours', render: (value) => value ? `${value}h` : '-' },
            { key: 'status', label: 'Status', render: (value) => `<span class="status-badge status-${value}">${value.replace('_', ' ')}</span>` },
            { key: 'actions', label: 'Actions', render: (value, row) => `
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary edit-attendance" data-id="${row.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info view-details" data-id="${row.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            ` }
        ];

        const tableContainer = document.getElementById('attendance-table');
        this.ui.createDataTable(tableContainer, records, columns, {
            searchable: true,
            sortable: true,
            pagination: true,
            pageSize: 50
        });
    }

    /**
     * Populate filter dropdowns
     */
    populateFilterDropdowns(data) {
        const employees = data.employees || [];
        const departments = [...new Set(employees.map(emp => emp.department))];

        // Populate employee filter
        const employeeFilter = document.getElementById('employee-filter');
        if (employeeFilter) {
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.employee_id;
                option.textContent = `${emp.name} (${emp.employee_id})`;
                employeeFilter.appendChild(option);
            });
        }

        // Populate department filter
        const departmentFilter = document.getElementById('department-filter');
        if (departmentFilter) {
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                departmentFilter.appendChild(option);
            });
        }

        // Populate modal selects
        this.populateModalSelects(employees, departments);
    }

    /**
     * Populate modal select elements
     */
    populateModalSelects(employees, departments) {
        // Manual entry employee select
        const manualEmployeeSelect = document.getElementById('manual-employee');
        if (manualEmployeeSelect) {
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.employee_id;
                option.textContent = `${emp.name} (${emp.employee_id})`;
                manualEmployeeSelect.appendChild(option);
            });
        }

        // Report employee select
        const reportEmployeeSelect = document.getElementById('report-employee');
        if (reportEmployeeSelect) {
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.employee_id;
                option.textContent = `${emp.name} (${emp.employee_id})`;
                reportEmployeeSelect.appendChild(option);
            });
        }

        // Report department select
        const reportDepartmentSelect = document.getElementById('report-department');
        if (reportDepartmentSelect) {
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                reportDepartmentSelect.appendChild(option);
            });
        }
    }

    /**
     * Setup event handlers
     */
    setupAttendanceHandlers(container) {
        // Export button
        const exportBtn = container.querySelector('#export-attendance');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.exportAttendance.bind(this));
        }

        // Generate report button
        const reportBtn = container.querySelector('#generate-report');
        if (reportBtn) {
            reportBtn.addEventListener('click', this.showReportModal.bind(this));
        }

        // Manual entry button
        const manualBtn = container.querySelector('#manual-entry');
        if (manualBtn) {
            manualBtn.addEventListener('click', this.showManualEntryModal.bind(this));
        }

        // Apply filters button
        const applyFiltersBtn = container.querySelector('#apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', this.applyFilters.bind(this));
        }

        // Modal forms
        const manualForm = container.querySelector('#manual-entry-form');
        if (manualForm) {
            manualForm.addEventListener('submit', this.handleManualEntry.bind(this));
        }

        const reportForm = container.querySelector('#report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', this.handleReportGeneration.bind(this));
        }

        // Report type change handler
        const reportTypeSelect = container.querySelector('#report-type');
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', this.handleReportTypeChange.bind(this));
        }

        // Modal controls
        this.ui.setupModalControls(container.querySelector('#manual-entry-modal'));
        this.ui.setupModalControls(container.querySelector('#report-modal'));

        // Table action buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-attendance')) {
                const recordId = e.target.dataset.id;
                this.editAttendanceRecord(recordId);
            } else if (e.target.classList.contains('view-details')) {
                const recordId = e.target.dataset.id;
                this.viewAttendanceDetails(recordId);
            }
        });
    }

    /**
     * Event handlers and utility methods
     */
    showManualEntryModal() {
        const modal = document.getElementById('manual-entry-modal');
        if (modal) {
            modal.style.display = 'block';
            // Set today's date as default
            const dateInput = modal.querySelector('#manual-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    showReportModal() {
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.style.display = 'block';
            // Set default date range (last 30 days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const startInput = modal.querySelector('#report-start-date');
            const endInput = modal.querySelector('#report-end-date');
            if (startInput) startInput.value = startDate.toISOString().split('T')[0];
            if (endInput) endInput.value = endDate.toISOString().split('T')[0];
        }
    }

    handleReportTypeChange(e) {
        const reportType = e.target.value;
        const employeeGroup = document.getElementById('report-employee-group');
        const departmentGroup = document.getElementById('report-department-group');

        // Show/hide relevant fields based on report type
        if (employeeGroup && departmentGroup) {
            employeeGroup.style.display = reportType === 'employee' ? 'block' : 'none';
            departmentGroup.style.display = reportType === 'department' ? 'block' : 'none';
        }
    }

    async handleManualEntry(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('Manual entry data:', Object.fromEntries(formData));
        // Implementation for manual entry
    }

    async handleReportGeneration(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('Report generation data:', Object.fromEntries(formData));
        // Implementation for report generation
    }

    async applyFilters() {
        console.log('Apply attendance filters');
        // Implementation for applying filters
    }

    async exportAttendance() {
        console.log('Export attendance records');
        // Implementation for exporting attendance
    }

    async editAttendanceRecord(recordId) {
        console.log('Edit attendance record:', recordId);
        // Implementation for editing attendance record
    }

    async viewAttendanceDetails(recordId) {
        console.log('View attendance details:', recordId);
        // Implementation for viewing attendance details
    }
}