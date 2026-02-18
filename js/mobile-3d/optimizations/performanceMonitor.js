// ============================================
// PERFORMANCE MONITOR
// ============================================
// Monitors FPS and triggers quality adjustments when needed
// WHY: Helps detect and respond to performance issues in real-time

class PerformanceMonitor {
    constructor(qualityManager, memoryManager) {
        this.qualityManager = qualityManager;
        this.memoryManager = memoryManager;
        
        // FPS tracking
        this.fps = 60;
        this.frames = 0;
        this.lastTime = performance.now();
        this.fpsHistory = [];
        this.maxFPSHistory = 60; // Keep last 60 readings
        
        // Performance state
        this.isPerformanceLow = false;
        this.lowPerformanceFrames = 0;
        this.lowPerformanceThreshold = 30; // Trigger after 30 low frames
        
        // Memory tracking
        this.memoryCheckInterval = 5000; // Check every 5 seconds
        this.lastMemoryCheck = Date.now();
        
        // Start monitoring
        this.startMonitoring();
        
        console.log('📊 Performance Monitor initialized');
    }
    
    /**
     * Start monitoring loop
     */
    startMonitoring() {
        const monitor = () => {
            this.frames++;
            const currentTime = performance.now();
            
            // Update FPS every second
            if (currentTime >= this.lastTime + 1000) {
                this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
                
                // Add to history
                this.fpsHistory.push(this.fps);
                if (this.fpsHistory.length > this.maxFPSHistory) {
                    this.fpsHistory.shift();
                }
                
                // Check performance
                this.checkPerformance();
                
                // Update debug display
                this.updateDebugDisplay();
                
                // Reset counters
                this.frames = 0;
                this.lastTime = currentTime;
            }
            
            // Check memory periodically
            if (currentTime - this.lastMemoryCheck >= this.memoryCheckInterval) {
                this.checkMemory();
                this.lastMemoryCheck = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }
    
    /**
     * Check performance and trigger adjustments
     */
    checkPerformance() {
        const targetFPS = 30; // Minimum acceptable FPS on mobile
        
        if (this.fps < targetFPS) {
            this.lowPerformanceFrames++;
            
            // If sustained low performance, take action
            if (this.lowPerformanceFrames >= this.lowPerformanceThreshold && !this.isPerformanceLow) {
                console.warn(`⚠️ Low performance detected (${this.fps} FPS)`);
                this.handleLowPerformance();
            }
        } else {
            // Reset counter if performance recovers
            this.lowPerformanceFrames = Math.max(0, this.lowPerformanceFrames - 2);
        }
    }
    
    /**
     * Handle low performance situation
     */
    handleLowPerformance() {
        this.isPerformanceLow = true;
        console.warn('🔧 Applying performance optimizations...');
        
        // Get renderer from global app
        const app = window.mobile3DApp;
        if (!app || !app.renderer) {
            console.error('❌ Cannot apply optimizations - app not found');
            return;
        }
        
        // Apply quality reduction
        if (this.qualityManager) {
            this.qualityManager.emergencyReduceQuality(app.renderer);
        }
        
        // Show notification to user
        this.showPerformanceNotification();
        
        // Log stats
        console.log('📊 Performance Stats:', {
            currentFPS: this.fps,
            averageFPS: this.getAverageFPS(),
            memoryUsage: this.memoryManager?.memoryUsageEstimate.toFixed(2) + ' MB'
        });
    }
    
    /**
     * Check memory usage
     */
    checkMemory() {
        if (!this.memoryManager) return;
        
        const memoryBudget = this.qualityManager?.getMemoryBudget() || 300;
        
        if (this.memoryManager.isMemoryHigh(memoryBudget)) {
            console.warn(`⚠️ High memory usage: ${this.memoryManager.memoryUsageEstimate.toFixed(2)}MB`);
            
            // Trigger emergency cleanup if critical
            if (this.memoryManager.memoryUsageEstimate >= memoryBudget) {
                console.warn('🧹 Triggering emergency memory cleanup');
                this.memoryManager.emergencyCleanup(50);
            }
        }
    }
    
    /**
     * Show performance notification
     */
    showPerformanceNotification() {
        // Check if notification already exists
        if (document.getElementById('performance-notification')) {
            return;
        }
        
        const notification = document.createElement('div');
        notification.id = 'performance-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 165, 0, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>⚡</span>
                <span>Optimizing for your device...</span>
            </div>
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        notification.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * Update debug display
     */
    updateDebugDisplay() {
        const fpsCounter = document.querySelector('.fps-counter');
        if (fpsCounter) {
            fpsCounter.textContent = `FPS: ${this.fps}`;
            
            // Color code based on performance
            if (this.fps >= 45) {
                fpsCounter.style.color = '#00ff00';
            } else if (this.fps >= 30) {
                fpsCounter.style.color = '#ffaa00';
            } else {
                fpsCounter.style.color = '#ff4444';
            }
        }
        
        // Update debug panel if exists
        const debugPerf = document.getElementById('debug-perf');
        if (debugPerf) {
            debugPerf.textContent = `${this.fps} FPS`;
        }
    }
    
    /**
     * Get average FPS
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }
    
    /**
     * Get minimum FPS from history
     */
    getMinFPS() {
        if (this.fpsHistory.length === 0) return 0;
        return Math.min(...this.fpsHistory);
    }
    
    /**
     * Get maximum FPS from history
     */
    getMaxFPS() {
        if (this.fpsHistory.length === 0) return 0;
        return Math.max(...this.fpsHistory);
    }
    
    /**
     * Get performance report
     */
    getReport() {
        return {
            currentFPS: this.fps,
            averageFPS: this.getAverageFPS(),
            minFPS: this.getMinFPS(),
            maxFPS: this.getMaxFPS(),
            isPerformanceLow: this.isPerformanceLow,
            lowPerformanceFrames: this.lowPerformanceFrames,
            memoryUsage: this.memoryManager?.getMemoryReport()
        };
    }
    
    /**
     * Reset monitoring
     */
    reset() {
        this.fps = 60;
        this.frames = 0;
        this.fpsHistory = [];
        this.isPerformanceLow = false;
        this.lowPerformanceFrames = 0;
        
        console.log('📊 Performance monitor reset');
    }
    
    /**
     * Enable FPS counter display
     */
    enableFPSCounter() {
        let fpsCounter = document.querySelector('.fps-counter');
        
        if (!fpsCounter) {
            fpsCounter = document.createElement('div');
            fpsCounter.className = 'fps-counter';
            fpsCounter.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 14px;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(fpsCounter);
        }
        
        fpsCounter.style.display = 'block';
    }
    
    /**
     * Disable FPS counter display
     */
    disableFPSCounter() {
        const fpsCounter = document.querySelector('.fps-counter');
        if (fpsCounter) {
            fpsCounter.style.display = 'none';
        }
    }
}

// Export
window.PerformanceMonitor = PerformanceMonitor;
