// ============================================
// ENHANCED DETECTOR.JS - With Performance Fallback
// ============================================

class DeviceDetector {
    constructor() {
        this.device = null;
        this.performanceScore = 0;
        this.config = {
            mobileWidth: 768,
            tabletWidth: 1024,
            // Performance threshold for 3D mobile - LOWERED for medium-end phones
            mobile3DThreshold: 80, // Below this = 2D fallback (was 150)
            mobile3DRecommended: 120 // Above this = recommended for 3D (was 200)
        };
    }

    /**
     * Main detection method - determines device type
     * @returns {string} 'mobile-3d' | 'mobile-2d' | 'tablet' | 'desktop'
     */
    detect() {
        console.log('🔍 Starting enhanced device detection...');
        
        // Check all factors
        const screenSize = this.checkScreenSize();
        const isTouchDevice = this.checkTouchCapability();
        const userAgent = this.checkUserAgent();
        const webglSupport = this.checkWebGLSupport();
        this.performanceScore = this.calculatePerformanceScore();

        // Log detection results
        console.log('📊 Detection Results:', {
            screenSize,
            isTouchDevice,
            userAgent,
            webglSupport,
            performanceScore: this.performanceScore
        });

        // Decision logic
        this.device = this.makeDecision({
            screenSize,
            isTouchDevice,
            userAgent,
            webglSupport,
            performanceScore: this.performanceScore
        });

        console.log(`✅ Device detected: ${this.device.toUpperCase()}`);
        console.log(`📈 Performance Score: ${this.performanceScore}`);
        
        // Store in sessionStorage for future use
        sessionStorage.setItem('deviceType', this.device);
        sessionStorage.setItem('performanceScore', this.performanceScore);
        
        return this.device;
    }

    /**
     * Check screen dimensions
     */
    checkScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        console.log(`📱 Screen: ${width}x${height}px`);

        if (width < this.config.mobileWidth) {
            return 'mobile';
        } else if (width < this.config.tabletWidth) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    /**
     * Check if device has touch capability
     */
    checkTouchCapability() {
        const hasTouch = (
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0)
        );

        const hasCoarseMouse = window.matchMedia('(pointer: coarse)').matches;
        
        console.log(`👆 Touch: ${hasTouch}, Coarse pointer: ${hasCoarseMouse}`);

        return hasTouch || hasCoarseMouse;
    }

    /**
     * Parse User Agent string
     */
    checkUserAgent() {
        const ua = navigator.userAgent.toLowerCase();
        
        // Mobile devices
        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 
            'blackberry', 'windows phone', 'mobile'
        ];
        
        const isMobile = mobileKeywords.some(keyword => ua.includes(keyword));
        
        // Tablets
        const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);
        
        console.log(`📤 User Agent: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}`);

        if (isTablet) return 'tablet';
        if (isMobile) return 'mobile';
        return 'desktop';
    }

    /**
     * Check WebGL support (needed for 3D)
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            const hasWebGL = !!gl;
            
            if (hasWebGL && gl) {
                // Get WebGL info for performance estimation
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    console.log(`🎨 WebGL Renderer: ${renderer}`);
                }
            }
            
            console.log(`🎨 WebGL: ${hasWebGL ? 'Supported' : 'Not supported'}`);
            
            return hasWebGL;
        } catch(e) {
            console.log('🎨 WebGL: Not supported');
            return false;
        }
    }

    /**
     * Calculate comprehensive performance score
     * Higher score = better performance
     */
    calculatePerformanceScore() {
        let score = 0;
        
        // 1. CPU Cores (0-80 points)
        if (navigator.hardwareConcurrency) {
            const cores = navigator.hardwareConcurrency;
            score += Math.min(cores * 10, 80); // Max 80 points
            console.log(`💻 CPU Cores: ${cores} → +${Math.min(cores * 10, 80)} points`);
        }
        
        // 2. Device Memory (0-100 points)
        if (navigator.deviceMemory) {
            const memory = navigator.deviceMemory; // in GB
            score += Math.min(memory * 20, 100); // Max 100 points
            console.log(`🧠 Memory: ${memory}GB → +${Math.min(memory * 20, 100)} points`);
        } else {
            // Estimate based on other factors
            score += 40; // Assume average if not available
        }
        
        // 3. Connection Speed (0-50 points)
        if (navigator.connection) {
            const effectiveType = navigator.connection.effectiveType;
            console.log(`📡 Connection: ${effectiveType}`);
            
            if (effectiveType === '4g') score += 50;
            else if (effectiveType === '3g') score += 25;
            else if (effectiveType === '2g') score += 10;
            else score += 15; // slow-2g or unknown
        } else {
            score += 30; // Assume reasonable if not available
        }
        
        // 4. Screen Resolution (0-50 points)
        const pixelRatio = window.devicePixelRatio || 1;
        const totalPixels = window.screen.width * window.screen.height * pixelRatio;
        const pixelScore = Math.min((totalPixels / 1000000) * 5, 50); // Max 50 points
        score += pixelScore;
        console.log(`🖥️ Screen: ${window.screen.width}x${window.screen.height} @${pixelRatio}x → +${pixelScore.toFixed(0)} points`);
        
        // 5. Platform bonus/penalty (±30 points)
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('iphone') || ua.includes('ipad')) {
            score += 30; // iOS devices generally perform well
            console.log(`🍎 iOS Device → +30 bonus`);
        } else if (ua.includes('android')) {
            // Android varies widely, neutral
            console.log(`🤖 Android Device → neutral`);
        }
        
        const finalScore = Math.round(score);
        console.log(`⚡ Total Performance Score: ${finalScore}`);
        
        return finalScore;
    }

    /**
     * Make final decision based on all factors
     */
    makeDecision(factors) {
        const { screenSize, isTouchDevice, userAgent, webglSupport, performanceScore } = factors;

        // Desktop decision (unchanged)
        if (screenSize === 'desktop' && !isTouchDevice) {
            return 'desktop';
        }

        // Mobile/Tablet decision with performance-based fallback
        if (screenSize === 'mobile' || userAgent === 'mobile' || 
            (screenSize === 'tablet' && isTouchDevice)) {
            
            // Check if WebGL is supported
            if (!webglSupport) {
                console.warn('⚠️ No WebGL support → Forcing mobile-2d');
                return 'mobile-2d';
            }
            
            // Performance-based decision
            if (performanceScore < this.config.mobile3DThreshold) {
                console.warn(`⚠️ Low performance (${performanceScore}) → Using mobile-2d fallback`);
                return 'mobile-2d';
            } else if (performanceScore < this.config.mobile3DRecommended) {
                console.log(`✅ Moderate performance (${performanceScore}) → mobile-3d (may have some lag)`);
                return 'mobile-3d';
            } else {
                console.log(`✅ Good performance (${performanceScore}) → mobile-3d (smooth)`);
                return 'mobile-3d';
            }
        }

        // Default to desktop for any edge cases
        return 'desktop';
    }

    /**
     * Get recommended experience with details
     */
    getRecommendation() {
        if (!this.device) {
            this.detect();
        }

        return {
            recommended: this.device,
            performanceScore: this.performanceScore,
            canRun3D: this.performanceScore >= this.config.mobile3DThreshold,
            smooth3D: this.performanceScore >= this.config.mobile3DRecommended,
            reason: this.getRecommendationReason()
        };
    }

    /**
     * Get human-readable recommendation reason
     */
    getRecommendationReason() {
        if (this.device === 'desktop') {
            return 'Desktop device - Full 3D experience';
        } else if (this.device === 'mobile-3d') {
            if (this.performanceScore >= this.config.mobile3DRecommended) {
                return 'Good performance - Mobile 3D experience';
            } else {
                return 'Moderate performance - Mobile 3D (may have minor lag)';
            }
        } else if (this.device === 'mobile-2d') {
            return 'Low performance or no WebGL - 2D fallback for smooth experience';
        }
        return 'Unknown';
    }

    /**
     * Force a specific device type (for testing)
     */
    forceDevice(type) {
        console.log(`🔧 Forcing device type: ${type}`);
        this.device = type;
        sessionStorage.setItem('deviceType', type);
        sessionStorage.setItem('deviceForced', 'true');
    }

    /**
     * Check if device was manually forced
     */
    isForced() {
        return sessionStorage.getItem('deviceForced') === 'true';
    }

    /**
     * Reset detection
     */
    reset() {
        sessionStorage.removeItem('deviceType');
        sessionStorage.removeItem('deviceForced');
        sessionStorage.removeItem('performanceScore');
        this.device = null;
        this.performanceScore = 0;
    }

    /**
     * Get performance tier
     */
    getPerformanceTier() {
        if (this.performanceScore >= this.config.mobile3DRecommended) {
            return 'high';
        } else if (this.performanceScore >= this.config.mobile3DThreshold) {
            return 'medium';
        } else {
            return 'low';
        }
    }
}

// Create global instance
window.deviceDetector = new DeviceDetector();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
}