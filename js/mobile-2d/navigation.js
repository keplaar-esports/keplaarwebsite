// ============================================
// MOBILE NAVIGATION.JS - Hamburger Menu
// ============================================

class MobileNavigation {
    constructor() {
        this.hamburger = document.getElementById('mobile-menu-toggle');
        this.navMenu = document.getElementById('mobile-nav');
        this.navLinks = document.querySelectorAll('.mobile-nav-menu a');
        this.overlay = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Create overlay
        this.createOverlay();
        
        // Setup hamburger click
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggle());
        }
        
        // Setup nav link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        console.log('🍔 Mobile navigation ready');
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'nav-overlay';
        document.body.appendChild(this.overlay);
        
        this.overlay.addEventListener('click', () => this.close());
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.hamburger.classList.add('active');
        this.navMenu.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log('📖 Menu opened');
    }
    
    close() {
        this.isOpen = false;
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        console.log('📕 Menu closed');
    }
    
    handleNavClick(e, link) {
        e.preventDefault();
        
        const sectionId = link.getAttribute('href');
        const section = document.querySelector(sectionId);
        
        if (section) {
            // Close menu
            this.close();
            
            // Wait for menu close animation
            setTimeout(() => {
                // Scroll to section
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active link
                this.updateActiveLink(link);
            }, 300);
        }
    }
    
    updateActiveLink(activeLink) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
}

// Make available globally
window.MobileNavigation = MobileNavigation;