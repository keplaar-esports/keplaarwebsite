/**
 * PopupManager - v2.3 - Fixed connector size and position
 */

class PopupManager {
    constructor() {
        this.container = null;
        this.currentPopup = null;
        this.isActive = false;
        this.isHoveringPopup = false;
        this.isHoveringTrigger = false;
        this.currentSection = null;
        this.hideTimeout = null;
        
        // POPUP POSITIONS - YOUR CUSTOM POSITIONS
        this.popupPositions = {
            // EVENTS (Screen 1)
            'event1': {
                left: window.innerWidth * 0.42,
                top: window.innerHeight * 0.30,
                connectorType: 'right-to-left'
            },
            'event2': {
                left: window.innerWidth * 0.63,
                top: window.innerHeight * 0.30,
                connectorType: 'right-to-left'
            },
            'event3': {
                left: window.innerWidth * 0.38,
                top: window.innerHeight * 0.30,
                connectorType: 'left-to-right'
            },
            
            // TEAM MEMBERS (Screen 3)
            'ceo': {
                left: window.innerWidth * 0.33,
                top: window.innerHeight * 0.25,
                connectorType: 'right-to-left'
            },
            'cfo': {
                left: window.innerWidth * 0.45,
                top: window.innerHeight * 0.25,
                connectorType: 'right-to-left'
            },
            'cto': {
                left: window.innerWidth * 0.57,
                top: window.innerHeight * 0.25,
                connectorType: 'right-to-left'
            },
            'cpo': {
                left: window.innerWidth * 0.31,
                top: window.innerHeight * 0.25,
                connectorType: 'left-to-right'
            },
            'coo': {
                left: window.innerWidth * 0.43,
                top: window.innerHeight * 0.25,
                connectorType: 'left-to-right'
            }
        };
        
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'hover-popup-container';
        document.body.appendChild(this.container);
        
        window.addEventListener('resize', () => {
            this.updatePositionsOnResize();
        });
        
        // Hide popup when user scrolls (camera moves)
        window.addEventListener('wheel', () => {
            this.forceHidePopup();
        }, { passive: true });
        
        // ✅ NEW: Hide popup when camera position changes
        window.addEventListener('camera-position-changed', () => {
            console.log('📷 Camera position changed - hiding popup');
            this.forceHidePopup();
        });
        
        console.log('✅ PopupManager v2.5 initialized - camera position check added');
    }

    updatePositionsOnResize() {
        for (let key in this.popupPositions) {
            const pos = this.popupPositions[key];
            if (!pos.leftPercent) {
                pos.leftPercent = pos.left / window.innerWidth;
                pos.topPercent = pos.top / window.innerHeight;
            }
            pos.left = window.innerWidth * pos.leftPercent;
            pos.top = window.innerHeight * pos.topPercent;
        }
    }


    setPopupPosition(sectionName, position) {
        if (this.popupPositions[sectionName]) {
            this.popupPositions[sectionName].left = position.left;
            this.popupPositions[sectionName].top = position.top;
            this.popupPositions[sectionName].leftPercent = position.left / window.innerWidth;
            this.popupPositions[sectionName].topPercent = position.top / window.innerHeight;
            
            if (position.connectorType) {
                this.popupPositions[sectionName].connectorType = position.connectorType;
            }
            
            console.log(`📍 Updated position for ${sectionName}:`, position);
        }
    }

    onTriggerEnter(section, mouseX, mouseY) {
        // ✅ NEW: Check if we're at the correct camera position
        const currentCameraPos = window.app?.cameraController?.getCurrentCameraPosition();
        
        // Define which sections belong to which camera positions
        const sectionToCameraMap = {
            'event1': 'screen1',
            'event2': 'screen1',
            'event3': 'screen1',
            'ceo': 'screen3',
            'cfo': 'screen3',
            'cto': 'screen3',
            'cpo': 'screen3',
            'coo': 'screen3'
        };
        
        const requiredPosition = sectionToCameraMap[section.name];
        
        // ✅ Only show popup if we're at the correct camera position
        if (currentCameraPos !== requiredPosition) {
            console.log(`🚫 Popup blocked: ${section.name} requires ${requiredPosition}, but camera is at ${currentCameraPos}`);
            return; // Don't show popup
        }
        
        this.isHoveringTrigger = true;
        
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        
        this.showPopup(section, mouseX, mouseY);
    }

    onTriggerLeave() {
        this.isHoveringTrigger = false;
        this.scheduleHide();
    }

    scheduleHide() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        this.hideTimeout = setTimeout(() => {
            if (!this.isHoveringTrigger && !this.isHoveringPopup) {
                this.hidePopup();
            }
        }, 150);
    }

    showPopup(section, mouseX, mouseY) {
        if (this.currentSection === section.name && this.currentPopup) {
            return;
        }

        this.forceHidePopup();
        this.currentSection = section.name;

        const isEvent = section.isEvent === true;
        const isTeamMember = section.role && section.personName;

        if (isEvent) {
            this.createEventPopup(section, mouseX, mouseY);
        } else if (isTeamMember) {
            this.createTeamPopup(section, mouseX, mouseY);
        }

        this.isActive = true;
    }

    createEventPopup(section, mouseX, mouseY) {
        const popup = document.createElement('div');
        popup.className = 'hover-popup-card popup-card-event';
        
        popup.innerHTML = `
            <div class="popup-header">
                <div class="popup-event-status">Coming Soon</div>
                <h3 class="popup-title">${section.name.toUpperCase()}</h3>
                <p class="popup-subtitle">Exciting Competition Ahead</p>
            </div>
            
            <div class="popup-body">
                <p class="popup-description">
                    Details for this event will be announced soon. Stay tuned to our social media channels for updates on registration, prizes, and tournament format.
                </p>
                
                <div class="popup-info-grid">
                    <div class="popup-info-item">
                        <span class="popup-info-label">Status</span>
                        <span class="popup-info-value">TBA</span>
                    </div>
                    <div class="popup-info-item">
                        <span class="popup-info-label">Prize Pool</span>
                        <span class="popup-info-value">TBA</span>
                    </div>
                </div>
            </div>
            
            <div class="popup-footer">
                <button class="popup-button popup-button-primary" onclick="window.popupManager.handleEventAction('${section.name}')">
                    <span class="button-icon">🔔</span>
                    <span>Notify Me</span>
                </button>
            </div>
        `;

        this.finalizePopup(popup, section.name, mouseX, mouseY);
    }

    createTeamPopup(section, mouseX, mouseY) {
        const popup = document.createElement('div');
        popup.className = 'hover-popup-card popup-card-team';
        
        const roleIcons = {
            'CEO': '👑',
            'CFO': '💼',
            'CTO': '⚙️',
            'CPO': '🎮',
            'COO': '📊'
        };

        const roleIcon = roleIcons[section.role] || '👤';
        
        popup.innerHTML = `
            <div class="popup-header">
                <div class="popup-role-badge">
                    <span class="role-badge-icon">${roleIcon}</span>
                    <span class="role-badge-text">${section.role}</span>
                </div>
                <h3 class="popup-title">${section.personName}</h3>
                <p class="popup-subtitle">Leadership Team</p>
            </div>
            
            <div class="popup-body">
                <p class="popup-description">
                    Part of Keplaar Esports' core leadership team, driving our vision and strategy in the competitive gaming landscape.
                </p>
                
                <div class="popup-info-grid">
                    <div class="popup-info-item">
                        <span class="popup-info-label">Position</span>
                        <span class="popup-info-value">${section.role}</span>
                    </div>
                    <div class="popup-info-item">
                        <span class="popup-info-label">Department</span>
                        <span class="popup-info-value">Executive</span>
                    </div>
                </div>
            </div>
            
            <div class="popup-footer">
                <button class="popup-button popup-button-primary" onclick="window.popupManager.handleLinkedInAction('${section.linkedinUrl}', '${section.personName}')">
                    <svg class="linkedin-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>View Profile</span>
                </button>
            </div>
        `;

        this.finalizePopup(popup, section.name, mouseX, mouseY);
    }

    finalizePopup(popup, sectionName, mouseX, mouseY) {
        this.container.appendChild(popup);
        
        const position = this.popupPositions[sectionName];
        if (position) {
            popup.style.left = position.left + 'px';
            popup.style.top = position.top + 'px';
        }
        
        // Activate popup (no connector)
        requestAnimationFrame(() => {
            popup.classList.add('active');
        });
        
        // Add hover listeners
        popup.addEventListener('mouseenter', () => {
            this.isHoveringPopup = true;
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
        });

        popup.addEventListener('mouseleave', () => {
            this.isHoveringPopup = false;
            this.scheduleHide();
        });
        
        this.currentPopup = popup;
    }


    shouldHidePopup() {
        return !this.isHoveringTrigger && !this.isHoveringPopup;
    }

    hidePopup() {
        if (this.isHoveringTrigger || this.isHoveringPopup) {
            return;
        }

        if (this.currentPopup) {
            this.currentPopup.classList.remove('active');
            setTimeout(() => {
                this.currentPopup?.remove();
                this.currentPopup = null;
            }, 400);
        }

        this.currentSection = null;
        this.isActive = false;
    }

    forceHidePopup() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }

        this.currentSection = null;
        this.isActive = false;
        this.isHoveringPopup = false;
        this.isHoveringTrigger = false;
    }

    handleEventAction(eventName) {
        console.log('🔔 Notify Me clicked for:', eventName);
        alert(`✅ You'll be notified when ${eventName} details are announced!`);
    }

    handleLinkedInAction(linkedinUrl, personName) {
        console.log('🔗 Opening LinkedIn for:', personName);
        if (linkedinUrl && linkedinUrl !== '#') {
            window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
        } else {
            alert(`LinkedIn profile for ${personName} will be available soon.`);
        }
    }

    isPopupActive() {
        return this.isActive;
    }

    getPopupPositions() {
        return this.popupPositions;
    }

    logPositions() {
        console.log('📍 Current Popup Positions:');
        console.table(this.popupPositions);
    }

}

window.popupManager = new PopupManager();
console.log('✅ PopupManager v2.3 loaded - connector size fixed');
console.log('💡 Type: window.popupManager.logConnectorConfig() to see settings');
