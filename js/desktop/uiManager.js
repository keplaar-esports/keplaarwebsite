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
            this.navigationUI.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                this.navigationUI.style.opacity = '1';
            }, 100);
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
        const currentIndex = window.app.cameraController.cameraPath.indexOf(currentPos);
        const totalScreens = window.app.cameraController.cameraPath.length;
        
        if (currentPos === 'outro') {
            this.hideNavigation();
            return;
        }
        
        if (this.previousButton) {
            this.previousButton.disabled = currentIndex === 0;
        }
        
        if (this.nextButton) {
            this.nextButton.disabled = currentIndex === totalScreens - 1;
        }
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
            instagram: 'https://instagram.com/keplaaresports',
            twitter: 'https://twitter.com/keplaaresports', 
            youtube: 'https://youtube.com/keplaaresports',
            discord: 'https://discord.gg/keplaar'
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
        const trigger = document.getElementById('game-select-trigger');
        const options = document.getElementById('game-select-options');
        const customOptions = document.querySelectorAll('.custom-option');
        const hiddenSelect = document.getElementById('player-game');
        const selectedText = document.querySelector('.selected-text');
        
        if (!trigger || !options) return;
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            options.classList.toggle('open');
            trigger.classList.toggle('open');
        });
        
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !options.contains(e.target)) {
                options.classList.remove('open');
                trigger.classList.remove('open');
            }
        });
        
        customOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const text = option.querySelector('.option-text').textContent;
                const icon = option.dataset.icon;
                
                selectedText.innerHTML = `<span class="selected-icon">${icon}</span> ${text}`;
                hiddenSelect.value = value;
                
                customOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                options.classList.remove('open');
                trigger.classList.remove('open');
                
                hiddenSelect.dispatchEvent(new Event('change'));
            });
        });
    }

    async handlePlayerApplication(e) {
        const form = e.target;
        const submitButton = form.querySelector('.submit-button');
        const submitText = submitButton.querySelector('.submit-text');
        const submitLoading = submitButton.querySelector('.submit-loading');
        
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
        submitButton.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            alert('🎉 Application Submitted Successfully!');
            
            form.reset();
            document.getElementById('file-info').style.display = 'none';
            this.hideAllUI();
            
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
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
        
        console.log('✅ All UI hidden');
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