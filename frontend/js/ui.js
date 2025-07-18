/**
 * UI Service Module
 * Handles common UI interactions, notifications, modals, and utilities
 */

class UIService {
    constructor(app) {
        this.app = app;
        this.notificationId = 0;
        this.setupUIHandlers();
    }

    /**
     * Setup global UI handlers
     */
    setupUIHandlers() {
        // Setup mobile menu toggle
        this.setupMobileMenu();
        
        // Setup form validation
        this.setupFormValidation();
        
        // Setup file upload handlers
        this.setupFileUpload();
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        // Add mobile menu toggle if needed
        const navbar = document.querySelector('.navbar-brand');
        if (navbar && window.innerWidth <= 768) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'mobile-menu-toggle btn btn-ghost';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
            navbar.appendChild(menuToggle);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.classList.contains('validate')) {
                if (!this.validateForm(form)) {
                    event.preventDefault();
                }
            }
        });
    }

    /**
     * Validate form
     */
    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.appendChild(errorElement);
        } else {
            field.parentNode.appendChild(errorElement);
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('error');
        const formGroup = field.closest('.form-group') || field.parentNode;
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Setup file upload handlers
     */
    setupFileUpload() {
        document.addEventListener('change', (event) => {
            if (event.target.type === 'file') {
                this.handleFileUpload(event.target);
            }
        });

        // Drag and drop functionality
        document.addEventListener('dragover', (event) => {
            event.preventDefault();
            const uploadArea = event.target.closest('.file-upload-area');
            if (uploadArea) {
                uploadArea.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (event) => {
            const uploadArea = event.target.closest('.file-upload-area');
            if (uploadArea) {
                uploadArea.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (event) => {
            event.preventDefault();
            const uploadArea = event.target.closest('.file-upload-area');
            if (uploadArea) {
                uploadArea.classList.remove('drag-over');
                const fileInput = uploadArea.querySelector('input[type="file"]');
                if (fileInput && event.dataTransfer.files.length > 0) {
                    fileInput.files = event.dataTransfer.files;
                    this.handleFileUpload(fileInput);
                }
            }
        });
    }

    /**
     * Handle file upload
     */
    handleFileUpload(input) {
        const file = input.files[0];
        if (!file) return;

        // Show file preview if it's an image
        if (file.type.startsWith('image/')) {
            this.showImagePreview(input, file);
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File size must be less than 10MB', 'error');
            input.value = '';
            return;
        }
    }

    /**
     * Show image preview
     */
    showImagePreview(input, file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            let preview = input.parentNode.querySelector('.image-preview');
            if (!preview) {
                preview = document.createElement('img');
                preview.className = 'image-preview';
                input.parentNode.appendChild(preview);
            }
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);

            // Auto remove after duration
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Show loading state on element
     */
    showLoading(element, message = 'Loading...') {
        element.classList.add('loading');
        element.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;
    }

    /**
     * Hide loading state
     */
    hideLoading(element) {
        element.classList.remove('loading');
    }

    /**
     * Create data table
     */
    createDataTable(container, config) {
        const {
            title,
            data,
            columns,
            actions = [],
            searchable = true,
            sortable = true,
            pagination = true,
            pageSize = 10
        } = config;

        let html = `
            <div class="data-table-container">
                <div class="data-table-header">
                    <h3>${title}</h3>
                    <div class="data-table-actions">
                        ${searchable ? '<input type="text" class="search-input" placeholder="Search...">' : ''}
                        ${actions.map(action => `
                            <button class="btn ${action.class || 'btn-primary'}" data-action="${action.id}">
                                ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `
                                <th ${sortable ? 'class="sortable"' : ''} data-column="${col.key}">
                                    ${col.label}
                                    ${sortable ? '<i class="fas fa-sort"></i>' : ''}
                                </th>
                            `).join('')}
                            ${config.rowActions ? '<th>Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateTableRows(data, columns, config.rowActions)}
                    </tbody>
                </table>
            </div>
        `;

        if (pagination && data.length > pageSize) {
            html += this.generatePagination(data.length, pageSize);
        }

        container.innerHTML = html;
        this.setupTableHandlers(container, config);
    }

    /**
     * Generate table rows
     */
    generateTableRows(data, columns, rowActions) {
        if (!data || data.length === 0) {
            return `
                <tr>
                    <td colspan="${columns.length + (rowActions ? 1 : 0)}" class="text-center">
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="fas fa-inbox"></i>
                            </div>
                            <p>No data available</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return data.map(row => `
            <tr>
                ${columns.map(col => `
                    <td>
                        ${this.formatCellValue(row[col.key], col.type, row)}
                    </td>
                `).join('')}
                ${rowActions ? `
                    <td>
                        <div class="table-actions">
                            ${rowActions.map(action => `
                                <button class="btn btn-sm ${action.class || 'btn-secondary'}" 
                                        data-action="${action.id}" 
                                        data-id="${row.id || row.employee_id}">
                                    ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                                    ${action.label || ''}
                                </button>
                            `).join('')}
                        </div>
                    </td>
                ` : ''}
            </tr>
        `).join('');
    }

    /**
     * Format cell value based on type
     */
    formatCellValue(value, type, row) {
        if (value === null || value === undefined) {
            return '-';
        }

        switch (type) {
            case 'date':
                return this.formatDate(value);
            case 'datetime':
                return this.formatDateTime(value);
            case 'status':
                return `<span class="status-badge ${value.toLowerCase()}">${value}</span>`;
            case 'boolean':
                return value ? 
                    '<span class="status-badge active">Yes</span>' : 
                    '<span class="status-badge inactive">No</span>';
            case 'email':
                return `<a href="mailto:${value}">${value}</a>`;
            case 'phone':
                return `<a href="tel:${value}">${value}</a>`;
            default:
                return this.escapeHtml(value.toString());
        }
    }

    /**
     * Setup table event handlers
     */
    setupTableHandlers(container, config) {
        // Search functionality
        const searchInput = container.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTable(container, e.target.value);
            });
        }

        // Action button handlers
        container.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn && config.onAction) {
                const action = actionBtn.dataset.action;
                const id = actionBtn.dataset.id;
                config.onAction(action, id, actionBtn);
            }
        });

        // Sort functionality
        if (config.sortable) {
            container.addEventListener('click', (e) => {
                const th = e.target.closest('th.sortable');
                if (th) {
                    this.sortTable(container, th.dataset.column);
                }
            });
        }
    }

    /**
     * Filter table rows
     */
    filterTable(container, searchTerm) {
        const rows = container.querySelectorAll('tbody tr');
        const term = searchTerm.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(term)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    /**
     * Sort table by column
     */
    sortTable(container, columnKey) {
        // Implementation would depend on having access to original data
        // For now, just show visual feedback
        const th = container.querySelector(`[data-column="${columnKey}"]`);
        const icon = th.querySelector('i');
        
        // Toggle sort icon
        if (icon.classList.contains('fa-sort')) {
            icon.className = 'fas fa-sort-up';
        } else if (icon.classList.contains('fa-sort-up')) {
            icon.className = 'fas fa-sort-down';
        } else {
            icon.className = 'fas fa-sort-up';
        }

        // Reset other column icons
        container.querySelectorAll('th.sortable i').forEach(i => {
            if (i !== icon) {
                i.className = 'fas fa-sort';
            }
        });
    }

    /**
     * Generate pagination
     */
    generatePagination(totalItems, pageSize) {
        const totalPages = Math.ceil(totalItems / pageSize);
        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';
        
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="pagination-btn ${i === 1 ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    /**
     * Format date and time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Create form from configuration
     */
    createForm(container, config) {
        const {
            title,
            fields,
            submitLabel = 'Submit',
            onSubmit
        } = config;

        const html = `
            <div class="content-card">
                <h2>${title}</h2>
                <form class="form validate" data-form="${config.id || 'dynamic-form'}">
                    ${fields.map(field => this.generateFormField(field)).join('')}
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">
                            ${submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        `;

        container.innerHTML = html;

        // Setup form handler
        if (onSubmit) {
            const form = container.querySelector('form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    onSubmit(data, form);
                }
            });
        }
    }

    /**
     * Generate form field HTML
     */
    generateFormField(field) {
        const {
            type = 'text',
            name,
            label,
            placeholder,
            required = false,
            options = [],
            value = ''
        } = field;

        let inputHtml = '';

        switch (type) {
            case 'select':
                inputHtml = `
                    <select name="${name}" ${required ? 'required' : ''}>
                        <option value="">Select ${label}</option>
                        ${options.map(opt => `
                            <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;
            case 'textarea':
                inputHtml = `
                    <textarea name="${name}" placeholder="${placeholder || ''}" ${required ? 'required' : ''}>${value}</textarea>
                `;
                break;
            case 'file':
                inputHtml = `
                    <div class="file-upload-area">
                        <input type="file" name="${name}" ${required ? 'required' : ''} ${field.accept ? `accept="${field.accept}"` : ''}>
                        <div class="upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <p class="upload-text">Click to upload or drag and drop</p>
                        <p class="upload-subtext">Maximum file size: 10MB</p>
                    </div>
                `;
                break;
            default:
                inputHtml = `
                    <input type="${type}" 
                           name="${name}" 
                           placeholder="${placeholder || ''}" 
                           value="${value}"
                           ${required ? 'required' : ''}>
                `;
        }

        return `
            <div class="form-group">
                <label for="${name}">${label} ${required ? '*' : ''}</label>
                ${inputHtml}
            </div>
        `;
    }

    /**
     * Create stats grid
     */
    createStatsGrid(container, stats) {
        const html = `
            <div class="stats-grid">
                ${stats.map(stat => `
                    <div class="stat-card">
                        <div class="stat-value">${stat.value}</div>
                        <div class="stat-label">${stat.label}</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Show confirmation dialog
     */
    showConfirmation(title, message, onConfirm, onCancel) {
        return this.app.showConfirmation(title, message, onConfirm, onCancel);
    }

    /**
     * Show loading modal
     */
    showLoadingModal(message = 'Processing...') {
        const modal = document.getElementById('loading-modal');
        const messageEl = document.getElementById('loading-message');
        
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Hide loading modal
     */
    hideLoadingModal() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIService;
}