// ============================================
// SIMPLE LOADING MANAGER
// ============================================

class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressFill = document.querySelector('.progress-fill');
        this.progressPercent = document.querySelector('.progress-percent');
        this.progressStatus = document.querySelector('.progress-status');
        
        // Loading stages
        this.stages = [
            { progress: 0, status: 'Initializing...' },
            { progress: 20, status: 'Setting up 3D engine...' },
            { progress: 50, status: 'Loading environment...' },
            { progress: 80, status: 'Preparing assets...' },
            { progress: 95, status: 'Almost ready...' },
            { progress: 100, status: 'Ready!' }
        ];
        
        this.currentProgress = 0;
        
        console.log('🔧 Simple LoadingManager initialized');
    }
    
    // Update progress (0-100)
    updateProgress(percent, status = null) {
        this.currentProgress = Math.min(Math.max(percent, 0), 100);
        
        // Update progress bar
        this.progressFill.style.width = `${this.currentProgress}%`;
        
        // Update percentage text
        this.progressPercent.textContent = `${Math.floor(this.currentProgress)}%`;
        
        // Update status text if provided
        if (status) {
            this.progressStatus.textContent = status;
        }
        
        // Auto-update status based on progress
        this.updateStatusFromProgress();
        
        // Check if complete
        if (this.currentProgress >= 100) {
            setTimeout(() => this.complete(), 500);
        }
    }
    
    // Auto-update status based on progress
    updateStatusFromProgress() {
        for (let i = this.stages.length - 1; i >= 0; i--) {
            if (this.currentProgress >= this.stages[i].progress) {
                this.progressStatus.textContent = this.stages[i].status;
                break;
            }
        }
    }
    
    // Set specific status
    setStatus(status) {
        this.progressStatus.textContent = status;
    }
    
    // Complete loading
    complete() {
        // Prevent multiple completions
        if (this.completed) {
            console.log('⚠️ Loading already completed, skipping');
            return;
        }
        
        console.log('✅ Loading complete!');
        this.completed = true; // Mark as completed
        
        // Ensure 100%
        this.updateProgress(100, 'Ready!');
        
        // Wait for progress animation to finish
        setTimeout(() => {
            // Add fade-out class
            this.loadingScreen.classList.add('fade-out');
            
            // Dispatch completion event ONCE
            setTimeout(() => {
                if (!this.eventDispatched) {
                    window.dispatchEvent(new CustomEvent('loading-complete'));
                    this.eventDispatched = true;
                    console.log('📡 Loading complete event dispatched (once)');
                }
            }, 200);
            
            // Remove from DOM after full fade
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                console.log('🎮 Loading screen removed');
            }, 800);
        }, 300);
    }
    
    // Error handling
    showError(message) {
        console.error('❌ Loading error:', message);
        this.progressStatus.textContent = `Error: ${message}`;
        this.progressStatus.style.color = '#ff5555';
    }
}

// Global instance
let loadingManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadingManager = new LoadingManager();
    window.loadingManager = loadingManager;
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}