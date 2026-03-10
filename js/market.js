// market.js - Market Analysis & Gold Price

// API bağlantıları artık ayarlardan (window.ApiService.BASE_URL) dinamik olarak alınıyor.

let marketChart = null;
let goldChart = null;
let currentMarketItem = null;
let currentMarketPeriod = 'daily';
let goldPeriodDays = 7;

// =================== MARKET ANALYSIS ===================

function initMarket() {
    // Period toggle
    document.querySelectorAll('#market-period button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#market-period button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMarketPeriod = btn.dataset.val;
            if (currentMarketItem) loadMarketData();
        });
    });

    // Search autocomplete for market
    const input = document.getElementById('market-item-search');
    const dropdown = document.getElementById('market-search-dropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase().trim();
        if (val.length < 2) { dropdown.innerHTML = ''; dropdown.classList.remove('open'); return; }

        const db = window.AppDB;
        if (!db) return;

        const results = [];
        for (const [mainCat, subCats] of Object.entries(db)) {
            for (const [subCat, items] of Object.entries(subCats)) {
                for (const item of items) {
                    const name = (item.name || item.id).toLowerCase();
                    if (name.includes(val) || item.id.toLowerCase().includes(val)) {
                        results.push({ ...item, mainCat, subCat });
                        if (results.length >= 15) break;
                    }
                }
                if (results.length >= 15) break;
            }
            if (results.length >= 15) break;
        }

        if (results.length === 0) { dropdown.innerHTML = ''; dropdown.classList.remove('open'); return; }

        dropdown.innerHTML = results.map(item => {
            const imgUrl = `https://render.albiononline.com/v1/item/${item.id}.png?size=32`;
            return `<div class="dropdown-item" onclick="selectMarketItem('${item.id}', '${(item.name || item.id).replace(/'/g, "\\'")}')">
                <img src="${imgUrl}" width="28" height="28" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='">
                <div class="dropdown-item-info">
                    <div class="dropdown-item-name">${item.name || item.id}</div>
                    <div class="dropdown-item-sub">${item.tier} · ${item.mainCat} › ${item.subCat}</div>
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

function selectMarketItem(itemId, itemName) {
    currentMarketItem = { id: itemId, name: itemName };
    document.getElementById('market-item-search').value = itemName;
    document.getElementById('market-search-dropdown').classList.remove('open');
    loadMarketData();
}

async function loadMarketData() {
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
        const apiUrl = window.ApiService?.BASE_URL || 'https://west.albion-online-data.com/api/v2/stats';

        // Fetch history
        const histUrl = `${apiUrl}/history/${currentMarketItem.id}?locations=${cities}&time-scale=${timescale}`;
        const histRes = await fetch(histUrl);
        const histData = await histRes.json();

        // Fetch current prices
        const priceUrl = `${apiUrl}/prices/${currentMarketItem.id}?locations=Caerleon,Bridgewatch,FortSterling,Lymhurst,Martlock,Thetford,Brecilien`;
        const priceRes = await fetch(priceUrl);
        const priceData = await priceRes.json();

        renderMarketChart(histData, currentMarketPeriod);
        renderMarketPriceCards(priceData);
        renderMarketCityTable(priceData);

    } catch (e) {
        console.error('Market data error:', e);
        document.getElementById('market-chart').parentElement.innerHTML = `<div class="empty-state"><span>⚠️</span><p>Veri yüklenemedi: ${e.message}</p></div>`;
    }
}

function renderMarketChart(histData, period) {
    const ctx = document.getElementById('market-chart');
    if (!ctx) return;

    if (marketChart) { marketChart.destroy(); marketChart = null; }

    if (!histData || histData.length === 0) return;

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
            ? d.toLocaleDateString('tr-TR')
            : d.toLocaleString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    });

    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-gold').trim() || '#f59e0b';

    marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Ortalama Fiyat',
                data: avgPrices,
                borderColor: accentColor,
                backgroundColor: accentColor + '22',
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.3,
                fill: true,
                spanGaps: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ccc' } },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.parsed.y?.toLocaleString()} Silver`
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#888', maxTicksLimit: 12 }, grid: { color: '#333' } },
                y: { ticks: { color: '#888', callback: v => v?.toLocaleString() }, grid: { color: '#333' } }
            }
        }
    });
}

function renderMarketPriceCards(priceData) {
    const container = document.getElementById('market-price-cards');
    if (!container || !priceData) return;

    const validPrices = priceData.filter(d => d.sell_price_min > 0);
    if (validPrices.length === 0) { container.innerHTML = '<span style="color:var(--text-muted)">Aktif kote yok</span>'; return; }

    const sorted = [...validPrices].sort((a, b) => a.sell_price_min - b.sell_price_min);
    const best = sorted[0];
    const avg = Math.round(validPrices.reduce((s, d) => s + d.sell_price_min, 0) / validPrices.length);

    container.innerHTML = `
        <div class="price-card best">
            <div class="price-label">🏆 En Ucuz</div>
            <div class="price-val">${best.sell_price_min?.toLocaleString()} S</div>
            <div class="price-city">${best.city}</div>
        </div>
        <div class="price-card avg">
            <div class="price-label">📊 Ortalama</div>
            <div class="price-val">${avg?.toLocaleString()} S</div>
            <div class="price-city">Tüm Şehirler</div>
        </div>
        <div class="price-card worst">
            <div class="price-label">💸 En Pahalı</div>
            <div class="price-val">${sorted[sorted.length - 1].sell_price_min?.toLocaleString()} S</div>
            <div class="price-city">${sorted[sorted.length - 1].city}</div>
        </div>
    `;
}

function renderMarketCityTable(priceData) {
    const container = document.getElementById('market-city-table');
    if (!container || !priceData) return;

    const cityData = priceData.filter(d => d.sell_price_min > 0 || d.buy_price_max > 0);
    if (cityData.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = `
        <table class="craft-table" style="margin-top:16px">
            <thead>
                <tr>
                    <th>Şehir</th>
                    <th>Kalite</th>
                    <th>Satış (Min)</th>
                    <th>Alış (Max)</th>
                    <th>Güncelleme</th>
                </tr>
            </thead>
            <tbody>
                ${cityData.map(d => `
                    <tr>
                        <td><strong>${d.city || '—'}</strong></td>
                        <td>${getQualityLabel(d.quality)}</td>
                        <td class="text-green">${d.sell_price_min > 0 ? d.sell_price_min.toLocaleString() + ' S' : '—'}</td>
                        <td style="color:var(--accent-blue)">${d.buy_price_max > 0 ? d.buy_price_max.toLocaleString() + ' S' : '—'}</td>
                        <td style="color:var(--text-muted); font-size:11px">${d.sell_price_min_date ? new Date(d.sell_price_min_date).toLocaleDateString('tr-TR') : '—'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getQualityLabel(q) {
    const labels = ['', 'Normal', 'İyi', 'Mükemmel', 'Üstün', 'Efsanevi'];
    return labels[q] || q || '—';
}

// =================== GOLD PRICE ===================

function initGoldPrice() {
    document.querySelectorAll('#gold-period button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#gold-period button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            goldPeriodDays = parseInt(btn.dataset.val);
            loadGoldPrice();
        });
    });
    loadGoldPrice();
}

async function loadGoldPrice() {
    try {
        const apiUrl = window.ApiService?.BASE_URL || 'https://west.albion-online-data.com/api/v2/stats';
        const count = goldPeriodDays * 24; // hourly data points
        const res = await fetch(`${apiUrl}/gold?count=${count}`);
        const data = await res.json();

        if (!data || data.length === 0) throw new Error('Veri yok');

        // Gold data: array of {price, timestamp}
        const prices = data.map(d => d.price).filter(Boolean);
        const timestamps = data.map(d => d.timestamp);

        const current = prices[prices.length - 1] || 0;
        const avg7 = calcAvg(data.slice(-7 * 24).map(d => d.price));
        const avg30 = calcAvg(data.slice(-30 * 24).map(d => d.price));
        const premium = Math.round(current * 2160).toLocaleString();

        document.getElementById('gold-current').textContent = current.toLocaleString() + ' S';
        document.getElementById('gold-avg7').textContent = avg7.toLocaleString() + ' S';
        document.getElementById('gold-avg30').textContent = avg30.toLocaleString() + ' S';
        document.getElementById('gold-premium').textContent = premium + ' S';

        renderGoldChart(data);

    } catch (e) {
        console.error('Gold price error:', e);
        // Show demo data if API fails
        renderGoldChartDemo();
    }
}

function calcAvg(arr) {
    const valid = arr.filter(Boolean);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function renderGoldChart(data) {
    const ctx = document.getElementById('gold-chart');
    if (!ctx) return;
    if (goldChart) { goldChart.destroy(); goldChart = null; }

    const labels = data.map(d => {
        const dt = new Date(d.timestamp);
        return dt.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
    });

    const prices = data.map(d => d.price);

    goldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Gold Fiyatı (Silver)',
                data: prices,
                borderColor: '#ffd700',
                backgroundColor: '#ffd70020',
                borderWidth: 2,
                pointRadius: 1,
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ccc' } },
                tooltip: { callbacks: { label: ctx => `${ctx.parsed.y?.toLocaleString()} Silver` } }
            },
            scales: {
                x: { ticks: { color: '#888', maxTicksLimit: 15 }, grid: { color: '#333' } },
                y: { ticks: { color: '#888', callback: v => v?.toLocaleString() + ' S' }, grid: { color: '#333' } }
            }
        }
    });
}

function renderGoldChartDemo() {
    // Demo chart with realistic-looking gold prices when API unavailable
    const ctx = document.getElementById('gold-chart');
    if (!ctx) return;
    if (goldChart) { goldChart.destroy(); goldChart = null; }

    const days = goldPeriodDays;
    const labels = [];
    const prices = [];
    let price = 3200;
    for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }));
        price = Math.max(2500, Math.min(5000, price + (Math.random() - 0.48) * 120));
        prices.push(Math.round(price));
    }

    document.getElementById('gold-current').textContent = prices[prices.length - 1].toLocaleString() + ' S';
    document.getElementById('gold-avg7').textContent = calcAvg(prices.slice(-7)).toLocaleString() + ' S';
    document.getElementById('gold-avg30').textContent = calcAvg(prices).toLocaleString() + ' S';
    document.getElementById('gold-premium').textContent = (prices[prices.length - 1] * 2160).toLocaleString() + ' S';

    goldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Gold Fiyatı (Silver) — Demo',
                data: prices,
                borderColor: '#ffd700',
                backgroundColor: '#ffd70020',
                borderWidth: 2,
                pointRadius: 2,
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ccc' } },
                tooltip: { callbacks: { label: ctx => `${ctx.parsed.y?.toLocaleString()} Silver` } }
            },
            scales: {
                x: { ticks: { color: '#888', maxTicksLimit: 15 }, grid: { color: '#333' } },
                y: { ticks: { color: '#888', callback: v => v?.toLocaleString() + ' S' }, grid: { color: '#333' } }
            }
        }
    });
}

window.initMarket = initMarket;
window.initGoldPrice = initGoldPrice;
window.loadMarketData = loadMarketData;
window.loadGoldPrice = loadGoldPrice;
window.selectMarketItem = selectMarketItem;
