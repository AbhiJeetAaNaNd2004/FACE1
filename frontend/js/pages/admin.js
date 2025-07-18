/**
 * Admin Page Module
 * Handles admin-level functionality and views
 */

class AdminPage {
    constructor(app) {
        this.app = app;
        this.api = app.getAPI();
        this.ui = app.getUI();
    }

    /**
     * Load Employees page
     */
    async loadEmployees(container) {
        try {
            const employeesData = await this.api.getEmployees();
            
            const html = `
                <div class="page-header">
                    <h1>Employee Management</h1>
                    <p>Manage employee records and information</p>
                    <div class="page-actions">
                        <button id="add-employee" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Add Employee
                        </button>
                        <button id="bulk-import" class="btn btn-secondary">
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
                                <input type="text" id="employee-search" class="form-control" placeholder="Search by name or ID">
                            </div>
                            <div class="filter-group">
                                <label>Department</label>
                                <select id="department-filter" class="form-control">
                                    <option value="">All Departments</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Status</label>
                                <select id="status-filter" class="form-control">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="employees-stats"></div>
                <div id="employees-table"></div>
            `;

            container.innerHTML = html;

            // Load employee stats
            this.loadEmployeeStats(employeesData);

            // Load employees table
            this.loadEmployeesTable(employeesData.employees);

            // Setup event handlers
            this.setupEmployeePageHandlers(container);

        } catch (error) {
            console.error('Failed to load employees:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load employee data');
        }
    }

    /**
     * Load employee statistics
     */
    loadEmployeeStats(data) {
        const employees = data.employees || [];
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(emp => emp.status === 'active').length;
        const enrolledEmployees = employees.filter(emp => emp.face_enrolled).length;
        const departments = [...new Set(employees.map(emp => emp.department))].length;

        const stats = [
            { label: 'Total Employees', value: totalEmployees },
            { label: 'Active', value: activeEmployees },
            { label: 'Face Enrolled', value: enrolledEmployees },
            { label: 'Departments', value: departments }
        ];

        const statsContainer = document.getElementById('employees-stats');
        this.ui.createStatsGrid(statsContainer, stats);
    }

    /**
     * Load employees table
     */
    loadEmployeesTable(employees) {
        const columns = [
            { key: 'employee_id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'department', label: 'Department' },
            { key: 'position', label: 'Position' },
            { key: 'status', label: 'Status', render: (value) => `<span class="status-badge status-${value}">${value}</span>` },
            { key: 'face_enrolled', label: 'Face Enrolled', render: (value) => value ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>' },
            { key: 'actions', label: 'Actions', render: (value, row) => `
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary edit-employee" data-id="${row.employee_id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info view-employee" data-id="${row.employee_id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-employee" data-id="${row.employee_id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` }
        ];

        const tableContainer = document.getElementById('employees-table');
        this.ui.createDataTable(tableContainer, employees, columns, {
            searchable: true,
            sortable: true,
            pagination: true
        });
    }

    /**
     * Load Enroll Employee page
     */
    async loadEnrollEmployee(container) {
        try {
            const html = `
                <div class="page-header">
                    <h1>Enroll Employee</h1>
                    <p>Add new employee and capture face data</p>
                </div>

                <div class="content-card">
                    <form id="enroll-employee-form" class="form-grid">
                        <div class="form-section">
                            <h3>Personal Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="employee-id">Employee ID *</label>
                                    <input type="text" id="employee-id" name="employee_id" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="full-name">Full Name *</label>
                                    <input type="text" id="full-name" name="name" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="email">Email *</label>
                                    <input type="email" id="email" name="email" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Phone</label>
                                    <input type="tel" id="phone" name="phone" class="form-control">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="department">Department *</label>
                                    <select id="department" name="department" class="form-control" required>
                                        <option value="">Select Department</option>
                                        <option value="IT">IT</option>
                                        <option value="HR">HR</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="position">Position *</label>
                                    <input type="text" id="position" name="position" class="form-control" required>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Face Enrollment</h3>
                            <div class="face-capture-container">
                                <div id="camera-preview" class="camera-preview">
                                    <video id="video-preview" autoplay playsinline></video>
                                    <canvas id="capture-canvas" style="display: none;"></canvas>
                                </div>
                                <div class="capture-controls">
                                    <button type="button" id="start-camera" class="btn btn-primary">
                                        <i class="fas fa-camera"></i>
                                        Start Camera
                                    </button>
                                    <button type="button" id="capture-photo" class="btn btn-success" disabled>
                                        <i class="fas fa-camera"></i>
                                        Capture Photo
                                    </button>
                                    <button type="button" id="retake-photo" class="btn btn-warning" style="display: none;">
                                        <i class="fas fa-redo"></i>
                                        Retake
                                    </button>
                                </div>
                                <div id="captured-photos" class="captured-photos">
                                    <p>Capture 3-5 photos from different angles for better recognition</p>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="history.back()">Cancel</button>
                            <button type="submit" class="btn btn-primary" disabled id="submit-enrollment">
                                <i class="fas fa-save"></i>
                                Enroll Employee
                            </button>
                        </div>
                    </form>
                </div>
            `;

            container.innerHTML = html;
            this.setupEnrollmentHandlers(container);

        } catch (error) {
            console.error('Failed to load enroll employee page:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load enrollment form');
        }
    }

    /**
     * Load Face Embeddings page
     */
    async loadFaceEmbeddings(container) {
        try {
            const embeddingsData = await this.api.getFaceEmbeddings();
            
            const html = `
                <div class="page-header">
                    <h1>Face Embeddings</h1>
                    <p>Manage face recognition data and embeddings</p>
                    <div class="page-actions">
                        <button id="regenerate-embeddings" class="btn btn-warning">
                            <i class="fas fa-sync"></i>
                            Regenerate All
                        </button>
                        <button id="backup-embeddings" class="btn btn-info">
                            <i class="fas fa-download"></i>
                            Backup
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="filters-container">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>Search Employee</label>
                                <input type="text" id="embedding-search" class="form-control" placeholder="Search by name or ID">
                            </div>
                            <div class="filter-group">
                                <label>Status</label>
                                <select id="embedding-status-filter" class="form-control">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="needs_update">Needs Update</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="embeddings-stats"></div>
                <div id="embeddings-table"></div>
            `;

            container.innerHTML = html;

            // Load embeddings stats
            this.loadEmbeddingsStats(embeddingsData);

            // Load embeddings table
            this.loadEmbeddingsTable(embeddingsData.embeddings);

            // Setup event handlers
            this.setupEmbeddingsHandlers(container);

        } catch (error) {
            console.error('Failed to load face embeddings:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load face embeddings data');
        }
    }

    /**
     * Setup event handlers for employee page
     */
    setupEmployeePageHandlers(container) {
        // Add employee button
        const addBtn = container.querySelector('#add-employee');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.app.modules.router.navigateTo('enroll-employee');
            });
        }

        // Search functionality
        const searchInput = container.querySelector('#employee-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filterEmployees(e.target.value);
            }, 300));
        }

        // Action buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-employee')) {
                const employeeId = e.target.dataset.id;
                this.editEmployee(employeeId);
            } else if (e.target.classList.contains('view-employee')) {
                const employeeId = e.target.dataset.id;
                this.viewEmployee(employeeId);
            } else if (e.target.classList.contains('delete-employee')) {
                const employeeId = e.target.dataset.id;
                this.deleteEmployee(employeeId);
            }
        });
    }

    /**
     * Setup enrollment handlers
     */
    setupEnrollmentHandlers(container) {
        const form = container.querySelector('#enroll-employee-form');
        const startCameraBtn = container.querySelector('#start-camera');
        const captureBtn = container.querySelector('#capture-photo');
        const retakeBtn = container.querySelector('#retake-photo');

        // Form submission
        form.addEventListener('submit', this.handleEnrollmentSubmit.bind(this));

        // Camera controls
        startCameraBtn.addEventListener('click', this.startCamera.bind(this));
        captureBtn.addEventListener('click', this.capturePhoto.bind(this));
        retakeBtn.addEventListener('click', this.retakePhoto.bind(this));
    }

    /**
     * Setup embeddings handlers
     */
    setupEmbeddingsHandlers(container) {
        // Regenerate embeddings
        const regenerateBtn = container.querySelector('#regenerate-embeddings');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', this.regenerateAllEmbeddings.bind(this));
        }

        // Backup embeddings
        const backupBtn = container.querySelector('#backup-embeddings');
        if (backupBtn) {
            backupBtn.addEventListener('click', this.backupEmbeddings.bind(this));
        }
    }

    /**
     * Utility methods
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async editEmployee(employeeId) {
        // Implementation for editing employee
        console.log('Edit employee:', employeeId);
    }

    async viewEmployee(employeeId) {
        // Implementation for viewing employee details
        console.log('View employee:', employeeId);
    }

    async deleteEmployee(employeeId) {
        // Implementation for deleting employee
        console.log('Delete employee:', employeeId);
    }

    async handleEnrollmentSubmit(e) {
        e.preventDefault();
        // Implementation for enrollment submission
        console.log('Submit enrollment');
    }

    async startCamera() {
        // Implementation for starting camera
        console.log('Start camera');
    }

    async capturePhoto() {
        // Implementation for capturing photo
        console.log('Capture photo');
    }

    async retakePhoto() {
        // Implementation for retaking photo
        console.log('Retake photo');
    }

    async regenerateAllEmbeddings() {
        // Implementation for regenerating embeddings
        console.log('Regenerate embeddings');
    }

    async backupEmbeddings() {
        // Implementation for backing up embeddings
        console.log('Backup embeddings');
    }

    loadEmbeddingsStats(data) {
        // Implementation for loading embeddings stats
        console.log('Load embeddings stats:', data);
    }

    loadEmbeddingsTable(embeddings) {
        // Implementation for loading embeddings table
        console.log('Load embeddings table:', embeddings);
    }

    filterEmployees(searchTerm) {
        // Implementation for filtering employees
        console.log('Filter employees:', searchTerm);
    }
}