// ============================================
// WEBGL CONTEXT RECOVERY
// ============================================
// Handles WebGL context loss and recovery gracefully
// WHY: Prevents white screen of death on context loss

class WebGLContextManager {
    constructor(canvas, onContextLost, onContextRestored) {
        this.canvas = canvas;
        this.onContextLost = onContextLost;
        this.onContextRestored = onContextRestored;
        
        this.contextLostCount = 0;
        this.isContextLost = false;
        this.recoveryAttempts = 0;
        this.maxRecoveryAttempts = 3;
        
        this.setupContextListeners();
        
        console.log('🔌 WebGL Context Manager initialized');
    }
    
    /**
     * Setup context event listeners
     */
    setupContextListeners() {
        // Context lost event
        this.canvas.addEventListener('webglcontextlost', (event) => {
            console.error('❌ WebGL context lost!');
            event.preventDefault(); // Prevent default behavior
            
            this.isContextLost = true;
            this.contextLostCount++;
            
            // Show user-friendly message
            this.showContextLostUI();
            
            // Call custom handler
            if (this.onContextLost) {
                this.onContextLost(event);
            }
            
            // Attempt recovery
            this.attemptRecovery();
        });
        
        // Context restored event
        this.canvas.addEventListener('webglcontextrestored', (event) => {
            console.log('✅ WebGL context restored!');
            
            this.isContextLost = false;
            this.recoveryAttempts = 0;
            
            // Hide recovery UI
            this.hideContextLostUI();
            
            // Call custom handler
            if (this.onContextRestored) {
                this.onContextRestored(event);
            }
        });
    }
    
    /**
     * Attempt to recover context
     */
    attemptRecovery() {
        if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
            console.error('❌ Max recovery attempts reached. Giving up.');
            this.showFallbackUI();
            return;
        }
        
        this.recoveryAttempts++;
        console.log(`🔄 Recovery attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts}...`);
        
        // Wait a bit before attempting recovery
        setTimeout(() => {
            if (this.isContextLost) {
                console.log('🔄 Reloading page to restore context...');
                this.reloadPage();
            }
        }, 2000 * this.recoveryAttempts); // Increasing delay
    }
    
    /**
     * Show context lost UI
     */
    showContextLostUI() {
        // Remove existing UI if present
        this.hideContextLostUI();
        
        const ui = document.createElement('div');
        ui.id = 'webgl-context-lost-ui';
        ui.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            color: white;
            font-family: 'Arial', sans-serif;
            text-align: center;
            padding: 20px;
        `;
        
        ui.innerHTML = `
            <div style="max-width: 400px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="font-size: 24px; margin: 0 0 10px 0;">3D Experience Paused</h2>
                <p style="font-size: 16px; margin: 0 0 20px 0; opacity: 0.8;">
                    The 3D renderer needs to restart to continue.
                </p>
                <div class="recovery-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255, 255, 255, 0.2);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 20px auto;
                "></div>
                <p style="font-size: 14px; opacity: 0.6; margin: 0;">
                    Attempting recovery (${this.recoveryAttempts}/${this.maxRecoveryAttempts})...
                </p>
            </div>
        `;
        
        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        ui.appendChild(style);
        
        document.body.appendChild(ui);
    }
    
    /**
     * Hide context lost UI
     */
    hideContextLostUI() {
        const ui = document.getElementById('webgl-context-lost-ui');
        if (ui) {
            ui.remove();
        }
    }
    
    /**
     * Show fallback UI when recovery fails
     */
    showFallbackUI() {
        const ui = document.getElementById('webgl-context-lost-ui');
        if (ui) {
            ui.innerHTML = `
                <div style="max-width: 400px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h2 style="font-size: 24px; margin: 0 0 10px 0;">Recovery Failed</h2>
                    <p style="font-size: 16px; margin: 0 0 20px 0; opacity: 0.8;">
                        Unable to restore the 3D experience automatically.
                    </p>
                    <button onclick="location.reload()" style="
                        background: white;
                        color: black;
                        border: none;
                        padding: 12px 24px;
                        font-size: 16px;
                        font-weight: bold;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 10px 5px;
                    ">Reload Page</button>
                    <button onclick="window.location.href='?view=mobile-2d'" style="
                        background: transparent;
                        color: white;
                        border: 2px solid white;
                        padding: 12px 24px;
                        font-size: 16px;
                        font-weight: bold;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 10px 5px;
                    ">Use 2D Version</button>
                </div>
            `;
        }
    }
    
    /**
     * Reload page with memory cleanup
     */
    reloadPage() {
        // Clear any stored data that might cause issues
        try {
            sessionStorage.clear();
        } catch(e) {
            console.warn('Could not clear session storage:', e);
        }
        
        // Reload
        window.location.reload();
    }
    
    /**
     * Check if context is healthy
     */
    isContextHealthy() {
        if (!this.canvas) return false;
        
        const gl = this.canvas.getContext('webgl') || 
                   this.canvas.getContext('experimental-webgl');
        
        if (!gl) return false;
        
        // Check for context loss
        const isLost = gl.isContextLost();
        
        return !isLost;
    }
    
    /**
     * Force context loss (for testing)
     */
    forceContextLoss() {
        console.warn('🧪 Forcing context loss for testing...');
        
        const gl = this.canvas.getContext('webgl') || 
                   this.canvas.getContext('experimental-webgl');
        
        if (gl) {
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) {
                ext.loseContext();
            }
        }
    }
    
    /**
     * Force context restore (for testing)
     */
    forceContextRestore() {
        console.log('🧪 Forcing context restore for testing...');
        
        const gl = this.canvas.getContext('webgl') || 
                   this.canvas.getContext('experimental-webgl');
        
        if (gl) {
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) {
                ext.restoreContext();
            }
        }
    }
    
    /**
     * Get statistics
     */
    getStats() {
        return {
            contextLostCount: this.contextLostCount,
            isContextLost: this.isContextLost,
            recoveryAttempts: this.recoveryAttempts,
            isHealthy: this.isContextHealthy()
        };
    }
}

// Export
window.WebGLContextManager = WebGLContextManager;
