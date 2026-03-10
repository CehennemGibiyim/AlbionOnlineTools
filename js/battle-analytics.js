// battle-analytics.js - Battle Analytics & Hot Zones Panel
// Active PvP events, hottest zones, fame farming locations

const BattleAnalyticsModule = {
    activeEvents: [],
    heatMap: [],
    
    async init() {
        console.log('[BattleAnalytics] Modül başlatılıyor...');
        this.setupControls();
        await this.loadActiveEvents();
        this.renderHotZones();
    },
    
    setupControls() {
        const filterBtns = document.querySelectorAll('#ba-activity-filter button');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderActiveEvents();
            });
        });
        
        const refreshBtn = document.getElementById('ba-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
    },
    
    async loadActiveEvents() {
        try {
            LoadingManager.updateProgress(40, 'Aktif olaylar yükleniyor...');
            
            const response = await fetch('https://gameinfo.albiononline.com/api/gameinfo/events?limit=50&offset=0');
            this.activeEvents = await response.json();
            
            // İstatistikler
            this.processHeatMap();
            LoadingManager.updateProgress(100, 'Analiz tamamlandı');
            
        } catch (error) {
            console.error('[BattleAnalytics] Yükleme hatası:', error);
            this.activeEvents = this.getDemoEvents();
        }
    },
    
    processHeatMap() {
        const zoneMap = {};
        
        this.activeEvents.forEach(event => {
            const zone = event.Location || 'Unknown';
            if (!zoneMap[zone]) {
                zoneMap[zone] = { kills: 0, fame: 0, lastEvent: null };
            }
            zoneMap[zone].kills++;
            zoneMap[zone].fame += event.TotalVictimKillFame || 0;
            zoneMap[zone].lastEvent = new Date(event.TimeStamp);
        });
        
        this.heatMap = Object.entries(zoneMap).map(([zone, stats]) => ({
            zone,
            ...stats,
            intensity: Math.min(100, (stats.kills / 3) * 100)
        })).sort((a, b) => b.kills - a.kills);
    },
    
    getDemoEvents() {
        return [
            { Location: 'Blackpeak Strait', TotalVictimKillFame: 450000, TimeStamp: new Date().toISOString(), Killer: { Name: 'PlayerA' }, Victim: { Name: 'PlayerB' } },
            { Location: 'Crescent Lake', TotalVictimKillFame: 320000, TimeStamp: new Date().toISOString(), Killer: { Name: 'PlayerC' }, Victim: { Name: 'PlayerD' } },
            { Location: 'Shattered Mountain', TotalVictimKillFame: 280000, TimeStamp: new Date().toISOString(), Killer: { Name: 'PlayerE' }, Victim: { Name: 'PlayerF' } }
        ];
    },
    
    renderActiveEvents() {
        const tbody = document.getElementById('ba-events-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = this.activeEvents.slice(0, 20).map(event => `
            <tr>
                <td>${new Date(event.TimeStamp).toLocaleTimeString('tr-TR')}</td>
                <td><strong>${event.Killer?.Name || '—'}</strong></td>
                <td>⚔️</td>
                <td><strong>${event.Victim?.Name || '—'}</strong></td>
                <td>${event.Location || '—'}</td>
                <td>${(event.TotalVictimKillFame || 0).toLocaleString('tr-TR')} Fame</td>
                <td><button class="btn-secondary btn-sm" onclick="alert('Detay')">Göster</button></td>
            </tr>
        `).join('');
        
        if (this.activeEvents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Son kill kayıtları bulunamadı</td></tr>';
        }
    },
    
    renderHotZones() {
        const container = document.getElementById('ba-hot-zones-container');
        if (!container) return;
        
        container.innerHTML = this.heatMap.slice(0, 10).map((zone, idx) => `
            <div class="ba-zone-card">
                <div class="ba-zone-rank">#${idx + 1}</div>
                <div class="ba-zone-info">
                    <div class="ba-zone-name">${zone.zone}</div>
                    <div class="ba-zone-stats">
                        💀 ${zone.kills} Kill | 💰 ${(zone.fame / 1000000).toFixed(1)}M Fame
                    </div>
                </div>
                <div class="ba-zone-heat">
                    <div class="ba-heat-bar">
                        <div class="ba-heat-fill" style="width:${zone.intensity}%; background:linear-gradient(90deg, #4ade80, #f97316, #ef4444)"></div>
                    </div>
                    <span style="font-size:11px">${Math.round(zone.intensity)}%</span>
                </div>
            </div>
        `).join('');
    },
    
    async refresh() {
        LoadingManager.show('Muharebe analizi güncelleniyor...');
        await this.loadActiveEvents();
        this.renderActiveEvents();
        this.renderHotZones();
        LoadingManager.hide();
        ToastManager.show('Analiz güncellendi', 'success');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ba-events-tbody')) {
        BattleAnalyticsModule.init();
    }
});

window.BattleAnalyticsModule = BattleAnalyticsModule;
