// KillBoard#1 iframe Integration
// https://killboard-1.com/ sitesini kendi temamızda çalıştırma

class KillboardIframe {
    constructor() {
        this.currentServer = 'us';
        this.iframe = null;
        this.loadingIndicator = null;
        this.servers = {
            'us': { name: 'Americas', flag: '🌎', url: 'https://killboard-1.com/us' },
            'eu': { name: 'Europe', flag: '🌍', url: 'https://killboard-1.com/eu' },
            'as': { name: 'Asia', flag: '🌏', url: 'https://killboard-1.com/as' }
        };
        
        // KillBoard#1 kategorileri
        this.categories = {
            'juicy': { name: 'Juicy Kills', icon: '💀', path: '/juicy' },
            'streamers': { name: 'Streamers', icon: '📺', path: '/streamers' },
            'solo': { name: 'Solo Open World', icon: '⚔️', path: '/solo' },
            'gank': { name: 'Ganking', icon: '🎯', path: '/gank' },
            'stalkers': { name: 'Stalkers', icon: '👥', path: '/stalkers' },
            'depths': { name: 'Depths', icon: '🏛️', path: '/depths' },
            'weapons': { name: 'Weapons', icon: '⚔️', path: '/weapons' },
            'rankings': { name: 'Rankings', icon: '🏆', path: '/solo' },
            'moments': { name: 'Moments', icon: '📸', path: '/moments' }
        };
        
        this.currentCategory = 'juicy';
    }

    async init() {
        console.log('[KillboardIframe] Başlatılıyor...');
        
        // Sunucu seçimini yükle
        this.currentServer = localStorage.getItem('albion-server') || 'us';
        
        // Kategori seçimini yükle
        this.currentCategory = localStorage.getItem('albion-category') || 'juicy';
        
        this.setupUI();
        this.setupEventListeners();
        this.loadKillboard();
    }

    setupUI() {
        const container = document.getElementById('killboard-container');
        if (!container) return;

        container.innerHTML = `
            <div style="padding:15px;">
                <!-- Server ve Kategori Seçimi -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div>
                        <h3 style="margin:0; color:#f59e0b;">💀 KillBoard#1 Integration</h3>
                        <p style="margin:5px 0 0 0; color:#888; font-size:14px;">
                            Resmi KillBoard#1 verileri ile tam entegrasyon
                        </p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div class="toggle-group" id="kb-server-toggle" style="display:flex; gap:8px;">
                            ${Object.entries(this.servers).map(([key, server]) => `
                                <button class="${key === this.currentServer ? 'active' : ''}" 
                                        data-server="${key}"
                                        style="padding:8px 16px; border:1px solid #333; background:${key === this.currentServer ? '#f59e0b' : 'transparent'}; color:${key === this.currentServer ? '#000' : '#f59e0b'}; border-radius:4px; cursor:pointer;">
                                    ${server.flag} ${server.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Kategori Seçimi -->
                <div style="margin-bottom:20px;">
                    <div style="color:#888; font-size:12px; margin-bottom:8px; text-transform:uppercase;">Kategori</div>
                    <div class="toggle-group" id="kb-category-toggle" style="display:flex; gap:8px; flex-wrap:wrap;">
                        ${Object.entries(this.categories).map(([key, category]) => `
                            <button class="${key === this.currentCategory ? 'active' : ''}" 
                                    data-category="${key}"
                                    style="padding:8px 12px; border:1px solid #333; background:${key === this.currentCategory ? '#f59e0b' : 'transparent'}; color:${key === this.currentCategory ? '#000' : '#f59e0b'}; border-radius:4px; cursor:pointer; font-size:12px;">
                                ${category.icon} ${category.name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Loading Indicator -->
                <div id="kb-loading" style="text-align:center; padding:40px; color:#888;">
                    <div style="font-size:18px; margin-bottom:10px;">⏳ KillBoard#1 yükleniyor...</div>
                    <div style="font-size:14px;">Resmi sunucudan veriler alınıyor</div>
                </div>

                <!-- Iframe Container -->
                <div id="kb-iframe-container" style="display:none;">
                    <iframe id="killboard-iframe" 
                            style="width:100%; height:800px; border:none; border-radius:8px; background:#000;"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
                            loading="lazy">
                    </iframe>
                    
                    <!-- Iframe Controls -->
                    <div style="margin-top:15px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                        <button onclick="killboardIframe.refresh()" 
                                style="padding:8px 16px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">
                            🔄 Yenile
                        </button>
                        <button onclick="killboardIframe.openInNewTab()" 
                                style="padding:8px 16px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;">
                            🔗 Yeni Sekmede Aç
                        </button>
                        <button onclick="killboardIframe.toggleFullscreen()" 
                                style="padding:8px 16px; background:#FF9800; color:white; border:none; border-radius:4px; cursor:pointer;">
                            🔳 Tam Ekran
                        </button>
                        <button onclick="killboardIframe.goHome()" 
                                style="padding:8px 16px; background:#9C27B0; color:white; border:none; border-radius:4px; cursor:pointer;">
                            🏠 Ana Sayfa
                        </button>
                    </div>
                </div>

                <!-- Error Message -->
                <div id="kb-error" style="display:none; text-align:center; padding:40px; color:#f44336;">
                    <div style="font-size:24px; margin-bottom:10px;">❌ Bağlantı Hatası</div>
                    <div style="margin-bottom:20px;">KillBoard#1 sunucusuna ulaşılamıyor.</div>
                    <button onclick="killboardIframe.retry()" 
                            style="padding:10px 20px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">
                        🔄 Tekrar Dene
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Server değiştirme
        document.addEventListener('click', (e) => {
            if (e.target.matches('#kb-server-toggle button')) {
                this.setServer(e.target.dataset.server);
            }
            if (e.target.matches('#kb-category-toggle button')) {
                this.setCategory(e.target.dataset.category);
            }
        });

        // Iframe load events
        const iframe = document.getElementById('killboard-iframe');
        if (iframe) {
            iframe.addEventListener('load', () => {
                this.onIframeLoad();
            });

            iframe.addEventListener('error', () => {
                this.onIframeError();
            });
        }
    }

    setServer(server) {
        if (this.servers[server]) {
            this.currentServer = server;
            localStorage.setItem('albion-server', server);
            this.updateServerButtons();
            this.loadKillboard();
        }
    }

    setCategory(category) {
        if (this.categories[category]) {
            this.currentCategory = category;
            localStorage.setItem('albion-category', category);
            this.updateCategoryButtons();
            this.loadKillboard();
        }
    }

    updateServerButtons() {
        document.querySelectorAll('#kb-server-toggle button').forEach(btn => {
            const isActive = btn.dataset.server === this.currentServer;
            btn.style.background = isActive ? '#f59e0b' : 'transparent';
            btn.style.color = isActive ? '#000' : '#f59e0b';
        });
    }

    updateCategoryButtons() {
        document.querySelectorAll('#kb-category-toggle button').forEach(btn => {
            const isActive = btn.dataset.category === this.currentCategory;
            btn.style.background = isActive ? '#f59e0b' : 'transparent';
            btn.style.color = isActive ? '#000' : '#f59e0b';
        });
    }

    loadKillboard() {
        const loading = document.getElementById('kb-loading');
        const container = document.getElementById('kb-iframe-container');
        const error = document.getElementById('kb-error');

        if (loading) loading.style.display = 'block';
        if (container) container.style.display = 'none';
        if (error) error.style.display = 'none';

        const iframe = document.getElementById('killboard-iframe');
        if (iframe) {
            // Kategoriye göre URL oluştur
            const baseUrl = this.servers[this.currentServer].url;
            const categoryPath = this.categories[this.currentCategory].path;
            const fullUrl = baseUrl + categoryPath;
            
            console.log('[KillboardIframe] Yükleniyor:', fullUrl);
            iframe.src = fullUrl;
        }
    }

    onIframeLoad() {
        console.log('[KillboardIframe] Iframe yüklendi');
        
        const loading = document.getElementById('kb-loading');
        const container = document.getElementById('kb-iframe-container');

        if (loading) loading.style.display = 'none';
        if (container) container.style.display = 'block';

        // Iframe içindeki içeriği stilize etmeye çalış
        this.tryToStyleIframe();
    }

    onIframeError() {
        console.error('[KillboardIframe] Iframe yüklenemedi');
        
        const loading = document.getElementById('kb-loading');
        const container = document.getElementById('kb-iframe-container');
        const error = document.getElementById('kb-error');

        if (loading) loading.style.display = 'none';
        if (container) container.style.display = 'none';
        if (error) error.style.display = 'block';
    }

    tryToStyleIframe() {
        // Not: Güvenlik nedeniyle cross-origin iframe'leri doğrudan stilize edemeyiz
        // Ancak bazı CSS injection denemeleri yapabiliriz
        try {
            const iframe = document.getElementById('killboard-iframe');
            if (iframe && iframe.contentWindow) {
                // iframe içindeki temayı değiştirmeye çalış
                const style = document.createElement('style');
                style.textContent = `
                    /* Tema uyumluluğu için deneme */
                    body {
                        background: #0f1117 !important;
                    }
                `;
                
                // Bu çalışmayabilir çünkü cross-origin kısıtlamaları
                iframe.contentWindow.document.head.appendChild(style);
            }
        } catch (error) {
            console.log('[KillboardIframe] CSS injection engellendi (cross-origin):', error.message);
        }
    }

    refresh() {
        console.log('[KillboardIframe] Yenileniyor...');
        this.loadKillboard();
    }

    openInNewTab() {
        const url = this.servers[this.currentServer].url;
        window.open(url, '_blank');
    }

    toggleFullscreen() {
        const container = document.getElementById('kb-iframe-container');
        const iframe = document.getElementById('killboard-iframe');
        
        if (!document.fullscreenElement) {
            container.requestFullscreen().then(() => {
                iframe.style.height = '100vh';
            }).catch(err => {
                console.error('[KillboardIframe] Tam ekran hatası:', err);
            });
        } else {
            document.exitFullscreen();
            iframe.style.height = '800px';
        }
    }

    retry() {
        this.loadKillboard();
    }

    goHome() {
        // Ana sayfaya git (kategori yok)
        const currentCat = this.currentCategory;
        this.currentCategory = 'juicy'; // Ana kategori
        this.updateCategoryButtons();
        this.loadKillboard();
        
        // Sonra eski kategoriye geri dön
        setTimeout(() => {
            this.currentCategory = currentCat;
            this.updateCategoryButtons();
        }, 100);
    }

    // Public API for external calls
    searchPlayer(query) {
        // Iframe içinde arama yapmaya çalış
        try {
            const iframe = document.getElementById('killboard-iframe');
            if (iframe && iframe.contentWindow) {
                // KillBoard#1 sitesindeki arama input'unu bulmaya çalış
                const searchInput = iframe.contentWindow.document.querySelector('input[type="text"], input[placeholder*="search"], input[placeholder*="ara"]');
                if (searchInput) {
                    searchInput.value = query;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        } catch (error) {
            console.log('[KillboardIframe] Arama yapılamadı:', error.message);
            // Fallback: Yeni sekmede arama yap
            const url = `${this.servers[this.currentServer].url}?search=${encodeURIComponent(query)}`;
            window.open(url, '_blank');
        }
    }
}

// Global instance
let killboardIframe;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    killboardIframe = new KillboardIframe();
    
    // Auto initialize if killboard tab is active
    const killboardTab = document.querySelector('[data-tab="killboard"]');
    if (killboardTab && killboardTab.classList.contains('active')) {
        killboardIframe.init();
    }
});

// Global functions for compatibility
window.initKillboard = () => killboardIframe.init();
window.searchKillboard = (query) => killboardIframe.searchPlayer(query);
window.setKbServer = (server) => killboardIframe.setServer(server);
window.loadKillboard = () => killboardIframe.loadKillboard();
