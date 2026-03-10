// Gold Price.js - Albion Online Altın Fiyat Analizi

// API bağlantıları window.ApiService.BASE_URL kullanılarak güncellenmiştir.
let goldChart = null;

// =================== ALTIN FİYATI ===================

function initGoldPrice() {
    console.log('[GoldPrice] Altın fiyatı başlatılıyor...');

    // Period toggle
    document.querySelectorAll('#gold-period button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#gold-period button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadGoldData(btn.dataset.val);
        });
    });

    // İlk veriyi yükle
    loadGoldData('7d');
}

async function loadGoldData(period = '7d') {
    try {
        console.log(`[GoldPrice] Altın verisi yükleniyor - Periyot: ${period}`);

        // Loading göster
        const chartContainer = document.getElementById('gold-chart');
        if (chartContainer) {
            chartContainer.parentElement.innerHTML = '<div style="padding:40px; text-align:center;">⏳ Altın verileri yükleniyor...</div>';
        }

        const apiUrl = window.ApiService?.BASE_URL || 'https://west.albion-online-data.com/api/v2/stats';

        // Fetch gold prices
        const goldUrl = `${apiUrl}/gold?count=100&date=${period}`;
        const goldRes = await fetch(goldUrl);
        const goldData = await goldRes.json();

        if (!goldData || goldData.length === 0) {
            chartContainer.parentElement.innerHTML = '<div class="empty-state"><span>🪙</span><p>Altın verisi bulunamadı</p></div>';
            return;
        }

        // Veriyi işle
        const processedData = goldData.map(item => ({
            timestamp: item.timestamp,
            price: item.gold_price,
            silver: item.silver_price,
            date: new Date(item.timestamp)
        }));

        // Render et
        renderGoldChart(processedData);
        updateGoldStats(processedData);

        console.log(`[GoldPrice] ${processedData.length} altın verisi yüklendi`);

    } catch (error) {
        console.error('[GoldPrice] Altın verisi hatası:', error);
        const chartContainer = document.getElementById('gold-chart');
        if (chartContainer) {
            chartContainer.parentElement.innerHTML = `<div class="empty-state"><span>⚠️</span><p>Altın verisi yüklenemedi: ${error.message}</p></div>`;
        }
    }
}

function renderGoldChart(goldData) {
    const ctx = document.getElementById('gold-chart');
    if (!ctx) return;

    if (goldChart) { goldChart.destroy(); goldChart = null; }

    // Veriyi tarihe göre sırala
    goldData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = goldData.map(item =>
        item.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
    );

    const prices = goldData.map(item => item.price);
    const silverPrices = goldData.map(item => item.silver);

    goldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Altın Fiyatı (Silver)',
                    data: prices,
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Silver Fiyatı',
                    data: silverPrices,
                    borderColor: '#C0C0C0',
                    backgroundColor: 'rgba(192, 192, 192, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    yAxisID: 'y1',
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#FFD700',
                    borderWidth: 1,
                    callbacks: {
                        title: function (context) {
                            return `📅 ${context[0].label}`;
                        },
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (label.includes('Altın')) {
                                return `🪙 ${value.toLocaleString('tr-TR')} Silver`;
                            } else {
                                return `🪙 ${value.toLocaleString('tr-TR')} Silver`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: '#333' },
                    ticks: {
                        color: '#888',
                        callback: function (value) {
                            return value.toLocaleString('tr-TR');
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: '#888',
                        callback: function (value) {
                            return value.toLocaleString('tr-TR');
                        }
                    }
                }
            }
        }
    });
}

function updateGoldStats(goldData) {
    if (!goldData || goldData.length === 0) return;

    const latest = goldData[goldData.length - 1];
    const oldest = goldData[0];

    const currentGoldPrice = latest.price;
    const oldGoldPrice = oldest.price;
    const change = currentGoldPrice - oldGoldPrice;
    const changePercent = ((change / oldGoldPrice) * 100).toFixed(2);

    const minPrice = Math.min(...goldData.map(item => item.price));
    const maxPrice = Math.max(...goldData.map(item => item.price));
    const avgPrice = Math.round(goldData.reduce((sum, item) => sum + item.price, 0) / goldData.length);

    // Stats container'ı güncelle
    const statsContainer = document.getElementById('gold-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="gold-stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Mevcut Fiyat</div>
                    <div class="stat-value current">🪙 ${currentGoldPrice.toLocaleString('tr-TR')}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Değişim</div>
                    <div class="stat-value ${change >= 0 ? 'positive' : 'negative'}">
                        ${change >= 0 ? '📈' : '📉'} ${change.toLocaleString('tr-TR')} (${changePercent}%)
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">En Düşük</div>
                    <div class="stat-value">🪙 ${minPrice.toLocaleString('tr-TR')}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">En Yüksek</div>
                    <div class="stat-value">🪙 ${maxPrice.toLocaleString('tr-TR')}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Ortalama</div>
                    <div class="stat-value">🪙 ${avgPrice.toLocaleString('tr-TR')}</div>
                </div>
            </div>
        `;
    }
}

// Global olarak export et
window.initGoldPrice = initGoldPrice;
window.loadGoldData = loadGoldData;
