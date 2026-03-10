// Enhanced Market Analysis - Tüm eşyaları destekler
// Hem üretilebilir hem de üretilemez eşyalar

const MARKET_API = 'https://west.albion-online-data.com/api/v2/stats';
const GOLD_API = 'https://west.albion-online-data.com/api/v2/stats/gold';

let marketChart = null;
let goldChart = null;
let currentMarketItem = null;
let currentMarketPeriod = 'daily';
let goldPeriodDays = 7;
let useFullDatabase = true; // Tüm eşyaları kullan

// =================== ENHANCED MARKET ANALYSIS ===================

function initEnhancedMarket() {
    console.log('[EnhancedMarket] Başlatılıyor...');
    
    // Period toggle
    document.querySelectorAll('#market-period button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#market-period button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMarketPeriod = btn.dataset.val;
            if (currentMarketItem) loadMarketData();
        });
    });

    // Enhanced search autocomplete for market
    const input = document.getElementById('market-item-search');
    const dropdown = document.getElementById('market-search-dropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase().trim();
        if (val.length < 2) { 
            dropdown.innerHTML = ''; 
            dropdown.classList.remove('open'); 
            return; 
        }

        // Tüm veritabanını kullan
        const db = useFullDatabase ? window.FullAppDB : window.AppDB;
        if (!db) {
            console.error('[EnhancedMarket] Veritabanı bulunamadı');
            return;
        }

        const results = [];
        const processedIds = new Set(); // Aynı eşyanın tekrar eklenmesini önle

        for (const [mainCat, subCats] of Object.entries(db)) {
            for (const [subCat, items] of Object.entries(subCats)) {
                for (const item of items) {
                    const itemId = item.id || item.uniqueName;
                    if (!itemId || processedIds.has(itemId)) continue;
                    
                    const name = (item.name || itemId).toLowerCase();
                    const tier = item.tier || 'T1';
                    
                    // Gelişmiş arama: hem isimde hem ID'de ara
                    if (name.includes(val) || 
                        itemId.toLowerCase().includes(val) ||
                        tier.toLowerCase().includes(val)) {
                        
                        results.push({ 
                            ...item, 
                            mainCat, 
                            subCat,
                            itemId: itemId
                        });
                        processedIds.add(itemId);
                        
                        if (results.length >= 20) break; // Daha fazla sonuç göster
                    }
                }
                if (results.length >= 20) break;
            }
            if (results.length >= 20) break;
        }

        if (results.length === 0) { 
            dropdown.innerHTML = '<div class="dropdown-item">Sonuç bulunamadı</div>'; 
            dropdown.classList.add('open'); 
            return; 
        }

        dropdown.innerHTML = results.map(item => {
            const imgUrl = `https://render.albiononline.com/v1/item/${item.itemId}.png?size=32`;
            const isCraftable = item.isCraftable !== false;
            const craftableIcon = isCraftable ? '🔨' : '💎';
            
            return `<div class="dropdown-item" onclick="selectEnhancedMarketItem('${item.itemId}', '${(item.name || item.itemId).replace(/'/g, "\\'")}')">
                <img src="${imgUrl}" width="28" height="28" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='">
                <div class="dropdown-item-info">
                    <div class="dropdown-item-name">
                        ${craftableIcon} ${item.name || item.itemId}
                    </div>
                    <div class="dropdown-item-sub">
                        ${item.tier} · ${item.mainCat || mainCat} › ${item.subCat || subCat}
                        ${!isCraftable ? '<span style="color:#f44336;"> (Üretilemez)</span>' : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
        dropdown.classList.add('open');
    });

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function selectEnhancedMarketItem(itemId, itemName) {
    currentMarketItem = { id: itemId, name: itemName };
    document.getElementById('market-item-search').value = itemName;
    document.getElementById('market-search-dropdown').classList.remove('open');
    loadEnhancedMarketData();
}

async function loadEnhancedMarketData() {
    if (!currentMarketItem) return;

    const city = document.getElementById('market-city').value;
    const cities = city.includes(',') ? city : city;
    const emptyEl = document.getElementById('market-empty');
    const infoEl = document.getElementById('market-item-info');

    if (emptyEl) emptyEl.style.display = 'none';
    if (infoEl) infoEl.style.display = 'flex';

    // Set item info
    document.getElementById('market-item-name').textContent = currentMarketItem.name;
    document.getElementById('market-item-id').textContent = currentMarketItem.id;
    document.getElementById('market-item-icon').src = `https://render.albiononline.com/v1/item/${currentMarketItem.id}.png?size=64`;

    // Set timescale
    const timescaleMap = { daily: 1, weekly: 7, monthly: 30 };
    const timescale = timescaleMap[currentMarketPeriod] || 1;

    try {
        // Loading göster
        const chartContainer = document.getElementById('market-chart');
        if (chartContainer) {
            chartContainer.parentElement.innerHTML = '<div style="padding:40px; text-align:center;">⏳ Pazar verileri yükleniyor...</div>';
        }

        // Fetch history
        const histUrl = `${MARKET_API}/history/${currentMarketItem.id}?locations=${cities}&time-scale=${timescale}`;
        const histRes = await fetch(histUrl);
        const histData = await histRes.json();

        // Fetch current prices
        const priceUrl = `${MARKET_API}/prices/${currentMarketItem.id}?locations=Caerleon,Bridgewatch,FortSterling,Lymhurst,Martlock,Thetford,Brecilien`;
        const priceRes = await fetch(priceUrl);
        const priceData = await priceRes.json();

        // Render results
        renderEnhancedMarketChart(histData, currentMarketPeriod);
        renderEnhancedMarketPriceCards(priceData);
        renderEnhancedMarketCityTable(priceData);

    } catch (e) {
        console.error('[EnhancedMarket] Veri hatası:', e);
        const chartContainer = document.getElementById('market-chart');
        if (chartContainer) {
            chartContainer.parentElement.innerHTML = `<div class="empty-state"><span>⚠️</span><p>Veri yüklenemedi: ${e.message}</p></div>`;
        }
    }
}

function renderEnhancedMarketChart(histData, period) {
    const ctx = document.getElementById('market-chart');
    if (!ctx) return;

    if (marketChart) { marketChart.destroy(); marketChart = null; }

    if (!histData || histData.length === 0) {
        ctx.parentElement.innerHTML = '<div class="empty-state"><span>📊</span><p>Bu eşya için pazar verisi bulunamadı</p></div>';
        return;
    }

    // Group by timestamp across all locations
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

    const fmtLabel = period === 'daily' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    const chartLabels = labels.map(t => {
        const d = new Date(t);
        return period === 'monthly' 
            ? d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })
            : d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    });

    marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Ortalama Fiyat',
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

function renderEnhancedMarketPriceCards(priceData) {
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

function renderEnhancedMarketCityTable(priceData) {
    const container = document.getElementById('market-city-table');
    if (!container || !priceData.length) return;

    const sorted = priceData
        .filter(p => p.min_price > 0)
        .sort((a, b) => a.min_price - b.min_price);

    container.innerHTML = `
        <table style="width:100%; border-collapse: collapse;">
            <thead>
                <tr style="background:#1a1a1a;">
                    <th style="padding:10px; text-align:left; border:1px solid #333;">Şehir</th>
                    <th style="padding:10px; text-align:right; border:1px solid #333;">Min Fiyat</th>
                    <th style="padding:10px; text-align:right; border:1px solid #333;">Max Fiyat</th>
                    <th style="padding:10px; text-align:right; border:1px solid #333;">Tarih</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(city => `
                    <tr>
                        <td style="padding:10px; border:1px solid #333;">${city.city}</td>
                        <td style="padding:10px; text-align:right; border:1px solid #333; color:#4CAF50;">
                            ${city.min_price.toLocaleString('tr-TR')} 🪙
                        </td>
                        <td style="padding:10px; text-align:right; border:1px solid #333; color:#f44336;">
                            ${city.max_price.toLocaleString('tr-TR')} 🪙
                        </td>
                        <td style="padding:10px; text-align:right; border:1px solid #333; color:#888;">
                            ${new Date(city.timestamp).toLocaleDateString('tr-TR')}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Global olarak export et
window.initEnhancedMarket = initEnhancedMarket;
window.selectEnhancedMarketItem = selectEnhancedMarketItem;
window.loadEnhancedMarketData = loadEnhancedMarketData;
