// guild-wars.js - Guild Wars Analytics Panel
// Guild statistics, territorial control, member performance

const GuildWarsModule = {
    currentGuild: null,
    guildData: null,
    memberStats: [],
    territoryList: [],
    warHistory: [],
    
    async init() {
        console.log('[GuildWars] Modül başlatılıyor...');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const searchBtn = document.getElementById('gw-search-btn');
        const searchInput = document.getElementById('gw-guild-search');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchGuild());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.searchGuild();
            });
        }
    },
    
    async searchGuild() {
        const input = document.getElementById('gw-guild-search');
        if (!input || !input.value.trim()) {
            ToastManager.show('Guild adı girin', 'warning');
            return;
        }
        
        LoadingManager.show(`Guild aranıyor: ${input.value}`);
        
        try {
            const response = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/guilds?name=${encodeURIComponent(input.value)}`);
            const data = await response.json();
            
            if (!data || data.length === 0) {
                LoadingManager.hide();
                ToastManager.show(`Guild bulunamadı: ${input.value}`, 'error');
                return;
            }
            
            // İlk sonucu seç
            const guild = data[0];
            this.currentGuild = guild;
            await this.loadGuildData(guild.Id);
            LoadingManager.hide();
            
        } catch (error) {
            LoadingManager.hide();
            ErrorHandler.handle(error, 'Guild Search');
        }
    },
    
    async loadGuildData(guildId) {
        try {
            LoadingManager.show('Guild verileri yükleniyor...');
            
            // Guild detay
            const guildRes = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId}`);
            const guild = await guildRes.json();
            
            this.guildData = guild;
            this.renderGuildStats(guild);
            
            // Member stats (simulasyon - gerçek API'de farklı endpoint)
            this.renderMemberStats(guild);
            
            // Territory data
            this.renderTerritoryData(guild);
            
            LoadingManager.hide();
            ToastManager.show(`Guild yüklendi: ${guild.Name}`, 'success');
            
        } catch (error) {
            LoadingManager.hide();
            ErrorHandler.handle(error, 'Load Guild Data');
        }
    },
    
    renderGuildStats(guild) {
        const statsContainer = document.getElementById('gw-stats-container');
        if (!statsContainer) return;
        
        const founded = new Date(guild.Founded).toLocaleDateString('tr-TR');
        const memberCount = guild.Members?.length || 0;
        
        statsContainer.innerHTML = `
            <div class="gw-stat-card">
                <div class="stat-label">Guild Adı</div>
                <div class="stat-value">${guild.Name}</div>
            </div>
            <div class="gw-stat-card">
                <div class="stat-label">Üye Sayısı</div>
                <div class="stat-value">${memberCount}</div>
            </div>
            <div class="gw-stat-card">
                <div class="stat-label">Kuruluş Tarihi</div>
                <div class="stat-value">${founded}</div>
            </div>
            <div class="gw-stat-card">
                <div class="stat-label">Lider</div>
                <div class="stat-value">${guild.Leader?.Name || '—'}</div>
            </div>
            <div class="gw-stat-card">
                <div class="stat-label">Tag</div>
                <div class="stat-value">[${guild.AllianceTag || guild.Name.substring(0, 3)}]</div>
            </div>
        `;
    },
    
    renderMemberStats(guild) {
        const tbody = document.getElementById('gw-members-tbody');
        if (!tbody || !guild.Members) return;
        
        const members = guild.Members.slice(0, 20); // Top 20
        
        tbody.innerHTML = members.map(member => `
            <tr>
                <td><strong>${member.Name}</strong></td>
                <td>${this.getRoleDisplay(member.Role)}</td>
                <td>${member.JoinedAt ? new Date(member.JoinedAt).toLocaleDateString('tr-TR') : '—'}</td>
                <td>${(Math.random() * 5000000).toLocaleString('tr-TR')} Fame</td>
                <td>${Math.random() > 0.5 ? '✅ Online' : '⏸️ Offline'}</td>
            </tr>
        `).join('');
    },
    
    getRoleDisplay(role) {
        const roles = {
            'leader': '👑 Lider',
            'officer': '⭐ Officer',
            'member': '⚔️ Üye',
            'initiate': '🆕 Yeni',
            'recruit': '🔰 Aday'
        };
        return roles[role] || role || '—';
    },
    
    renderTerritoryData(guild) {
        const tbody = document.getElementById('gw-territory-tbody');
        if (!tbody) return;
        
        // Demo veri - gerçek API'den gelir
        const territories = [
            { name: 'Avermere', zone: 'Royal', owner: guild.Name, status: 'defended' },
            { name: 'Ashenvale', zone: 'Royal', owner: guild.Name, status: 'defended' },
            { name: 'Milthorn', zone: 'Outlands', owner: 'Enemy Guild', status: 'contested' }
        ];
        
        tbody.innerHTML = territories.map(t => `
            <tr>
                <td><strong>${t.name}</strong></td>
                <td><span class="tier-badge tier-${t.zone}">${t.zone}</span></td>
                <td>${t.owner}</td>
                <td>${t.status === 'defended' ? '🛡️ Korunan' : '⚡ Tartışmalı'}</td>
                <td><button class="btn-secondary" onclick="alert('Territory details')">Detay</button></td>
            </tr>
        `).join('');
    }
};

// Module initialization
document.addEventListener('DOMContentLoaded', () => {
    if (typeof GuildWarsModule !== 'undefined') {
        GuildWarsModule.init();
    }
});

window.GuildWarsModule = GuildWarsModule;
