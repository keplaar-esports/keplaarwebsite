// websiteUI.js - FIXED VERSION with working event listeners
console.log('🔧 websiteUI.js loaded');

class WebsiteUI {
  constructor() {
    console.log('🔧 WebsiteUI: Initializing');
    
    this.header = document.getElementById('website-header');
    this.logoLink = document.getElementById('logo-link');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    
    if (!this.header) {
      console.error('❌ WebsiteUI: Header element not found!');
      return;
    }
    
    console.log('✅ WebsiteUI: Header found');
    console.log(`✅ WebsiteUI: Found ${this.navLinks.length} nav links`);
    
    // Ensure header is hidden initially
    this.hideHeader();
    
    // Setup event listeners
    this.init();
  }
  
  init() {
    console.log('🔧 WebsiteUI: Setting up event listeners');
    
    // 👇 FIX: Logo click - make sure it works
    if (this.logoLink) {
      this.logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔄 Logo clicked - reloading page');
        window.location.reload();
      });
      console.log('✅ Logo click handler attached');
    }
    
    // 👇 FIX: Navigation links
    this.setupNavigation();
    
    // Listen for Enter Environment button
    this.setupEnterButtonListener();
    
    // Listen for camera position changes
    this.setupCameraPositionListener();
  }
  
  setupNavigation() {
    console.log('🔧 Setting up navigation handlers');
    
    let handlersAttached = 0;
    
    this.navLinks.forEach((link, index) => {
      // 👇 Remove any existing listeners
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      // 👇 Attach new listener
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const screenId = newLink.dataset.screen;
        console.log(`🎯 Nav clicked: ${screenId}`);
        
        // Update active state
        this.updateActiveNavLink(screenId);
        
        // Navigate
        this.navigateToScreen(screenId);
      });
      
      handlersAttached++;
    });
    
    // Update reference to new links
    this.navLinks = document.querySelectorAll('.nav-menu a');
    
    console.log(`✅ ${handlersAttached} navigation handlers attached`);
  }
  
  setupCameraPositionListener() {
    console.log('🎯 WebsiteUI: Setting up camera position listener');
    
    window.addEventListener('camera-position-changed', (event) => {
        const cameraPosition = event.detail.position;
        const screenId = event.detail.screenId;
        
        console.log(`📡 Camera event: ${cameraPosition} -> ${screenId}`);
        
        if (screenId) {
            this.updateActiveNavLink(screenId);
        }
    });
    
    // Listen for Next/Previous buttons
    const nextButton = document.getElementById('next-button');
    const prevButton = document.getElementById('previous-button');
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            setTimeout(() => this.updateHeaderFromCameraPosition(), 500);
        });
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            setTimeout(() => this.updateHeaderFromCameraPosition(), 500);
        });
    }
    
    console.log('✅ Camera listeners attached');
  }
  
  updateHeaderFromCameraPosition() {
    if (!window.app?.cameraController) return;
    
    const currentPos = window.app.cameraController.currentCameraPosition;
    console.log(`📄 Updating header: ${currentPos}`);
    
    const cameraToScreenMap = {
        'screen1': 'events',
        'screen2': 'about',
        'screen3': 'team', 
        'screen4': 'giveaways',
        'outro': 'join',
        'intro': null
    };
    
    const screenId = cameraToScreenMap[currentPos];
    
    if (screenId) {
        this.updateActiveNavLink(screenId);
    } else if (currentPos === 'intro') {
        this.navLinks.forEach(link => link.classList.remove('active'));
    }
  }
  
  navigateToScreen(screenId) {
    console.log(`🎯 Navigating to: ${screenId}`);
    
    this.updateActiveNavLink(screenId);
    
    const screenMap = {
      'events': 'screen1',
      'about': 'screen2',
      'team': 'screen3',
      'giveaways': 'screen4',
      'join': 'outro'
    };
    
    const cameraPos = screenMap[screenId];
    if (!cameraPos) {
      console.error(`Unknown screen: ${screenId}`);
      return;
    }
    
    // Check if in intro
    const uiContainer = document.getElementById('ui-container');
    const isIntro = uiContainer && uiContainer.style.display !== 'none';
    
    if (isIntro && screenId !== 'join') {
      console.log('⏳ In intro, entering first...');
      this.enterEnvironmentFirst(cameraPos);
    } else if (screenId === 'join') {
      this.goToJoinScreen();
    } else {
      this.goToCameraPosition(cameraPos);
    }
  }
  
  enterEnvironmentFirst(targetCameraPos) {
    console.log('🚪 Entering environment first...');
    
    const enterButton = document.getElementById('enter-button');
    if (enterButton) {
      enterButton.click();
      
      setTimeout(() => {
        this.goToCameraPosition(targetCameraPos);
      }, 3000);
    }
  }
  
  goToCameraPosition(cameraPos) {
    console.log(`🎬 Moving camera to: ${cameraPos}`);
    
    if (!window.app?.cameraController) {
      console.error('❌ Camera controller not available');
      setTimeout(() => this.goToCameraPosition(cameraPos), 500);
      return;
    }
    
    const targetPos = window.app.cameraController.cameraPositions[cameraPos];
    if (!targetPos) {
      console.error(`❌ Position not found: ${cameraPos}`);
      return;
    }
    
    window.app.cameraController.animateCameraToPosition(
      targetPos.position,
      targetPos.target,
      2
    ).then(() => {
      window.app.cameraController.currentCameraPosition = cameraPos;
      
      if (window.app.uiManager) {
        window.app.uiManager.updateNavigationButtons();
      }
      
      this.updateHeaderFromCameraPosition();
      
      console.log(`✅ Arrived at ${cameraPos}`);
    });
  }
  
  goToJoinScreen() {
    console.log('📱 Going to Join Us');
    
    const uiContainer = document.getElementById('ui-container');
    const isIntro = uiContainer && uiContainer.style.display !== 'none';
    
    if (isIntro) {
      this.enterEnvironmentDirectToSocial();
    } else {
      this.goDirectlyToSocialMedia();
    }
  }

  enterEnvironmentDirectToSocial() {
    const enterButton = document.getElementById('enter-button');
    if (enterButton) {
      enterButton.click();
      setTimeout(() => this.goDirectlyToSocialMedia(), 3000);
    }
  }

  goDirectlyToSocialMedia() {
    console.log('🎯 Going to social media UI');
    
    this.updateActiveNavLink('join');
    
    if (window.app?.uiManager) {
      window.app.uiManager.hideNavigation();
    }
    
    if (window.app?.cameraController) {
      const currentPos = window.app.cameraController.currentCameraPosition;
      
      if (currentPos !== 'outro') {
        const outroPos = window.app.cameraController.cameraPositions.outro;
        
        window.app.cameraController.animateCameraToPosition(
          outroPos.position,
          outroPos.target,
          2
        ).then(() => {
          window.app.cameraController.currentCameraPosition = 'outro';
          
          if (window.app.uiManager) {
            window.app.uiManager.showSocialMediaUI();
          }
        });
      } else {
        if (window.app.uiManager) {
          window.app.uiManager.showSocialMediaUI();
        }
      }
    }
  }
  
  updateActiveNavLink(screenId) {
    this.navLinks.forEach(link => {
      if (link.dataset.screen === screenId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    console.log(`✅ Active: ${screenId}`);
  }
  
  hideHeader() {
    console.log('💻 Hiding header');
    this.header.style.display = 'none';
  }
  
  showHeader() {
    console.log('👁️ Showing header');
    this.header.style.display = 'flex';
    
    setTimeout(() => {
      this.header.style.opacity = '1';
      this.header.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
      this.updateHeaderFromCameraPosition();
    }, 100);
  }
  
  setupEnterButtonListener() {
    const enterButton = document.getElementById('enter-button');
    
    if (enterButton) {
      console.log('🎬 Listening for Enter button');
      
      enterButton.addEventListener('click', () => {
        console.log('🎬 Enter clicked');
        
        setTimeout(() => {
          this.showHeader();
          console.log('✅ Header shown after enter');
        }, 2500);
      });
    }
  }
  
  cleanup() {
    // Cleanup if needed
  }
}

// Initialize immediately - check if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM ready - creating WebsiteUI');
    window.websiteUI = new WebsiteUI();
  });
} else {
  // DOM already loaded, initialize now
  console.log('📄 DOM already ready - creating WebsiteUI immediately');
  window.websiteUI = new WebsiteUI();
  
  // Test after initialization
  setTimeout(() => {
    console.log('🧪 WebsiteUI test:', {
      exists: !!window.websiteUI,
      header: !!document.getElementById('website-header'),
      logoLink: !!document.getElementById('logo-link'),
      navLinks: document.querySelectorAll('.nav-menu a').length
    });
  }, 100);
}

window.addEventListener('beforeunload', () => {
  if (window.websiteUI) {
    window.websiteUI.cleanup();
  }
});