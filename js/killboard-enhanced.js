// Enhanced Killboard - KillBoard#1 Style Integration
// Albion Online Data Project API ile gelişmiş killboard

class EnhancedKillboard {
    constructor() {
        this.currentServer = 'west';
        this.currentCategory = 'lethal';
        this.currentPage = 0;
        this.pageSize = 20;
        this.cache = new Map();
        this.loading = false;
        
        // Sunucu ayarları
        this.servers = {
            'west': { name: 'Americas', flag: '🌎', offset: 0 },
            'europe': { name: 'Europe', flag: '🌍', offset: 0 },
            'east': { name: 'Asia', flag: '🌏', offset: 0 }
        };
        
        // Kategoriler
        this.categories = {
            'lethal': { name: 'Lethal Kills', icon: '💀', filter: this.isLethalKill.bind(this) },
            'depths': { name: 'Depths', icon: '🏛️', filter: this.isDepthsKill.bind(this) },
            'zvz': { name: 'ZVZ', icon: '⚔️', filter: this.isZvZKill.bind(this) },
            'stalkers': { name: 'Stalkers', icon: '👥', filter: this.isStalkerKill.bind(this) },
            'ganking': { name: 'Ganking', icon: '🎯', filter: this.isGankingKill.bind(this) }
        };
    }

    async init() {
        console.log('[EnhancedKB] KillBoard başlatılıyor...');
        
        // Sunucu seçimi
        this.currentServer = localStorage.getItem('albion-server') || 'west';
        this.currentCategory = localStorage.getItem('albion-category') || 'lethal';
        
        this.setupUI();
        this.setupEventListeners();
        await this.loadKills();
    }

    setupUI() {
        // Sunucu butonları
        const serverContainer = document.getElementById('kb-server-toggle');
        if (serverContainer) {
            let html = '';
            for (const [key, server] of Object.entries(this.servers)) {
                html += `<button class="nav-tab ${key === this.currentServer ? 'active' : ''}" data-server="${key}">
                    ${server.flag} ${server.name}
                </button>`;
            }
            serverContainer.innerHTML = html;
        }

        // Kategori butonları
        const categoryContainer = document.getElementById('kb-category-toggle');
        if (categoryContainer) {
            let html = '';
            for (const [key, category] of Object.entries(this.categories)) {
                html += `<button class="nav-tab ${key === this.currentCategory ? 'active' : ''}" data-category="${key}">
                    ${category.icon} ${category.name}
                </button>`;
            }
            categoryContainer.innerHTML = html;
        }
    }

    setupEventListeners() {
        // Sunucu değiştirme
        document.addEventListener('click', (e) => {
            if (e.target.matches('#kb-server-toggle button')) {
                this.setServer(e.target.dataset.server);
            }
            if (e.target.matches('#kb-category-toggle button')) {
                this.setCategory(e.target.dataset.category);
            }
        });

        // Arama
        const searchInput = document.getElementById('kb-player-search');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.searchPlayer(query);
                    } else {
                        this.loadKills();
                    }
                }
            });
        }

        // Refresh butonu
        const refreshBtn = document.getElementById('kb-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadKills());
        }
    }

    setServer(server) {
        if (this.servers[server]) {
            this.currentServer = server;
            localStorage.setItem('albion-server', server);
            this.currentPage = 0;
            this.updateServerButtons();
            this.loadKills();
        }
    }

    setCategory(category) {
        if (this.categories[category]) {
            this.currentCategory = category;
            localStorage.setItem('albion-category', category);
            this.currentPage = 0;
            this.updateCategoryButtons();
            this.loadKills();
        }
    }

    updateServerButtons() {
        document.querySelectorAll('#kb-server-toggle button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.server === this.currentServer);
        });
    }

    updateCategoryButtons() {
        document.querySelectorAll('#kb-category-toggle button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });
    }

    async loadKills() {
        const container = document.getElementById('killboard-container');
        if (!container || this.loading) return;

        this.loading = true;
        container.innerHTML = '<div style="padding:40px; text-align:center;">⏳ Yükleniyor...</div>';

        try {
            const cacheKey = `${this.currentServer}_${this.currentCategory}_${this.currentPage}`;
            
            if (this.cache.has(cacheKey)) {
                this.displayKills(this.cache.get(cacheKey));
                return;
            }

            const apiUrl = `https://gameinfo.albiononline.com/api/gameinfo/events?limit=${this.pageSize}&offset=${this.currentPage * this.pageSize}`;
            console.log('[EnhancedKB] API çağrısı:', apiUrl);

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[EnhancedKB] API yanıtı:', data);

            // Kategoriye göre filtrele
            const filteredKills = this.filterKillsByCategory(data);
            this.cache.set(cacheKey, filteredKills);

            this.displayKills(filteredKills);
        } catch (error) {
            console.error('[EnhancedKB] Hata:', error);
            container.innerHTML = `
                <div style="padding:20px; text-align:center; color:#f44336;">
                    ❌ Hata: ${error.message}
                    <br><small>API: gameinfo.albiononline.com</small>
                </div>
            `;
        } finally {
            this.loading = false;
        }
    }

    filterKillsByCategory(kills) {
        const filter = this.categories[this.currentCategory].filter;
        return kills.filter(filter);
    }

    // Kategori filtreleri
    isLethalKill(event) {
        return event.TotalVictimKillFame >= 1000; // High fame kills
    }

    isDepthsKill(event) {
        return event.Location && (
            event.Location.includes('Dungeon') ||
            event.Location.includes('Depths') ||
            event.Location.includes('Hellgate') ||
            event.Location.includes('Expedition')
        );
    }

    isZvZKill(event) {
        // ZvZ kills - high participant count
        return event.Participants && event.Participants.length >= 10;
    }

    isStalkerKill(event) {
        // Stalker kills - solo or small group
        return event.Participants && event.Participants.length <= 5;
    }

    isGankingKill(event) {
        // Ganking - unexpected attacks
        return event.TotalVictimKillFame < 1000 && 
               event.Killer && 
               event.Victim &&
               event.Killer.Name !== event.Victim.Name;
    }

    displayKills(kills) {
        const container = document.getElementById('killboard-container');
        if (!container) return;

        const category = this.categories[this.currentCategory];
        const server = this.servers[this.currentServer];

        let html = `
            <div style="padding:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3>${category.icon} ${category.name} - ${server.flag} ${server.name}</h3>
                    <button id="kb-refresh" style="padding:8px 16px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">
                        🔄 Yenile
                    </button>
                </div>
        `;

        if (kills.length === 0) {
            html += '<div style="text-align:center; padding:40px; color:#666;">Bu kategoride kill bulunamadı.</div>';
        } else {
            kills.forEach(kill => {
                html += this.createKillCard(kill);
            });

            // Sayfalama
            if (kills.length === this.pageSize) {
                html += `
                    <div style="text-align:center; margin-top:20px;">
                        <button onclick="enhancedKillboard.loadMore()" style="padding:8px 16px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;">
                            Daha Fazla Yükle
                        </button>
                    </div>
                `;
            }
        }

        html += '</div>';
        container.innerHTML = html;
    }

    createKillCard(kill) {
        const killer = kill.Killer || {};
        const victim = kill.Victim || {};
        const fame = kill.TotalVictimKillFame || 0;
        const location = kill.Location || 'Bilinmiyor';
        const time = new Date(kill.TimeStamp).toLocaleString('tr-TR');
        const isLethal = fame >= 1000;
        
        // Item bilgileri
        const weapon = this.getMainWeapon(kill.Killer);
        const victimWeapon = this.getMainWeapon(kill.Victim);

        return `
            <div style="border:1px solid #333; margin:10px 0; padding:15px; border-radius:8px; background:${isLethal ? '#1a1a1a' : '#0f0f0f'};">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div>
                        <div style="font-size:16px; font-weight:bold; color:#4CAF50;">
                            💀 ${killer.Name || 'Bilinmiyor'}
                            ${killer.GuildName ? `<span style="color:#2196F3;">[${killer.GuildName}]</span>` : ''}
                            ${weapon ? `<span style="color:#FF9800;"> ${weapon}</span>` : ''}
                        </div>
                        <div style="font-size:14px; margin-top:5px;">
                            vs
                        </div>
                        <div style="font-size:16px; font-weight:bold; color:#f44336;">
                            ☠️ ${victim.Name || 'Bilinmiyor'}
                            ${victim.GuildName ? `<span style="color:#2196F3;">[${victim.GuildName}]</span>` : ''}
                            ${victimWeapon ? `<span style="color:#FF9800;"> ${victimWeapon}</span>` : ''}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        ${isLethal ? '<div style="color:#FFD700; font-weight:bold;">⚡ LETHAL</div>' : ''}
                        <div style="color:#4CAF50;">💰 ${fame.toLocaleString('tr-TR')} Fame</div>
                        <div style="color:#2196F3;">📍 ${location}</div>
                        <div style="color:#666; font-size:12px;">⏰ ${time}</div>
                    </div>
                </div>
                
                ${kill.Participants && kill.Participants.length > 2 ? `
                    <div style="border-top:1px solid #333; padding-top:10px; margin-top:10px;">
                        <div style="color:#666; font-size:12px;">⚔️ ${kill.Participants.length} Katılımcı</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getMainWeapon(player) {
        if (!player || !player.Equipment) return null;
        
        const equipment = player.Equipment;
        const weapons = [
            equipment.MainHand,
            equipment.OffHand,
            equipment.Armor,
            equipment.Head,
            equipment.Shoes
        ];

        for (const item of weapons) {
            if (item && item.Type && (
                item.Type.includes('SWORD') ||
                item.Type.includes('AXE') ||
                item.Type.includes('HAMMER') ||
                item.Type.includes('DAGGER') ||
                item.Type.includes('SPEAR') ||
                item.Type.includes('STAFF') ||
                item.Type.includes('BOW') ||
                item.Type.includes('CROSSBOW') ||
                item.Type.includes('CURSESTAFF') ||
                item.Type.includes('FIRESTAFF') ||
                item.Type.includes('FROSTSTAFF') ||
                item.Type.includes('HOLYSTAFF') ||
                item.Type.includes('NATURESTAFF') ||
                item.Type.includes('ARCANE')
            )) {
                return item.LocalizedName || item.Type;
            }
        }
        return null;
    }

    async loadMore() {
        this.currentPage++;
        await this.loadKills();
    }

    async searchPlayer(query) {
        const container = document.getElementById('killboard-container');
        if (!container) return;

        container.innerHTML = `
            <div style="padding:40px; text-align:center;">
                🔍 "${query}" aranıyor...
            </div>
        `;

        try {
            // Oyuncu bilgilerini al
            const playerResponse = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/players?name=${encodeURIComponent(query)}`);
            const players = await playerResponse.json();

            if (!players || players.length === 0) {
                container.innerHTML = `
                    <div style="padding:40px; text-align:center;">
                        ❌ Oyuncu bulunamadı: "${query}"
                    </div>
                `;
                return;
            }

            const player = players[0];
            
            // Kill geçmişini al
            const killsResponse = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/players/${player.Id}/kills?limit=50`);
            const kills = await killsResponse.json();

            this.displayPlayerStats(query, player, kills);
        } catch (error) {
            console.error('[EnhancedKB] Arama hatası:', error);
            container.innerHTML = `
                <div style="padding:20px; text-align:center; color:#f44336;">
                    ❌ Arama hatası: ${error.message}
                </div>
            `;
        }
    }

    displayPlayerStats(query, player, kills) {
        const container = document.getElementById('killboard-container');
        
        // İstatistikleri hesapla
        const totalKills = kills.filter(k => k.Killer && k.Killer.Id === player.Id).length;
        const totalDeaths = kills.filter(k => k.Victim && k.Victim.Id === player.Id).length;
        const totalKillFame = kills
            .filter(k => k.Killer && k.Killer.Id === player.Id)
            .reduce((sum, k) => sum + (k.TotalVictimKillFame || 0), 0);
        
        const kdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : '∞';

        let html = `
            <div style="padding:20px;">
                <h3>🔍 ${query} - Oyuncu İstatistikleri</h3>
                
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin:20px 0;">
                    <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                        <div style="color:#4CAF50; font-size:24px; font-weight:bold;">${totalKills}</div>
                        <div style="color:#666;">💀 Kill</div>
                    </div>
                    <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                        <div style="color:#f44336; font-size:24px; font-weight:bold;">${totalDeaths}</div>
                        <div style="color:#666;">☠️ Death</div>
                    </div>
                    <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                        <div style="color:#FFD700; font-size:24px; font-weight:bold;">${kdRatio}</div>
                        <div style="color:#666;">📊 K/D</div>
                    </div>
                    <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                        <div style="color:#4CAF50; font-size:24px; font-weight:bold;">${totalKillFame.toLocaleString('tr-TR')}</div>
                        <div style="color:#666;">💰 Kill Fame</div>
                    </div>
                </div>

                <h4>📋 Son Aktiviteler</h4>
        `;

        kills.slice(0, 20).forEach(kill => {
            const isKill = kill.Killer && kill.Killer.Id === player.Id;
            const opponent = isKill ? kill.Victim : kill.Killer;
            const fame = kill.TotalVictimKillFame || 0;
            const time = new Date(kill.TimeStamp).toLocaleString('tr-TR');

            html += `
                <div style="border:1px solid #333; margin:10px 0; padding:15px; border-radius:8px;">
                    <div style="color:${isKill ? '#4CAF50' : '#f44336'}; font-weight:bold; margin-bottom:5px;">
                        ${isKill ? '💀 KILL' : '☠️ DEATH'} 
                        ${opponent ? opponent.Name : 'Bilinmiyor'}
                        ${opponent && opponent.GuildName ? `[${opponent.GuildName}]` : ''}
                    </div>
                    <div style="color:#666; font-size:14px;">
                        💰 ${fame.toLocaleString('tr-TR')} Fame | 
                        📍 ${kill.Location || 'Bilinmiyor'} | 
                        ⏰ ${time}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
}

// Global instance
let enhancedKillboard;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    enhancedKillboard = new EnhancedKillboard();
    
    // Auto initialize if killboard tab is active
    const killboardTab = document.querySelector('[data-tab="killboard"]');
    if (killboardTab && killboardTab.classList.contains('active')) {
        enhancedKillboard.init();
    }
});

// Global functions for compatibility
window.initKillboard = () => enhancedKillboard.init();
window.searchKillboard = (query) => enhancedKillboard.searchPlayer(query);
window.setKbServer = (server) => enhancedKillboard.setServer(server);
window.loadKillboard = () => enhancedKillboard.loadKills();
