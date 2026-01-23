// ============================================
// MOBILE-3D UI - FIXED VERSION
// Proper outro modal handling with scroll re-enabling
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
        
        // 🆕 OUTRO MODAL STATE
        this.outroModalElement = null;
        this.outroModalOpen = false;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize UI handlers
     */
    init() {
        console.log('🎨 Initializing Mobile-3D UI...');
        
        setTimeout(() => {
            this.setupHamburgerMenu();
            this.setupNavigationLinks();
            this.setupSocialLinks();
            this.setupFormModal();
            
            console.log('✅ Mobile-3D UI initialized');
        }, 500);
    }
    
    /**
     * Setup hamburger menu
     */
    setupHamburgerMenu() {
        if (!this.hamburger || !this.navMenu) {
            console.error('❌ Hamburger menu elements not found!');
            return;
        }
        
        this.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });
        
        if (this.navOverlay) {
            this.navOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuOpen) {
                this.closeMenu();
            }
        });
        
        console.log('✅ Hamburger menu setup complete');
    }
    
    /**
     * Toggle menu
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
        
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.enableScroll();
        }
        
        console.log('📕 Menu closed');
    }
    
    /**
     * Setup navigation links
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
                
                this.updateActiveNavLink(screenId);
                this.navigateToScreen(screenId);
                this.closeMenu();
            });
        });
        
        console.log(`✅ Setup ${this.navLinks.length} navigation links`);
    }
    
    /**
     * Navigate to screen with smooth animation
     */
    async navigateToScreen(screenId) {
        if (!window.mobile3DApp) {
            console.error('❌ App not initialized');
            return;
        }
        
        const currentScroll = window.mobile3DApp.scrollController.getScrollPercent();
        
        const screenMap = {
            'screen1': 'screen1-center',
            'screen2': 'screen2-center',
            'screen3': 'screen3-center',
            'screen4': 'screen4-center',
            'outro': 'outro'
        };
        
        const targetPositionKey = screenMap[screenId];
        if (!targetPositionKey) {
            console.error(`❌ Unknown screen: ${screenId}`);
            return;
        }
        
        const targetScroll = window.mobile3DApp.cameraController.getScrollPercentForPosition(targetPositionKey);
        const distance = Math.abs(targetScroll - currentScroll);
        
        let duration = 3;
        if (distance > 60) {
            duration = 6;
        } else if (distance > 30) {
            duration = 4.5;
        }
        
        console.log(`📏 Distance: ${distance.toFixed(1)}% → Duration: ${duration}s`);
        
        const startScroll = currentScroll;
        const startTime = performance.now();
        const animDuration = duration * 1000;
        
        const animateScroll = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / animDuration, 1);
            
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const newScroll = startScroll + (targetScroll - startScroll) * eased;
            window.mobile3DApp.scrollController.setScroll(newScroll, true);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                console.log(`✅ Arrived at ${screenId}`);
            }
        };
        
        animateScroll();
        this.updateActiveNavLink(screenId);
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
            instagram: 'https://www.instagram.com/keplaar_meme.gg?igsh=dzQ2c2hteDJua2dj',
            twitter: 'https://twitter.com/keplaaresports', 
            youtube: 'https://youtube.com/keplaaresports',
            discord: 'https://discord.gg/WsG2V2tRK'
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
        
        this.showFormBtn.addEventListener('click', () => {
            console.log('📋 Opening application form');
            this.openFormModal();
        });
        
        if (this.formCloseBtn) {
            this.formCloseBtn.addEventListener('click', () => {
                this.closeFormModal();
            });
        }
        
        this.formModal.addEventListener('click', (e) => {
            if (e.target === this.formModal) {
                this.closeFormModal();
            }
        });
        
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
        
        if (this.menuOpen) {
            this.closeMenu();
        }
        
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
        
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            console.log('📋 Form data:', data);
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showToast('✅ Application submitted successfully!');
            
            this.form.reset();
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
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 170, 255, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * 🆕 SHOW OUTRO MODAL - Returns Promise
     */
    async showOutroModal() {
        return new Promise((resolve) => {
            console.log('🎯 Showing outro modal');
            
            // Create or get modal
            this.outroModalElement = document.getElementById('outro-modal');
            
            if (!this.outroModalElement) {
                this.createOutroModal();
            }
            
            // Show modal
            this.outroModalElement.style.display = 'flex';
            this.outroModalOpen = true;
            
            // 🆕 SETUP CLOSE HANDLERS THAT RE-ENABLE SCROLL
            const closeHandler = () => {
                this.closeOutroModal();
                resolve(); // Resolve promise when closed
            };
            
            // Close button
            const closeBtn = this.outroModalElement.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.onclick = closeHandler;
            }
            
            // Overlay click
            this.outroModalElement.onclick = (e) => {
                if (e.target === this.outroModalElement) {
                    closeHandler();
                }
            };
            
            // Social link cards (don't close, just open links)
            this.outroModalElement.querySelectorAll('.social-link-card').forEach(link => {
                link.onclick = (e) => {
                    e.preventDefault();
                    const platform = link.dataset.platform;
                    const urls = {
                        instagram: 'https://instagram.com/keplaaresports',
                        twitter: 'https://twitter.com/keplaaresports',
                        youtube: 'https://youtube.com/keplaaresports',
                        discord: 'https://discord.gg/keplaar'
                    };
                    if (urls[platform]) {
                        window.open(urls[platform], '_blank', 'noopener,noreferrer');
                    }
                };
            });
            
            // Join button
            const joinBtn = this.outroModalElement.querySelector('#outro-show-form');
            if (joinBtn) {
                joinBtn.onclick = () => {
                    this.closeOutroModal();
                    this.openFormModal();
                    resolve(); // Resolve after opening form
                };
            }
        });
    }
    
    /**
     * 🆕 CLOSE OUTRO MODAL AND RE-ENABLE SCROLL
     */
    closeOutroModal() {
        console.log('📕 Closing outro modal');
        
        if (this.outroModalElement) {
            this.outroModalElement.style.display = 'none';
        }
        
        this.outroModalOpen = false;
        
        // 🆕 RE-ENABLE SCROLL - THIS IS CRUCIAL
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.enableScroll();
            console.log('✅ Scroll re-enabled after outro modal close');
        }
    }
    
    /**
     * 🆕 CREATE OUTRO MODAL
     */
    createOutroModal() {
        const modal = document.createElement('div');
        modal.id = 'outro-modal';
        modal.className = 'mobile-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <button class="modal-close" aria-label="Close">&times;</button>
                <h2>Join Keplaar Esports</h2>
                <p class="form-subtitle">Connect with us and become part of our team</p>
                
                <div class="social-links-grid">
                    <a href="#" class="social-link-card" data-platform="instagram">
                        <img src="assets/icons/instagram.png" alt="Instagram">
                        <span>Instagram</span>
                    </a>
                    <a href="#" class="social-link-card" data-platform="twitter">
                        <img src="assets/icons/x.png" alt="Twitter">
                        <span>Twitter/X</span>
                    </a>
                    <a href="#" class="social-link-card" data-platform="youtube">
                        <img src="assets/icons/youtube.png" alt="YouTube">
                        <span>YouTube</span>
                    </a>
                    <a href="#" class="social-link-card" data-platform="discord">
                        <img src="assets/icons/discord.png" alt="Discord">
                        <span>Discord</span>
                    </a>
                </div>
                
                <button class="outro-join-btn" id="outro-show-form">
                    Apply to Join Team
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .social-links-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 30px 0;
            }
            .social-link-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                text-decoration: none;
                color: white;
                transition: all 0.3s ease;
            }
            .social-link-card:active {
                background: rgba(0, 170, 255, 0.2);
                transform: scale(0.95);
            }
            .social-link-card img {
                width: 40px;
                height: 40px;
            }
            .outro-join-btn {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #00aaff, #00ffaa);
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
        `;
        document.head.appendChild(style);
        
        this.outroModalElement = modal;
    }
}