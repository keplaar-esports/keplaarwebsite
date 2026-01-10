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
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-button');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        console.log('📝 Form data:', data);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert('✅ Application submitted successfully!');
        form.reset();
        
        document.getElementById('mobile-form-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
    } catch (error) {
        console.error('❌ Form submission error:', error);
        alert('❌ Failed to submit. Please try again.');
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

window.mobileApp = {
    initialized: true,
    version: '1.0.0'
};