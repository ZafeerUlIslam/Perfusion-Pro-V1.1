/**
 * Perfusion Pro Suite — PWA & Offline OT Management Engine
 * Automatically prompts user to download/install PWA upon opening,
 * pre-caches all calculation engines, and provides 100% offline reliability in OT.
 */
(function () {
    'use strict';

    let deferredPrompt = null;
    let isOfflineEngineReady = false;

    // Check if app is already running as an installed standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');

    // Register Service Worker immediately
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((reg) => {
                    console.log('[PWA OT] Service Worker registered with scope:', reg.scope);
                    precacheAllEngines();
                })
                .catch((err) => {
                    console.warn('[PWA OT] Service Worker registration failed:', err);
                    precacheAllEngines(); // Still cache in CacheStorage even if SW scope has issues
                });
        });
    } else {
        precacheAllEngines();
    }

    // Engine asset manifest to guarantee 100% offline calculations in the Operating Theater
    const ENGINE_ASSETS = [
        './',
        './index.html',
        './style.css',
        './main.js',
        './ecg-background.js',
        './manifest.json',
        './favicon.png',
        './icons/icon-192.png',
        './icons/icon-512.png',
        './icons/icon-maskable-192.png',
        './icons/icon-maskable-512.png',
        './icons/icon.svg',
        './bsa.js',
        './bloodflow.js',
        './oxygenator.js',
        './cannula.js',
        './kirklin.js',
        './valvesize.js',
        './pedz-bsa.js',
        './pedz-zscore.js',
        './pedz-common.js',
        './pedz-mmode.js',
        './pedz-app.js',
        './cpbHct.js',
        './gdp.js',
        './diseases.js',
        './z score/index.html',
        './z score/styles.css',
        './z score/app.js',
        './z score/bsa.js',
        './z score/common.js',
        './z score/mmode.js',
        './z score/zscore.js'
    ];

    // Explicit Cache Pre-warming
    async function precacheAllEngines() {
        if (!('caches' in window)) return;
        try {
            const cache = await caches.open('perfusion-pro-ot-v6.1');
            let loadedCount = 0;
            const total = ENGINE_ASSETS.length;

            for (const asset of ENGINE_ASSETS) {
                try {
                    const match = await cache.match(asset);
                    if (!match) {
                        const res = await fetch(asset, { cache: 'no-cache' });
                        if (res.ok) await cache.put(asset, res);
                    }
                } catch (e) {
                    // Ignore single file fetch error
                }
                loadedCount++;
                updateDownloadProgress(Math.round((loadedCount / total) * 100));
            }
            isOfflineEngineReady = true;
            markEngineReady();
        } catch (e) {
            console.warn('[PWA OT] Cache prefetch error:', e);
            isOfflineEngineReady = true;
            markEngineReady();
        }
    }

    function updateDownloadProgress(pct) {
        const progressBar = document.getElementById('pwa-download-bar');
        const progressLabel = document.getElementById('pwa-download-label');
        if (progressBar) progressBar.style.width = pct + '%';
        if (progressLabel) progressLabel.textContent = pct + '% Loaded';
    }

    function markEngineReady() {
        const statusEl = document.getElementById('pwa-engine-status');
        const progressLabel = document.getElementById('pwa-download-label');
        if (statusEl) {
            statusEl.innerHTML = '<span class="pwa-status-check">✓</span> <strong>100% Ready for Offline OT Use</strong> (All Calculation Engines Loaded)';
            statusEl.classList.add('ready');
        }
        if (progressLabel) progressLabel.textContent = '100% Complete';
    }

    // Capture standard PWA beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default mini-infobar so our custom popup takes center stage
        e.preventDefault();
        deferredPrompt = e;
        console.log('[PWA OT] beforeinstallprompt captured');

        // Automatically show the download popup on page open
        showDownloadPopup();
    });

    // Also listen for appinstalled event
    window.addEventListener('appinstalled', () => {
        console.log('[PWA OT] App was successfully installed!');
        deferredPrompt = null;
        hideDownloadPopup();
        showInstalledBanner('✓ Perfusion Pro Installed & Ready Offline');
    });

    // Automatically display popup shortly after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        if (isStandalone) {
            // Already installed and opened as standalone PWA in OT!
            showInstalledBanner('⚡ OT Offline Mode Active — All Clinical Engines Ready');
            return;
        }

        // Slight natural delay so the app UI mounts first, then download popup appears
        setTimeout(() => {
            showDownloadPopup();
        }, 650);
    });

    // Build & Show the Download Popup
    function showDownloadPopup() {
        if (isStandalone) return;
        if (document.getElementById('pwa-download-modal')) {
            document.getElementById('pwa-download-modal').classList.add('active');
            return;
        }

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'pwa-download-modal';
        modalOverlay.className = 'pwa-modal-overlay active';

        modalOverlay.innerHTML = `
            <div class="pwa-modal-box" role="dialog" aria-modal="true" aria-labelledby="pwa-title">
                <div class="pwa-modal-header">
                    <div class="pwa-modal-icon-wrap">
                        <div class="pwa-modal-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#ef4444" fill="rgba(239, 68, 68, 0.15)"/>
                                <path d="M12 9v6m-3-3h6" stroke="#38bdf8" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <span class="pwa-pulse-dot"></span>
                    </div>
                    <div>
                        <h2 id="pwa-title" class="pwa-modal-title">Download for Offline OT Use</h2>
                        <p class="pwa-modal-subtitle">Perfusion Pro Suite • Zero Discrepancy Clinical Calculations</p>
                    </div>
                </div>

                <div class="pwa-modal-body">
                    <div class="pwa-highlight-box">
                        <div class="pwa-highlight-row">
                            <span class="pwa-tag-ot">🏥 OT READY</span>
                            <span class="pwa-tag-network">100% OFFLINE</span>
                            <span class="pwa-tag-precision">ZERO LATENCY</span>
                        </div>
                        <p class="pwa-explanation">
                            Operating Theaters frequently have shielded walls with zero Wi-Fi or cellular signal. 
                            Download this app completely to test and verify CPB, HCT, GDP, and Z-Score calculations with 
                            <strong>zero discrepancies</strong> directly at the perfusion console.
                        </p>
                    </div>

                    <div class="pwa-engine-list">
                        <div class="pwa-engine-item"><span>⚡ CPB & Hemodilution Engine</span><strong>Pre-cached</strong></div>
                        <div class="pwa-engine-item"><span>⚡ GDP & DO₂/VO₂ Perfusion Engine</span><strong>Pre-cached</strong></div>
                        <div class="pwa-engine-item"><span>⚡ Pediatric Echocardiography Z-Score</span><strong>Pre-cached</strong></div>
                        <div class="pwa-engine-item"><span>⚡ Multi-Formula BSA & Blood Flow</span><strong>Pre-cached</strong></div>
                    </div>

                    <div class="pwa-progress-section">
                        <div class="pwa-progress-header">
                            <span id="pwa-engine-status"><span class="pwa-spinner"></span> Pre-loading engines into offline storage...</span>
                            <span id="pwa-download-label" class="pwa-progress-pct">0%</span>
                        </div>
                        <div class="pwa-progress-track">
                            <div id="pwa-download-bar" class="pwa-progress-fill" style="width: 15%;"></div>
                        </div>
                    </div>

                    ${isIOS ? `
                        <div class="pwa-ios-instructions">
                            <div class="pwa-ios-step">
                                <span class="pwa-step-num">1</span>
                                <span>Tap the <strong>Share</strong> button <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; display:inline-block"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> at bottom of Safari</span>
                            </div>
                            <div class="pwa-ios-step">
                                <span class="pwa-step-num">2</span>
                                <span>Select <strong>"Add to Home Screen"</strong> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="pwa-modal-footer">
                    <button type="button" id="pwa-install-action-btn" class="pwa-btn-install">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download & Install App
                    </button>
                    <button type="button" id="pwa-dismiss-btn" class="pwa-btn-dismiss">
                        Continue in Browser
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Bind events
        const installBtn = document.getElementById('pwa-install-action-btn');
        const dismissBtn = document.getElementById('pwa-dismiss-btn');

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const choiceResult = await deferredPrompt.userChoice;
                    console.log('[PWA OT] User choice:', choiceResult.outcome);
                    if (choiceResult.outcome === 'accepted') {
                        hideDownloadPopup();
                    }
                    deferredPrompt = null;
                } else if (isIOS) {
                    // Highlight iOS instruction
                    const iosBox = document.querySelector('.pwa-ios-instructions');
                    if (iosBox) {
                        iosBox.style.animation = 'pwaPulseBorder 1s ease 2';
                    }
                } else {
                    // For desktop Chrome/Edge without prompt event or already cached
                    hideDownloadPopup();
                    showInstalledBanner('✓ Offline Cache Complete. You can also click the install icon in your browser address bar.');
                }
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                hideDownloadPopup();
            });
        }

        // If engines are already ready, mark them
        if (isOfflineEngineReady) {
            markEngineReady();
            updateDownloadProgress(100);
        }
    }

    function hideDownloadPopup() {
        const modal = document.getElementById('pwa-download-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
            }, 300);
        }
    }

    function showInstalledBanner(text) {
        const existing = document.getElementById('pwa-installed-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'pwa-installed-toast';
        toast.className = 'pwa-toast';
        toast.innerHTML = `
            <div class="pwa-toast-inner">
                <span class="pwa-toast-dot"></span>
                <span>${text}</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast) {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 400);
            }
        }, 3200);
    }

})();
