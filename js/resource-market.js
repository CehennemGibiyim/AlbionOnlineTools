// resource-market.js - Resource Market Tracker Panel
// Tier-wise pricing trends, profit alerts, material tracking

const ResourceMarketModule = {
    tiers: ['T4', 'T5', 'T6', 'T7', 'T8'],
    materials: {},
    priceHistory: {},
    selectedTier: 'T5',
    alerts: [],
    
    async init() {
        console.log('[ResourceMarket] Modül başlatılıyor...');
        this.setupControls();
        await this.loadMaterials();
        this.renderMaterials();
    },
    
    setupControls() {
        // Tier buttons
        const tierBtns = document.querySelectorAll('#rm-tier-buttons button');
        tierBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tierBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTier = btn.dataset.val;
                this.renderMaterials();
            });
        });
        
        // Material category buttons
        const catBtns = document.querySelectorAll('#rm-material-category button');
        catBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                catBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderMaterials();
            });
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('rm-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
        
        // Alert button
        const alertBtn = document.getElementById('rm-set-alert-btn');
        if (alertBtn) {
            alertBtn.addEventListener('click', () => this.showAlertModal());
        }
    },
    
    async loadMaterials() {
        try {
            LoadingManager.updateProgress(20, 'Malzeme verileri yükleniyor...');
            
            // Demo veri - gerçek API'den gelecek
            this.materials = this.getDemoMaterials();
            
            // Price history
            this.materials.forEach(mat => {
                this.priceHistory[mat.id] = this.generatePriceHistory(mat.id);
            });
            
            LoadingManager.updateProgress(100, 'Malzeme analizi tamamlandı');
            
        } catch (error) {
            console.error('[ResourceMarket] Yükleme hatası:', error);
        }
    },
    
    getDemoMaterials() {
        return [
            // T5 Wood
            { id: 'T5_WOOD', name: 'Oak', category: 'Wood', tier: 'T5', avgPrice: 850, trend: 'up', margin: 12.5, profitPerUnit: 106 },
            { id: 'T5_WOOD_BIRCH', name: 'Birch', category: 'Wood', tier: 'T5', avgPrice: 920, trend: 'stable', margin: 10.2, profitPerUnit: 94 },
            { id: 'T5_WOOD_MAPLE', name: 'Maple', category: 'Wood', tier: 'T5', avgPrice: 1050, trend: 'down', margin: 8.1, profitPerUnit: 85 },
            
            // T5 Ore
            { id: 'T5_ORE', name: 'Iron Ore', category: 'Ore', tier: 'T5', avgPrice: 1200, trend: 'up', margin: 15.3, profitPerUnit: 184 },
            { id: 'T5_ORE_COPPER', name: 'Copper Ore', category: 'Ore', tier: 'T5', avgPrice: 1320, trend: 'stable', margin: 11.8, profitPerUnit: 156 },
            { id: 'T5_ORE_ZINC', name: 'Zinc Ore', category: 'Ore', tier: 'T5', avgPrice: 1480, trend: 'down', margin: 9.5, profitPerUnit: 141 },
            
            // T6 Cloth
            { id: 'T6_CLOTH', name: 'Flax', category: 'Cloth', tier: 'T6', avgPrice: 2100, trend: 'up', margin: 18.7, profitPerUnit: 393 },
            { id: 'T6_CLOTH_HEMP', name: 'Hemp', category: 'Cloth', tier: 'T6', avgPrice: 2350, trend: 'stable', margin: 16.2, profitPerUnit: 381 },
            
            // T6 Leather
            { id: 'T6_LEATHER', name: 'Goat Leather', category: 'Leather', tier: 'T6', avgPrice: 1850, trend: 'down', margin: 12.1, profitPerUnit: 224 },
            { id: 'T6_LEATHER_COW', name: 'Cow Leather', category: 'Leather', tier: 'T6', avgPrice: 2050, trend: 'up', margin: 14.5, profitPerUnit: 298 }
        ];
    },
    
    generatePriceHistory(materialId, days = 30) {
        const history = [];
        const basePrice = Math.random() * 500 + 800;
        let price = basePrice;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            price = Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, price + (Math.random() - 0.48) * 100));
            
            history.push({
                date: date.toISOString().split('T')[0],
                price: Math.round(price),
                volume: Math.floor(Math.random() * 5000) + 1000
            });
        }
        
        return history;
    },
    
    renderMaterials() {
        const tbody = document.getElementById('rm-materials-tbody');
        const activeCategory = document.querySelector('#rm-material-category button.active');
        const category = activeCategory?.dataset.val || 'all';
        
        if (!tbody) return;
        
        let filtered = this.materials.filter(m => m.tier === this.selectedTier);
        if (category !== 'all') {
            filtered = filtered.filter(m => m.category === category);
        }
        
        tbody.innerHTML = filtered.map((mat, idx) => `
            <tr onclick="ResourceMarketModule.showMaterialDetails('${mat.id}')">
                <td>${idx + 1}</td>
                <td><strong>${mat.name}</strong></td>
                <td>${mat.category}</td>
                <td style="color:#f59e0b; font-weight:bold">${mat.avgPrice.toLocaleString()} S</td>
                <td>${this.getTrendIcon(mat.trend)} ${mat.trend}</td>
                <td style="color:#4ade80; font-weight:bold">${mat.margin.toFixed(1)}%</td>
                <td style="color:#64b5f6">${mat.profitPerUnit} S/unit</td>
                <td><button class="btn-secondary btn-sm" onclick="event.stopPropagation(); ResourceMarketModule.setAlert('${mat.id}')">🔔 Alert</button></td>
            </tr>
        `).join('');
        
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">Malzeme bulunamadı</td></tr>';
        }
    },
    
    getTrendIcon(trend) {
        const icons = {
            'up': '📈',
            'down': '📉',
            'stable': '➡️'
        };
        return icons[trend] || '?';
    },
    
    showMaterialDetails(materialId) {
        const material = this.materials.find(m => m.id === materialId);
        if (!material) return;
        
        const history = this.priceHistory[materialId] || [];
        const recentPrices = history.slice(-7).map(h => h.price);
        const minPrice = Math.min(...recentPrices);
        const maxPrice = Math.max(...recentPrices);
        const avgPrice = Math.round(recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>${material.name} (${material.tier})</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="modal-stats-grid">
                        <div class="modal-stat">
                            <span class="modal-stat-label">Ortalama Fiyat</span>
                            <span class="modal-stat-val" style="color:#f59e0b">${avgPrice.toLocaleString()} S</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label">Min - Max (7d)</span>
                            <span class="modal-stat-val">${minPrice} - ${maxPrice}</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label">Kâr Marjı</span>
                            <span class="modal-stat-val" style="color:#4ade80">${material.margin.toFixed(1)}%</span>
                        </div>
                        <div class="modal-stat">
                            <span class="modal-stat-label">Birim Kâr</span>
                            <span class="modal-stat-val" style="color:#64b5f6">${material.profitPerUnit} S</span>
                        </div>
                    </div>
                    <div class="modal-section">
                        <h4>📊 Son 7 Günlük Fiyatlar</h4>
                        <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px;">
                            ${history.slice(-7).map(h => `
                                <div style="text-align:center; padding:4px; background:var(--bg-main); border-radius:4px;">
                                    <div style="font-size:10px; color:var(--text-muted)">${new Date(h.date).toLocaleDateString('tr-TR', {month:'short', day:'numeric'})}</div>
                                    <div style="font-size:13px; font-weight:bold">${h.price}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-tip">
                        💡 Bu malzeme ${material.trend === 'up' ? 'yükselişte' : material.trend === 'down' ? 'düşüşte' : 'istikrarlı'}. 
                        Kullanımı yüksek, kâr marjı ${material.margin.toFixed(1)}%.
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    setAlert(materialId) {
        const material = this.materials.find(m => m.id === materialId);
        if (!material) return;
        
        const triggerPrice = Math.round(material.avgPrice * 0.9); // 10% aşağı
        
        this.alerts.push({
            id: materialId,
            name: material.name,
            triggerPrice,
            active: true
        });
        
        localStorage.setItem('rm-alerts', JSON.stringify(this.alerts));
        ToastManager.show(`Alert set: ${material.name} when price ≤ ${triggerPrice} S`, 'success');
    },
    
    async refresh() {
        LoadingManager.show('Malzeme verisi güncelleniyor...');
        await this.loadMaterials();
        this.renderMaterials();
        LoadingManager.hide();
        ToastManager.show('Fiyatlar güncellendi', 'success');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rm-materials-tbody')) {
        ResourceMarketModule.init();
    }
});

window.ResourceMarketModule = ResourceMarketModule;
