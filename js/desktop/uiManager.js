class UIManager {
    constructor() {
        this.uiContainer = document.getElementById('ui-container');
        this.navigationUI = document.getElementById('navigation-ui');
        this.enterButton = document.getElementById('enter-button');
        this.previousButton = document.getElementById('previous-button');
        this.nextButton = document.getElementById('next-button');
        
        if (this.uiContainer) {
            this.uiContainer.style.opacity = '0';
            this.uiContainer.style.transition = 'none';
            this.uiContainer.style.display = 'block';
        }

        this.init();
    }
    
    init() {
        this.enterButton?.addEventListener('click', () => this.enterEnvironment());
        this.previousButton?.addEventListener('click', () => this.goToPreviousScreen());
        this.nextButton?.addEventListener('click', () => this.goToNextScreen());
        
        console.log('✅ UIManager initialized');
    }

    notifyEnvironmentEntry() {
        console.log('🎯 UIManager: Notifying environment entry');
        
        if (window.websiteUI) {
            window.websiteUI.showHeader();
        }
        
        setTimeout(() => {
            const headerLinks = document.querySelectorAll('.nav-menu a');
            headerLinks.forEach(link => {
                if (link.dataset.screen === 'events') {
                    link.classList.add('active');
                }
            });
        }, 100);
    }
    
    async enterEnvironment() {
        console.log('🚪 Entering environment...');
        
        if (this.enterButton) {
            this.enterButton.disabled = true;
            this.enterButton.style.pointerEvents = 'none';
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Move camera
        if (window.app?.cameraController) {
            await window.app.cameraController.animateCameraToPosition(
                window.app.cameraController.cameraPositions.screen1.position, 
                window.app.cameraController.cameraPositions.screen1.target, 
                2.5
            );
            
            window.app.cameraController.currentCameraPosition = 'screen1';
            console.log('✅ Camera moved to screen1');
        }
        
        // 👇 BRIGHTNESS FIX: Ensure canvas is FULLY VISIBLE
        if (window.app?.renderer) {
            window.app.renderer.domElement.style.opacity = '1';
            console.log('✅ Canvas brightness: 100% (fully visible)');
        }
        
        this.hideIntroPanel();
        this.showNavigation();
        this.updateNavigationButtons();
        this.notifyEnvironmentEntry();
        
        console.log('✅ Environment entered');
    }
    
    hideIntroPanel() {
        this.uiContainer.style.transition = 'opacity 0.8s ease';
        this.uiContainer.style.opacity = '0';
        
        setTimeout(() => {
            this.uiContainer.style.display = 'none';
        }, 800);
    }

    showNavigation() {
        if (this.navigationUI) {
            this.navigationUI.style.display = 'flex';
            this.navigationUI.style.opacity = '0';
            this.navigationUI.style.transition = 'opacity 0.2s ease'; // Faster - 0.2s instead of 0.5s
            
            setTimeout(() => {
                this.navigationUI.style.opacity = '1';
            }, 10); // Much faster - 10ms instead of 100ms
        }
    }

    hideNavigation() {
        if (this.navigationUI) {
            this.navigationUI.style.opacity = '0';
            setTimeout(() => {
                this.navigationUI.style.display = 'none';
            }, 500);
        }
    }
    
    goToNextScreen() {
        if (window.app?.cameraController) {
            window.app.cameraController.goToNextScreen();
            
            setTimeout(() => {
                if (window.websiteUI) {
                    window.websiteUI.updateHeaderFromCameraPosition();
                }
                this.updateNavigationButtons();
            }, 600);
        }
    }

    goToPreviousScreen() {
        if (window.app?.cameraController) {
            window.app.cameraController.goToPreviousScreen();
            
            setTimeout(() => {
                if (window.websiteUI) {
                    window.websiteUI.updateHeaderFromCameraPosition();
                }
                this.updateNavigationButtons();
            }, 600);
        }
    }

    updateNavigationButtons() {
        if (!window.app?.cameraController) return;
        
        const currentPos = window.app.cameraController.getCurrentCameraPosition();
        
        // ✅ NEW: Enable navigation at ALL positions (full loop support)
        // intro → previous goes to screen4, next goes to screen1
        // outro → previous goes to screen4, next goes to screen1
        // All other positions → both buttons work normally
        
        // Enable both buttons everywhere - full bidirectional loop!
        if (this.previousButton) this.previousButton.disabled = false;
        if (this.nextButton) this.nextButton.disabled = false;
        
        console.log(`🟢 Navigation buttons enabled at: ${currentPos}`);
    }

    showSocialMediaUI() {
        console.log('🎯 showSocialMediaUI called');
        
        const socialUI = document.getElementById('social-media-ui');
        
        if (socialUI) {
            socialUI.style.display = 'flex';
            socialUI.style.opacity = '0';

            this.hideWebsiteHeader();
            
            setTimeout(() => {
                socialUI.style.opacity = '1';
            }, 100);
            
            this.setupSocialMediaHandlers();
        }
    }

    setupSocialMediaHandlers() {
        console.log('🔧 Setting up social media handlers');
        
        document.querySelectorAll('.social-item').forEach(item => {
            item.addEventListener('click', () => {
                const platform = item.dataset.platform;
                this.openSocialMedia(platform);
            });
        });
        
        const nextButton = document.getElementById('next-to-form');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.showContactFormUI();
            });
        }
        
        const socialCloseBtn = document.querySelector('#social-media-ui .close-button');
        if (socialCloseBtn) {
            const newCloseBtn = socialCloseBtn.cloneNode(true);
            socialCloseBtn.parentNode.replaceChild(newCloseBtn, socialCloseBtn);
            
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('❌ Social close clicked');
                this.hideAllUI();
            });
            
            console.log('✅ Social close button handler attached');
        }
    }

    showContactFormUI() {
        console.log('📝 Showing contact form UI');
        
        const socialUI = document.getElementById('social-media-ui');
        if (socialUI) {
            socialUI.style.display = 'none';
        }
        
        const formUI = document.getElementById('contact-form-ui');
        if (formUI) {
            formUI.style.display = 'flex';
            formUI.style.opacity = '0';
            
            this.hideWebsiteHeader();

            setTimeout(() => {
                formUI.style.opacity = '1';
            }, 100);
            
            this.setupContactFormHandler();
        }
    }

    openSocialMedia(platform) {
        const urls = {
            instagram: 'https://www.instagram.com/keplaar_meme.gg?igsh=dzQ2c2hteDJua2dj',
            twitter: 'https://twitter.com/keplaaresports', 
            youtube: 'https://youtube.com/keplaaresports',
            discord: 'https://discord.gg/WsG2V2tRK'
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank');
        }
    }

    setupContactFormHandler() {
        console.log('🔧 Setting up contact form handlers');
        
        const form = document.getElementById('player-application-form');
        const formUI = document.getElementById('contact-form-ui');
        
        const formCloseBtn = document.querySelector('#contact-form-ui .close-button');
        if (formCloseBtn) {
            const newCloseBtn = formCloseBtn.cloneNode(true);
            formCloseBtn.parentNode.replaceChild(newCloseBtn, formCloseBtn);
            
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('❌ Form close clicked');
                this.hideAllUI();
            });
            
            console.log('✅ Form close button handler attached');
        }
        
        if (formUI) {
            formUI.addEventListener('click', (e) => {
                if (e.target === formUI) {
                    console.log('❌ Clicked outside form');
                    this.hideAllUI();
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePlayerApplication(e);
            });
            
            form.addEventListener('wheel', (e) => {
                e.stopPropagation();
            }, { passive: false });
        }
        
        this.setupEnhancedFileUpload();
        this.setupEnhancedDropdown();
    }

    setupEnhancedFileUpload() {
        const fileInput = document.getElementById('player-portfolio');
        const fileDropArea = document.getElementById('file-drop-area');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const fileRemove = document.getElementById('file-remove');
        
        if (!fileInput || !fileDropArea) return;
        
        fileDropArea.addEventListener('click', () => fileInput.click());
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.remove('drag-over');
            }, false);
        });
        
        fileDropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelect();
            }
        }, false);
        
        fileInput.addEventListener('change', handleFileSelect);
        
        function handleFileSelect() {
            const file = fileInput.files[0];
            
            if (file) {
                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    alert('❌ Please select a PDF file only.');
                    resetFileInput();
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('❌ File too large! Maximum size is 5MB.');
                    resetFileInput();
                    return;
                }
                
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                fileName.textContent = file.name;
                fileSize.textContent = `${sizeMB} MB`;
                fileInfo.style.display = 'block';
            } else {
                resetFileInput();
            }
        }
        
        if (fileRemove) {
            fileRemove.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                resetFileInput();
            });
        }
        
        function resetFileInput() {
            fileInput.value = '';
            fileInfo.style.display = 'none';
            fileName.textContent = '';
            fileSize.textContent = '';
        }
    }

    setupEnhancedDropdown() {
        console.log('🎯 Setting up dropdown...');
        
        const display = document.getElementById('game-select-display');
        const dropdown = document.getElementById('game-select-dropdown');
        const options = document.querySelectorAll('.select-option');
        const hiddenSelect = document.getElementById('player-game');
        const placeholder = display?.querySelector('.select-placeholder');
        
        console.log('Dropdown elements:', {
            display: display ? 'FOUND' : 'NOT FOUND',
            dropdown: dropdown ? 'FOUND' : 'NOT FOUND',
            options: options.length + ' options found',
            hidden: hiddenSelect ? 'FOUND' : 'NOT FOUND'
        });
        
        if (!display || !dropdown || !placeholder) {
            console.log('❌ Dropdown elements missing');
            return;
        }
        
        // Click to toggle
        display.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ DROPDOWN CLICKED!');
            
            const isOpen = display.classList.toggle('open');
            dropdown.classList.toggle('open', isOpen);
            console.log('Dropdown is now:', isOpen ? 'OPEN' : 'CLOSED');
        });
        
        // Select option
        options.forEach((option, index) => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const value = option.dataset.value;
                const icon = option.dataset.icon;
                const label = option.querySelector('.opt-label').textContent;
                
                console.log('✅ Selected:', value);
                
                placeholder.innerHTML = `${icon} ${label}`;
                placeholder.classList.add('selected');
                hiddenSelect.value = value;
                
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                display.classList.remove('open');
                dropdown.classList.remove('open');
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!display.contains(e.target) && !dropdown.contains(e.target)) {
                display.classList.remove('open');
                dropdown.classList.remove('open');
            }
        });
        
        console.log('✅ Dropdown setup complete!');
    }

    async handlePlayerApplication(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('.new-submit-btn');
        const submitText = submitButton?.querySelector('.submit-text');
        const submitLoading = submitButton?.querySelector('.submit-loading');
        
        if (!submitButton || !submitText || !submitLoading) {
            console.error('❌ Form elements not found');
            return;
        }
        
        submitText.style.display = 'none';
        submitLoading.style.display = 'flex';
        submitButton.disabled = true;
        
        try {
            // Check if Supabase SDK loaded
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase SDK not loaded. Check internet connection and try refreshing the page.');
            }
            
            // Check if Supabase client initialized
            if (!window.supabaseClient) {
                if (window.supabaseLoadError) {
                    throw new Error('Database connection failed: ' + window.supabaseLoadError);
                }
                throw new Error('Database not ready. Please wait a moment and try again, or refresh the page.');
            }
            
            // Get form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                game: formData.get('game'),
                rank: formData.get('rank'),
                game_id: formData.get('game_id')
            };
            
            console.log('📝 Submitting application:', data);
            
            // Handle file upload if exists
            let portfolioUrl = null;
            let portfolioName = null;
            let portfolioSize = null;
            
            const fileInput = document.getElementById('player-portfolio');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                console.log('📄 Uploading file:', file.name);
                
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
            alert('✅ Application submitted successfully! We\'ll review it and get back to you soon.');
            
            // Reset form and UI
            form.reset();
            
            const filePreview = document.getElementById('new-file-preview');
            const dropZone = document.getElementById('new-file-drop');
            if (filePreview && dropZone) {
                filePreview.style.display = 'none';
                dropZone.style.display = 'flex';
            }
            
            const placeholder = form.querySelector('.select-placeholder');
            if (placeholder) {
                placeholder.innerHTML = 'Select your primary game';
                placeholder.classList.remove('selected');
            }
            
            this.hideAllUI();
            
        } catch (error) {
            console.error('❌ Submission error:', error);
            alert('❌ Failed to submit: ' + error.message + '\n\nPlease try again or contact us directly.');
        } finally {
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
            submitButton.disabled = false;
        }
    }

    hideAllUI() {
        console.log('🚪 Hiding all UI');
        
        const socialUI = document.getElementById('social-media-ui');
        const formUI = document.getElementById('contact-form-ui');
        
        if (socialUI) socialUI.style.display = 'none';
        if (formUI) formUI.style.display = 'none';

        this.showWebsiteHeader();
        this.showNavigation();
        
        // ✅ UPDATE: Update navigation buttons based on current position
        this.updateNavigationButtons();
        
        console.log('✅ All UI hidden, navigation restored');
    }

    hideWebsiteHeader() {
        const header = document.getElementById('website-header');
        if (header) {
            header.style.display = 'none';
        }
    }

    showWebsiteHeader() {
        const header = document.getElementById('website-header');
        if (header) {
            header.style.display = 'flex';
            
            setTimeout(() => {
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }, 10);
        }
    }
}

// Initialize immediately - check if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uiManager = new UIManager();
    });
} else {
    window.uiManager = new UIManager();
    console.log('✅ UIManager initialized immediately');
}