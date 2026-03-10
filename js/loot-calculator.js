// loot-calculator.js - Loot Calculator & Farming Profit Module
// Mob drops, dungeon loot tables, farming profit calculation

const LootCalculatorModule = {
    mobs: [],
    dungeons: [],
    selectedZone: null,
    farmingResults: [],
    
    async init() {
        console.log('[LootCalculator] Modül başlatılıyor...');
        this.setupControls();
        this.loadData();
        this.renderZones();
    },
    
    setupControls() {
        // Zone buttons
        const zoneBtns = document.querySelectorAll('#lc-zone-buttons button');
        zoneBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                zoneBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedZone = btn.dataset.val;
                this.renderMobsForZone();
            });
        });
        
        // Calculate button
        const calcBtn = document.getElementById('lc-calculate-btn');
        if (calcBtn) {
            calcBtn.addEventListener('click', () => this.calculateProfit());
        }
    },
    
    loadData() {
        this.mobs = this.getDemoMobs();
        this.dungeons = this.getDemoDungeons();
    },
    
    getDemoMobs() {
        return [
            {
                id: 'MOB_T4_ELEMENTALGOLEM',
                name: 'Elemental Golem',
                zone: 'Royal Valleys',
                tier: 4,
                health: 450,
                difficulty: 'medium',
                avgKillTime: 45, // seconds
                drops: [
                    { item: 'Cloth', rarity: 'common', rate: 0.25, quantity: '1-3', value: 350 },
                    { item: 'Elemental Essence', rarity: 'uncommon', rate: 0.10, quantity: '1', value: 2500 },
                    { item: 'Ancient Rune', rarity: 'rare', rate: 0.02, quantity: '1', value: 15000 }
                ],
                avgLootValue: 1200
            },
            {
                id: 'MOB_T5_DEATHWORM',
                name: 'Death Worm',
                zone: 'Outlands',
                tier: 5,
                health: 850,
                difficulty: 'hard',
                avgKillTime: 120,
                drops: [
                    { item: 'Leather', rarity: 'common', rate: 0.30, quantity: '1-4', value: 500 },
                    { item: 'Worm Fang', rarity: 'uncommon', rate: 0.15, quantity: '1-2', value: 4000 },
                    { item: 'Cursed Fragment', rarity: 'rare', rate: 0.05, quantity: '1', value: 25000 }
                ],
                avgLootValue: 3200
            },
            {
                id: 'MOB_T6_DEMONLORD',
                name: 'Demon Lord',
                zone: 'Avalon Dungeon',
                tier: 6,
                health: 2000,
                difficulty: 'very_hard',
                avgKillTime: 300,
                drops: [
                    { item: 'Ore', rarity: 'common', rate: 0.40, quantity: '2-5', value: 700 },
                    { item: 'Demonic Core', rarity: 'uncommon', rate: 0.20, quantity: '1', value: 8000 },
                    { item: 'Artifact Fragment', rarity: 'rare', rate: 0.08, quantity: '1', value: 50000 }
                ],
                avgLootValue: 8500
            }
        ];
    },
    
    getDemoDungeons() {
        return [
            {
                id: 'DUNGEON_SOLO_T4',
                name: 'Solo Dungeon (T4)',
                tier: 4,
                players: 1,
                difficulty: 'easy',
                duration: 15, // minutes
                bosses: 3,
                avgLootValue: 15000,
                entryFee: 0,
                profitPerRun: 15000
            },
            {
                id: 'DUNGEON_GROUP_T5',
                name: 'Group Dungeon (T5) - 4 Players',
                tier: 5,
                players: 4,
                difficulty: 'medium',
                duration: 25,
                bosses: 4,
                avgLootValue: 80000,
                entryFee: 0,
                profitPerRun: 20000 // per player
            },
            {
                id: 'DUNGEON_RAID_T6',
                name: 'Raid Dungeon (T6) - 10 Players',
                tier: 6,
                players: 10,
                difficulty: 'hard',
                duration: 45,
                bosses: 6,
                avgLootValue: 500000,
                entryFee: 5000,
                profitPerRun: 45000 // per player
            }
        ];
    },
    
    renderZones() {
        const container = document.getElementById('lc-zone-summary');
        if (!container) return;
        
        const zones = ['Royal Valleys', 'Outlands', 'Avalon Dungeon'];
        
        container.innerHTML = zones.map(zone => {
            const mobsInZone = this.mobs.filter(m => m.zone === zone);
            const totalValue = mobsInZone.reduce((sum, m) => sum + m.avgLootValue, 0);
            
            return `
                <div class="lc-zone-card">
                    <h4>${zone}</h4>
                    <p>${mobsInZone.length} mob türü</p>
                    <p>💰 Avg: ${(totalValue / mobsInZone.length).toLocaleString()} S/mob</p>
                </div>
            `;
        }).join('');
    },
    
    renderMobsForZone() {
        const tbody = document.getElementById('lc-mobs-tbody');
        if (!tbody) return;
        
        let filtered = this.mobs;
        if (this.selectedZone && this.selectedZone !== 'all') {
            filtered = this.mobs.filter(m => m.zone === this.selectedZone);
        }
        
        tbody.innerHTML = filtered.map(mob => `
            <tr onclick="LootCalculatorModule.showMobDetails('${mob.id}')">
                <td><strong>${mob.name}</strong></td>
                <td>${mob.zone}</td>
                <td>${mob.difficulty}</td>
                <td>${mob.avgKillTime}s</td>
                <td>${mob.drops.length} drop</td>
                <td style="color:#f59e0b; font-weight:bold">${mob.avgLootValue.toLocaleString()} S</td>
                <td style="color:#4ade80">${(mob.avgLootValue / (mob.avgKillTime / 60)).toFixed(0)} S/min</td>
                <td><button class="btn-secondary btn-sm" onclick="event.stopPropagation();">Detay</button></td>
            </tr>
        `).join('');
    },
    
    showMobDetails(mobId) {
        const mob = this.mobs.find(m => m.id === mobId);
        if (!mob) return;
        
        // Profit per hour calculation
        const killsPerHour = 3600 / mob.avgKillTime;
        const profitPerHour = killsPerHour * mob.avgLootValue;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>${mob.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="modal-stats-grid">
                        <div class="modal-stat">
                            <span class="modal-stat-label">Avg Loot/Kill</span>
                            <span class="modal-stat-val" style="color:#f59e0b">${mob.avgLootValue.toLocaleString()} S</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label">Kill Time</span>
                            <span class="modal-stat-val">${mob.avgKillTime}s</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label">Kills/Hour</span>
                            <span class="modal-stat-val">${killsPerHour.toFixed(0)}</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label" style="color:#4ade80">Profit/Hour</span>
                            <span class="modal-stat-val" style="color:#4ade80">${profitPerHour.toLocaleString()} S</span>
                        </div>
                    </div>
                    
                    <div class="modal-section">
                        <h4>📦 Drop Table</h4>
                        ${mob.drops.map(drop => `
                            <div class="res-row">
                                <span>
                                    ${this.getRarityIcon(drop.rarity)} 
                                    ${drop.item} 
                                    <span style="color:var(--text-muted); font-size:11px">(${drop.quantity})</span>
                                </span>
                                <span style="color:#f59e0b">${(drop.rate * 100).toFixed(1)}% - ${drop.value.toLocaleString()} S</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="modal-tip">
                        💡 Best farming strategy: ${profitPerHour > 500000 ? '🔥 Highly Profitable' : '💰 Good profit'} 
                        zone. Risk level: ${mob.difficulty.toUpperCase()}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    getRarityIcon(rarity) {
        const icons = {
            'common': '⚪',
            'uncommon': '🟢',
            'rare': '🔵',
            'epic': '🟣',
            'legendary': '🟡'
        };
        return icons[rarity] || '?';
    },
    
    calculateProfit() {
        const hoursPara = document.getElementById('lc-farming-hours')?.value || 1;
        const hours = parseFloat(hoursPara) || 1;
        
        this.farmingResults = this.mobs.map(mob => ({
            ...mob,
            killsInPeriod: Math.floor((hours * 3600) / mob.avgKillTime),
            totalProfit: Math.floor((hours * 3600 / mob.avgKillTime) * mob.avgLootValue)
        })).sort((a, b) => b.totalProfit - a.totalProfit);
        
        this.renderFarmingResults(hours);
    },
    
    renderFarmingResults(hours) {
        const tbody = document.getElementById('lc-results-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = this.farmingResults.map((mob, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${mob.name}</strong></td>
                <td>${mob.killsInPeriod} times</td>
                <td style="color:#f59e0b; font-weight:bold">${mob.totalProfit.toLocaleString()} S</td>
                <td>${(mob.totalProfit / hours).toLocaleString()} S/hr</td>
                <td>${mob.difficulty}</td>
            </tr>
        `).join('');
        
        ToastManager.show(`Calculated for ${hours} hour(s)`, 'success');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('lc-mobs-tbody')) {
        LootCalculatorModule.init();
    }
});

window.LootCalculatorModule = LootCalculatorModule;
