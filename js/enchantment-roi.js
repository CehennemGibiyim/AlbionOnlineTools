// enchantment-roi.js - Enchantment & Artifact ROI Calculator
// Cost breakdown, success rates, refund calculator

const EnchantmentROIModule = {
    enchantmentLevels: [0, 1, 2, 3, 4],
    itemTiers: ['T4', 'T5', 'T6', 'T7', 'T8'],
    enchantData: {},
    
    async init() {
        console.log('[EnchantmentROI] Modül başlatılıyor...');
        this.setupControls();
        this.loadEnchantmentData();
        this.renderCalculator();
    },
    
    setupControls() {
        // Tier selector
        const tierSelect = document.getElementById('er-tier-select');
        if (tierSelect) {
            tierSelect.addEventListener('change', () => this.updateCalculation());
        }
        
        // Enchantment level selector
        const enchSelect = document.getElementById('er-enchant-select');
        if (enchSelect) {
            enchSelect.addEventListener('change', () => this.updateCalculation());
        }
        
        // Calculate button
        const calcBtn = document.getElementById('er-calculate-btn');
        if (calcBtn) {
            calcBtn.addEventListener('click', () => this.calculateROI());
        }
    },
    
    loadEnchantmentData() {
        this.enchantData = {
            'T4': {
                base_cost: 5000,
                mat_cost: 2500,
                enchant_costs: [0, 1500, 4500, 12000, 35000],
                success_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                refund_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                artifact_costs: [0, 500, 1500, 4000, 10000]
            },
            'T5': {
                base_cost: 12000,
                mat_cost: 6000,
                enchant_costs: [0, 3500, 10500, 30000, 85000],
                success_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                refund_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                artifact_costs: [0, 1200, 3500, 10000, 28000]
            },
            'T6': {
                base_cost: 28000,
                mat_cost: 14000,
                enchant_costs: [0, 8000, 24000, 70000, 200000],
                success_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                refund_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                artifact_costs: [0, 2800, 8000, 22000, 65000]
            },
            'T7': {
                base_cost: 65000,
                mat_cost: 32500,
                enchant_costs: [0, 18000, 54000, 160000, 460000],
                success_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                refund_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                artifact_costs: [0, 6500, 18000, 50000, 150000]
            },
            'T8': {
                base_cost: 150000,
                mat_cost: 75000,
                enchant_costs: [0, 40000, 120000, 350000, 1000000],
                success_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                refund_rates: [1.0, 0.80, 0.60, 0.40, 0.20],
                artifact_costs: [0, 15000, 40000, 115000, 350000]
            }
        };
    },
    
    renderCalculator() {
        const container = document.getElementById('er-calculator-form');
        if (!container) return;
        
        container.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px">
                <div>
                    <label style="display:block; margin-bottom:6px; font-size:12px; color:var(--text-muted)">Tier Seç:</label>
                    <select id="er-tier-select" style="width:100%">
                        <option value="T4">T4</option>
                        <option value="T5" selected>T5</option>
                        <option value="T6">T6</option>
                        <option value="T7">T7</option>
                        <option value="T8">T8</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; margin-bottom:6px; font-size:12px; color:var(--text-muted)">Enchantment Seviyesi:</label>
                    <select id="er-enchant-select" style="width:100%">
                        <option value="0">Normal (.0)</option>
                        <option value="1">.1</option>
                        <option value="2">.2</option>
                        <option value="3">.3</option>
                        <option value="4">.4</option>
                    </select>
                </div>
            </div>
            <button class="btn-fetch" id="er-calculate-btn">💰 ROI Hesapla</button>
        `;
        
        this.setupControls();
    },
    
    updateCalculation() {
        // Real-time update as user changes
        this.calculateROI();
    },
    
    calculateROI() {
        const tier = document.getElementById('er-tier-select')?.value || 'T5';
        const enchLevel = parseInt(document.getElementById('er-enchant-select')?.value || 0);
        
        const data = this.enchantData[tier];
        if (!data) {
            ToastManager.show('Tier verisi bulunamadı', 'error');
            return;
        }
        
        // Cost breakdown
        const baseCost = data.base_cost;
        const matCost = data.mat_cost;
        const enchantCost = enchLevel > 0 ? data.enchant_costs[enchLevel] : 0;
        const artifactCost = enchLevel > 0 ? data.artifact_costs[enchLevel] : 0;
        const totalCost = baseCost + matCost + enchantCost + artifactCost;
        
        // Success rates
        const successRate = data.success_rates[enchLevel];
        const refundRate = data.refund_rates[enchLevel];
        
        // Expected values
        const expectedValue = totalCost * 1.2; // Assume 20% profit margin
        const expectedROI = ((expectedValue - totalCost) / totalCost) * 100;
        
        // Break-even
        const breakEven = Math.ceil(totalCost / (expectedValue - totalCost || 1));
        
        this.renderROIResults({
            tier,
            enchLevel,
            baseCost,
            matCost,
            enchantCost,
            artifactCost,
            totalCost,
            successRate,
            refundRate,
            expectedValue,
            expectedROI,
            breakEven
        });
    },
    
    renderROIResults(result) {
        const container = document.getElementById('er-results-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom:20px">
                <div class="modal-stat">
                    <span class="modal-stat-label">Total Cost</span>
                    <span class="modal-stat-val" style="color:#f59e0b">${result.totalCost.toLocaleString()} S</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-label">Expected Value</span>
                    <span class="modal-stat-val" style="color:#4ade80">${result.expectedValue.toLocaleString()} S</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-label">Expected ROI</span>
                    <span class="modal-stat-val" style="color:#64b5f6">${result.expectedROI.toFixed(1)}%</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-label">Success Rate</span>
                    <span class="modal-stat-val">${(result.successRate * 100).toFixed(0)}%</span>
                </div>
            </div>
            
            <div style="background:var(--bg-panel); border:1px solid var(--border-light); border-radius:10px; padding:14px; margin-bottom:20px">
                <h4 style="margin-bottom:10px">💸 Cost Breakdown</h4>
                <div class="res-row">
                    <span>Temel Eşya</span>
                    <span>${result.baseCost.toLocaleString()} S</span>
                </div>
                <div class="res-row">
                    <span>Malzeme</span>
                    <span>${result.matCost.toLocaleString()} S</span>
                </div>
                ${result.enchLevel > 0 ? `
                    <div class="res-row">
                        <span>Enchantment (${'.'.repeat(result.enchLevel)}${result.enchLevel})</span>
                        <span>${result.enchantCost.toLocaleString()} S</span>
                    </div>
                    <div class="res-row">
                        <span>Artifact</span>
                        <span>${result.artifactCost.toLocaleString()} S</span>
                    </div>
                ` : ''}
                <div class="res-row" style="border-top:1px solid var(--border-light); padding-top:8px; font-weight:bold">
                    <span>TOPLAM</span>
                    <span style="color:var(--accent-gold)">${result.totalCost.toLocaleString()} S</span>
                </div>
            </div>
            
            <div style="background:rgba(74, 222, 128, 0.1); border-left:3px solid #4ade80; padding:12px; border-radius:4px;">
                💡 ${result.enchLevel === 0 ? 'Normal items are always profitable' : 
                  result.expectedROI > 15 ? '🔥 Highly profitable enchantment level' :
                  result.expectedROI > 0 ? '💰 Good profit expected' : 
                  '⚠️ Risky - low profit margin'}
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('er-calculator-form')) {
        EnchantmentROIModule.init();
    }
});

window.EnchantmentROIModule = EnchantmentROIModule;
