// pwa-installer.js - PWA Installation & Updates
// Service worker registration, install prompt, update detection

const PWAModule = {
    serviceWorkerRegistration: null,
    deferredPrompt: null,
    
    async init() {
        console.log('[PWA] Initializing...');
        
        // Check browser support
        if (!('serviceWorker' in navigator)) {
            console.warn('[PWA] Service Worker not supported');
            return;
        }
        
        // Register manifest
        this.registerManifest();
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Handle install prompt
        this.handleInstallPrompt();
        
        // Check for updates
        this.checkForUpdates();
    },
    
    registerManifest() {
        const link = document.querySelector('link[rel="manifest"]') || 
                     document.createElement('link');
        
        if (!link.href) {
            link.rel = 'manifest';
            link.href = '/manifest.json';
            document.head.appendChild(link);
        }
        
        console.log('[PWA] Manifest registered');
    },
    
    async registerServiceWorker() {
        try {
            this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/',
                updateViaCache: 'none'
            });
            
            console.log('[PWA] Service Worker registered');
            
            // Listen for updates
            this.serviceWorkerRegistration.addEventListener('updatefound', () => {
                this.handleUpdateFound();
            });
            
            // Check for updates periodically
            setInterval(() => {
                this.serviceWorkerRegistration.update();
            }, 60000); // Every minute
            
        } catch (error) {
            console.error('[PWA] Service Worker registration failed:', error);
        }
    },
    
    handleInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('[PWA] Install prompt available');
            event.preventDefault();
            this.deferredPrompt = event;
            
            // Show install button
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed');
            this.deferredPrompt = null;
            ToastManager.show('Albion Tools installed successfully!', 'success');
        });
    },
    
    showInstallButton() {
        const button = document.getElementById('pwa-install-btn');
        if (!button) {
            return;
        }
        
        button.style.display = 'block';
        button.addEventListener('click', () => this.installApp());
    },
    
    async installApp() {
        if (!this.deferredPrompt) {
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('[PWA] User accepted install');
            this.deferredPrompt = null;
        } else {
            console.log('[PWA] User declined install');
        }
    },
    
    handleUpdateFound() {
        const newWorker = this.serviceWorkerRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('[PWA] Update available');
                this.showUpdatePrompt();
            }
        });
    },
    
    showUpdatePrompt() {
        const message = '🆕 Güncelleme mevcut! Sayfayı yenilemek ister misin?';
        
        ToastManager.show(message, 'info');
        
        // Auto-update option
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Güncelle';
        updateBtn.className = 'btn-fetch';
        updateBtn.style.position = 'fixed';
        updateBtn.style.bottom = '20px';
        updateBtn.style.right = '20px';
        updateBtn.style.zIndex = '9999';
        
        updateBtn.addEventListener('click', () => {
            this.applyUpdate();
        });
        
        // Show for 5 seconds then auto-hide
        setTimeout(() => {
            if (updateBtn.parentElement) {
                updateBtn.remove();
            }
        }, 5000);
    },
    
    applyUpdate() {
        if (this.serviceWorkerRegistration?.waiting) {
            this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload when controller changes
            let reloadTimeout;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                clearTimeout(reloadTimeout);
                window.location.reload();
            });
            
            // Safety timeout
            reloadTimeout = setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    },
    
    // Clear cache manually
    clearCache() {
        if (this.serviceWorkerRegistration) {
            navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
        }
    },
    
    // Check if running as installed app
    isInstalledApp() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               navigator.standalone === true ||
               document.referrer.includes('android-app://');
    },
    
    // Get app display mode
    getDisplayMode() {
        const modes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
        return modes.find(mode => 
            window.matchMedia(`(display-mode: ${mode})`).matches
        );
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    PWAModule.init();
    
    // Check if running as installed app
    if (PWAModule.isInstalledApp()) {
        console.log('[PWA] Running as installed app');
        document.body.classList.add('app-mode');
    }
});

window.PWAModule = PWAModule;
