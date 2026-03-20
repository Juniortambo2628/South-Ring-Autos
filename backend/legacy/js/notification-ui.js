/**
 * Custom Notification System
 * Replaces browser alerts with Bootstrap-based UI notifications
 */

const NotificationUI = {
    /**
     * Show success notification
     */
    showSuccess(title, message, duration = 5000) {
        this.showNotification(title, message, 'success', duration);
    },

    /**
     * Show error notification
     */
    showError(title, message, duration = 0) {
        this.showNotification(title, message, 'danger', duration);
    },

    /**
     * Show warning notification
     */
    showWarning(title, message, duration = 5000) {
        this.showNotification(title, message, 'warning', duration);
    },

    /**
     * Show info notification
     */
    showInfo(title, message, duration = 5000) {
        this.showNotification(title, message, 'info', duration);
    },

    /**
     * Show notification toast
     */
    showNotification(title, message, type = 'info', duration = 5000) {
        // Create container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '10000';
            container.style.maxWidth = '400px';
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.setAttribute('role', 'alert');
        notification.style.marginBottom = '10px';
        notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        notification.style.animation = 'slideInRight 0.3s ease-out';

        // Get icon based on type
        const icons = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="fas ${icons[type]} fa-lg me-3 mt-1"></i>
                <div class="flex-grow-1">
                    <strong>${title}</strong>
                    <p class="mb-0 mt-1">${message}</p>
                </div>
                <button type="button" class="btn-close ms-2" data-bs-dismiss="alert"></button>
            </div>
        `;

        container.appendChild(notification);

        // Auto-dismiss if duration is set
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        // Add CSS animation if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        return notification;
    },

    /**
     * Show modal dialog (replacement for window.alert)
     */
    showModal(title, message, type = 'info', onClose = null) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('notification-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'notification-modal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Get icon and color based on type
        const configs = {
            success: { icon: 'fa-check-circle', color: 'text-success' },
            danger: { icon: 'fa-exclamation-circle', color: 'text-danger' },
            warning: { icon: 'fa-exclamation-triangle', color: 'text-warning' },
            info: { icon: 'fa-info-circle', color: 'text-info' }
        };

        const config = configs[type] || configs.info;

        // Update modal content
        modal.querySelector('.modal-title').innerHTML = `
            <i class="fas ${config.icon} ${config.color} me-2"></i>${title}
        `;
        modal.querySelector('.modal-body').innerHTML = message;

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Handle close callback
        if (onClose) {
            modal.addEventListener('hidden.bs.modal', onClose, { once: true });
        }

        return bsModal;
    },

    /**
     * Show confirmation dialog (replacement for window.confirm)
     */
    showConfirm(title, message, onConfirm, onCancel = null) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirm-modal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-btn">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirm-btn">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Update modal content
        modal.querySelector('.modal-title').innerHTML = `
            <i class="fas fa-question-circle text-primary me-2"></i>${title}
        `;
        modal.querySelector('.modal-body').innerHTML = message;

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Handle confirm
        const confirmBtn = modal.querySelector('#confirm-btn');
        const handleConfirm = () => {
            bsModal.hide();
            if (onConfirm) onConfirm();
        };
        confirmBtn.removeEventListener('click', confirmBtn._handler);
        confirmBtn._handler = handleConfirm;
        confirmBtn.addEventListener('click', handleConfirm);

        // Handle cancel
        if (onCancel) {
            const cancelBtn = modal.querySelector('#cancel-btn');
            const handleCancel = () => {
                if (onCancel) onCancel();
            };
            cancelBtn.removeEventListener('click', cancelBtn._handler);
            cancelBtn._handler = handleCancel;
            cancelBtn.addEventListener('click', handleCancel);
        }

        return bsModal;
    }
};

// Make it globally available
window.NotificationUI = NotificationUI;
