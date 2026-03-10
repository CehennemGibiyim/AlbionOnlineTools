// player-rankings.js - Player Rankings & Leaderboards
// Top killers, wealth rankings, fame leaderboards

const PlayerRankingsModule = {
    rankings: {
        killers: [],
        fame: [],
        wealth: [],
        guilds: []
    },
    
    async init() {
        console.log('[PlayerRankings] Modül başlatılıyor...');
        this.setupControls();
        await this.loadRankings();
        this.renderActiveTab();
    },
    
    setupControls() {
        const tabs = document.querySelectorAll('#pr-ranking-tabs button');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderActiveTab();
            });
        });
    },
    
    async loadRankings() {
        try {
            LoadingManager.show('Sıralamalar yükleniyor...');
            
            // Events'ten rank hesapla
            const response = await fetch('https://gameinfo.albiononline.com/api/gameinfo/events?limit=200&offset=0');
            const events = await response.json();
            
            this.processRankings(events);
            LoadingManager.hide();
            
        } catch (error) {
            console.error('[PlayerRankings] Yükleme hatası:', error);
            LoadingManager.hide();
            this.rankings = this.getDemoRankings();
        }
    },
    
    processRankings(events) {
        const players = {};
        const guilds = {};
        
        events.forEach(event => {
            // Killer stats
            if (event.Killer) {
                const killerName = event.Killer.Name;
                if (!players[killerName]) {
                    players[killerName] = { name: killerName, kills: 0, fame: 0, deaths: 0, guild: event.Killer.GuildName };
                }
                players[killerName].kills++;
                players[killerName].fame += event.TotalVictimKillFame || 0;
            }
            
            // Victim stats
            if (event.Victim) {
                const victimName = event.Victim.Name;
                if (!players[victimName]) {
                    players[victimName] = { name: victimName, kills: 0, fame: 0, deaths: 0, guild: event.Victim.GuildName };
                }
                players[victimName].deaths++;
            }
        });
        
        this.rankings.killers = Object.values(players).sort((a, b) => b.kills - a.kills).slice(0, 100);
        this.rankings.fame = Object.values(players).sort((a, b) => b.fame - a.fame).slice(0, 100);
    },
    
    getDemoRankings() {
        const players = [];
        for (let i = 1; i <= 50; i++) {
            players.push({
                name: `Player_${i}`,
                kills: Math.floor(Math.random() * 500),
                deaths: Math.floor(Math.random() * 300),
                fame: Math.floor(Math.random() * 50000000),
                guild: `Guild_${Math.floor(i / 5)}`
            });
        }
        
        return {
            killers: players.sort((a, b) => b.kills - a.kills),
            fame: players.sort((a, b) => b.fame - a.fame),
            wealth: players.sort((a, b) => b.fame - a.fame),
            guilds: players.slice(0, 20).map(p => ({
                name: p.guild,
                totalFame: Math.random() * 500000000,
                members: Math.floor(Math.random() * 100) + 10
            }))
        };
    },
    
    renderActiveTab() {
        const activeBtn = document.querySelector('#pr-ranking-tabs button.active');
        if (!activeBtn) return;
        
        const type = activeBtn.dataset.type;
        const tbody = document.getElementById('pr-rankings-tbody');
        if (!tbody) return;
        
        const data = this.rankings[type] || [];
        
        if (type === 'killers') {
            tbody.innerHTML = data.map((p, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.guild || '—'}</td>
                    <td style="color:#4ade80"><strong>${p.kills}</strong></td>
                    <td style="color:#ef4444">${p.deaths}</td>
                    <td>${(p.kills / Math.max(1, p.deaths)).toFixed(2)}</td>
                </tr>
            `).join('');
        } else if (type === 'fame') {
            tbody.innerHTML = data.map((p, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.guild || '—'}</td>
                    <td style="color:#f59e0b"><strong>${(p.fame / 1000000).toFixed(2)}M</strong></td>
                    <td>${p.kills}</td>
                    <td>${(p.fame / Math.max(1, p.kills)).toFixed(0)}</td>
                </tr>
            `).join('');
        } else if (type === 'guilds') {
            tbody.innerHTML = data.map((g, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${g.name}</strong></td>
                    <td>${g.members}</td>
                    <td style="color:#f59e0b">${(g.totalFame / 1000000000).toFixed(2)}B</td>
                </tr>
            `).join('');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pr-rankings-tbody')) {
        PlayerRankingsModule.init();
    }
});

window.PlayerRankingsModule = PlayerRankingsModule;
