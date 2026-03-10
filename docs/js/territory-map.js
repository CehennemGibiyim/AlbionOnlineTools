// territory-map.js - Territory Control Map Panel
// Real-time territory ownership, war zones, market hubs

const TerritoryMapModule = {
    territories: [],
    map: null,
    selectedZone: null,
    
    async init() {
        console.log('[TerritoryMap] Modül başlatılıyor...');
        this.setupControls();
        await this.loadTerritories();
        this.renderMap();
    },
    
    setupControls() {
        const filterBtns = document.querySelectorAll('#tm-territory-filter button');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedZone = btn.dataset.val;
                this.renderMap();
            });
        });
        
        const refreshBtn = document.getElementById('tm-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
    },
    
    async loadTerritories() {
        try {
            LoadingManager.updateProgress(30, 'Bölgeler yükleniyor...');
            
            // Gerçek API'den veri çek
            const response = await fetch('https://gameinfo.albiononline.com/api/gameinfo/territories');
            this.territories = await response.json();
            
            LoadingManager.updateProgress(100, 'Harita hazırlanıyor...');
            
        } catch (error) {
            console.error('[TerritoryMap] Yükleme hatası:', error);
            // Demo veri kullan
            this.territories = this.getDemoTerritories();
        }
    },
    
    getDemoTerritories() {
        return [
            { id: 1, name: 'Avermere', zone: 'Royal', owner: 'Guild A', color: '#ff6b6b', contested: false },
            { id: 2, name: 'Ashenvale', zone: 'Royal', owner: 'Guild A', color: '#ff6b6b', contested: false },
            { id: 3, name: 'Milthorn', zone: 'Outlands', owner: 'Guild B', color: '#4ecdc4', contested: true },
            { id: 4, name: 'Cutlass Keys', zone: 'Outlands', owner: 'Guild C', color: '#45b7d1', contested: false },
            { id: 5, name: 'Redtree Hill', zone: 'Outlands', owner: 'Neutral', color: '#95a5a6', contested: false }
        ];
    },
    
    renderMap() {
        const mapContainer = document.getElementById('tm-map-container');
        if (!mapContainer) return;
        
        const filtered = this.selectedZone === 'all' 
            ? this.territories 
            : this.territories.filter(t => t.zone === this.selectedZone);
        
        mapContainer.innerHTML = `
            <div class="tm-map-canvas">
                ${filtered.map(t => this.renderTerritoryNode(t)).join('')}
            </div>
        `;
    },
    
    renderTerritoryNode(territory) {
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        
        return `
            <div class="tm-territory-node" 
                 style="left:${x}%; top:${y}%; background:${territory.color}"
                 onclick="TerritoryMapModule.showTerritoryDetails('${territory.name}')"
                 title="${territory.name}">
                <div class="tm-node-label">${territory.name.substring(0, 3)}</div>
                ${territory.contested ? '<div class="tm-contested-badge">⚡</div>' : ''}
            </div>
        `;
    },
    
    showTerritoryDetails(name) {
        const territory = this.territories.find(t => t.name === name);
        if (!territory) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>${territory.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="modal-stats-grid">
                        <div class="modal-stat">
                            <span class="modal-stat-label">Bölge</span>
                            <span class="modal-stat-val">${territory.zone}</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label">Sahibi</span>
                            <span class="modal-stat-val">${territory.owner}</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label">Durum</span>
                            <span class="modal-stat-val">${territory.contested ? '⚡ Tartışmalı' : '🛡️ Korunan'}</span>
                        </div>
                    </div>
                    <div class="modal-section">
                        <h4>📊 Geçmiş Sahipler</h4>
                        <div class="res-row">
                            <span>Guild A</span>
                            <span style="color:#4ade80">45 gün</span>
                        </div>
                        <div class="res-row">
                            <span>Guild B</span>
                            <span style="color:#f97316">23 gün</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    async refresh() {
        LoadingManager.show('Harita güncelleniyor...');
        await this.loadTerritories();
        this.renderMap();
        LoadingManager.hide();
        ToastManager.show('Harita güncellendi', 'success');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tm-map-container')) {
        TerritoryMapModule.init();
    }
});

window.TerritoryMapModule = TerritoryMapModule;
