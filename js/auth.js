// auth.js - central logout handler
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        const anchor = e.target.closest && e.target.closest('a');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (!href) return;

        // Only special-case links that navigate to the public home page
        if (href.endsWith('welcome.html') || href === 'welcome.html') {
            // If this is the explicit logout link, clear session and allow navigation
            if (anchor.id === 'nav-logout') {
                try {
                    sessionStorage.removeItem('quickcutCurrentUser');
                } catch (err) {
                    console.warn('Failed clearing session on logout', err);
                }
                // allow default navigation to proceed
                return;
            }

            // For other links that happen to point to welcome.html, do not clear session
            // (allow navigation but ensure we don't accidentally treat this as a logout)
            return;
        }
    }, false);
});
