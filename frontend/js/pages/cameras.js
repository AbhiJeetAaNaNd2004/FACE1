/**
 * Cameras Page Module
 * Handles camera management, configuration, and live feeds
 */

class CamerasPage {
    constructor(app) {
        this.app = app;
        this.api = app.getAPI();
        this.ui = app.getUI();
        this.activeCameras = new Map();
        this.videoElements = new Map();
    }

    /**
     * Load Cameras page
     */
    async loadCameras(container) {
        try {
            const camerasData = await this.api.getCameras();
            
            const html = `
                <div class="page-header">
                    <h1>Camera Management</h1>
                    <p>Configure and monitor security cameras</p>
                    <div class="page-actions">
                        <button id="add-camera" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Add Camera
                        </button>
                        <button id="discover-cameras" class="btn btn-secondary">
                            <i class="fas fa-search"></i>
                            Discover
                        </button>
                        <button id="test-all-cameras" class="btn btn-info">
                            <i class="fas fa-play"></i>
                            Test All
                        </button>
                    </div>
                </div>

                <div class="content-card">
                    <div class="filters-container">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>Location</label>
                                <select id="location-filter" class="form-control">
                                    <option value="">All Locations</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Status</label>
                                <select id="status-filter" class="form-control">
                                    <option value="">All Status</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Type</label>
                                <select id="type-filter" class="form-control">
                                    <option value="">All Types</option>
                                    <option value="ip">IP Camera</option>
                                    <option value="usb">USB Camera</option>
                                    <option value="rtsp">RTSP Stream</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>&nbsp;</label>
                                <button id="refresh-status" class="btn btn-success">
                                    <i class="fas fa-sync"></i>
                                    Refresh Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="cameras-stats"></div>

                <div class="cameras-grid-container">
                    <div class="view-controls">
                        <button id="grid-view" class="btn btn-sm btn-primary active">
                            <i class="fas fa-th"></i>
                            Grid View
                        </button>
                        <button id="list-view" class="btn btn-sm btn-secondary">
                            <i class="fas fa-list"></i>
                            List View
                        </button>
                        <button id="live-view" class="btn btn-sm btn-info">
                            <i class="fas fa-video"></i>
                            Live View
                        </button>
                    </div>
                    
                    <div id="cameras-display">
                        <div id="cameras-grid" class="cameras-grid"></div>
                        <div id="cameras-table" class="cameras-table" style="display: none;"></div>
                        <div id="cameras-live" class="cameras-live" style="display: none;"></div>
                    </div>
                </div>

                <!-- Add Camera Modal -->
                <div id="add-camera-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Add New Camera</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <form id="add-camera-form" class="modal-body">
                            <div class="form-group">
                                <label for="camera-name">Camera Name *</label>
                                <input type="text" id="camera-name" name="name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="camera-type">Camera Type *</label>
                                <select id="camera-type" name="type" class="form-control" required>
                                    <option value="">Select Type</option>
                                    <option value="ip">IP Camera</option>
                                    <option value="usb">USB Camera</option>
                                    <option value="rtsp">RTSP Stream</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="camera-location">Location *</label>
                                <input type="text" id="camera-location" name="location" class="form-control" required>
                            </div>
                            <div id="ip-camera-fields" style="display: none;">
                                <div class="form-group">
                                    <label for="camera-ip">IP Address</label>
                                    <input type="text" id="camera-ip" name="ip_address" class="form-control">
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
                            </div>
                            <div id="usb-camera-fields" style="display: none;">
                                <div class="form-group">
                                    <label for="camera-device">Device Index</label>
                                    <input type="number" id="camera-device" name="device_index" class="form-control" value="0">
                                </div>
                            </div>
                            <div id="rtsp-camera-fields" style="display: none;">
                                <div class="form-group">
                                    <label for="rtsp-url">RTSP URL</label>
                                    <input type="text" id="rtsp-url" name="rtsp_url" class="form-control" placeholder="rtsp://...">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="camera-resolution">Resolution</label>
                                <select id="camera-resolution" name="resolution" class="form-control">
                                    <option value="640x480">640x480</option>
                                    <option value="1280x720" selected>1280x720 (HD)</option>
                                    <option value="1920x1080">1920x1080 (Full HD)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="camera-fps">Frame Rate (FPS)</label>
                                <input type="number" id="camera-fps" name="fps" class="form-control" value="30" min="1" max="60">
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                            <button type="button" id="test-camera-connection" class="btn btn-info">Test Connection</button>
                            <button type="submit" form="add-camera-form" class="btn btn-primary">Add Camera</button>
                        </div>
                    </div>
                </div>

                <!-- Camera Details Modal -->
                <div id="camera-details-modal" class="modal" style="display: none;">
                    <div class="modal-content large-modal">
                        <div class="modal-header">
                            <h3 id="camera-details-title">Camera Details</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="camera-details-grid">
                                <div class="camera-info">
                                    <h4>Camera Information</h4>
                                    <div id="camera-info-content"></div>
                                </div>
                                <div class="camera-preview">
                                    <h4>Live Preview</h4>
                                    <div id="camera-preview-content">
                                        <video id="preview-video" controls style="width: 100%; max-width: 400px;"></video>
                                    </div>
                                </div>
                            </div>
                            <div class="camera-actions">
                                <button id="start-preview" class="btn btn-success">
                                    <i class="fas fa-play"></i>
                                    Start Preview
                                </button>
                                <button id="stop-preview" class="btn btn-danger">
                                    <i class="fas fa-stop"></i>
                                    Stop Preview
                                </button>
                                <button id="take-snapshot" class="btn btn-info">
                                    <i class="fas fa-camera"></i>
                                    Take Snapshot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Load camera stats
            this.loadCameraStats(camerasData);

            // Load cameras display
            this.loadCamerasGrid(camerasData.cameras);

            // Populate filter dropdowns
            this.populateFilterDropdowns(camerasData);

            // Setup event handlers
            this.setupCameraHandlers(container);

        } catch (error) {
            console.error('Failed to load cameras:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load camera data');
        }
    }

    /**
     * Load camera statistics
     */
    loadCameraStats(data) {
        const cameras = data.cameras || [];
        const totalCameras = cameras.length;
        const onlineCameras = cameras.filter(cam => cam.status === 'online').length;
        const offlineCameras = cameras.filter(cam => cam.status === 'offline').length;
        const errorCameras = cameras.filter(cam => cam.status === 'error').length;

        const stats = [
            { label: 'Total Cameras', value: totalCameras, color: 'primary' },
            { label: 'Online', value: onlineCameras, color: 'success' },
            { label: 'Offline', value: offlineCameras, color: 'warning' },
            { label: 'Error', value: errorCameras, color: 'danger' }
        ];

        const statsContainer = document.getElementById('cameras-stats');
        this.ui.createStatsGrid(statsContainer, stats);
    }

    /**
     * Load cameras grid view
     */
    loadCamerasGrid(cameras) {
        const gridContainer = document.getElementById('cameras-grid');
        
        if (!cameras || cameras.length === 0) {
            gridContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-video-slash"></i>
                    <h3>No Cameras Configured</h3>
                    <p>Add your first camera to get started</p>
                    <button class="btn btn-primary" onclick="document.getElementById('add-camera').click()">
                        <i class="fas fa-plus"></i>
                        Add Camera
                    </button>
                </div>
            `;
            return;
        }

        const camerasHTML = cameras.map(camera => `
            <div class="camera-card" data-camera-id="${camera.id}">
                <div class="camera-card-header">
                    <h4>${camera.name}</h4>
                    <span class="status-indicator status-${camera.status}"></span>
                </div>
                <div class="camera-card-body">
                    <div class="camera-thumbnail">
                        ${camera.status === 'online' ? 
                            `<img src="${camera.thumbnail_url || '/images/camera-placeholder.png'}" alt="Camera thumbnail">` :
                            `<div class="camera-offline"><i class="fas fa-video-slash"></i><span>Camera Offline</span></div>`
                        }
                    </div>
                    <div class="camera-info">
                        <div class="info-item">
                            <span class="label">Location:</span>
                            <span class="value">${camera.location}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Type:</span>
                            <span class="value">${camera.type.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Resolution:</span>
                            <span class="value">${camera.resolution}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Status:</span>
                            <span class="value status-${camera.status}">${camera.status}</span>
                        </div>
                    </div>
                </div>
                <div class="camera-card-actions">
                    <button class="btn btn-sm btn-primary view-camera" data-id="${camera.id}">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-sm btn-info test-camera" data-id="${camera.id}">
                        <i class="fas fa-play"></i>
                        Test
                    </button>
                    <button class="btn btn-sm btn-warning edit-camera" data-id="${camera.id}">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-camera" data-id="${camera.id}">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        gridContainer.innerHTML = camerasHTML;
    }

    /**
     * Load cameras table view
     */
    loadCamerasTable(cameras) {
        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'location', label: 'Location' },
            { key: 'type', label: 'Type', render: (value) => value.toUpperCase() },
            { key: 'ip_address', label: 'IP Address', render: (value) => value || '-' },
            { key: 'resolution', label: 'Resolution' },
            { key: 'fps', label: 'FPS' },
            { key: 'status', label: 'Status', render: (value) => `<span class="status-badge status-${value}">${value}</span>` },
            { key: 'last_seen', label: 'Last Seen', render: (value) => value ? new Date(value).toLocaleString() : '-' },
            { key: 'actions', label: 'Actions', render: (value, row) => `
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary view-camera" data-id="${row.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-info test-camera" data-id="${row.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-warning edit-camera" data-id="${row.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-camera" data-id="${row.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` }
        ];

        const tableContainer = document.getElementById('cameras-table');
        this.ui.createDataTable(tableContainer, cameras, columns, {
            searchable: true,
            sortable: true,
            pagination: true
        });
    }

    /**
     * Load cameras live view
     */
    loadCamerasLive(cameras) {
        const liveContainer = document.getElementById('cameras-live');
        const onlineCameras = cameras.filter(cam => cam.status === 'online');

        if (onlineCameras.length === 0) {
            liveContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-video-slash"></i>
                    <h3>No Online Cameras</h3>
                    <p>No cameras are currently online for live viewing</p>
                </div>
            `;
            return;
        }

        const liveHTML = `
            <div class="live-grid">
                ${onlineCameras.map(camera => `
                    <div class="live-camera-container" data-camera-id="${camera.id}">
                        <div class="live-camera-header">
                            <h4>${camera.name}</h4>
                            <span class="live-indicator">
                                <i class="fas fa-circle"></i>
                                LIVE
                            </span>
                        </div>
                        <div class="live-camera-feed">
                            <video id="live-video-${camera.id}" 
                                   class="live-video" 
                                   controls 
                                   muted 
                                   data-camera-id="${camera.id}">
                                Your browser does not support video playback.
                            </video>
                        </div>
                        <div class="live-camera-controls">
                            <button class="btn btn-sm btn-success start-live" data-id="${camera.id}">
                                <i class="fas fa-play"></i>
                                Start
                            </button>
                            <button class="btn btn-sm btn-danger stop-live" data-id="${camera.id}">
                                <i class="fas fa-stop"></i>
                                Stop
                            </button>
                            <button class="btn btn-sm btn-info fullscreen-live" data-id="${camera.id}">
                                <i class="fas fa-expand"></i>
                                Fullscreen
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        liveContainer.innerHTML = liveHTML;
    }

    /**
     * Populate filter dropdowns
     */
    populateFilterDropdowns(data) {
        const cameras = data.cameras || [];
        const locations = [...new Set(cameras.map(cam => cam.location))];

        const locationFilter = document.getElementById('location-filter');
        if (locationFilter) {
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationFilter.appendChild(option);
            });
        }
    }

    /**
     * Setup event handlers
     */
    setupCameraHandlers(container) {
        // Add camera button
        const addCameraBtn = container.querySelector('#add-camera');
        if (addCameraBtn) {
            addCameraBtn.addEventListener('click', this.showAddCameraModal.bind(this));
        }

        // View controls
        const gridViewBtn = container.querySelector('#grid-view');
        const listViewBtn = container.querySelector('#list-view');
        const liveViewBtn = container.querySelector('#live-view');

        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => this.switchView('grid'));
        }
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => this.switchView('list'));
        }
        if (liveViewBtn) {
            liveViewBtn.addEventListener('click', () => this.switchView('live'));
        }

        // Camera type change handler
        const cameraTypeSelect = container.querySelector('#camera-type');
        if (cameraTypeSelect) {
            cameraTypeSelect.addEventListener('change', this.handleCameraTypeChange.bind(this));
        }

        // Form submissions
        const addCameraForm = container.querySelector('#add-camera-form');
        if (addCameraForm) {
            addCameraForm.addEventListener('submit', this.handleAddCamera.bind(this));
        }

        // Test camera connection
        const testConnectionBtn = container.querySelector('#test-camera-connection');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', this.testCameraConnection.bind(this));
        }

        // Modal controls
        this.ui.setupModalControls(container.querySelector('#add-camera-modal'));
        this.ui.setupModalControls(container.querySelector('#camera-details-modal'));

        // Camera action buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-camera')) {
                const cameraId = e.target.dataset.id;
                this.viewCameraDetails(cameraId);
            } else if (e.target.classList.contains('test-camera')) {
                const cameraId = e.target.dataset.id;
                this.testCamera(cameraId);
            } else if (e.target.classList.contains('edit-camera')) {
                const cameraId = e.target.dataset.id;
                this.editCamera(cameraId);
            } else if (e.target.classList.contains('delete-camera')) {
                const cameraId = e.target.dataset.id;
                this.deleteCamera(cameraId);
            } else if (e.target.classList.contains('start-live')) {
                const cameraId = e.target.dataset.id;
                this.startLiveFeed(cameraId);
            } else if (e.target.classList.contains('stop-live')) {
                const cameraId = e.target.dataset.id;
                this.stopLiveFeed(cameraId);
            }
        });
    }

    /**
     * Event handlers and utility methods
     */
    showAddCameraModal() {
        const modal = document.getElementById('add-camera-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    handleCameraTypeChange(e) {
        const cameraType = e.target.value;
        const ipFields = document.getElementById('ip-camera-fields');
        const usbFields = document.getElementById('usb-camera-fields');
        const rtspFields = document.getElementById('rtsp-camera-fields');

        // Hide all fields first
        if (ipFields) ipFields.style.display = 'none';
        if (usbFields) usbFields.style.display = 'none';
        if (rtspFields) rtspFields.style.display = 'none';

        // Show relevant fields
        switch (cameraType) {
            case 'ip':
                if (ipFields) ipFields.style.display = 'block';
                break;
            case 'usb':
                if (usbFields) usbFields.style.display = 'block';
                break;
            case 'rtsp':
                if (rtspFields) rtspFields.style.display = 'block';
                break;
        }
    }

    switchView(viewType) {
        const gridView = document.getElementById('cameras-grid');
        const listView = document.getElementById('cameras-table');
        const liveView = document.getElementById('cameras-live');
        
        const gridBtn = document.getElementById('grid-view');
        const listBtn = document.getElementById('list-view');
        const liveBtn = document.getElementById('live-view');

        // Hide all views
        if (gridView) gridView.style.display = 'none';
        if (listView) listView.style.display = 'none';
        if (liveView) liveView.style.display = 'none';

        // Remove active class from all buttons
        if (gridBtn) gridBtn.classList.remove('active');
        if (listBtn) listBtn.classList.remove('active');
        if (liveBtn) liveBtn.classList.remove('active');

        // Show selected view and activate button
        switch (viewType) {
            case 'grid':
                if (gridView) gridView.style.display = 'block';
                if (gridBtn) gridBtn.classList.add('active');
                break;
            case 'list':
                if (listView) listView.style.display = 'block';
                if (listBtn) listBtn.classList.add('active');
                // Load table if not already loaded
                this.loadCamerasTable(this.currentCameras || []);
                break;
            case 'live':
                if (liveView) liveView.style.display = 'block';
                if (liveBtn) liveBtn.classList.add('active');
                // Load live view if not already loaded
                this.loadCamerasLive(this.currentCameras || []);
                break;
        }
    }

    async handleAddCamera(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('Add camera data:', Object.fromEntries(formData));
        // Implementation for adding camera
    }

    async testCameraConnection() {
        console.log('Test camera connection');
        // Implementation for testing camera connection
    }

    async viewCameraDetails(cameraId) {
        console.log('View camera details:', cameraId);
        // Implementation for viewing camera details
    }

    async testCamera(cameraId) {
        console.log('Test camera:', cameraId);
        // Implementation for testing specific camera
    }

    async editCamera(cameraId) {
        console.log('Edit camera:', cameraId);
        // Implementation for editing camera
    }

    async deleteCamera(cameraId) {
        console.log('Delete camera:', cameraId);
        // Implementation for deleting camera
    }

    async startLiveFeed(cameraId) {
        console.log('Start live feed:', cameraId);
        // Implementation for starting live feed
    }

    async stopLiveFeed(cameraId) {
        console.log('Stop live feed:', cameraId);
        // Implementation for stopping live feed
    }
}