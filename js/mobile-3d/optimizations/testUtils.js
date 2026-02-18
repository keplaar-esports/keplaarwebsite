// ============================================
// PHASE 1 TESTING & DEBUG UTILITIES
// ============================================
// Add ?debug=true&test=true to URL to enable testing utilities

if (window.location.search.includes('test=true')) {
    console.log('🧪 Test utilities enabled');
    
    // Wait for app to load
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!window.mobile3DApp) {
                console.error('❌ mobile3DApp not found! App may have failed to initialize.');
                return;
            }
            
            console.log('✅ mobile3DApp found, setting up test utilities...');
            
            // Create testing object
            window.testUtils = {
                
                /**
                 * Run comprehensive diagnostics
                 */
                runDiagnostics() {
                    console.log('🔍 Running diagnostics...\n');
                    
                    const app = window.mobile3DApp;
                    const results = {
                        timestamp: new Date().toISOString(),
                        device: {},
                        quality: {},
                        performance: {},
                        memory: {},
                        context: {}
                    };
                    
                    // Device Info
                    console.log('📱 DEVICE INFO:');
                    results.device = {
                        performanceScore: window.deviceDetector?.performanceScore,
                        tier: app.qualityManager?.performanceTier,
                        userAgent: navigator.userAgent,
                        screen: `${window.screen.width}x${window.screen.height}`,
                        pixelRatio: window.devicePixelRatio,
                        memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown',
                        cores: navigator.hardwareConcurrency || 'unknown'
                    };
                    console.log(results.device);
                    
                    // Quality Settings
                    console.log('\n🎨 QUALITY SETTINGS:');
                    results.quality = app.qualityManager?.settings || {};
                    console.log(results.quality);
                    
                    // Performance Stats
                    console.log('\n⚡ PERFORMANCE:');
                    results.performance = app.performanceMonitor?.getReport() || {};
                    console.log(results.performance);
                    
                    // Memory Usage
                    console.log('\n💾 MEMORY:');
                    results.memory = app.memoryManager?.getMemoryReport() || {};
                    console.log(results.memory);
                    
                    // Context Status
                    console.log('\n🔌 WEBGL CONTEXT:');
                    results.context = app.contextManager?.getStats() || {};
                    console.log(results.context);
                    
                    // Renderer Info
                    console.log('\n🖼️ RENDERER:');
                    if (app.renderer) {
                        const gl = app.renderer.getContext();
                        results.renderer = {
                            pixelRatio: app.renderer.getPixelRatio(),
                            size: app.renderer.getSize(new THREE.Vector2()),
                            capabilities: {
                                maxTextureSize: app.renderer.capabilities.maxTextureSize,
                                maxAnisotropy: app.renderer.capabilities.getMaxAnisotropy()
                            },
                            info: app.renderer.info
                        };
                        console.log(results.renderer);
                    }
                    
                    console.log('\n✅ Diagnostics complete!');
                    console.log('💾 Results stored in: window.testUtils.lastDiagnostics');
                    
                    this.lastDiagnostics = results;
                    return results;
                },
                
                /**
                 * Stress test - rapid scene navigation
                 */
                async stressTest(iterations = 10) {
                    console.log(`🔥 Starting stress test (${iterations} iterations)...`);
                    
                    const app = window.mobile3DApp;
                    const screens = ['screen1', 'screen2', 'screen3', 'screen4'];
                    const results = [];
                    
                    for (let i = 0; i < iterations; i++) {
                        const screen = screens[i % screens.length];
                        const startFPS = app.performanceMonitor.fps;
                        const startMemory = app.memoryManager.memoryUsageEstimate;
                        
                        console.log(`\n  Iteration ${i + 1}/${iterations}: Navigating to ${screen}`);
                        
                        // Navigate
                        await app.cameraController.navigateToScreen(screen);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        const endFPS = app.performanceMonitor.fps;
                        const endMemory = app.memoryManager.memoryUsageEstimate;
                        
                        results.push({
                            iteration: i + 1,
                            screen,
                            fpsChange: endFPS - startFPS,
                            memoryChange: (endMemory - startMemory).toFixed(2),
                            finalFPS: endFPS,
                            finalMemory: endMemory.toFixed(2)
                        });
                        
                        console.log(`    FPS: ${startFPS} → ${endFPS} (${endFPS - startFPS >= 0 ? '+' : ''}${endFPS - startFPS})`);
                        console.log(`    Memory: ${startMemory.toFixed(2)}MB → ${endMemory.toFixed(2)}MB`);
                    }
                    
                    console.log('\n✅ Stress test complete!');
                    console.log('📊 Average FPS change:', (results.reduce((sum, r) => sum + r.fpsChange, 0) / results.length).toFixed(1));
                    console.log('📊 Total memory change:', (results[results.length - 1].finalMemory - results[0].finalMemory).toFixed(2) + 'MB');
                    
                    this.lastStressTest = results;
                    return results;
                },
                
                /**
                 * Memory leak test
                 */
                async memoryLeakTest(duration = 30) {
                    console.log(`🧪 Memory leak test (${duration} seconds)...`);
                    
                    const app = window.mobile3DApp;
                    const samples = [];
                    const startMemory = app.memoryManager.memoryUsageEstimate;
                    const startTime = Date.now();
                    
                    const sampleInterval = setInterval(() => {
                        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                        const memory = app.memoryManager.memoryUsageEstimate;
                        
                        samples.push({
                            time: elapsed,
                            memory: memory.toFixed(2),
                            fps: app.performanceMonitor.fps
                        });
                        
                        console.log(`  ${elapsed}s: ${memory.toFixed(2)}MB (${app.performanceMonitor.fps} FPS)`);
                    }, 2000);
                    
                    return new Promise(resolve => {
                        setTimeout(() => {
                            clearInterval(sampleInterval);
                            
                            const endMemory = app.memoryManager.memoryUsageEstimate;
                            const leak = endMemory - startMemory;
                            
                            console.log('\n✅ Memory leak test complete!');
                            console.log(`📊 Memory change: ${leak.toFixed(2)}MB (${leak > 5 ? '⚠️ POTENTIAL LEAK' : '✅ Normal'})`);
                            
                            this.lastMemoryTest = {
                                duration,
                                startMemory,
                                endMemory,
                                leak: leak.toFixed(2),
                                samples
                            };
                            
                            resolve(this.lastMemoryTest);
                        }, duration * 1000);
                    });
                },
                
                /**
                 * Test context loss recovery
                 */
                testContextLoss() {
                    console.log('🧪 Testing context loss recovery...');
                    console.log('⚠️ This will temporarily break the 3D view!');
                    
                    const app = window.mobile3DApp;
                    if (app.contextManager) {
                        app.contextManager.forceContextLoss();
                        console.log('✅ Context loss triggered. Watch for recovery UI...');
                    } else {
                        console.error('❌ Context manager not found!');
                    }
                },
                
                /**
                 * Force quality reduction
                 */
                reduceQuality() {
                    console.log('🔧 Forcing quality reduction...');
                    
                    const app = window.mobile3DApp;
                    if (app.qualityManager && app.renderer) {
                        const beforeRatio = app.renderer.getPixelRatio();
                        app.qualityManager.emergencyReduceQuality(app.renderer);
                        const afterRatio = app.renderer.getPixelRatio();
                        
                        console.log(`✅ Pixel ratio: ${beforeRatio} → ${afterRatio}`);
                        console.log('🎨 New settings:', app.qualityManager.settings);
                    } else {
                        console.error('❌ Quality manager or renderer not found!');
                    }
                },
                
                /**
                 * Force memory cleanup
                 */
                cleanMemory(targetMB = 50) {
                    console.log(`🧹 Forcing memory cleanup (target: ${targetMB}MB)...`);
                    
                    const app = window.mobile3DApp;
                    if (app.memoryManager) {
                        const beforeMemory = app.memoryManager.memoryUsageEstimate;
                        app.memoryManager.emergencyCleanup(targetMB);
                        const afterMemory = app.memoryManager.memoryUsageEstimate;
                        
                        console.log(`✅ Memory: ${beforeMemory.toFixed(2)}MB → ${afterMemory.toFixed(2)}MB`);
                        console.log(`📊 Freed: ${(beforeMemory - afterMemory).toFixed(2)}MB`);
                    } else {
                        console.error('❌ Memory manager not found!');
                    }
                },
                
                /**
                 * Export diagnostics as JSON
                 */
                exportDiagnostics() {
                    const data = this.runDiagnostics();
                    const json = JSON.stringify(data, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `diagnostics-${Date.now()}.json`;
                    a.click();
                    
                    console.log('💾 Diagnostics exported!');
                },
                
                /**
                 * Show help
                 */
                help() {
                    console.log(`
╔════════════════════════════════════════════════════════════╗
║           PHASE 1 TEST UTILITIES - HELP                    ║
╚════════════════════════════════════════════════════════════╝

Available Commands:
-------------------

📊 testUtils.runDiagnostics()
   - Run full system diagnostics
   - Shows device, quality, performance, memory info

🔥 testUtils.stressTest(10)
   - Stress test with rapid navigation
   - Default: 10 iterations

🧪 testUtils.memoryLeakTest(30)
   - Monitor memory for leaks
   - Default: 30 seconds

🔌 testUtils.testContextLoss()
   - Test WebGL context recovery
   - WARNING: Temporarily breaks view

🔧 testUtils.reduceQuality()
   - Force quality reduction
   - Tests emergency optimization

🧹 testUtils.cleanMemory(50)
   - Force memory cleanup
   - Default: free 50MB

💾 testUtils.exportDiagnostics()
   - Export diagnostics as JSON file

❓ testUtils.help()
   - Show this help message

Quick Access to App:
-------------------
mobile3DApp.performanceMonitor.getReport()
mobile3DApp.memoryManager.getMemoryReport()
mobile3DApp.contextManager.getStats()
mobile3DApp.qualityManager.settings

╚════════════════════════════════════════════════════════════╝
                    `);
                }
            };
            
            // Auto-run initial diagnostics
            console.log('\n🎮 Test utilities loaded! Type "testUtils.help()" for commands.\n');
            testUtils.runDiagnostics();
            
        }, 2000);
    });
}
