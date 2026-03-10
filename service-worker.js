// service-worker.js - Service Worker for PWA & Offline Support
// Caching, offline mode, push notifications

const CACHE_VERSION = 'albion-v2.0.0';
const CACHE_ASSETS = `${CACHE_VERSION}-assets`;
const CACHE_API = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/themes.css',
    '/css/styles.css',
    '/css/app-fixes.css',
    '/css/new-panels.css',
    '/js/app.js',
    '/js/app-fixes.js',
    '/js/api.js',
    '/js/i18n.js'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    event.waitUntil(
        caches.open(CACHE_ASSETS).then((cache) => {
            console.log('[ServiceWorker] Caching assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_ASSETS && cacheName !== CACHE_API) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // API requests - network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    // Cache successful API responses
                    const responseClone = response.clone();
                    caches.open(CACHE_API).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    
                    return response;
                })
                .catch(() => {
                    // Return cached API response if network fails
                    return caches.match(request).then((response) => {
                        return response || new Response(
                            JSON.stringify({ offline: true, message: 'Offline mode' }),
                            { headers: { 'Content-Type': 'application/json' } }
                        );
                    });
                })
        );
    }
    // Static assets - cache first, network fallback
    else {
        event.respondWith(
            caches.match(request).then((response) => {
                if (response) {
                    return response;
                }
                
                return fetch(request).then((response) => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    const responseClone = response.clone();
                    caches.open(CACHE_ASSETS).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    
                    return response;
                });
            })
        );
    }
});

// Background sync for push notifications
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    if (event.tag === 'price-alerts') {
        event.waitUntil(syncPriceAlerts());
    }
});

async function syncPriceAlerts() {
    try {
        const response = await fetch('/api/price-alerts/check');
        const alerts = await response.json();
        
        alerts.forEach((alert) => {
            self.registration.showNotification('Price Alert', {
                body: `${alert.item} dropped to ${alert.price} S`,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                tag: 'price-alert',
                requireInteraction: false
            });
        });
    } catch (error) {
        console.error('[ServiceWorker] Sync error:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }
    
    let notificationData = {
        title: 'Albion Tools',
        body: event.data.text(),
        icon: '/icon-192.png',
        badge: '/badge-72.png'
    };
    
    try {
        notificationData = JSON.parse(event.data.text());
    } catch (e) {
        // Use default if not JSON
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Focus existing window if open
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window if not already open
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Message handling (communication with client)
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_API).then(() => {
            console.log('[ServiceWorker] API cache cleared');
        });
    }
});

console.log('[ServiceWorker] Loaded');
