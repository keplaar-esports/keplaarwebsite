// ============================================
// SCROLL CONTROLLER.JS - Fixed Progress Bar Position
// ============================================

class ScrollController {
    constructor() {
        this.scrollProgress = null;
        this.lastScroll = 0;
        this.header = document.getElementById('mobile-header');
        this.sections = document.querySelectorAll('.mobile-section');
        this.navLinks = document.querySelectorAll('.mobile-nav-menu a');
        
        this.init();
    }
    
    init() {
        // Create scroll progress bar
        this.createScrollProgress();
        
        // Setup scroll listener
        window.addEventListener('scroll', () => {
            this.handleScroll();
        }, { passive: true });
        
        // Initial check
        this.handleScroll();
        
        console.log('📜 Scroll controller ready');
    }
    
    createScrollProgress() {
        this.scrollProgress = document.createElement('div');
        this.scrollProgress.className = 'scroll-progress';
        document.body.appendChild(this.scrollProgress);
    }
    
    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        // Update scroll progress
        this.updateScrollProgress();
        
        // Hide/show header on scroll
        this.handleHeaderScroll(currentScroll);
        
        // Update active section
        this.updateActiveSection();
        
        // Update last scroll position
        this.lastScroll = currentScroll;
    }
    
    updateScrollProgress() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        
        if (this.scrollProgress) {
            this.scrollProgress.style.width = `${scrolled}%`;
        }
    }
    
    handleHeaderScroll(currentScroll) {
        // Don't hide header at top of page
        if (currentScroll <= 0) {
            this.header.style.transform = 'translateY(0)';
            // 👇 MOVE PROGRESS BAR BACK DOWN
            if (this.scrollProgress) {
                this.scrollProgress.style.top = '70px';
            }
            return;
        }
        
        // Hide header when scrolling down, show when scrolling up
        if (currentScroll > this.lastScroll && currentScroll > 100) {
            // Scrolling down - hide header
            this.header.style.transform = 'translateY(-100%)';
            
            // 👇 MOVE PROGRESS BAR TO TOP
            if (this.scrollProgress) {
                this.scrollProgress.style.top = '0';
            }
        } else {
            // Scrolling up - show header
            this.header.style.transform = 'translateY(0)';
            
            // 👇 MOVE PROGRESS BAR BACK DOWN
            if (this.scrollProgress) {
                this.scrollProgress.style.top = '70px';
            }
        }
    }
    
    updateActiveSection() {
        const scrollPosition = window.pageYOffset + 200; // Offset for header
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Update nav links
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Scroll to specific section (programmatic)
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // Scroll to top
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Make available globally
window.ScrollController = ScrollController;