// ============================================
// MOBILE-3D UI - Hamburger Menu & Navigation
// ============================================

class Mobile3DUI {
    constructor() {
        // Elements
        this.hamburger = document.getElementById('mobile-menu-toggle');
        this.navMenu = document.getElementById('mobile-nav-menu');
        this.navOverlay = document.getElementById('mobile-nav-overlay');
        this.navLinks = document.querySelectorAll('.mobile-nav-link');
        this.socialLinks = document.querySelectorAll('.social-link');
        this.showFormBtn = document.getElementById('mobile-show-form');
        this.formModal = document.getElementById('mobile-form-modal');
        this.formCloseBtn = this.formModal?.querySelector('.modal-close');
        this.form = document.getElementById('mobile-application-form');
        
        // State
        this.menuOpen = false;
        this.currentScreen = 'screen1';
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize UI handlers
     */
    init() {
        console.log('🎨 Initializing Mobile-3D UI...');
        
        // Hamburger menu
        this.setupHamburgerMenu();
        
        // Navigation links
        this.setupNavigationLinks();
        
        // Social media links
        this.setupSocialLinks();
        
        // Form modal
        this.setupFormModal();
        
        // Listen for camera changes to update active nav
        this.listenForCameraChanges();
        
        console.log('✅ Mobile-3D UI initialized');
    }
    
    /**
     * Setup hamburger menu toggle
     */
    setupHamburgerMenu() {
        if (!this.hamburger || !this.navMenu) {
            console.warn('⚠️ Hamburger menu elements not found');
            return;
        }
        
        // Hamburger click
        this.hamburger.addEventListener('click', () => {
            this.toggleMenu();
        });
        
        // Overlay click (close menu)
        if (this.navOverlay) {
            this.navOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuOpen) {
                this.closeMenu();
            }
        });
        
        console.log('✅ Hamburger menu setup');
    }
    
    /**
     * Toggle menu open/close
     */
    toggleMenu() {
        if (this.menuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    /**
     * Open menu
     */
    openMenu() {
        this.menuOpen = true;
        this.hamburger.classList.add('active');
        this.navMenu.classList.add('active');
        this.navOverlay.classList.add('active');
        
        // Disable scrolling while menu is open
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.disableScroll();
        }
        
        console.log('📖 Menu opened');
    }
    
    /**
     * Close menu
     */
    closeMenu() {
        this.menuOpen = false;
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.navOverlay.classList.remove('active');
        
        // Re-enable scrolling
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.enableScroll();
        }
        
        console.log('📕 Menu closed');
    }
    
    /**
     * Setup navigation link clicks
     */
    setupNavigationLinks() {
        if (!this.navLinks || this.navLinks.length === 0) {
            console.warn('⚠️ No navigation links found');
            return;
        }
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const screenId = link.dataset.screen;
                console.log(`🎯 Nav link clicked: ${screenId}`);
                
                // Update active state
                this.updateActiveNavLink(screenId);
                
                // Navigate to screen
                this.navigateToScreen(screenId);
                
                // Close menu
                this.closeMenu();
            });
        });
        
        console.log(`✅ Setup ${this.navLinks.length} navigation links`);
    }
    
    /**
     * Navigate to a specific screen
     */
    navigateToScreen(screenId) {
        if (!window.mobile3DApp) {
            console.error('❌ App not initialized');
            return;
        }
        
        // Use scroll controller to navigate smoothly
        window.mobile3DApp.scrollController.navigateToScreen(screenId);
        
        // Update current screen
        this.currentScreen = screenId;
    }
    
    /**
     * Update active navigation link
     */
    updateActiveNavLink(screenId) {
        this.navLinks.forEach(link => {
            if (link.dataset.screen === screenId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    /**
     * Setup social media links
     */
    setupSocialLinks() {
        if (!this.socialLinks || this.socialLinks.length === 0) {
            console.warn('⚠️ No social links found');
            return;
        }
        
        const socialUrls = {
            instagram: 'https://instagram.com/keplaaresports',
            twitter: 'https://twitter.com/keplaaresports',
            youtube: 'https://youtube.com/keplaaresports',
            discord: 'https://discord.gg/keplaar'
        };
        
        this.socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const platform = link.dataset.platform;
                console.log(`🔗 Social link clicked: ${platform}`);
                
                if (socialUrls[platform]) {
                    window.open(socialUrls[platform], '_blank', 'noopener,noreferrer');
                }
            });
        });
        
        console.log(`✅ Setup ${this.socialLinks.length} social links`);
    }
    
    /**
     * Setup form modal
     */
    setupFormModal() {
        if (!this.showFormBtn || !this.formModal) {
            console.warn('⚠️ Form elements not found');
            return;
        }
        
        // Show form button click
        this.showFormBtn.addEventListener('click', () => {
            console.log('📋 Opening application form');
            this.openFormModal();
        });
        
        // Close button
        if (this.formCloseBtn) {
            this.formCloseBtn.addEventListener('click', () => {
                this.closeFormModal();
            });
        }
        
        // Click outside to close
        this.formModal.addEventListener('click', (e) => {
            if (e.target === this.formModal) {
                this.closeFormModal();
            }
        });
        
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }
        
        console.log('✅ Form modal setup');
    }
    
    /**
     * Open form modal
     */
    openFormModal() {
        this.formModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Close menu if open
        if (this.menuOpen) {
            this.closeMenu();
        }
        
        // Disable scroll controller
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.disableScroll();
        }
    }
    
    /**
     * Close form modal
     */
    closeFormModal() {
        this.formModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Re-enable scroll controller
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.enableScroll();
        }
        
        console.log('📋 Form closed');
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.form.querySelector('.submit-button');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Get form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            console.log('📋 Form data:', data);
            
            // Simulate submission (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            this.showToast('✅ Application submitted successfully!');
            
            // Reset form
            this.form.reset();
            
            // Close modal
            this.closeFormModal();
            
        } catch (error) {
            console.error('❌ Form submission error:', error);
            this.showToast('❌ Failed to submit. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    /**
     * Show toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Listen for camera position changes to update active nav
     */
    listenForCameraChanges() {
        // Poll current screen every 100ms to update nav
        setInterval(() => {
            if (!window.mobile3DApp?.scrollController) return;
            
            const currentScreen = window.mobile3DApp.scrollController.getCurrentScreen();
            
            if (currentScreen && currentScreen !== this.currentScreen) {
                this.currentScreen = currentScreen;
                this.updateActiveNavLink(currentScreen);
            }
        }, 100);
    }
}