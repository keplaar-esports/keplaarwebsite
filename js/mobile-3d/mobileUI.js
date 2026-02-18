// ============================================
// MOBILE-3D UI - FIXED VERSION WITH SUPABASE
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
            this.setupNavArrows();
            
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
        // DON'T disable body overflow - let the modal handle its own scrolling
        
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
        // Body overflow was never disabled, so no need to reset it
        
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.enableScroll();
        }
        
        console.log('📋 Form closed');
    }
    
    /**
     * Handle form submission - WITH SUPABASE (SAME AS DESKTOP)
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.form.querySelector('.submit-button');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Check if Supabase SDK loaded (SAME AS DESKTOP)
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase SDK not loaded. Check internet connection and try refreshing the page.');
            }
            
            // Check if Supabase client initialized (SAME AS DESKTOP)
            if (!window.supabaseClient) {
                if (window.supabaseLoadError) {
                    throw new Error('Database connection failed: ' + window.supabaseLoadError);
                }
                throw new Error('Database not ready. Please wait a moment and try again, or refresh the page.');
            }
            
            // Get form data
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                game: formData.get('game'),
                rank: formData.get('rank'),
                game_id: formData.get('game_id')
            };
            
            console.log('📝 [Mobile-3D via mobileUI] Submitting application:', data);
            
            // Handle file upload if exists
            let portfolioUrl = null;
            let portfolioName = null;
            let portfolioSize = null;
            
            const fileInput = document.getElementById('mobile3d-portfolio');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                console.log('📄 [Mobile-3D] Uploading file:', file.name);
                
                // Upload to Supabase Storage
                const fileName = `${Date.now()}_${file.name}`;
                const { data: uploadData, error: uploadError } = await window.supabaseClient
                    .storage
                    .from('portfolios')
                    .upload(fileName, file);
                
                if (uploadError) {
                    console.error('❌ File upload error:', uploadError);
                    throw new Error('Failed to upload file: ' + uploadError.message);
                }
                
                console.log('✅ File uploaded:', uploadData);
                
                // Get public URL
                const { data: urlData } = window.supabaseClient
                    .storage
                    .from('portfolios')
                    .getPublicUrl(fileName);
                
                portfolioUrl = urlData.publicUrl;
                portfolioName = file.name;
                portfolioSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
                
                console.log('🔗 File URL:', portfolioUrl);
            }
            
            // Insert into database
            const { data: dbData, error: dbError } = await window.supabaseClient
                .from('applications')
                .insert([{
                    ...data,
                    portfolio_url: portfolioUrl,
                    portfolio_name: portfolioName,
                    portfolio_size: portfolioSize
                }])
                .select();
            
            if (dbError) {
                console.error('❌ Database error:', dbError);
                throw new Error('Failed to submit application: ' + dbError.message);
            }
            
            console.log('✅ Application saved:', dbData);
            
            // Success!
            this.showToast('✅ Application submitted successfully!');
            
            this.form.reset();
            
            // Reset file upload UI
            const filePreview = document.getElementById('mobile3d-file-preview');
            const dropZone = document.getElementById('mobile3d-file-drop');
            if (filePreview && dropZone) {
                filePreview.style.display = 'none';
                dropZone.style.display = 'flex';
            }
            
            this.closeFormModal();
            
        } catch (error) {
            console.error('❌ [Mobile-3D] Submission error:', error);
            this.showToast('❌ Failed to submit: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    /**
     * Setup step navigation arrows (prev / next)
     */
    setupNavArrows() {
        this.navArrowsContainer = document.getElementById('mobile-nav-arrows');
        this.navPrevBtn = document.getElementById('mobile-nav-prev');
        this.navNextBtn = document.getElementById('mobile-nav-next');

        if (!this.navPrevBtn || !this.navNextBtn) {
            console.warn('⚠️ Nav arrow buttons not found');
            return;
        }

        // Use both touchend (mobile) and click (desktop/fallback)
        const addNavListener = (btn, direction) => {
            btn.addEventListener('touchend', (e) => {
                e.preventDefault(); // prevent ghost click
                e.stopPropagation();
                this.navigateStep(direction);
            }, { passive: false });
            btn.addEventListener('click', () => this.navigateStep(direction));
        };
        addNavListener(this.navPrevBtn, 'prev');
        addNavListener(this.navNextBtn, 'next');

        console.log('✅ Nav arrows setup');
    }

    /**
     * Show the nav arrows and start a continuous state-sync loop
     * so the prev/next disabled state always reflects the current
     * camera position regardless of how the user navigated there
     * (scroll, hamburger menu, or nav buttons).
     */
    showNavArrows() {
        if (!this.navArrowsContainer) return;
        this.navArrowsContainer.style.display = 'flex';
        this.updateNavArrowState();

        // Poll every frame — lightweight index comparison only
        let lastIndex = -1;
        const syncLoop = () => {
            const index = window.mobile3DApp?.cameraController?.getCurrentIndex() ?? -1;
            if (index !== lastIndex) {
                lastIndex = index;
                this.updateNavArrowState();
            }
            requestAnimationFrame(syncLoop);
        };
        requestAnimationFrame(syncLoop);
    }

    /**
     * Update disabled state of arrow buttons based on current path position.
     * Prev is disabled at screen1-left (can't go to intro).
     * Next is NEVER disabled — at outro it loops back to screen1-left.
     */
    updateNavArrowState() {
        const app = window.mobile3DApp;
        if (!app || !this.navPrevBtn || !this.navNextBtn) return;

        const index    = app.cameraController.getCurrentIndex();
        const minIndex = 1; // screen1-left

        this.navPrevBtn.classList.toggle('disabled', index <= minIndex);
        this.navNextBtn.classList.remove('disabled'); // always enabled — loops at outro
    }

    /**
     * Navigate one step forward or backward through the camera path.
     * At outro, pressing next wraps back to screen1-left.
     */
    navigateStep(direction) {
        const app = window.mobile3DApp;
        if (!app) return;

        // Don't navigate while a popup or menu is open
        if (window.mobileTeamPopup?.isActive) return;
        if (this.menuOpen) return;

        const path     = app.cameraController.path;
        const minIndex = 1;                // screen1-left (never go back to intro)
        const maxIndex = path.length - 1; // outro

        let currentIndex = app.cameraController.getCurrentIndex();
        currentIndex = Math.max(minIndex, Math.min(maxIndex, currentIndex));

        let targetIndex;
        let looping = false;

        if (direction === 'next') {
            if (currentIndex >= maxIndex) {
                // At outro — loop back to screen1-left
                targetIndex = minIndex;
                looping     = true;
            } else {
                targetIndex = currentIndex + 1;
            }
        } else {
            // prev — never goes below minIndex
            targetIndex = Math.max(currentIndex - 1, minIndex);
        }

        if (targetIndex === currentIndex && !looping) return;

        const targetKey   = path[targetIndex];
        const targetScroll = app.cameraController.getScrollPercentForPosition(targetKey);

        console.log(`🟳️ Nav ${direction}: path[${currentIndex}] → path[${targetIndex}] (${targetKey})${looping ? ' [LOOP]' : ''}`);

        if (looping) {
            // Teleport instantly — no animation through intermediate screens
            app.scrollController.setScroll(targetScroll, true);
            console.log(`✅ Looped to ${targetKey}`);
            return;
        }

        // Normal step: smooth animated scroll
        const startScroll = app.scrollController.getScrollPercent();
        const startTime   = performance.now();
        const duration    = 1100;

        const animateStep = () => {
            const elapsed  = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            app.scrollController.setScroll(startScroll + (targetScroll - startScroll) * eased, true);

            if (progress < 1) {
                requestAnimationFrame(animateStep);
            } else {
                console.log(`✅ Arrived at ${targetKey}`);
            }
        };

        requestAnimationFrame(animateStep);
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
