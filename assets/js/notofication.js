/**
 * QuickCut Notification System JS - Robust Version
 */

(function() {
    // Self-healing BASE_URL
    function getBaseUrl() {
        if (typeof window.BASE_URL !== 'undefined' && window.BASE_URL) return window.BASE_URL;
        
        const scriptTag = document.querySelector('script[src*="notifications.js"]');
        if (scriptTag) {
            const src = scriptTag.getAttribute('src');
            return src.split('assets')[0];
        }
        
        // Final fallback: try to guess from location
        const path = window.location.pathname;
        if (path.includes('/admin/')) return '../';
        if (path.includes('/booking/') || path.includes('/queue/') || path.includes('/auth/')) return '../';
        return './';
    }

    const BASE_URL = getBaseUrl();

    function init() {
        const bellWrapper = document.getElementById('notification-bell-wrapper');
        const dropdown = document.getElementById('notification-dropdown');
        const badge = document.getElementById('notification-badge');
        
        if (!bellWrapper || !dropdown) {
            // If elements not found, retry once after a short delay (useful for dynamic injection)
            if (!window.notifRetry) {
                window.notifRetry = true;
                setTimeout(init, 500);
            }
            return;
        }

        let hoverTimeout;

        // --- Fetch Logic ---
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${BASE_URL}notifications/get_notifications.php`);
                const data = await response.json();
                if (data.success) {
                    updateUI(data);
                }
            } catch (err) { console.error("Notification Fetch Error:", err); }
        };

        const updateUI = (data) => {
            // Update Badge
            if (badge) {
                const unread = data.unread_count;
                badge.innerText = unread > 9 ? '9+' : unread;
                badge.style.display = unread > 0 ? 'block' : 'none';
            }

            // Update Text Status
            const unreadText = document.getElementById('unread-count-text');
            if (unreadText) {
                unreadText.innerText = data.unread_count > 0 ? `${data.unread_count} New` : 'No New Notifications';
            }

            // Update List
            const list = document.getElementById('notification-list');
            if (!list) return;

            if (data.notifications.length === 0) {
                list.innerHTML = '<div class="no-notifications"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
                return;
            }

            list.innerHTML = data.notifications.map(n => `
                <div class="notification-item ${parseInt(n.is_read) === 0 ? 'unread' : ''}" onclick="markOneRead(${n.id})">
                    <div class="notification-icon"><i class="${getIcon(n.type)}"></i></div>
                    <div class="notification-content">
                        <p class="notification-msg">${n.message}</p>
                        <span class="notification-time">${timeAgo(n.created_at)}</span>
                    </div>
                </div>
            `).join('');
        };

        // --- Event Listeners ---
        bellWrapper.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            dropdown.classList.add('active');
            fetchNotifications();
        });

        bellWrapper.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                dropdown.classList.remove('active');
            }, 300);
        });

        bellWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.innerWidth <= 992) {
                dropdown.classList.toggle('active');
                if (dropdown.classList.contains('active')) fetchNotifications();
            }
        });

        document.addEventListener('click', (e) => {
            if (!bellWrapper.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        const markAllBtn = document.getElementById('mark-all-read-btn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    const res = await fetch(`${BASE_URL}notifications/mark_notification_read.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mark_all: true })
                    });
                    const data = await res.json();
                    if (data.success) fetchNotifications();
                } catch (err) { console.error(err); }
            });
        }

        // --- Helper Functions ---
        window.markOneRead = async (id) => {
            try {
                const res = await fetch(`${BASE_URL}notifications/mark_notification_read.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification_id: id })
                });
                const data = await res.json();
                if (data.success) fetchNotifications();
            } catch (err) { console.error(err); }
        };

        function getIcon(type) {
            const icons = {
                'payment_success': 'fas fa-check-circle',
                'payment_failed': 'fas fa-times-circle',
                'status_change': 'fas fa-info-circle',
                'admin_new_booking': 'fas fa-calendar-plus',
                'queue_alert_1': 'fas fa-clock',
                'queue_alert_2': 'fas fa-clock'
            };
            return icons[type] || 'fas fa-bell';
        }

        function timeAgo(dateString) {
            const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
            if (diff < 60) return 'just now';
            if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
            if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
            return Math.floor(diff / 86400) + 'd ago';
        }

        // Initial fetch and interval
        fetchNotifications();
        setInterval(fetchNotifications, 15000);
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
