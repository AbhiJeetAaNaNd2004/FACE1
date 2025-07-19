/**
 * System Page Module
 * Handles system control, monitoring, and live feed functionality
 */

class SystemPage {
    constructor(app) {
        this.app = app;
        this.api = app.getAPI();
        this.ui = app.getUI();
        this.systemMonitorInterval = null;
        this.liveFeedActive = false;
    }

    /**
     * Load System Control page
     */
    async loadSystemControl(container) {
        try {
            let systemData;
            try {
                systemData = await this.api.getSystemStatus();
            } catch (error) {
                console.warn('Failed to get system status:', error);
                systemData = { 
                    data: { 
                        is_running: false, 
                        uptime: 0, 
                        faces_detected: 0,
                        recognition_rate: 0 
                    } 
                };
            }
            
            const html = `
                <div class="page-header">
                    <h1>System Control</h1>
                    <p>Monitor and control the face recognition system</p>
                    <div class="page-actions">
                        <button id="restart-system" class="btn btn-warning">
                            <i class="fas fa-redo"></i>
                            Restart System
                        </button>
                        <button id="backup-system" class="btn btn-info">
                            <i class="fas fa-download"></i>
                            Backup
                        </button>
                        <button id="system-logs" class="btn btn-secondary">
                            <i class="fas fa-file-alt"></i>
                            View Logs
                        </button>
                    </div>
                </div>

                <div class="system-dashboard">
                    <div class="dashboard-row">
                        <div id="system-stats" class="stats-section"></div>
                        <div id="system-health" class="health-section">
                            <div class="health-card">
                                <div class="health-header">
                                    <h3>System Health</h3>
                                    <span id="health-status" class="health-indicator">
                                        <i class="fas fa-circle"></i>
                                        <span>Healthy</span>
                                    </span>
                                </div>
                                <div class="health-metrics">
                                    <div class="metric">
                                        <label>CPU Usage</label>
                                        <div class="progress-bar">
                                            <div id="cpu-usage" class="progress-fill" style="width: 45%"></div>
                                        </div>
                                        <span id="cpu-percentage">45%</span>
                                    </div>
                                    <div class="metric">
                                        <label>Memory Usage</label>
                                        <div class="progress-bar">
                                            <div id="memory-usage" class="progress-fill" style="width: 62%"></div>
                                        </div>
                                        <span id="memory-percentage">62%</span>
                                    </div>
                                    <div class="metric">
                                        <label>Disk Usage</label>
                                        <div class="progress-bar">
                                            <div id="disk-usage" class="progress-fill" style="width: 38%"></div>
                                        </div>
                                        <span id="disk-percentage">38%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="system-controls">
                    <div class="controls-grid">
                        <div class="control-section">
                            <h3>Face Detection Service</h3>
                            <div class="service-status">
                                <span id="face-detection-status" class="status-indicator status-running">
                                    <i class="fas fa-circle"></i>
                                    Running
                                </span>
                                <div class="service-actions">
                                    <button id="start-face-detection" class="btn btn-sm btn-success" disabled>
                                        <i class="fas fa-play"></i>
                                        Start
                                    </button>
                                    <button id="stop-face-detection" class="btn btn-sm btn-danger">
                                        <i class="fas fa-stop"></i>
                                        Stop
                                    </button>
                                    <button id="restart-face-detection" class="btn btn-sm btn-warning">
                                        <i class="fas fa-redo"></i>
                                        Restart
                                    </button>
                                </div>
                            </div>
                            <div class="service-info">
                                <div class="info-item">
                                    <span class="label">Uptime:</span>
                                    <span id="face-detection-uptime">2h 34m</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Faces Detected:</span>
                                    <span id="faces-detected-count">1,234</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Recognition Rate:</span>
                                    <span id="recognition-rate">94.2%</span>
                                </div>
                            </div>
                        </div>

                        <div class="control-section">
                            <h3>Camera Service</h3>
                            <div class="service-status">
                                <span id="camera-service-status" class="status-indicator status-running">
                                    <i class="fas fa-circle"></i>
                                    Running
                                </span>
                                <div class="service-actions">
                                    <button id="start-camera-service" class="btn btn-sm btn-success" disabled>
                                        <i class="fas fa-play"></i>
                                        Start
                                    </button>
                                    <button id="stop-camera-service" class="btn btn-sm btn-danger">
                                        <i class="fas fa-stop"></i>
                                        Stop
                                    </button>
                                    <button id="restart-camera-service" class="btn btn-sm btn-warning">
                                        <i class="fas fa-redo"></i>
                                        Restart
                                    </button>
                                </div>
                            </div>
                            <div class="service-info">
                                <div class="info-item">
                                    <span class="label">Active Cameras:</span>
                                    <span id="active-cameras-count">3</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Total Cameras:</span>
                                    <span id="total-cameras-count">5</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Frame Rate:</span>
                                    <span id="average-fps">28.5 FPS</span>
                                </div>
                            </div>
                        </div>

                        <div class="control-section">
                            <h3>Database Service</h3>
                            <div class="service-status">
                                <span id="database-status" class="status-indicator status-running">
                                    <i class="fas fa-circle"></i>
                                    Running
                                </span>
                                <div class="service-actions">
                                    <button id="optimize-database" class="btn btn-sm btn-info">
                                        <i class="fas fa-cogs"></i>
                                        Optimize
                                    </button>
                                    <button id="backup-database" class="btn btn-sm btn-secondary">
                                        <i class="fas fa-save"></i>
                                        Backup
                                    </button>
                                </div>
                            </div>
                            <div class="service-info">
                                <div class="info-item">
                                    <span class="label">Total Records:</span>
                                    <span id="total-records">15,678</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Database Size:</span>
                                    <span id="database-size">245 MB</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Last Backup:</span>
                                    <span id="last-backup">Yesterday</span>
                                </div>
                            </div>
                        </div>

                        <div class="control-section">
                            <h3>System Settings</h3>
                            <div class="settings-form">
                                <div class="form-group">
                                    <label for="recognition-threshold">Recognition Threshold</label>
                                    <div class="range-input">
                                        <input type="range" id="recognition-threshold" min="0.1" max="1.0" step="0.1" value="0.7" class="form-range">
                                        <span id="threshold-value">0.7</span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="detection-interval">Detection Interval (ms)</label>
                                    <input type="number" id="detection-interval" class="form-control" value="1000" min="100" max="5000">
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="auto-enroll" checked>
                                        Auto-enroll new faces
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="save-unknown-faces">
                                        Save unknown faces for review
                                    </label>
                                </div>
                                <button id="save-settings" class="btn btn-primary">
                                    <i class="fas fa-save"></i>
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="recent-activity">
                    <h3>Recent System Activity</h3>
                    <div id="activity-log" class="activity-log">
                        <div class="activity-item">
                            <span class="timestamp">10:23 AM</span>
                            <span class="activity-type info">INFO</span>
                            <span class="activity-message">Face detection service started</span>
                        </div>
                        <div class="activity-item">
                            <span class="timestamp">10:22 AM</span>
                            <span class="activity-type success">SUCCESS</span>
                            <span class="activity-message">Employee John Doe recognized (Camera 1)</span>
                        </div>
                        <div class="activity-item">
                            <span class="timestamp">10:20 AM</span>
                            <span class="activity-type warning">WARNING</span>
                            <span class="activity-message">Camera 3 connection unstable</span>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Load system stats
            this.loadSystemStats(systemData);

            // Start system monitoring
            this.startSystemMonitoring();

            // Setup event handlers
            this.setupSystemControlHandlers(container);

        } catch (error) {
            console.error('Failed to load system control:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load system control');
        }
    }

    /**
     * Load Live Feed page
     */
    async loadLiveFeed(container) {
        try {
            const camerasData = await this.api.getCameras();
            
            const html = `
                <div class="page-header">
                    <h1>Live Feed Monitor</h1>
                    <p>Monitor live camera feeds and face detection in real-time</p>
                    <div class="page-actions">
                        <button id="start-all-feeds" class="btn btn-success">
                            <i class="fas fa-play"></i>
                            Start All Feeds
                        </button>
                        <button id="stop-all-feeds" class="btn btn-danger">
                            <i class="fas fa-stop"></i>
                            Stop All Feeds
                        </button>
                        <button id="fullscreen-mode" class="btn btn-info">
                            <i class="fas fa-expand"></i>
                            Fullscreen
                        </button>
                    </div>
                </div>

                <div class="live-feed-controls">
                    <div class="controls-row">
                        <div class="layout-controls">
                            <label>Layout:</label>
                            <button class="layout-btn active" data-layout="grid-2x2">2x2</button>
                            <button class="layout-btn" data-layout="grid-3x3">3x3</button>
                            <button class="layout-btn" data-layout="single">Single</button>
                            <button class="layout-btn" data-layout="pip">Picture-in-Picture</button>
                        </div>
                        <div class="detection-controls">
                            <label>
                                <input type="checkbox" id="show-detections" checked>
                                Show Face Detections
                            </label>
                            <label>
                                <input type="checkbox" id="show-names" checked>
                                Show Names
                            </label>
                            <label>
                                <input type="checkbox" id="record-detections">
                                Record Detections
                            </label>
                        </div>
                    </div>
                </div>

                <div id="live-feed-container" class="live-feed-container">
                    <div id="live-feed-grid" class="live-feed-grid grid-2x2">
                        ${this.generateLiveFeedSlots(camerasData.cameras)}
                    </div>
                </div>

                <div class="detection-panel">
                    <div class="panel-header">
                        <h3>Recent Detections</h3>
                        <div class="panel-controls">
                            <label>
                                <input type="checkbox" id="auto-scroll" checked>
                                Auto-scroll
                            </label>
                            <button id="clear-detections" class="btn btn-sm btn-secondary">
                                <i class="fas fa-trash"></i>
                                Clear
                            </button>
                        </div>
                    </div>
                    <div id="detections-list" class="detections-list">
                        <div class="detection-item">
                            <div class="detection-time">10:23:45</div>
                            <div class="detection-info">
                                <strong>John Doe</strong> detected on Camera 1
                                <span class="confidence">95.2% confidence</span>
                            </div>
                            <div class="detection-thumbnail">
                                <img src="/images/detection-placeholder.svg" alt="Detection">
                            </div>
                        </div>
                        <div class="detection-item">
                            <div class="detection-time">10:22:30</div>
                            <div class="detection-info">
                                <strong>Unknown Person</strong> detected on Camera 2
                                <span class="confidence">87.1% confidence</span>
                            </div>
                            <div class="detection-thumbnail">
                                <img src="/images/detection-placeholder.svg" alt="Detection">
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Setup live feed handlers
            this.setupLiveFeedHandlers(container);

            // Initialize live feeds
            this.initializeLiveFeeds(camerasData.cameras);

        } catch (error) {
            console.error('Failed to load live feed:', error);
            container.innerHTML = this.ui.getErrorHTML('Failed to load live feed');
        }
    }

    /**
     * Generate live feed slots HTML
     */
    generateLiveFeedSlots(cameras) {
        const maxSlots = 9; // 3x3 grid maximum
        const slots = [];

        for (let i = 0; i < maxSlots; i++) {
            const camera = cameras[i];
            if (camera) {
                slots.push(`
                    <div class="feed-slot" data-camera-id="${camera.id}">
                        <div class="feed-header">
                            <span class="camera-name">${camera.name}</span>
                            <span class="feed-status status-offline">
                                <i class="fas fa-circle"></i>
                                Offline
                            </span>
                        </div>
                        <div class="feed-content">
                            <video id="feed-video-${camera.id}" 
                                   class="feed-video" 
                                   muted 
                                   data-camera-id="${camera.id}">
                            </video>
                            <div class="feed-overlay">
                                <button class="feed-control-btn start-feed" data-camera-id="${camera.id}">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        </div>
                        <div class="feed-footer">
                            <span class="feed-info">${camera.location}</span>
                            <span class="fps-counter">0 FPS</span>
                        </div>
                    </div>
                `);
            } else {
                slots.push(`
                    <div class="feed-slot empty-slot">
                        <div class="empty-slot-content">
                            <i class="fas fa-video-slash"></i>
                            <span>No Camera</span>
                        </div>
                    </div>
                `);
            }
        }

        return slots.join('');
    }

    /**
     * Load system statistics
     */
    loadSystemStats(data) {
        const stats = [
            { label: 'System Uptime', value: data.uptime || '2d 14h 32m', color: 'info' },
            { label: 'Active Sessions', value: data.active_sessions || 12, color: 'primary' },
            { label: 'Detections Today', value: data.detections_today || 234, color: 'success' },
            { label: 'System Load', value: data.system_load || '2.1', color: 'warning' }
        ];

        const statsContainer = document.getElementById('system-stats');
        this.ui.createStatsGrid(statsContainer, stats);
    }

    /**
     * Start system monitoring
     */
    startSystemMonitoring() {
        // Initial status refresh
        this.refreshSystemStatus();
        
        this.systemMonitorInterval = setInterval(async () => {
            try {
                const systemData = await this.api.getSystemStatus();
                this.updateSystemMetrics(systemData);
                this.refreshSystemStatus();
            } catch (error) {
                console.error('Failed to update system metrics:', error);
            }
        }, 5000); // Update every 5 seconds
    }

    /**
     * Update system metrics
     */
    updateSystemMetrics(data) {
        // Update CPU usage
        const cpuUsage = document.getElementById('cpu-usage');
        const cpuPercentage = document.getElementById('cpu-percentage');
        if (cpuUsage && cpuPercentage && data.cpu_usage) {
            cpuUsage.style.width = `${data.cpu_usage}%`;
            cpuPercentage.textContent = `${data.cpu_usage}%`;
        }

        // Update Memory usage
        const memoryUsage = document.getElementById('memory-usage');
        const memoryPercentage = document.getElementById('memory-percentage');
        if (memoryUsage && memoryPercentage && data.memory_usage) {
            memoryUsage.style.width = `${data.memory_usage}%`;
            memoryPercentage.textContent = `${data.memory_usage}%`;
        }

        // Update Disk usage
        const diskUsage = document.getElementById('disk-usage');
        const diskPercentage = document.getElementById('disk-percentage');
        if (diskUsage && diskPercentage && data.disk_usage) {
            diskUsage.style.width = `${data.disk_usage}%`;
            diskPercentage.textContent = `${data.disk_usage}%`;
        }

        // Update service counters
        if (data.faces_detected_count) {
            const facesCount = document.getElementById('faces-detected-count');
            if (facesCount) facesCount.textContent = data.faces_detected_count.toLocaleString();
        }

        if (data.recognition_rate) {
            const recognitionRate = document.getElementById('recognition-rate');
            if (recognitionRate) recognitionRate.textContent = `${data.recognition_rate}%`;
        }
    }

    /**
     * Setup system control handlers
     */
    setupSystemControlHandlers(container) {
        // Service control buttons
        const serviceButtons = [
            'start-face-detection',
            'stop-face-detection',
            'restart-face-detection',
            'start-camera-service',
            'stop-camera-service',
            'restart-camera-service'
        ];

        serviceButtons.forEach(buttonId => {
            const button = container.querySelector(`#${buttonId}`);
            if (button) {
                button.addEventListener('click', () => {
                    this.handleServiceControl(buttonId);
                });
            }
        });

        // Settings form
        const saveSettingsBtn = container.querySelector('#save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', this.saveSystemSettings.bind(this));
        }

        // Threshold slider
        const thresholdSlider = container.querySelector('#recognition-threshold');
        const thresholdValue = container.querySelector('#threshold-value');
        if (thresholdSlider && thresholdValue) {
            thresholdSlider.addEventListener('input', (e) => {
                thresholdValue.textContent = e.target.value;
            });
        }

        // System control buttons
        const restartSystemBtn = container.querySelector('#restart-system');
        if (restartSystemBtn) {
            restartSystemBtn.addEventListener('click', this.restartSystem.bind(this));
        }

        const backupSystemBtn = container.querySelector('#backup-system');
        if (backupSystemBtn) {
            backupSystemBtn.addEventListener('click', this.backupSystem.bind(this));
        }

        const systemLogsBtn = container.querySelector('#system-logs');
        if (systemLogsBtn) {
            systemLogsBtn.addEventListener('click', this.showSystemLogs.bind(this));
        }
    }

    /**
     * Setup live feed handlers
     */
    setupLiveFeedHandlers(container) {
        // Layout controls
        const layoutButtons = container.querySelectorAll('.layout-btn');
        layoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layout = e.target.dataset.layout;
                this.changeLayout(layout);
                
                // Update active state
                layoutButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Feed controls
        const startAllBtn = container.querySelector('#start-all-feeds');
        const stopAllBtn = container.querySelector('#stop-all-feeds');
        
        if (startAllBtn) {
            startAllBtn.addEventListener('click', this.startAllFeeds.bind(this));
        }
        if (stopAllBtn) {
            stopAllBtn.addEventListener('click', this.stopAllFeeds.bind(this));
        }

        // Individual feed controls
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-feed')) {
                const cameraId = e.target.dataset.cameraId;
                this.startFeed(cameraId);
            }
        });

        // Detection controls
        const showDetections = container.querySelector('#show-detections');
        const showNames = container.querySelector('#show-names');
        const recordDetections = container.querySelector('#record-detections');

        if (showDetections) {
            showDetections.addEventListener('change', this.toggleDetectionOverlay.bind(this));
        }
        if (showNames) {
            showNames.addEventListener('change', this.toggleNameDisplay.bind(this));
        }
        if (recordDetections) {
            recordDetections.addEventListener('change', this.toggleDetectionRecording.bind(this));
        }
    }

    /**
     * Initialize live feeds
     */
    initializeLiveFeeds(cameras) {
        cameras.forEach(camera => {
            const videoElement = document.getElementById(`feed-video-${camera.id}`);
            if (videoElement) {
                this.setupVideoElement(videoElement, camera);
            }
        });
    }

    /**
     * Setup video element for camera
     */
    setupVideoElement(videoElement, camera) {
        // Store reference to video element
        this.videoElements.set(camera.id, videoElement);

        // Setup event listeners
        videoElement.addEventListener('loadstart', () => {
            this.updateFeedStatus(camera.id, 'connecting');
        });

        videoElement.addEventListener('canplay', () => {
            this.updateFeedStatus(camera.id, 'online');
        });

        videoElement.addEventListener('error', () => {
            this.updateFeedStatus(camera.id, 'error');
        });
    }

    /**
     * Update feed status indicator
     */
    updateFeedStatus(cameraId, status) {
        const feedSlot = document.querySelector(`[data-camera-id="${cameraId}"]`);
        if (feedSlot) {
            const statusElement = feedSlot.querySelector('.feed-status');
            if (statusElement) {
                statusElement.className = `feed-status status-${status}`;
                statusElement.innerHTML = `<i class="fas fa-circle"></i> ${status.charAt(0).toUpperCase() + status.slice(1)}`;
            }
        }
    }

    /**
     * Event handlers and utility methods
     */
    async handleServiceControl(action) {
        console.log('Service control action:', action);
        
        try {
            let result;
            const button = document.getElementById(action);
            
            // Disable button and show loading
            if (button) {
                button.disabled = true;
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                // Restore button after operation
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = originalText;
                }, 3000);
            }
            
            switch (action) {
                case 'start-face-detection':
                    result = await this.api.startFaceDetectionSystem();
                    if (result.success) {
                        this.ui.showNotification('Face detection system started successfully', 'success');
                        this.updateServiceStatus('face-detection', 'running');
                    } else {
                        throw new Error(result.message || 'Failed to start face detection system');
                    }
                    break;
                    
                case 'stop-face-detection':
                    result = await this.api.stopFaceDetectionSystem();
                    if (result.success) {
                        this.ui.showNotification('Face detection system stopped successfully', 'success');
                        this.updateServiceStatus('face-detection', 'stopped');
                    } else {
                        throw new Error(result.message || 'Failed to stop face detection system');
                    }
                    break;
                    
                case 'restart-face-detection':
                    // Stop first, then start
                    await this.api.stopFaceDetectionSystem();
                    setTimeout(async () => {
                        result = await this.api.startFaceDetectionSystem();
                        if (result.success) {
                            this.ui.showNotification('Face detection system restarted successfully', 'success');
                            this.updateServiceStatus('face-detection', 'running');
                        }
                    }, 2000);
                    break;
                    
                case 'start-camera-service':
                case 'stop-camera-service':
                case 'restart-camera-service':
                    this.ui.showNotification('Camera service control is managed automatically by the face detection system', 'info');
                    break;
                    
                default:
                    console.warn('Unknown service control action:', action);
            }
            
        } catch (error) {
            console.error('Service control failed:', error);
            this.ui.showNotification(error.message || 'Service control operation failed', 'error');
        }
    }

    async saveSystemSettings() {
        const settings = {
            recognition_threshold: document.getElementById('recognition-threshold').value,
            detection_interval: document.getElementById('detection-interval').value,
            auto_enroll: document.getElementById('auto-enroll').checked,
            save_unknown_faces: document.getElementById('save-unknown-faces').checked
        };
        console.log('Save settings:', settings);
        // Implementation for saving settings
    }

    async restartSystem() {
        console.log('Restart system');
        // Implementation for restarting system
    }

    async backupSystem() {
        console.log('Backup system');
        // Implementation for backing up system
    }
    
    async showSystemLogs() {
        try {
            const logsData = await this.api.getSystemLogs();
            
            const modal = document.createElement('div');
            modal.className = 'modal fade show';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">System Logs</h5>
                            <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                        </div>
                        <div class="modal-body">
                            <div class="logs-controls mb-3">
                                <button id="refresh-logs" class="btn btn-sm btn-primary">
                                    <i class="fas fa-refresh"></i> Refresh
                                </button>
                                <button id="clear-logs" class="btn btn-sm btn-warning">
                                    <i class="fas fa-trash"></i> Clear Logs
                                </button>
                                <select id="log-level-filter" class="form-control form-control-sm" style="width: auto; display: inline-block;">
                                    <option value="">All Levels</option>
                                    <option value="ERROR">Error</option>
                                    <option value="WARNING">Warning</option>
                                    <option value="INFO">Info</option>
                                    <option value="DEBUG">Debug</option>
                                </select>
                            </div>
                            <div id="logs-container" class="logs-container" style="height: 400px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
                                ${this.formatLogs(logsData.logs || [])}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show"></div>
            `;
            
            document.body.appendChild(modal);
            
            // Setup logs controls
            modal.querySelector('#refresh-logs').addEventListener('click', async () => {
                const refreshedLogs = await this.api.getSystemLogs();
                modal.querySelector('#logs-container').innerHTML = this.formatLogs(refreshedLogs.logs || []);
            });
            
            modal.querySelector('#log-level-filter').addEventListener('change', (e) => {
                const level = e.target.value;
                const logs = logsData.logs || [];
                const filteredLogs = level ? logs.filter(log => log.includes(level)) : logs;
                modal.querySelector('#logs-container').innerHTML = this.formatLogs(filteredLogs);
            });
            
        } catch (error) {
            console.error('Failed to load system logs:', error);
            this.ui.showNotification('Failed to load system logs', 'error');
        }
    }
    
    formatLogs(logs) {
        if (!logs || logs.length === 0) {
            return '<div style="color: #666; text-align: center; padding: 20px;">No logs available</div>';
        }
        
        return logs.map(log => {
            const logLevel = this.getLogLevel(log);
            const color = this.getLogColor(logLevel);
            return `<div style="color: ${color}; margin-bottom: 5px;">${log}</div>`;
        }).join('');
    }
    
    getLogLevel(log) {
        if (log.includes('ERROR')) return 'ERROR';
        if (log.includes('WARNING')) return 'WARNING';
        if (log.includes('INFO')) return 'INFO';
        if (log.includes('DEBUG')) return 'DEBUG';
        return 'INFO';
    }
    
    getLogColor(level) {
        switch (level) {
            case 'ERROR': return '#dc3545';
            case 'WARNING': return '#ffc107';
            case 'INFO': return '#17a2b8';
            case 'DEBUG': return '#6c757d';
            default: return '#333';
        }
    }
    
    updateServiceStatus(service, status) {
        const statusIndicator = document.getElementById(`${service}-status`);
        const startButton = document.getElementById(`start-${service}`);
        const stopButton = document.getElementById(`stop-${service}`);
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator status-${status}`;
            statusIndicator.innerHTML = `<i class="fas fa-circle"></i> ${status === 'running' ? 'Running' : 'Stopped'}`;
        }
        
        if (startButton && stopButton) {
            if (status === 'running') {
                startButton.disabled = true;
                stopButton.disabled = false;
            } else {
                startButton.disabled = false;
                stopButton.disabled = true;
            }
        }
    }
    
    async refreshSystemStatus() {
        try {
            const systemData = await this.api.getSystemStatus();
            if (systemData.success && systemData.data) {
                const isRunning = systemData.data.is_running;
                this.updateServiceStatus('face-detection', isRunning ? 'running' : 'stopped');
                
                // Update stats
                if (document.getElementById('faces-detected-count')) {
                    document.getElementById('faces-detected-count').textContent = 
                        systemData.data.faces_detected || '0';
                }
                if (document.getElementById('recognition-rate')) {
                    document.getElementById('recognition-rate').textContent = 
                        `${systemData.data.recognition_rate || 0}%`;
                }
                if (document.getElementById('face-detection-uptime')) {
                    const uptime = systemData.data.uptime || 0;
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    document.getElementById('face-detection-uptime').textContent = 
                        `${hours}h ${minutes}m`;
                }
            }
        } catch (error) {
            console.error('Failed to refresh system status:', error);
        }
    }

    changeLayout(layout) {
        const feedGrid = document.getElementById('live-feed-grid');
        if (feedGrid) {
            feedGrid.className = `live-feed-grid ${layout}`;
        }
    }

    async startAllFeeds() {
        console.log('Start all feeds');
        // Implementation for starting all feeds
    }

    async stopAllFeeds() {
        console.log('Stop all feeds');
        // Implementation for stopping all feeds
    }

    async startFeed(cameraId) {
        console.log('Start feed for camera:', cameraId);
        // Implementation for starting individual feed
    }

    toggleDetectionOverlay(e) {
        console.log('Toggle detection overlay:', e.target.checked);
        // Implementation for toggling detection overlay
    }

    toggleNameDisplay(e) {
        console.log('Toggle name display:', e.target.checked);
        // Implementation for toggling name display
    }

    toggleDetectionRecording(e) {
        console.log('Toggle detection recording:', e.target.checked);
        // Implementation for toggling detection recording
    }

    /**
     * Cleanup when page is unloaded
     */
    cleanup() {
        if (this.systemMonitorInterval) {
            clearInterval(this.systemMonitorInterval);
            this.systemMonitorInterval = null;
        }

        // Stop all video feeds
        this.videoElements.forEach((videoElement) => {
            if (videoElement.srcObject) {
                const tracks = videoElement.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        });

        this.videoElements.clear();
        this.activeCameras.clear();
    }
}