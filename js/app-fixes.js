// app-fixes.js - Bug fixes & improvements
// Mevcut app.js ile beraber çalışır

// BUG FIX #1: Category state persistence
const CategoryManager = {
    currentMain: 'equipmentitem',
    currentSub: 'ALL',
    currentTier: 'ALL',
    currentEnchant: 'ALL',
    
    saveState() {
        localStorage.setItem('albion-craft-state', JSON.stringify({
            main: this.currentMain,
            sub: this.currentSub,
            tier: this.currentTier,
            enchant: this.currentEnchant
        }));
    },
    
    loadState() {
        const saved = localStorage.getItem('albion-craft-state');
        if (saved) {
            const state = JSON.parse(saved);
            this.currentMain = state.main;
            this.currentSub = state.sub;
            this.currentTier = state.tier;
            this.currentEnchant = state.enchant;
        }
    },
    
    setCategory(main, sub) {
        this.currentMain = main;
        this.currentSub = sub;
        this.saveState();
    }
};

// BUG FIX #2: Unified Server Management
const ServerManager = {
    current: localStorage.getItem('albion-server') || 'west',
    
    getBaseUrl() {
        const servers = {
            west: 'https://west.albion-online-data.com/api/v2/stats',
            east: 'https://east.albion-online-data.com/api/v2/stats',
            europe: 'https://europe.albion-online-data.com/api/v2/stats',
        };
        return servers[this.current] || servers.west;
    },
    
    set(server) {
        console.log('[ServerManager] Sunucu değiştiriliyor:', server);
        this.current = server;
        localStorage.setItem('albion-server', server);
        
        // Tüm API endpoints'i güncelle
        if (window.ApiService) window.ApiService.BASE_URL = this.getBaseUrl();
        
        // UI güncelle
        document.querySelectorAll('[id$="-server-toggle"] button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.val === server);
        });
        
        console.log('[ServerManager] Base URL:', this.getBaseUrl());
    },
    
    init() {
        this.set(this.current);
    }
};

// BUG FIX #3: Loading indicator & progress toast
const LoadingManager = {
    create() {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'global-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="spinner"></div>
                    <p id="loader-text">Yükleniyor...</p>
                    <div id="loader-progress" class="progress-bar" style="display:none;">
                        <div id="loader-progress-fill" class="progress-fill"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        return loader;
    },
    
    show(text = 'Yükleniyor...') {
        const loader = this.create();
        document.getElementById('loader-text').textContent = text;
        loader.style.display = 'flex';
    },
    
    hide() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.style.display = 'none';
    },
    
    updateProgress(percent, text) {
        const progressEl = document.getElementById('loader-progress');
        const fillEl = document.getElementById('loader-progress-fill');
        const textEl = document.getElementById('loader-text');
        
        if (progressEl && fillEl) {
            progressEl.style.display = 'block';
            fillEl.style.width = percent + '%';
        }
        if (textEl && text) textEl.textContent = text;
    }
};

// BUG FIX #4: Enhanced Toast Notifications
const ToastManager = {
    create() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    },
    
    show(msg, type = 'info', duration = 3000) {
        const container = this.create();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${msg}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, duration);
    },
    
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || '📋';
    }
};

// BUG FIX #5: Error Handler
const ErrorHandler = {
    handle(error, context = 'Error') {
        console.error(`[${context}]`, error);
        const msg = error.message || String(error);
        ToastManager.show(`❌ Hata: ${msg}`, 'error');
        return msg;
    }
};

// BUG FIX #6: Keyboard Shortcuts
const KeyboardManager = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K: Search
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('item-search');
                if (searchInput) searchInput.focus();
            }
            // Ctrl+S: Settings
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (typeof switchTab === 'function') switchTab('settings');
            }
            // Ctrl+/: Kısayolları göster
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showShortcuts();
            }
        });
    },
    
    showShortcuts() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>⌨️ Keyboard Shortcuts</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="shortcut-list">
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>K</kbd> = Arama (Search)
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>S</kbd> = Ayarlar (Settings)
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>/</kbd> = Bu menüyü göster
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
};

// Export
window.CategoryManager = CategoryManager;
window.ServerManager = ServerManager;
window.LoadingManager = LoadingManager;
window.ToastManager = ToastManager;
window.ErrorHandler = ErrorHandler;
window.KeyboardManager = KeyboardManager;
