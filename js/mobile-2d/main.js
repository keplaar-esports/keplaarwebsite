// ============================================
// MOBILE MAIN.JS - Execute immediately
// ============================================

console.log('📱 Mobile main.js loaded - starting NOW...');

// Execute immediately (don't wait for load event)
(function initMobile() {
    console.log('📱 Initializing mobile experience NOW...');
    
    // Wait a tiny bit for template to be in DOM
    setTimeout(() => {
        
        // FORCE enable scrolling
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        console.log('✅ Scrolling enabled');
        
        // Check if elements exist
        const header = document.getElementById('mobile-header');
        const hamburger = document.getElementById('mobile-menu-toggle');
        const content = document.getElementById('mobile-content');
        
        console.log('🔍 Elements check:');
        console.log('  Header:', header ? '✅' : '❌');
        console.log('  Hamburger:', hamburger ? '✅' : '❌');
        console.log('  Content:', content ? '✅' : '❌');
        
        if (!header || !hamburger || !content) {
            console.error('❌ Required elements not found!');
            return;
        }
        
        // Make content visible and scrollable
        if (content) {
            content.style.display = 'block';
            content.style.opacity = '1';
            content.style.visibility = 'visible';
            console.log('✅ Content forced visible');
        }
        
        // Initialize modules
        if (window.MobileNavigation) {
            window.mobileNav = new MobileNavigation();
            console.log('✅ Mobile navigation initialized');
        }
        
        if (window.ScrollController) {
            window.scrollController = new ScrollController();
            console.log('✅ Scroll controller initialized');
        }
        
        if (window.SectionManager) {
            window.sectionManager = new SectionManager();
            console.log('✅ Section manager initialized');
        }
        
        if (window.TouchHandler) {
            window.touchHandler = new TouchHandler();
            console.log('✅ Touch handler initialized');
        }
        
        // Setup form modal
        setupFormModal();
        
        // Setup social links
        setupSocialLinks();
        
        // Hide loading screen
        hideLoadingScreen();
        
        console.log('✅ Mobile experience ready!');
        
    }, 500); // Wait 500ms for template
    
})();

// Setup form modal
function setupFormModal() {
    const showFormBtn = document.getElementById('show-mobile-form');
    const formModal = document.getElementById('mobile-form-modal');
    const closeBtn = formModal?.querySelector('.modal-close');
    const form = document.getElementById('mobile-application-form');
    
    if (showFormBtn && formModal) {
        showFormBtn.addEventListener('click', () => {
            console.log('📝 Opening form modal');
            formModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeBtn && formModal) {
        closeBtn.addEventListener('click', () => {
            formModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    if (formModal) {
        formModal.addEventListener('click', (e) => {
            if (e.target === formModal) {
                formModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Setup file upload handler
    setupFileUpload();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-button');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Check if Supabase is ready
        if (!window.supabaseClient) {
            throw new Error('Supabase not initialized. Please refresh the page.');
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
        
        console.log('📝 [Mobile-2D] Submitting application:', data);
        
        // Handle file upload if exists
        let portfolioUrl = null;
        let portfolioName = null;
        let portfolioSize = null;
        
        const mobile2dFileInput = document.getElementById('mobile2d-portfolio');
        if (mobile2dFileInput && mobile2dFileInput.files.length > 0) {
            const file = mobile2dFileInput.files[0];
            console.log('📄 [Mobile-2D] Uploading file:', file.name);
            
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
        form.reset();
        
        // Reset file upload display
        const filePreview = document.getElementById('mobile2d-file-preview');
        const dropZone = document.getElementById('mobile2d-file-drop');
        if (filePreview && dropZone) {
            filePreview.style.display = 'none';
            dropZone.style.display = 'flex';
        }
        
        document.getElementById('mobile-form-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
    } catch (error) {
        console.error('❌ [Mobile-2D] Form submission error:', error);
        alert('❌ Failed to submit: ' + error.message + '\n\nPlease try again or contact us directly.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function setupSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    const urls = {
        instagram: 'https://instagram.com/keplaaresports',
        twitter: 'https://twitter.com/keplaaresports',
        youtube: 'https://youtube.com/keplaaresports',
        discord: 'https://discord.gg/keplaar'
    };
    
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = link.dataset.platform;
            console.log(`🔗 Opening ${platform}`);
            if (urls[platform]) {
                window.open(urls[platform], '_blank', 'noopener,noreferrer');
            }
        });
    });
    
    console.log(`✅ Setup ${socialLinks.length} social links`);
}

function hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.5s ease';
            loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                console.log('✅ Loading screen hidden');
            }, 500);
        }
    }, 800);
}

// ===== FILE UPLOAD HANDLER FOR MOBILE-2D =====
function setupFileUpload() {
    const mobile2dFileInput = document.getElementById('mobile2d-portfolio');
    const mobile2dDropZone = document.getElementById('mobile2d-file-drop');
    const mobile2dFilePreview = document.getElementById('mobile2d-file-preview');
    const mobile2dFileName = document.getElementById('mobile2d-file-name');
    const mobile2dFileSize = document.getElementById('mobile2d-file-size');
    const mobile2dFileRemove = document.getElementById('mobile2d-file-remove');

    if (mobile2dFileInput && mobile2dDropZone) {
        // Mobile-friendly: Make input overlay the drop zone
        mobile2dFileInput.style.position = 'absolute';
        mobile2dFileInput.style.top = '0';
        mobile2dFileInput.style.left = '0';
        mobile2dFileInput.style.width = '100%';
        mobile2dFileInput.style.height = '100%';
        mobile2dFileInput.style.opacity = '0';
        mobile2dFileInput.style.cursor = 'pointer';
        mobile2dDropZone.style.position = 'relative';
        
        // Handle file selection
        mobile2dFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    mobile2dFileInput.value = '';
                    return;
                }
                mobile2dFileName.textContent = file.name;
                mobile2dFileSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
                mobile2dDropZone.style.display = 'none';
                mobile2dFilePreview.style.display = 'flex';
                console.log('✅ [Mobile-2D] File uploaded:', file.name);
            } else {
                alert('Please select a PDF file');
                mobile2dFileInput.value = '';
            }
        });
        
        // Remove file
        if (mobile2dFileRemove) {
            mobile2dFileRemove.addEventListener('click', (e) => {
                e.stopPropagation();
                mobile2dFileInput.value = '';
                mobile2dDropZone.style.display = 'flex';
                mobile2dFilePreview.style.display = 'none';
                console.log('❌ [Mobile-2D] File removed');
            });
        }
        
        console.log('✅ [Mobile-2D] File upload handler setup complete');
    }
}

window.mobileApp = {
    initialized: true,
    version: '1.0.0'
};