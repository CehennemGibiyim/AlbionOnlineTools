// advanced-filters.js - Advanced Filtering System
// Date range, guild filter, zone filter, tier-specific search

const AdvancedFiltersModule = {
    activeFilters: {
        dateRange: { start: null, end: null },
        guild: null,
        zone: null,
        tier: null,
        enchantment: null,
        minPrice: null,
        maxPrice: null,
        searchText: ''
    },
    
    init() {
        console.log('[AdvancedFilters] Modül başlatılıyor...');
        this.setupDatePickers();
        this.setupDropdowns();
        this.setupTextInputs();
    },
    
    setupDatePickers() {
        const startDateInput = document.getElementById('af-start-date');
        const endDateInput = document.getElementById('af-end-date');
        
        if (startDateInput) {
            startDateInput.addEventListener('change', (e) => {
                this.activeFilters.dateRange.start = e.target.value;
                this.applyFilters();
            });
        }
        
        if (endDateInput) {
            endDateInput.addEventListener('change', (e) => {
                this.activeFilters.dateRange.end = e.target.value;
                this.applyFilters();
            });
        }
    },
    
    setupDropdowns() {
        // Guild dropdown
        const guildSelect = document.getElementById('af-guild-select');
        if (guildSelect) {
            guildSelect.addEventListener('change', (e) => {
                this.activeFilters.guild = e.target.value || null;
                this.applyFilters();
            });
        }
        
        // Zone dropdown
        const zoneSelect = document.getElementById('af-zone-select');
        if (zoneSelect) {
            zoneSelect.addEventListener('change', (e) => {
                this.activeFilters.zone = e.target.value || null;
                this.applyFilters();
            });
        }
        
        // Tier filter
        const tierBtns = document.querySelectorAll('[id*="tier-filter"] button');
        tierBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tierBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilters.tier = btn.dataset.val === 'all' ? null : btn.dataset.val;
                this.applyFilters();
            });
        });
        
        // Enchantment filter
        const enchBtns = document.querySelectorAll('[id*="enchant-filter"] button');
        enchBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                enchBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilters.enchantment = btn.dataset.val === 'all' ? null : btn.dataset.val;
                this.applyFilters();
            });
        });
    },
    
    setupTextInputs() {
        // Price range
        const minPriceInput = document.getElementById('af-min-price');
        const maxPriceInput = document.getElementById('af-max-price');
        
        if (minPriceInput) {
            minPriceInput.addEventListener('change', (e) => {
                this.activeFilters.minPrice = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            });
        }
        
        if (maxPriceInput) {
            maxPriceInput.addEventListener('change', (e) => {
                this.activeFilters.maxPrice = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            });
        }
        
        // Search text
        const searchInput = document.getElementById('af-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.activeFilters.searchText = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
    },
    
    // Filter data by active filters
    filterData(items) {
        if (!items || items.length === 0) return [];
        
        return items.filter(item => {
            // Text search
            if (this.activeFilters.searchText) {
                const searchText = this.activeFilters.searchText;
                const itemName = (item.name || '').toLowerCase();
                const itemId = (item.id || '').toLowerCase();
                if (!itemName.includes(searchText) && !itemId.includes(searchText)) {
                    return false;
                }
            }
            
            // Tier filter
            if (this.activeFilters.tier && item.tier !== this.activeFilters.tier) {
                return false;
            }
            
            // Enchantment filter
            if (this.activeFilters.enchantment && item.enchantment !== this.activeFilters.enchantment) {
                return false;
            }
            
            // Price range
            if (this.activeFilters.minPrice && item.price < this.activeFilters.minPrice) {
                return false;
            }
            if (this.activeFilters.maxPrice && item.price > this.activeFilters.maxPrice) {
                return false;
            }
            
            // Guild filter
            if (this.activeFilters.guild && item.guild !== this.activeFilters.guild) {
                return false;
            }
            
            // Zone filter
            if (this.activeFilters.zone && item.zone !== this.activeFilters.zone) {
                return false;
            }
            
            // Date range
            if (this.activeFilters.dateRange.start || this.activeFilters.dateRange.end) {
                const itemDate = new Date(item.timestamp || item.date);
                if (this.activeFilters.dateRange.start) {
                    const startDate = new Date(this.activeFilters.dateRange.start);
                    if (itemDate < startDate) return false;
                }
                if (this.activeFilters.dateRange.end) {
                    const endDate = new Date(this.activeFilters.dateRange.end);
                    if (itemDate > endDate) return false;
                }
            }
            
            return true;
        });
    },
    
    applyFilters() {
        // Trigger filter event
        const event = new CustomEvent('filtersChanged', { 
            detail: { filters: this.activeFilters } 
        });
        document.dispatchEvent(event);
        
        // Show active filter count
        this.updateFilterBadge();
    },
    
    updateFilterBadge() {
        const activeCount = this.getActiveFilterCount();
        const badge = document.getElementById('af-active-badge');
        
        if (badge && activeCount > 0) {
            badge.textContent = activeCount;
            badge.style.display = 'block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    },
    
    getActiveFilterCount() {
        let count = 0;
        if (this.activeFilters.dateRange.start) count++;
        if (this.activeFilters.dateRange.end) count++;
        if (this.activeFilters.guild) count++;
        if (this.activeFilters.zone) count++;
        if (this.activeFilters.tier) count++;
        if (this.activeFilters.enchantment) count++;
        if (this.activeFilters.minPrice) count++;
        if (this.activeFilters.maxPrice) count++;
        if (this.activeFilters.searchText) count++;
        return count;
    },
    
    // Reset all filters
    resetFilters() {
        this.activeFilters = {
            dateRange: { start: null, end: null },
            guild: null,
            zone: null,
            tier: null,
            enchantment: null,
            minPrice: null,
            maxPrice: null,
            searchText: ''
        };
        
        // Clear inputs
        document.querySelectorAll('[id^="af-"]').forEach(el => {
            if (el.type === 'text' || el.type === 'number' || el.type === 'date') {
                el.value = '';
            }
        });
        
        // Clear button states
        document.querySelectorAll('[id*="filter"] button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.val === 'all') btn.classList.add('active');
        });
        
        this.applyFilters();
        ToastManager.show('Tüm filtreler temizlendi', 'info');
    },
    
    // Export filters to JSON
    exportFilters() {
        const json = JSON.stringify(this.activeFilters, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filters-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Import filters from JSON
    importFilters(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.activeFilters = { ...this.activeFilters, ...imported };
            this.applyFilters();
            ToastManager.show('Filtreler yüklendi', 'success');
        } catch (error) {
            ToastManager.show('Filtre import hatası: ' + error.message, 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdvancedFiltersModule.init();
});

window.AdvancedFiltersModule = AdvancedFiltersModule;
