// ============================================
// MOBILE TEAM POPUP
// Uses window touchend (always fires even when scroll controller
// calls preventDefault on touchstart).
// Tap validation uses the EXACT same worldToUV + getSectionAtUV
// logic as the desktop interaction.js, with the identical bounds,
// so the interactive areas match pixel-for-pixel.
// ============================================

class MobileTeamPopup {
    constructor() {
        this.container = null;
        this.currentPopup = null;
        this.isActive = false;

        // Tap tracking
        this._tapStartX    = 0;
        this._tapStartY    = 0;
        this._tapStartTime = 0;
        this._TAP_MOVE_LIMIT = 25;  // px
        this._TAP_TIME_LIMIT = 600; // ms

        // EXACT same section bounds as desktop interaction.js
        this._sections = [
            {
                name: 'ceo',
                bounds: { x: 0.1, y: -0.68, width: 0.4, height: 1.4 },
                role: 'CEO',
                personName: 'Amogh Ingale',
                linkedinUrl: 'https://linkedin.com/in/amogh-ingale-a903b91aa/'
            },
            {
                name: 'coo',
                bounds: { x: -0.6, y: -0.68, width: 0.4, height: 1.4 },
                role: 'COO',
                personName: 'Deepti Goswami',
                linkedinUrl: 'https://linkedin.com/in/amogh-ingale-a903b91aa/'
            }
        ];

        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'mobile-team-popup-container';
        document.body.appendChild(this.container);

        // Record finger-down position (passive — never blocks scroll)
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            this._tapStartX    = e.touches[0].clientX;
            this._tapStartY    = e.touches[0].clientY;
            this._tapStartTime = performance.now();
        }, { passive: true });

        // touchend always fires regardless of preventDefault on touchstart
        window.addEventListener('touchend', (e) => {
            if (this.isActive) return;

            // Only active when camera is on the team screen
            const currentScreen = window.mobile3DApp?.cameraController?.getCurrentScreen();
            if (currentScreen !== 'screen3') return;

            // Ignore taps on UI chrome elements
            const touch  = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target && (
                target.closest('#mobile-header')                ||
                target.closest('#mobile-nav-menu')              ||
                target.closest('#mobile-nav-arrows')            ||
                target.closest('.mobile-modal')                 ||
                target.closest('#mobile-team-popup-container')
            )) return;

            // Validate it was a real tap, not a scroll gesture
            const dx       = touch.clientX - this._tapStartX;
            const dy       = touch.clientY - this._tapStartY;
            const dist     = Math.sqrt(dx * dx + dy * dy);
            const duration = performance.now() - this._tapStartTime;
            if (dist > this._TAP_MOVE_LIMIT || duration > this._TAP_TIME_LIMIT) return;

            // ── Raycast + section check (identical to desktop logic) ──
            const section = this._getSectionAtTap(touch.clientX, touch.clientY);
            if (!section) {
                console.log('📱 Tap missed all team sections — no popup');
                return;
            }

            console.log(`📱 Team section hit: ${section.name}`);
            this.show(section.role, section.personName, section.linkedinUrl);

        }, { passive: true });

        console.log('✅ MobileTeamPopup initialized');
    }

    // ── Replicates desktop worldToUV + getSectionAtUV exactly ────────────
    _getSectionAtTap(clientX, clientY) {
        const app = window.mobile3DApp;
        if (!app?.sceneManager?.model || !app?.camera) return null;

        // Find Screen002 mesh
        let mesh = null;
        app.sceneManager.model.traverse(child => {
            if (child.isMesh && child.name === 'Screen002') mesh = child;
        });
        if (!mesh) return null;

        // Build NDC and raycast
        const ndcX =  (clientX / window.innerWidth)  * 2 - 1;
        const ndcY = -(clientY / window.innerHeight) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), app.camera);

        const hits = raycaster.intersectObject(mesh, false);
        if (hits.length === 0) return null;

        // worldToUV — exactly as desktop does it
        const localPoint = mesh.worldToLocal(hits[0].point.clone());
        const uv = {
            u: localPoint.x + 0.5,
            v: localPoint.y + 0.5
        };

        // getSectionAtUV — same bounds check as desktop
        for (const section of this._sections) {
            const b        = section.bounds;
            const sectionU = b.x + 0.5;
            const sectionV = b.y + 0.5;
            if (
                uv.u >= sectionU             &&
                uv.u <= sectionU + b.width   &&
                uv.v >= sectionV             &&
                uv.v <= sectionV + b.height
            ) {
                return section;
            }
        }

        return null; // Hit the screen mesh but outside both sections
    }

    show(role, personName, linkedinUrl) {
        this.forceHide();

        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.disableScroll();
        }

        const roleIcons = { 'CEO': '👑', 'COO': '📊' };

        const roleDescriptions = {
            'CEO': 'Amogh Ingale is a technology-focused entrepreneur with experience as a Data Analyst and as a Business Development Manager in the EdTech sector. Blending analytics, strategy, and a passion for gaming, he founded Keplaar eSports to build a structured and performance-driven ecosystem for aspiring eSports athletes.',
            'COO': 'Squadron Leader Deepti Goswami is an Indian Air Force veteran with hands-on combat experience across multiple missions, bringing discipline, strategic thinking, and operational precision to every endeavor. With extensive expertise in simulation training and coaching, she has mentored individuals in high-performance environments. Driven by a passion for competitive gaming, she has transitioned her leadership and training acumen into the eSports ecosystem, focusing on shaping and mentoring the next generation of eSports athletes through structured, simulation-based development.'
        };

        const roleDesignations = { 'CEO': 'Founder', 'COO': 'Co-Founder' };

        const roleIcon    = roleIcons[role]        || '👤';
        const description = roleDescriptions[role] || "Part of Keplaar Esports' core leadership team.";
        const designation = roleDesignations[role] || 'Executive';

        const overlay = document.createElement('div');
        overlay.className = 'mtp-overlay';
        overlay.addEventListener('touchend', (e) => {
            if (e.target === overlay) { e.preventDefault(); this.hide(); }
        }, { passive: false });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hide();
        });

        const card = document.createElement('div');
        card.className = 'mtp-card';
        card.innerHTML = `
            <button class="mtp-close" aria-label="Close">&times;</button>
            <div class="mtp-header">
                <div class="mtp-role-badge">
                    <span class="mtp-role-icon">${roleIcon}</span>
                    <span class="mtp-role-text">${role}</span>
                </div>
                <h3 class="mtp-name">${personName}</h3>
                <p class="mtp-subtitle">Leadership Team</p>
            </div>
            <div class="mtp-divider"></div>
            <div class="mtp-body">
                <p class="mtp-description">${description}</p>
                <div class="mtp-info-grid">
                    <div class="mtp-info-item">
                        <span class="mtp-info-label">Position</span>
                        <span class="mtp-info-value">${role}</span>
                    </div>
                    <div class="mtp-info-item">
                        <span class="mtp-info-label">Designation</span>
                        <span class="mtp-info-value">${designation}</span>
                    </div>
                </div>
            </div>
            <div class="mtp-footer">
                <button class="mtp-linkedin-btn">
                    <svg class="mtp-linkedin-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    View LinkedIn Profile
                </button>
            </div>
        `;

        // Stop card touches bubbling to the overlay-close handler
        card.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

        const closeBtn = card.querySelector('.mtp-close');
        closeBtn.addEventListener('touchend', (e) => {
            e.preventDefault(); e.stopPropagation(); this.hide();
        }, { passive: false });
        closeBtn.addEventListener('click', () => this.hide());

        const linkedinBtn = card.querySelector('.mtp-linkedin-btn');
        const openLinkedIn = () => {
            if (linkedinUrl && linkedinUrl !== '#') {
                window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
            } else {
                alert(`LinkedIn profile for ${personName} will be available soon.`);
            }
        };
        linkedinBtn.addEventListener('touchend', (e) => {
            e.preventDefault(); e.stopPropagation(); openLinkedIn();
        }, { passive: false });
        linkedinBtn.addEventListener('click', openLinkedIn);

        overlay.appendChild(card);
        this.container.appendChild(overlay);
        this.currentPopup = overlay;
        this.isActive = true;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => overlay.classList.add('active'));
        });

        console.log(`📋 Team popup shown: ${role} – ${personName}`);
    }

    hide() {
        if (!this.currentPopup) return;
        this.currentPopup.classList.remove('active');
        const ref = this.currentPopup;
        setTimeout(() => ref.remove(), 380);
        this.currentPopup = null;
        this.isActive = false;
        if (window.mobile3DApp?.scrollController) {
            window.mobile3DApp.scrollController.enableScroll();
        }
        console.log('📋 Team popup hidden');
    }

    forceHide() {
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
        this.isActive = false;
    }
}

window.mobileTeamPopup = new MobileTeamPopup();
console.log('✅ MobileTeamPopup loaded');
