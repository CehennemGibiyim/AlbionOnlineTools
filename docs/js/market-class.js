// Market-Class.js - Albion Online Sınıf Sistemine Göre Pazar Analizi

const MARKET_API = 'https://www.albion-online-data.com/api/v2/stats';
const GOLD_API = 'https://www.albion-online-data.com/api/v2/stats/gold';
let currentClass = null;
let currentCategory = 'weapons';
let marketChart = null;

// =================== SINIF PAZAR ARAYÜZÜ ===================

function initClassMarket() {
    console.log('[ClassMarket] Sınıf pazarı başlatılıyor...');
    
    // Sınıf seçimi
    setupClassSelection();
    
    // Kategori seçimi
    setupCategorySelection();
    
    // Arama özelliği
    setupClassSearch();
    
    // İlk sınıfı yükle
    loadFirstClass();
}

function setupClassSelection() {
    const classContainer = document.getElementById('class-selection');
    if (!classContainer) return;
    
    // Sınıf butonları oluştur
    const classes = [
        { key: 'WARRIOR', name: 'Savaşçı', icon: '⚔️', color: '#e74c3c' },
        { key: 'MAGE', name: 'Büyücü', icon: '🔮', color: '#9b59b6' },
        { key: 'RANGER', name: 'Okçu', icon: '🏹', color: '#27ae60' },
        { key: 'ASSASSIN', name: 'Suikastçi', icon: '🗡️', color: '#f39c12' },
        { key: 'HEALER', name: 'Şifacı', icon: '💚', color: '#3498db' },
        { key: 'TANK', name: 'Tank', icon: '🛡️', color: '#95a5a6' }
    ];
    
    classContainer.innerHTML = classes.map(cls => `
        <button class="class-btn ${currentClass === cls.key ? 'active' : ''}" 
                data-class="${cls.key}"
                style="background: ${cls.color}; border: 2px solid ${currentClass === cls.key ? '#fff' : 'transparent'};">
            <div class="class-icon">${cls.icon}</div>
            <div class="class-name">${cls.name}</div>
        </button>
    `).join('');
    
    // Event listener
    classContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.class-btn');
        if (btn) {
            selectClass(btn.dataset.class);
        }
    });
}

function setupCategorySelection() {
    const categoryContainer = document.getElementById('category-selection');
    if (!categoryContainer) return;
    
    const categories = [
        { key: 'weapons', name: 'Silahlar', icon: '⚔️' },
        { key: 'armor', name: 'Zırhlar', icon: '🛡️' },
        { key: 'artifacts', name: 'Artifactlar', icon: '🎯' },
        { key: 'mounts', name: 'Mountlar', icon: '🐴' },
        { key: 'consumables', name: 'İçecekler', icon: '🧪' }
    ];
    
    categoryContainer.innerHTML = categories.map(cat => `
        <button class="category-btn ${currentCategory === cat.key ? 'active' : ''}" 
                data-category="${cat.key}">
            <span>${cat.icon} ${cat.name}</span>
        </button>
    `).join('');
    
    // Event listener
    categoryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (btn) {
            selectCategory(btn.dataset.category);
        }
    });
}

function setupClassSearch() {
    const searchInput = document.getElementById('class-item-search');
    const dropdown = document.getElementById('class-search-dropdown');
    
    if (!searchInput || !dropdown) return;
    
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
        if (val.length < 2) {
            dropdown.innerHTML = '';
            dropdown.classList.remove('open');
            return;
        }
        
        if (!currentClass || !window.ClassDB) return;
        
        const classData = window.ClassDB[currentClass];
        if (!classData) return;
        
        const items = classData[currentCategory] || [];
        const results = items.filter(item => {
            const name = (item.display_name || item.name || item.id).toLowerCase();
            const id = (item.id || '').toLowerCase();
            return name.includes(val) || id.includes(val);
        }).slice(0, 15);
        
        if (results.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-item">Sonuç bulunamadı</div>';
        } else {
            dropdown.innerHTML = results.map(item => {
                const imgUrl = `https://render.albiononline.com/v1/item/${item.id}.png?size=32`;
                const tier = item.tier || 'T1';
                const isCraftable = item.isCraftable !== false;
                const craftableIcon = isCraftable ? '🔨' : '💎';
                
                return `
                    <div class="dropdown-item" onclick="selectClassItem('${item.id}', '${(item.display_name || item.name || item.id).replace(/'/g, "\\'")}')">
                        <img src="${imgUrl}" width="28" height="28" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='">
                        <div class="dropdown-item-info">
                            <div class="dropdown-item-name">
                                ${craftableIcon} ${item.display_name || item.name || item.id}
                            </div>
                            <div class="dropdown-item-sub">
                                ${tier} ${item.weapon_type ? `· ${item.weapon_type}` : ''}
                                ${item.armor_type ? `· ${item.armor_type}` : ''}
                                ${!isCraftable ? '<span style="color:#f44336;"> (Üretilemez)</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        dropdown.classList.add('open');
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function selectClass(className) {
    currentClass = className;
    currentCategory = 'weapons';
    
    // Butonları güncelle
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.class === className);
    });
    
    // Kategori butonlarını sıfırla
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'weapons');
    });
    
    // Eşyaları yükle
    loadClassItems();
    
    // Arama input'unu temizle
    const searchInput = document.getElementById('class-item-search');
    if (searchInput) searchInput.value = '';
    
    console.log(`[ClassMarket] Sınıf seçildi: ${className}`);
}

function selectCategory(category) {
    if (!currentClass) return;
    
    currentCategory = category;
    
    // Butonları güncelle
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Eşyaları yükle
    loadClassItems();
    
    // Arama input'unu temizle
    const searchInput = document.getElementById('class-item-search');
    if (searchInput) searchInput.value = '';
    
    console.log(`[ClassMarket] Kategori seçildi: ${category}`);
}

function loadClassItems() {
    if (!currentClass || !window.ClassDB) return;
    
    const classData = window.ClassDB[currentClass];
    if (!classData) return;
    
    const items = classData[currentCategory] || [];
    const container = document.getElementById('class-items-container');
    
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>📦</span>
                <p>Bu kategoride eşya bulunamadı</p>
            </div>
        `;
        return;
    }
    
    // Eşyaları tier'e göre grupla
    const groupedItems = {};
    items.forEach(item => {
        const tier = item.tier || 'T1';
        if (!groupedItems[tier]) groupedItems[tier] = [];
        groupedItems[tier].push(item);
    });
    
    // Tier sırasına göre göster
    const tierOrder = ['T8', 'T7', 'T6', 'T5', 'T4', 'T3', 'T2', 'T1'];
    
    container.innerHTML = tierOrder.map(tier => {
        if (!groupedItems[tier]) return '';
        
        return `
            <div class="tier-section">
                <h3 class="tier-title">${tier} Eşyaları</h3>
                <div class="items-grid">
                    ${groupedItems[tier].map(item => {
                        const imgUrl = `https://render.albiononline.com/v1/item/${item.id}.png?size=64`;
                        const isCraftable = item.isCraftable !== false;
                        const craftableIcon = isCraftable ? '🔨' : '💎';
                        
                        return `
                            <div class="item-card" onclick="selectClassItem('${item.id}', '${(item.display_name || item.name || item.id).replace(/'/g, "\\'")}')">
                                <div class="item-image">
                                    <img src="${imgUrl}" width="64" height="64" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='">
                                    <div class="item-tier">${tier}</div>
                                </div>
                                <div class="item-info">
                                    <div class="item-name">${item.display_name || item.name || item.id}</div>
                                    <div class="item-type">
                                        ${item.weapon_type || item.armor_type || ''}
                                    </div>
                                    <div class="item-craftable">
                                        ${craftableIcon} ${isCraftable ? 'Üretilebilir' : 'Üretilemez'}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`[ClassMarket] ${items.length} eşya yüklendi - ${currentClass}/${currentCategory}`);
}

function selectClassItem(itemId, itemName) {
    // Pazar verilerini yükle
    loadClassMarketData(itemId, itemName);
    
    // Arama dropdown'unu kapat
    const dropdown = document.getElementById('class-search-dropdown');
    if (dropdown) dropdown.classList.remove('open');
    
    // Arama input'unu güncelle
    const searchInput = document.getElementById('class-item-search');
    if (searchInput) searchInput.value = itemName;
}

async function loadClassMarketData(itemId, itemName) {
    const city = document.getElementById('market-city').value;
    const cities = city.includes(',') ? city : city;
    
    try {
        // Loading göster
        const chartContainer = document.getElementById('market-chart');
        if (chartContainer) {
            chartContainer.parentElement.innerHTML = '<div style="padding:40px; text-align:center;">⏳ Pazar verileri yükleniyor...</div>';
        }
        
        // Fetch history
        const histUrl = `${MARKET_API}/history/${itemId}?locations=${cities}&time-scale=7`;
        const histRes = await fetch(histUrl);
        const histData = await histRes.json();
        
        // Fetch current prices
        const priceUrl = `${MARKET_API}/prices/${itemId}?locations=Caerleon,Bridgewatch,FortSterling,Lymhurst,Martlock,Thetford,Brecilien`;
        const priceRes = await fetch(priceUrl);
        const priceData = await priceRes.json();
        
        // Render results
        renderClassMarketChart(histData, itemName);
        renderClassMarketPriceCards(priceData);
        
        // Item info'yu güncelle
        document.getElementById('market-item-name').textContent = itemName;
        document.getElementById('market-item-id').textContent = itemId;
        document.getElementById('market-item-icon').src = `https://render.albiononline.com/v1/item/${itemId}.png?size=64`;
        
    } catch (e) {
        console.error('[ClassMarket] Veri hatası:', e);
        const chartContainer = document.getElementById('market-chart');
        if (chartContainer) {
            chartContainer.parentElement.innerHTML = `<div class="empty-state"><span>⚠️</span><p>Veri yüklenemedi: ${e.message}</p></div>`;
        }
    }
}

function renderClassMarketChart(histData, itemName) {
    const ctx = document.getElementById('market-chart');
    if (!ctx) return;
    
    if (marketChart) { marketChart.destroy(); marketChart = null; }
    
    if (!histData || histData.length === 0) {
        ctx.parentElement.innerHTML = '<div class="empty-state"><span>📊</span><p>Bu eşya için pazar verisi bulunamadı</p></div>';
        return;
    }
    
    // Group by timestamp
    const timeMap = {};
    histData.forEach(entry => {
        (entry.data || []).forEach(d => {
            const key = d.timestamp;
            if (!timeMap[key]) timeMap[key] = [];
            if (d.avg_price > 0) timeMap[key].push(d.avg_price);
        });
    });
    
    const labels = Object.keys(timeMap).sort();
    const avgPrices = labels.map(t => {
        const prices = timeMap[t];
        return prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
    });
    
    const chartLabels = labels.map(t => {
        const d = new Date(t);
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    });
    
    marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: `${itemName} - Ortalama Fiyat`,
                data: avgPrices,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                },
                y: {
                    grid: { color: '#333' },
                    ticks: { 
                        color: '#888',
                        callback: function(value) {
                            return value.toLocaleString('tr-TR') + ' 🪙';
                        }
                    }
                }
            }
        }
    });
}

function renderClassMarketPriceCards(priceData) {
    const container = document.getElementById('market-price-cards');
    if (!container || !priceData.length) return;
    
    const cities = ['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Brecilien'];
    
    container.innerHTML = cities.map(city => {
        const cityData = priceData.find(p => p.city === city);
        if (!cityData || cityData.min_price === 0) return '';
        
        const price = cityData.min_price;
        const date = new Date(cityData.timestamp).toLocaleDateString('tr-TR');
        
        return `
            <div class="price-card">
                <div class="city-name">${city}</div>
                <div class="price-value">${price.toLocaleString('tr-TR')} 🪙</div>
                <div class="price-date">${date}</div>
            </div>
        `;
    }).join('');
}

function loadFirstClass() {
    // İlk sınıfı otomatik yükle
    const firstClassBtn = document.querySelector('.class-btn');
    if (firstClassBtn) {
        selectClass(firstClassBtn.dataset.class);
    }
}

// Global olarak export et
window.initClassMarket = initClassMarket;
window.selectClass = selectClass;
window.selectCategory = selectCategory;
window.selectClassItem = selectClassItem;
window.loadClassMarketData = loadClassMarketData;
