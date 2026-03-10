// app.js — AlbionTools Main Orchestrator
// Tamamen temiz ve çalışır version
// app-fixes.js ile entegre

const CITIES = [
    { id: 'Caerleon', label: 'Caerleon', returnRate: 15.2 },
    { id: 'Bridgewatch', label: 'Bridgewatch', returnRate: 15.2 },
    { id: 'FortSterling', label: 'Fort Sterling', returnRate: 15.2 },
    { id: 'Lymhurst', label: 'Lymhurst', returnRate: 15.2 },
    { id: 'Martlock', label: 'Martlock', returnRate: 15.2 },
    { id: 'Thetford', label: 'Thetford', returnRate: 15.2 },
    { id: 'Brecilien', label: 'Brecilien', returnRate: 15.2 },
    { id: 'ArthursRest', label: "Arthur's Rest", returnRate: 15.2 },
    { id: 'MorganaRest', label: "Morgana's Rest", returnRate: 15.2 },
    { id: 'MerlynsRest', label: "Merlyn's Rest", returnRate: 15.2 },
    { id: 'BlackMarket', label: 'Black Market', returnRate: 10.0 },
];

let globalItemsList = [];
let currentMainCategory = '';
let currentSubCategory = '';
let currentTier = 'ALL';
let currentEnchant = 'ALL';
let currentTab = 'craft';

// ==================== ENTRY POINT ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[AlbionTools] Uygulama başlatılıyor...');

    // 1. Dil / i18n çeviri uygula
    if (window.I18n && window.I18n.applyTranslations) {
        window.I18n.applyTranslations();
    }

    // 2. Ayarlar: tema, dil, sunucu
    if (typeof initSettings === 'function') initSettings();

    // 3. Şehir listesi
    initCities();

    // 4. Sunucu seçim butonlarını başlat
    initServerToggles();

    // 5. Veritabanını yükle
    try {
        console.log('[AlbionTools] Veritabanı yükleniyor...');
        window.AppDB = await window.ApiService.getLocalDatabase();
        console.log('[AlbionTools] DB yüklendi, içerik:', window.AppDB ? Object.keys(window.AppDB) : 'NULL');
    } catch (e) {
        console.error('[AlbionTools] DB yükleme hatası:', e);
        window.AppDB = null;
    }

    if (!window.AppDB) {
        console.error('[AlbionTools] Veritabanı bulunamadı!');
        const tbody = document.getElementById('craft-table-body');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="12">
                <div class="empty-state">
                    <span>⚠️</span>
                    <p>Veritabanı bulunamadı (data/db.json).<br>Lütfen terminalde <strong>npm run build-db</strong> komutunu çalıştırın.</p>
                </div>
            </td></tr>`;
        }
        // Diğer modülleri yine de başlat
        if (typeof initAvalon === 'function') initAvalon();
        if (typeof initKillboard === 'function') initKillboard();
        if (typeof initClassMarket === 'function') initClassMarket();
        if (typeof initGoldPrice === 'function') initGoldPrice();
        if (typeof initBuilds === 'function') initBuilds();
        switchTab('craft');
        return;
    }

    console.log('[AlbionTools] DB yüklendi:', Object.keys(window.AppDB));

    // 6. Craft modülü hazır
    initCategoriesFromDB();
    initFilters();
    initProductDropdowns();
    buildAllItemsFlatList();
    initSearchAutocomplete();

    // 7. İstatistik göster
    const itemCountEl = document.getElementById('about-item-count');
    if (itemCountEl) {
        const totalItems = Object.values(window.AppDB)
            .flatMap(cats => Object.values(cats))
            .flatMap(items => Array.isArray(items) ? items : [])
            .length;
        itemCountEl.textContent = totalItems + ' eşya';
    }

    // 8. Diğer modülleri başlat
    if (typeof initAvalon === 'function') initAvalon();
    if (typeof initKillboard === 'function') initKillboard();
    if (typeof initClassMarket === 'function') initClassMarket();
    if (typeof initGoldPrice === 'function') initGoldPrice();
    if (typeof initBuilds === 'function') initBuilds();

    // 9. Fiyat güncelleme butonu
    const fetchBtn = document.getElementById('btn-fetch-prices');
    if (fetchBtn) fetchBtn.addEventListener('click', calculateCrafting);

    // 10. Başlangıç tablosunu render et
    renderTable();
    switchTab('craft');

    console.log('[AlbionTools] Uygulama hazır!');
});

// ==================== SERVER TOGGLE INITIALIZATION ====================
function initServerToggles() {
    const server = localStorage.getItem('albion-server') || 'west';
    console.log('[initServerToggles] Mevcut sunucu:', server);

    // Tüm sunucu toggles'i başlat
    const toggleGroups = document.querySelectorAll('[id$="-server-toggle"]');
    toggleGroups.forEach(group => {
        group.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.val === server);
        });
    });
}

// ==================== GENERIC SERVER SETTER ====================
function setServer(server) {
    console.log('[setServer] Sunucu değiştiriliyor:', server);
    localStorage.setItem('albion-server', server);
    
    // Tüm sunucu toggles'ini güncelle
    document.querySelectorAll('[id$="-server-toggle"] button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === server);
    });
    
    console.log('[setServer] Sunucu ayarlandı:', server);
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.toggle('active', el.id === `tab-${tabName}`);
    });
}

// ==================== CITIES ====================
function initCities() {
    const container = document.getElementById('city-list');
    if (!container) return;
    container.innerHTML = '';
    CITIES.forEach((city, index) => {
        const lbl = document.createElement('label');
        lbl.className = 'city-label';
        lbl.innerHTML = `<input type="radio" name="city-radio" value="${city.id}" ${index === 0 ? 'checked' : ''}>
                         <span>${city.label}</span>`;
        container.appendChild(lbl);
    });
}

// ==================== INITIALIZE CATEGORIES FROM DB ====================
function initCategoriesFromDB() {
    console.log('[initCategoriesFromDB] Başlıyor...');
    if (!window.AppDB) {
        console.warn('[initCategoriesFromDB] Veritabanı yüklenmedi!');
        return;
    }

    const keys = Object.keys(window.AppDB);
    if (keys.length === 0) {
        console.warn('[initCategoriesFromDB] Veritabanı boş!');
        return;
    }

    // Varsayılan kategoriyi ayarla
    if (!currentMainCategory || !window.AppDB[currentMainCategory]) {
        currentMainCategory = keys[0];
    }

    console.log('[initCategoriesFromDB] Ana kategoriler:', keys);
    console.log('[initCategoriesFromDB] Seçili:', currentMainCategory);

    // Dropdownları başlat
    initCraftSelectors();
}

// ==================== PRODUCT DROPDOWNS ====================
function initProductDropdowns() {
    console.log('[initProductDropdowns] Başlıyor...');
    // Bu fonksiyon craft selectorsları initialize etmek için çağrılıyor
    // initCraftSelectors() tarafından yapılıyor, bu da yardımcı fonksiyon
}

// ==================== CRAFT SELECTORS ====================
function initCraftSelectors() {
    const mainSel = document.getElementById('filter-category-main');
    const subSel = document.getElementById('filter-category-sub');
    if (!mainSel || !subSel || !window.AppDB) {
        console.warn('[initCraftSelectors] DOM elements veya DB yüklenemedi');
        return;
    }

    console.log('[initCraftSelectors] Başlatılıyor...');

    // Ana kategori listesini doldur
    mainSel.innerHTML = '<option value="ALL">Tümü</option>';
    Object.keys(window.AppDB).forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = friendlyMainCategory(m);
        mainSel.appendChild(opt);
        console.log('[initCraftSelectors] Ana kategori eklendi:', m);
    });

    // Varsayılan seçim
    if (!currentMainCategory || currentMainCategory === 'ALL') {
        currentMainCategory = Object.keys(window.AppDB)[0] || 'ALL';
    }
    mainSel.value = currentMainCategory;
    console.log('[initCraftSelectors] Main selector set:', currentMainCategory);

    updateSubDropdown(currentMainCategory);

    // Olay Dinleyicileri
    mainSel.addEventListener('change', () => {
        const val = mainSel.value;
        currentMainCategory = val;
        console.log('[initCraftSelectors] Main kategori değişti:', val);

        if (val !== 'ALL') {
            updateSubDropdown(val);
            currentSubCategory = 'ALL';
            subSel.value = 'ALL';
        } else {
            subSel.innerHTML = '<option value="ALL">Tümü</option>';
            currentSubCategory = 'ALL';
        }
        renderTable();
    });

    subSel.addEventListener('change', () => {
        currentSubCategory = subSel.value;
        console.log('[initCraftSelectors] Sub kategori değişti:', currentSubCategory);
        renderTable();
    });
}

function updateSubDropdown(mainCat) {
    const subSel = document.getElementById('filter-category-sub');
    if (!subSel || !window.AppDB || !window.AppDB[mainCat]) {
        console.warn('[updateSubDropdown] Geçersiz parametre:', mainCat);
        return;
    }

    console.log('[updateSubDropdown] Alt kategoriler doldurulüyor:', mainCat);

    subSel.innerHTML = '<option value="ALL">Tümü</option>';
    const subCats = Object.keys(window.AppDB[mainCat]);
    console.log('[updateSubDropdown] Alt kategoriler:', subCats);

    subCats.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = friendlySubCategory(mainCat, s);
        subSel.appendChild(opt);
    });
}

function friendlyMainCategory(cat) {
    const map = {
        potion: '🧪 İksirler',
        meal: '🍖 Yiyecek',
        melee: '⚔️ Yakın Dövüş',
        staff: '🔮 Personeller',
        bow: '🏹 Yaylar',
        armor: '🛡️ Zırh',
        helmet: '⛑️ Başlık',
        shoes: '👟 Ayakkabı',
        off_hand: '🛡️ Ek El',
        cape: '🧣 Pelerin',
        other: '📦 Diğer',
        resources: '⛏️ Kaynaklar',
        consumable: '💊 Tüketilebilir',
        artifact: '✨ Esinti',
    };
    return map[cat] || cat.toUpperCase();
}

function friendlySubCategory(mainCat, subCat) {
    const map = {
        potion: '🧪 İksirler',
        meal: '🍖 Yiyecek',
        potion_herb: '🌿 Bitki İksiri',
        sword: '⚔️ Kılıçlar',
        axe: '🪓 Baltalar',
        mace: '🏏 Değnekler',
        hammer: '🔨 Çekiçler',
        spear: '🗡️ Mızraklar',
        scythe: '⚙️ Oraklar',
        dagger: '🔪 Hançerler',
        bow: '🏹 Yaylar',
        firestaff: '🔥 Ateş Personeli',
        holystaff: '✨ Kutsal Personel',
        arcanestaff: '🌀 Esrik Personel',
        cursestaff: '💀 Lanet Personeli',
        froststaff: '❄️ Don Personeli',
        naturestaff: '🌿 Doğa Personeli',
        warbow: '🏹 Savaş Yayı',
        crossbow: '🏹 Tüfek',
        cloth_armor: '👘 Kumaş Zırh',
        leather_armor: '🧥 Deri Zırh',
        plate_armor: '🛡️ Plaka Zırh',
        cloth_helmet: '🎩 Kumaş Başlık',
        leather_helmet: '🪖 Deri Başlık',
        plate_helmet: '⛑️ Plaka Başlık',
        cloth_shoes: '👟 Kumaş Ayakkabı',
        leather_shoes: '👞 Deri Ayakkabı',
        plate_shoes: '👢 Plaka Ayakkabı',
        cape: '🧣 Peleriner',
        off_hand: '🛡️ Ek El',
    };
    return map[subCat] || `${mainCat.toUpperCase()} › ${subCat.toUpperCase()}`;
}

// ==================== FLAT SEARCH LIST ====================
function buildAllItemsFlatList() {
    globalItemsList = [];
    if (!window.AppDB) return;

    console.log('[buildAllItemsFlatList] Başlıyor...');
    let count = 0;

    for (const [mainCat, subCats] of Object.entries(window.AppDB)) {
        for (const [subCat, items] of Object.entries(subCats)) {
            if (Array.isArray(items)) {
                for (const item of items) {
                    globalItemsList.push({ ...item, mainCat, subCat });
                    count++;
                }
            }
        }
    }

    console.log('[buildAllItemsFlatList] Toplam item:', count);
}

// ==================== AUTOCOMPLETE SEARCH ====================
function initSearchAutocomplete() {
    const input = document.getElementById('item-search');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) {
        console.warn('[initSearchAutocomplete] DOM elements not found');
        return;
    }

    console.log('[initSearchAutocomplete] Başlatılıyor...');

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase().trim();
        if (val.length < 2) {
            closeDropdown();
            if (val.length === 0) renderTable();
            return;
        }

        const results = globalItemsList.filter(item => {
            const name = (item.name || item.id || '').toLowerCase();
            return name.includes(val) || (item.id || '').toLowerCase().includes(val);
        }).slice(0, 15);

        if (results.length === 0) {
            closeDropdown();
            return;
        }

        dropdown.innerHTML = results.map(item => {
            const imgUrl = `https://render.albiononline.com/v1/item/${item.id}.png?size=32`;
            return `<div class="dropdown-item" onclick="jumpToItem('${item.mainCat}','${item.subCat}','${item.id}')">
                <img src="${imgUrl}" width="28" height="28" onerror="this.style.display='none'">
                <div class="dropdown-item-info">
                    <div class="dropdown-item-name">${item.name || item.id}</div>
                    <div class="dropdown-item-sub">${item.tier || ''} · ${friendlySubCategory(item.mainCat, item.subCat)}</div>
                </div>
            </div>`;
        }).join('');
        dropdown.classList.add('open');
    });

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
    });
}

function jumpToItem(mainCat, subCat, itemId) {
    currentMainCategory = mainCat;
    currentSubCategory = subCat;

    const mainSel = document.getElementById('filter-category-main');
    const subSel = document.getElementById('filter-category-sub');
    if (mainSel) mainSel.value = mainCat;
    if (subSel) {
        updateSubDropdown(mainCat);
        subSel.value = subCat;
    }
    closeDropdown();
    const searchInput = document.getElementById('item-search');
    if (searchInput) searchInput.value = '';
    renderTable();

    setTimeout(() => {
        const row = document.querySelector(`[data-item-id="${itemId}"]`);
        if (row) {
            row.classList.add('row-highlight');
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => row.classList.remove('row-highlight'), 2000);
        }
    }, 100);
}

function closeDropdown() {
    const dd = document.getElementById('search-dropdown');
    if (dd) {
        dd.innerHTML = '';
        dd.classList.remove('open');
    }
}

// ==================== FILTERS ====================
function initFilters() {
    const tierFilters = document.querySelectorAll('#tier-filters button');
    const enchantFilters = document.querySelectorAll('#enchant-filters button');

    tierFilters.forEach(b => {
        b.onclick = () => {
            tierFilters.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            currentTier = b.dataset.val;
            renderTable();
        };
    });

    enchantFilters.forEach(b => {
        b.onclick = () => {
            enchantFilters.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            currentEnchant = b.dataset.val;
            renderTable();
        };
    });
}

// ==================== TABLE RENDERING ====================
function renderTable() {
    const tbody = document.getElementById('craft-table-body');
    if (!tbody) {
        console.warn('[renderTable] tbody not found');
        return;
    }
    tbody.innerHTML = '';

    if (!window.AppDB) {
        tbody.innerHTML = `<tr><td colspan="12"><div class="empty-state"><span>⚠️</span><p>Veritabanı yüklenemedi.</p></div></td></tr>`;
        return;
    }

    // Tüm eşyaları veya belirli kategoriyi göster
    let items = [];

    if (currentMainCategory && currentSubCategory && currentSubCategory !== 'ALL' &&
        window.AppDB[currentMainCategory] && window.AppDB[currentMainCategory][currentSubCategory]) {
        items = window.AppDB[currentMainCategory][currentSubCategory];
        console.log('[renderTable] Sub kategoriden:', items.length, 'item yüklendi');
    } else if (currentMainCategory && currentMainCategory !== 'ALL' && window.AppDB[currentMainCategory]) {
        // Tüm alt kategorileri birleştir
        for (const subCatItems of Object.values(window.AppDB[currentMainCategory])) {
            if (Array.isArray(subCatItems)) items = items.concat(subCatItems);
        }
        console.log('[renderTable] Ana kategoriden:', items.length, 'item yüklendi');
    } else {
        // Tümü - ilk kategorideki ilk alt kategorilerden göster
        const firstMain = Object.keys(window.AppDB)[0];
        if (firstMain) {
            const firstSub = Object.keys(window.AppDB[firstMain])[0];
            if (firstSub && Array.isArray(window.AppDB[firstMain][firstSub])) {
                items = window.AppDB[firstMain][firstSub];
                currentMainCategory = firstMain;
                currentSubCategory = firstSub;
            }
        }
        console.log('[renderTable] İlk kategoriden:', items.length, 'item yüklendi');
    }

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12"><div class="empty-state"><span>📋</span><p>Bu kategoride eşya bulunamadı.</p></div></td></tr>`;
        console.warn('[renderTable] Item liste boş');
        return;
    }

    // Tier filtresi
    if (currentTier !== 'ALL') items = items.filter(i => i.tier === currentTier);

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12"><div class="empty-state"><span>🔍</span><p>Seçilen filtrelerle eşya bulunamadı.</p></div></td></tr>`;
        return;
    }

    const enchStr = currentEnchant !== 'ALL' && currentEnchant !== '0' ? `@${currentEnchant}` : '';

    items.forEach(item => {
        const realId = (item.id || '') + enchStr;
        let matHtml = '';

        Object.entries(item.materials || {}).forEach(([matId, count]) => {
            let mId = matId;
            if (enchStr && !matId.includes('LEVEL') && !matId.includes('RUNE') && !matId.includes('SOUL') && !matId.includes('RELIC')) {
                mId = matId + '_LEVEL' + currentEnchant;
            }
            const imgUrl = `https://render.albiononline.com/v1/item/${mId}.png?size=32`;
            matHtml += `<div class="mat-row">
                <div class="mat-info">
                    <img src="${imgUrl}" width="24" height="24" onerror="this.style.opacity='0.3'">
                    <span>${count}x</span>
                </div>
                <input type="number" class="item-input mat-cost" data-id="${mId}" value="0" min="0">
            </div>`;
        });

        const mainImg = `https://render.albiononline.com/v1/item/${realId}.png?size=48`;
        const tr = document.createElement('tr');
        tr.dataset.itemId = realId;
        tr.dataset.name = String(item.name || item.id || '');

        tr.innerHTML = `
            <td>
                <div style="color:var(--text-muted);font-size:10px;margin-bottom:4px">${(item.mainCat || currentMainCategory).toUpperCase()} › ${(item.subCat || currentSubCategory).toUpperCase()}</div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <img src="${mainImg}" width="40" height="40" style="background:rgba(0,0,0,0.4);border-radius:6px;flex-shrink:0" onerror="this.style.opacity='0.3'">
                    <div>
                        <strong style="color:var(--accent)">${item.tier || ''}</strong> ${item.name || item.id}<br>
                        <span style="font-size:10px;color:var(--text-muted)">${realId}</span>
                    </div>
                </div>
            </td>
            <td>${matHtml || '—'}</td>
            <td>—</td>
            <td>0</td>
            <td class="total-mat-cost" style="color:#ffb84d">0 S</td>
            <td class="return-val" style="color:#4ade80">0 S</td>
            <td><input type="number" class="item-input craft-fee" value="${item.craftFeeValue || 0}" min="0"></td>
            <td><input type="number" class="item-input sell-price" value="0" min="0"></td>
            <td class="net-cost">0 S</td>
            <td class="net-profit font-bold">0 S</td>
            <td class="profit-margin">0.0%</td>
            <td><input type="number" class="item-input craft-amount" value="1" min="1"></td>
        `;
        tbody.appendChild(tr);
        tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => calculateRow(tr)));
    });

    console.log('[renderTable] Tablo render edildi:', items.length, 'item');
    calculateGlobal();
}

// ==================== CALCULATIONS ====================
function calculateRow(tr) {
    const taxSell = parseFloat(document.getElementById('tax-sell')?.value || 4.5) / 100;
    let matCost = 0;
    tr.querySelectorAll('.mat-cost').forEach(inp => matCost += parseFloat(inp.value) || 0);
    const craftFee = parseFloat(tr.querySelector('.craft-fee')?.value) || 0;
    const sellPrice = parseFloat(tr.querySelector('.sell-price')?.value) || 0;
    const amount = parseFloat(tr.querySelector('.craft-amount')?.value) || 1;

    const premiumRate = parseFloat(document.getElementById('bonus-premium')?.value || 15.2) / 100;
    const returnVal = matCost * premiumRate;
    const netCost = matCost - returnVal + craftFee;
    const netSell = sellPrice * (1 - taxSell);
    const profit = (netSell - netCost) * amount;
    const margin = netCost > 0 ? (profit / netCost) * 100 : 0;

    const fmt = (n) => Math.round(n).toLocaleString('tr-TR') + ' S';
    tr.querySelector('.total-mat-cost').innerText = fmt(matCost * amount);
    tr.querySelector('.return-val').innerText = fmt(returnVal * amount);
    tr.querySelector('.net-cost').innerText = fmt(netCost * amount);

    const profitEl = tr.querySelector('.net-profit');
    profitEl.innerText = fmt(profit);
    profitEl.className = 'net-profit font-bold ' + (profit >= 0 ? 'profit-pos' : 'profit-neg');
    tr.querySelector('.profit-margin').innerText = margin.toFixed(1) + '%';
    tr.querySelector('.profit-margin').style.color = margin >= 0 ? '#4ade80' : '#f87171';
}

function calculateGlobal() {
    let sumCost = 0, sumReturn = 0, sumFee = 0, sumProfit = 0, count = 0;
    document.querySelectorAll('#craft-table-body tr').forEach(tr => {
        if (tr.style.display !== 'none' && tr.querySelector('.total-mat-cost')) {
            sumCost += parseFloat(tr.querySelector('.total-mat-cost').innerText.replace(/[^0-9.-]/g, '')) || 0;
            sumReturn += parseFloat(tr.querySelector('.return-val').innerText.replace(/[^0-9.-]/g, '')) || 0;
            sumFee += parseFloat(tr.querySelector('.craft-fee')?.value || 0) * (parseFloat(tr.querySelector('.craft-amount')?.value || 1));
            sumProfit += parseFloat(tr.querySelector('.net-profit').innerText.replace(/[^0-9.-]/g, '')) || 0;
            count++;
        }
    });
    const fmt = (n) => Math.round(n).toLocaleString('tr-TR') + ' <span class="silver">S</span>';
    const El = (id) => document.getElementById(id);
    if (El('sum-cost')) El('sum-cost').innerHTML = fmt(sumCost);
    if (El('sum-return')) El('sum-return').innerHTML = fmt(sumReturn);
    if (El('sum-fee')) El('sum-fee').innerHTML = fmt(sumFee);
    if (El('sum-profit')) El('sum-profit').innerHTML = fmt(sumProfit);
    const margin = sumCost > 0 ? (sumProfit / sumCost) * 100 : 0;
    if (El('sum-margin')) El('sum-margin').innerText = margin.toFixed(1) + '%';
}

async function calculateCrafting() {
    const btn = document.getElementById('btn-fetch-prices');
    if (btn) { btn.innerHTML = '⏳ Yükleniyor...'; btn.disabled = true; }

    const rows = document.querySelectorAll('#craft-table-body tr');
    let itemsToFetch = [];
    rows.forEach(tr => {
        if (tr.style.display !== 'none' && tr.dataset.itemId) {
            itemsToFetch.push(tr.dataset.itemId);
            tr.querySelectorAll('.mat-cost').forEach(m => { if (m.dataset.id) itemsToFetch.push(m.dataset.id); });
        }
    });
    itemsToFetch = [...new Set(itemsToFetch)].filter(Boolean);

    if (itemsToFetch.length === 0) {
        if (btn) { btn.innerHTML = '⟳ <span>Fiyatları Güncelle</span>'; btn.disabled = false; }
        return;
    }

    try {
        const selectedCity = document.querySelector('input[name="city-radio"]:checked')?.value || 'Caerleon';
        const data = await window.ApiService.getPrices(itemsToFetch, [selectedCity]);
        const priceMap = {};
        data.forEach(d => {
            priceMap[d.item_id] = d.sell_price_min > 0 ? d.sell_price_min : d.buy_price_max;
        });

        rows.forEach(tr => {
            if (tr.style.display !== 'none' && tr.dataset.itemId) {
                const sellEl = tr.querySelector('.sell-price');
                if (sellEl && priceMap[tr.dataset.itemId]) sellEl.value = priceMap[tr.dataset.itemId];
                tr.querySelectorAll('.mat-cost').forEach(mat => {
                    if (mat.dataset.id && priceMap[mat.dataset.id]) mat.value = priceMap[mat.dataset.id];
                });
                calculateRow(tr);
            }
        });
        if (typeof showToast === 'function') showToast('✅ Fiyatlar güncellendi!');
    } catch (e) {
        console.error('[AlbionTools] Fiyat çekme hatası:', e);
        if (typeof showToast === 'function') showToast('⚠️ Fiyatlar alınamadı. İnternet bağlantısını kontrol edin.');
    }

    if (btn) { btn.innerHTML = '⟳ <span>Fiyatları Güncelle</span>'; btn.disabled = false; }
    calculateGlobal();
}

function syncSettingsInputs() {
    const sTax = document.getElementById('s-tax-sell');
    const sPremium = document.getElementById('s-bonus-premium');
    if (sTax) sTax.value = document.getElementById('tax-sell')?.value || '4.5';
    if (sPremium) sPremium.value = document.getElementById('bonus-premium')?.value || '15.2';
}

// ==================== GLOBAL EXPORTS ====================
window.switchTab = switchTab;
window.setServer = setServer;
window.jumpToItem = jumpToItem;
window.calculateRow = calculateRow;
window.loadKillboard = typeof loadKillboard !== 'undefined' ? loadKillboard : () => { };
window.loadMarketData = typeof loadMarketData !== 'undefined' ? loadMarketData : () => { };
window.loadGoldPrice = typeof loadGoldPrice !== 'undefined' ? loadGoldPrice : () => { };
window.closeAvalonModal = typeof closeAvalonModal !== 'undefined' ? closeAvalonModal : () => { };
window.openAvalonModal = typeof openAvalonModal !== 'undefined' ? openAvalonModal : () => { };
window.renderBuilds = typeof renderBuilds !== 'undefined' ? renderBuilds : () => { };
window.applyDefaultSettings = typeof applyDefaultSettings !== 'undefined' ? applyDefaultSettings : () => { };
