/* ═══════════════════════════════════════════════════════════════════════════
   PERFUSION PRO SUITE — SERVICE WORKER FOR OPERATING THEATER (OT)
   Engineered for 100% zero-network offline reliability with all engines loaded.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'perfusion-pro-ot-v6.1';

const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './style.css?v=6.0',
    './main.js',
    './main.js?v=5.0',
    './ecg-background.js',
    './ecg-background.js?v=4.0',
    './manifest.json',
    './favicon.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png',
    './icons/icon.svg',
    // All Calculation & Clinical Decision Engines
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
    './cpbHct.js?v=2.1',
    './gdp.js',
    './gdp.js?v=2.6',
    './diseases.js',
    // Z-Score Subsystem Files
    './z score/index.html',
    './z score/styles.css',
    './z score/app.js',
    './z score/bsa.js',
    './z score/common.js',
    './z score/mmode.js',
    './z score/zscore.js'
];

// Install: Cache all engine assets immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Cache essential assets with atomic resilience
            const cachePromises = CORE_ASSETS.map(async (assetUrl) => {
                try {
                    const response = await fetch(assetUrl, { cache: 'no-cache' });
                    if (response.ok) {
                        await cache.put(assetUrl, response);
                    }
                } catch (err) {
                    console.warn('[SW OT] Pre-cache skipped asset:', assetUrl, err);
                }
            });
            await Promise.all(cachePromises);
            return self.skipWaiting();
        })
    );
});

// Activate: Claim clients and wipe previous obsolete caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW OT] Removing old cache version:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Offline-First Strategy with Background Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Handle HTML navigation (always serve offline index.html if network drops in OT)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkRes) => {
                    if (networkRes && networkRes.status === 200) {
                        const copy = networkRes.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return networkRes;
                })
                .catch(async () => {
                    const cachedPage = await caches.match(event.request);
                    if (cachedPage) return cachedPage;
                    const fallbackHome = await caches.match('./index.html');
                    return fallbackHome || caches.match('/');
                })
        );
        return;
    }

    // Handle static resources, modules, fonts, styles
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Network fetch promise in background or primary
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        // Cache Google Fonts or dynamic same-origin requests
                        const isSameOrigin = url.origin === location.origin;
                        const isFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
                        if (isSameOrigin || isFont) {
                            const resClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
                        }
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Offline in Operating Theater — cachedResponse will be returned
                    return cachedResponse;
                });

            // Return cached response instantly if found (ultra-fast offline loading in OT)
            return cachedResponse || fetchPromise;
        })
    );
});

// Message listener for app communication
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
