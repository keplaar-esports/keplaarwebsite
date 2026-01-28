// ============================================
// UPDATED LOADER.JS - Handles mobile-3d vs mobile-2d
// ============================================

class ExperienceLoader {
    constructor() {
        this.deviceType = null;
        this.loadedScripts = [];
        this.loadedStyles = [];
    }

    /**
     * Initialize and load appropriate experience
     */
    async init() {
        console.log('🚀 ExperienceLoader: Starting...');

        // Get device type from detector
        this.deviceType = window.deviceDetector.detect();

        // Show loading screen
        this.showLoadingScreen();

        // Load appropriate experience based on device type
        try {
            if (this.deviceType === 'desktop') {
                await this.loadDesktopExperience();
            } else if (this.deviceType === 'mobile-3d') {
                await this.loadMobile3DExperience();
            } else if (this.deviceType === 'mobile-2d') {
                await this.loadMobile2DExperience();
            } else {
                throw new Error(`Unknown device type: ${this.deviceType}`);
            }

            console.log('✅ Experience loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load experience:', error);
            
            // Fallback: If mobile-3d fails, try mobile-2d
            if (this.deviceType === 'mobile-3d') {
                console.log('🔄 Attempting mobile-2d fallback...');
                try {
                    await this.loadMobile2DExperience();
                    this.deviceType = 'mobile-2d';
                } catch (fallbackError) {
                    this.showError('Failed to load any mobile experience.');
                }
            } else {
                this.showError('Failed to load experience. Please refresh.');
            }
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            this.updateLoadingStatus('Initializing...');
        }
    }

    /**
     * Update loading screen status
     */
    updateLoadingStatus(message) {
        const statusElement = document.querySelector('.progress-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log(`📢 ${message}`);
    }

    /**
     * Update loading percentage
     */
    updateLoadingProgress(percent) {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercent = document.querySelector('.progress-percent');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${percent}%`;
        }
    }

    /**
     * Load Desktop Experience (3D) - WITH SUPABASE
     */
    async loadDesktopExperience() {
        console.log('🖥️ Loading DESKTOP experience...');

        try {
            // Step 1: Load Supabase SDK FIRST (5%)
            this.updateLoadingStatus('Loading database connection...');
            this.updateLoadingProgress(5);
            await this.loadSupabaseSDK();

            // Step 2: Load HTML template (15%)
            this.updateLoadingStatus('Loading interface...');
            this.updateLoadingProgress(15);
            await this.loadHTMLTemplate('templates/desktop.html');

            // Step 3: Load CSS (30%)
            this.updateLoadingStatus('Loading styles...');
            this.updateLoadingProgress(30);
            await this.loadStylesheets([
                'css/shared/common.css',
                'css/desktop/style.css',
                'css/desktop/ui.css',
                'css/desktop/websiteUI.css',
                'css/desktop/forms.css',
                'css/desktop/popups.css'
            ]);

            // Step 4: Load 3D Libraries (55%)
            this.updateLoadingStatus('Loading 3D engine...');
            this.updateLoadingProgress(55);
            await this.loadScripts([
                'js/libs/three.min.js',
                'js/libs/OrbitControls.js',
                'js/libs/GLTFLoader.js'
            ]);

            // Step 5: Load GSAP (65%)
            this.updateLoadingStatus('Loading animations...');
            this.updateLoadingProgress(65);
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

            // Step 6: Load Desktop modules (85%)
            this.updateLoadingStatus('Loading desktop modules...');
            this.updateLoadingProgress(85);
            await this.loadScripts([
                'js/desktop/sceneManager.js',
                'js/desktop/cameraController.js',
                'js/desktop/popupManager.js',
                'js/desktop/interaction.js',
                'js/desktop/uiManager.js',
                'js/desktop/websiteUI.js'
            ]);

            // Step 7: Load shared modules (95%)
            this.updateLoadingStatus('Loading shared modules...');
            this.updateLoadingProgress(95);
            await this.loadScripts([
                'js/shared/formHandler.js',
                'js/shared/socialMedia.js'
            ]);

            // Step 8: Initialize desktop app (100%)
            this.updateLoadingStatus('Initializing 3D environment...');
            this.updateLoadingProgress(95);
            await this.loadScript('js/desktop/main.js');

            // Complete (100%)
            this.updateLoadingStatus('Ready!');
            this.updateLoadingProgress(100);

            console.log('✅ Desktop experience loaded');

        } catch (error) {
            console.error('❌ Failed to load desktop experience:', error);
            throw error;
        }
    }

    /**
     * Load Mobile 3D Experience (NEW)
     */
    async loadMobile3DExperience() {
        console.log('📱 Loading MOBILE-3D experience...');

        try {
            // Step 1: Load Supabase SDK FIRST (5%)
            this.updateLoadingStatus('Loading database connection...');
            this.updateLoadingProgress(5);
            await this.loadSupabaseSDK();

            // Step 2: Load HTML template (15%)
            this.updateLoadingStatus('Loading interface...');
            this.updateLoadingProgress(15);
            await this.loadHTMLTemplate('templates/mobile-3d.html');

            // Step 3: Load CSS (30%)
            this.updateLoadingStatus('Loading styles...');
            this.updateLoadingProgress(30);
            await this.loadStylesheets([
                'css/shared/common.css',
                'css/mobile-3d/main.css',
                'css/mobile-3d/ui.css',
                'css/mobile-3d/hamburger.css'
            ]);

            // Step 4: Load 3D Libraries (50%)
            this.updateLoadingStatus('Loading 3D engine...');
            this.updateLoadingProgress(50);
            await this.loadScripts([
                'js/libs/three.min.js',
                'js/libs/OrbitControls.js',
                'js/libs/GLTFLoader.js'
            ]);

            // Step 5: Load mobile-3d modules (75%)
            this.updateLoadingStatus('Loading mobile 3D modules...');
            this.updateLoadingProgress(75);
            await this.loadScripts([
                'js/mobile-3d/sceneManager.js',
                'js/mobile-3d/cameraController.js',
                'js/mobile-3d/scrollController.js',
                'js/mobile-3d/mobileUI.js',
                'js/mobile-3d/interaction.js'
            ]);

            // Step 6: Load shared modules (90%)
            this.updateLoadingStatus('Loading shared modules...');
            this.updateLoadingProgress(90);
            await this.loadScripts([
                'js/shared/formHandler.js',
                'js/shared/socialMedia.js'
            ]);

            // Step 7: Initialize mobile-3d app (95%)
            this.updateLoadingStatus('Initializing mobile 3D...');
            this.updateLoadingProgress(95);
            await this.loadScript('js/mobile-3d/main.js');

            // Complete (100%)
            this.updateLoadingStatus('Ready!');
            this.updateLoadingProgress(100);

            console.log('✅ Mobile-3D experience loaded');

        } catch (error) {
            console.error('❌ Failed to load mobile-3D experience:', error);
            throw error;
        }
    }

    /**
     * Load Mobile 2D Experience (Fallback) - WITH SUPABASE
     */
    async loadMobile2DExperience() {
        console.log('📱 Loading MOBILE-2D experience (fallback)...');

        try {
            // Step 1: Load Supabase SDK FIRST (5%)
            this.updateLoadingStatus('Loading database connection...');
            this.updateLoadingProgress(5);
            await this.loadSupabaseSDK();

            // Step 2: Load HTML template (20%)
            this.updateLoadingStatus('Loading interface...');
            this.updateLoadingProgress(20);
            await this.loadHTMLTemplate('templates/mobile-2d.html');

            // Step 3: Load CSS (45%)
            this.updateLoadingStatus('Loading styles...');
            this.updateLoadingProgress(45);
            await this.loadStylesheets([
                'css/shared/common.css',
                'css/mobile-2d/main.css',
                'css/mobile-2d/navigation.css',
                'css/mobile-2d/sections.css',
                'css/mobile-2d/responsive.css'
            ]);

            // Step 4: Load Mobile modules (70%)
            this.updateLoadingStatus('Loading mobile modules...');
            this.updateLoadingProgress(70);
            await this.loadScripts([
                'js/mobile-2d/navigation.js',
                'js/mobile-2d/scrollController.js',
                'js/mobile-2d/sectionManager.js',
                'js/mobile-2d/touchHandler.js'
            ]);

            // Step 5: Load shared modules (85%)
            this.updateLoadingStatus('Loading shared modules...');
            this.updateLoadingProgress(85);
            await this.loadScripts([
                'js/shared/formHandler.js',
                'js/shared/socialMedia.js'
            ]);

            // Step 6: Initialize mobile app (95%)
            this.updateLoadingStatus('Initializing mobile experience...');
            this.updateLoadingProgress(95);
            await this.loadScript('js/mobile-2d/main.js');

            // Complete (100%)
            this.updateLoadingStatus('Ready!');
            this.updateLoadingProgress(100);

            console.log('✅ Mobile-2D experience loaded');

        } catch (error) {
            console.error('❌ Failed to load mobile-2D experience:', error);
            throw error;
        }
    }

    /**
     * Load Supabase SDK and Configuration
     */
    async loadSupabaseSDK() {
        try {
            console.log('📦 Loading Supabase SDK...');
            
            // Load Supabase SDK from CDN
            await this.loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
            
            // Load Supabase configuration
            await this.loadScript('js/config/supabase.js');
            
            // Wait for Supabase to initialize
            await this.waitForSupabase();
            
            console.log('✅ Supabase SDK loaded and initialized');
        } catch (error) {
            console.error('❌ Failed to load Supabase SDK:', error);
            throw error;
        }
    }

    /**
     * Wait for Supabase client to be ready
     */
    async waitForSupabase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max
            
            const checkSupabase = () => {
                attempts++;
                
                if (window.supabaseClient) {
                    console.log('✅ Supabase client ready');
                    resolve();
                } else if (window.supabaseLoadError) {
                    console.error('❌ Supabase load error:', window.supabaseLoadError);
                    reject(new Error(window.supabaseLoadError));
                } else if (attempts >= maxAttempts) {
                    console.error('❌ Supabase initialization timeout');
                    reject(new Error('Supabase initialization timeout'));
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            
            checkSupabase();
        });
    }

    /**
     * Load HTML template
     */
    async loadHTMLTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const appContainer = document.getElementById('app-container');
            
            if (appContainer) {
                appContainer.innerHTML = html;
            } else {
                console.error('❌ #app-container not found in index.html');
            }

            console.log(`✅ Loaded template: ${templatePath}`);
        } catch (error) {
            console.error(`❌ Failed to load template ${templatePath}:`, error);
            throw error;
        }
    }

    /**
     * Load single script
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (this.loadedScripts.includes(src)) {
                console.log(`⏭️ Script already loaded: ${src}`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Maintain order

            script.onload = () => {
                this.loadedScripts.push(src);
                console.log(`✅ Loaded script: ${src}`);
                resolve();
            };

            script.onerror = () => {
                console.error(`❌ Failed to load script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Load multiple scripts in sequence
     */
    async loadScripts(srcArray) {
        for (const src of srcArray) {
            await this.loadScript(src);
        }
    }

    /**
     * Load single stylesheet
     */
    loadStylesheet(href) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (this.loadedStyles.includes(href)) {
                console.log(`⏭️ Stylesheet already loaded: ${href}`);
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;

            link.onload = () => {
                this.loadedStyles.push(href);
                console.log(`✅ Loaded stylesheet: ${href}`);
                resolve();
            };

            link.onerror = () => {
                console.error(`❌ Failed to load stylesheet: ${href}`);
                reject(new Error(`Failed to load stylesheet: ${href}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Load multiple stylesheets in sequence
     */
    async loadStylesheets(hrefArray) {
        for (const href of hrefArray) {
            await this.loadStylesheet(href);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center; color: white; padding: 40px;">
                    <h2 style="color: #ff4646; margin-bottom: 20px;">⚠️ Loading Error</h2>
                    <p style="margin-bottom: 30px;">${message}</p>
                    <button onclick="window.location.reload()" style="
                        padding: 12px 30px;
                        background: #00aaff;
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 1rem;
                        cursor: pointer;
                    ">Reload Page</button>
                </div>
            `;
        }
    }

    /**
     * Get current device type
     */
    getDeviceType() {
        return this.deviceType;
    }
}

// Create global instance
window.experienceLoader = new ExperienceLoader();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExperienceLoader;
}