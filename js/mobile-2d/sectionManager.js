// ============================================
// SECTION MANAGER.JS - Section Visibility
// ============================================

class SectionManager {
    constructor() {
        this.sections = document.querySelectorAll('.mobile-section');
        this.observerOptions = {
            threshold: 0.15, // Trigger when 15% visible
            rootMargin: '0px 0px -100px 0px'
        };
        
        this.init();
    }
    
    init() {
        // Create intersection observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.observerOptions
        );
        
        // Observe all sections
        this.sections.forEach(section => {
            this.observer.observe(section);
        });
        
        console.log('👁️ Section observer ready');
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Section is visible
                entry.target.classList.add('visible');
                
                // Animate children if they have fade-in-up class
                this.animateChildren(entry.target);
            }
        });
    }
    
    animateChildren(section) {
        const fadeElements = section.querySelectorAll('.fade-in-up');
        
        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 100); // Stagger animation
        });
    }
    
    // Manually trigger section visibility (for debugging)
    showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('visible');
            this.animateChildren(section);
        }
    }
    
    // Hide section (reverse animation)
    hideSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('visible');
        }
    }
    
    // Check if section is visible
    isSectionVisible(sectionId) {
        const section = document.getElementById(sectionId);
        return section ? section.classList.contains('visible') : false;
    }
}

// Make available globally
window.SectionManager = SectionManager;