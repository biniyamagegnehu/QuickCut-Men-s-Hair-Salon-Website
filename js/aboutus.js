// QuickCut - About Us JavaScript
// Additional functionality for About Us page

document.addEventListener('DOMContentLoaded', function() {
    // ========== NAVBAR SCROLL EFFECT FOR ABOUT PAGE ==========
    const navbar = document.querySelector('#about-nav');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.padding = '0.5rem 0';
                navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            } else {
                navbar.style.padding = '1rem 0';
                navbar.style.boxShadow = 'none';
            }
        });
        
        // Trigger scroll event on load
        window.dispatchEvent(new Event('scroll'));
    }

    // ========== ACTIVE NAV LINK HIGHLIGHT ==========
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('#about-nav-menu .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('href');
            
            if (linkPage === currentPage || 
                (currentPage === 'aboutus.html' && linkPage === 'aboutus.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // Call on page load
    setActiveNavLink();

    // ========== SMOOTH SCROLL TO INTERNAL LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100; // Adjust for navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== FEATURE CARDS INTERACTIVITY ==========
    const featureItems = document.querySelectorAll('.feature-item');
    
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            
            const icon = this.querySelector('.feature-icon i');
            if (icon) {
                icon.style.color = '#ff6b35'; // Primary color
                icon.style.transition = 'color 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            
            const icon = this.querySelector('.feature-icon i');
            if (icon) {
                icon.style.color = ''; // Reset to default
            }
        });
    });

    // ========== MAP PLACEHOLDER INTERACTIVITY ==========
    const mapPlaceholder = document.querySelector('#map-placeholder');
    const googleMapsBtn = document.querySelector('#google-maps-btn');
    
    if (mapPlaceholder) {
        // Add hover effect
        mapPlaceholder.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
            this.style.transition = 'background-color 0.3s ease';
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        mapPlaceholder.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
        
        // Click to open Google Maps
        mapPlaceholder.addEventListener('click', function() {
            if (googleMapsBtn) {
                googleMapsBtn.click();
            }
        });
        
        mapPlaceholder.style.cursor = 'pointer';
        mapPlaceholder.style.padding = '2rem';
        mapPlaceholder.style.borderRadius = '8px';
        mapPlaceholder.style.backgroundColor = '#f0f0f0';
        mapPlaceholder.style.textAlign = 'center';
    }

    // ========== CONTACT INFO COPY TO CLIPBOARD ==========
    const contactItems = document.querySelectorAll('#contact-details p');
    
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            
            // Don't copy if it's a heading
            if (text.length > 0 && !text.includes(':')) {
                copyToClipboard(text);
                showToast('Copied!', `"${text}" copied to clipboard`, 'success');
            }
        });
        
        // Add hover effect
        item.style.cursor = 'pointer';
        item.style.transition = 'background-color 0.2s ease';
        
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });

    // ========== WORKING HOURS ANIMATION ==========
    const hoursItems = document.querySelectorAll('.hours-item');
    
    hoursItems.forEach(item => {
        const currentTime = new Date();
        const currentDay = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const currentHour = currentTime.getHours();
        
        // Check if this is current day
        let isCurrentDay = false;
        
        if (item.id === 'weekday-hours' && currentDay >= 1 && currentDay <= 5) {
            isCurrentDay = true;
        } else if (item.id === 'saturday-hours' && currentDay === 6) {
            isCurrentDay = true;
        } else if (item.id === 'sunday-hours' && currentDay === 0) {
            isCurrentDay = true;
        }
        
        // Check if we're within business hours
        if (isCurrentDay) {
            const timeRange = item.querySelector('span').textContent;
            const [openStr, closeStr] = timeRange.split(' - ');
            
            // Convert to 24-hour format for comparison
            const openTime = convertTo24Hour(openStr.trim());
            const closeTime = convertTo24Hour(closeStr.trim());
            
            if (currentHour >= openTime && currentHour < closeTime) {
                // We're open now!
                item.style.backgroundColor = 'rgba(25, 135, 84, 0.1)';
                item.style.borderLeft = '4px solid #198754';
                item.style.paddingLeft = '1rem';
                item.style.transition = 'all 0.3s ease';
                
                // Add "Open Now" badge
                const badge = document.createElement('span');
                badge.className = 'badge bg-success ms-2';
                badge.textContent = 'Open Now';
                item.querySelector('strong').appendChild(badge);
                
                // Animate the walk-in notice
                const walkInNotice = document.querySelector('#walk-in-notice');
                if (walkInNotice) {
                    walkInNotice.style.backgroundColor = 'rgba(25, 135, 84, 0.2)';
                    walkInNotice.style.border = '2px solid #198754';
                    
                    // Add pulsing animation
                    walkInNotice.style.animation = 'pulse 2s infinite';
                }
            } else if (currentHour < openTime) {
                // We'll open later
                item.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
                item.style.borderLeft = '4px solid #ffc107';
                item.style.paddingLeft = '1rem';
            } else {
                // We're closed for today
                item.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                item.style.borderLeft = '4px solid #dc3545';
                item.style.paddingLeft = '1rem';
                
                const badge = document.createElement('span');
                badge.className = 'badge bg-danger ms-2';
                badge.textContent = 'Closed';
                item.querySelector('strong').appendChild(badge);
            }
        }
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            if (!this.style.backgroundColor) {
                this.style.backgroundColor = '#f8f9fa';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            // Don't reset if it's styled based on time
            if (!this.classList.contains('current-day')) {
                this.style.backgroundColor = '';
            }
        });
    });

    // ========== SOCIAL MEDIA LINKS ANIMATION ==========
    const socialLinks = document.querySelectorAll('#footer-social a');
    
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'translateY(-3px) scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
                
                // Different colors for different platforms
                if (this.id === 'facebook-link') {
                    icon.style.color = '#1877f2';
                } else if (this.id === 'twitter-link') {
                    icon.style.color = '#1da1f2';
                } else if (this.id === 'instagram-link') {
                    icon.style.color = '#e4405f';
                } else if (this.id === 'tiktok-link') {
                    icon.style.color = '#000000';
                }
            }
        });
        
        link.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'translateY(0) scale(1)';
                icon.style.color = '';
            }
        });
    });

    // ========== STORY REVEAL ANIMATION ==========
    const storyParagraphs = document.querySelectorAll('#our-story-content p');
    
    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 300); // Staggered animation
            }
        });
    }, observerOptions);
    
    // Observe story paragraphs and feature items
    storyParagraphs.forEach(paragraph => {
        paragraph.style.opacity = '0';
        paragraph.style.transform = 'translateY(20px)';
        paragraph.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(paragraph);
    });
    
    featureItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(item);
    });
    
    // Also observe cards
    const cards = document.querySelectorAll('.login-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(card);
    });

    // ========== FOOTER SCROLL REVEAL ==========
    const footer = document.querySelector('#about-footer');
    if (footer) {
        observer.observe(footer);
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(20px)';
        footer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }

    // ========== BACK TO TOP BUTTON ==========
    const backToTopBtn = document.querySelector('#back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
                backToTopBtn.style.animation = 'fadeIn 0.3s ease';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Style the button
        backToTopBtn.style.position = 'fixed';
        backToTopBtn.style.bottom = '20px';
        backToTopBtn.style.right = '20px';
        backToTopBtn.style.zIndex = '1000';
        backToTopBtn.style.width = '50px';
        backToTopBtn.style.height = '50px';
        backToTopBtn.style.borderRadius = '50%';
        backToTopBtn.style.display = 'none';
        backToTopBtn.style.alignItems = 'center';
        backToTopBtn.style.justifyContent = 'center';
        backToTopBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }

    // ========== ADDITIONAL STYLES ==========
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .feature-item {
            transition: all 0.3s ease;
            padding: 1.5rem;
            border-radius: 10px;
        }
        
        .feature-item:hover {
            background-color: rgba(255, 107, 53, 0.05);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .feature-icon i {
            transition: all 0.3s ease;
        }
        
        .hours-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #dee2e6;
            transition: all 0.3s ease;
        }
        
        .hours-item:last-child {
            border-bottom: none;
        }
        
        #walk-in-notice {
            transition: all 0.3s ease;
        }
        
        .social-links a {
            transition: all 0.3s ease;
            padding: 0.5rem;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        
        .social-links a:hover {
            background-color: rgba(255,255,255,0.1);
            transform: translateY(-3px);
        }
        
        .badge {
            font-size: 0.6em;
            padding: 0.2em 0.5em;
            margin-left: 0.5em;
        }
    `;
    document.head.appendChild(additionalStyles);

    // ========== HELPER FUNCTIONS ==========
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
    
    function convertTo24Hour(timeStr) {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
            hours = '00';
        }
        
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        
        return parseInt(hours, 10);
    }
    
    function showToast(title, message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    <small>${message}</small>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Initialize Bootstrap toast
        const bsToast = new bootstrap.Toast(toast, {
            delay: 3000
        });
        bsToast.show();
        
        // Remove toast from DOM after it's hidden
        toast.addEventListener('hidden.bs.toast', function () {
            toast.remove();
        });
    }

    // ========== PAGE VISIT COUNTER (DEMO) ==========
    function updateVisitCounter() {
        const visits = localStorage.getItem('quickcutAboutVisits') || 0;
        const newVisits = parseInt(visits) + 1;
        localStorage.setItem('quickcutAboutVisits', newVisits);
        
        // Show welcome message for first-time visitors
        if (newVisits === 1) {
            setTimeout(() => {
                showToast('Welcome!', 'Thanks for learning more about QuickCut', 'info');
            }, 1500);
        }
        
        // Optional: Log visits (for demo purposes)
        console.log(`About Us page visits: ${newVisits}`);
    }
    
    // Update counter on page load
    updateVisitCounter();

    // ========== INITIALIZATION COMPLETE ==========
    console.log('QuickCut About Us page initialized!');
    
    // Trigger initial animations
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    }, 100);
});