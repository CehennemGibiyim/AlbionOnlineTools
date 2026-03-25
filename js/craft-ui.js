/* 
 * Albion Tools - Craft UI Entegrasyonu (Görsel Kategori ve Detay Sistemi)
 * app.js'teki eski tablo tabanlı özellikleri override eder (renderTable, calculateCrafting vs.)
 */

let craftState = {
    step: 1,
    mainCat: null,
    subCat: null,
    itemGroup: null, 
    selectedItemData: null
};

// Override renderTable from app.js
window.renderTable = function() {
    console.log('[CraftUI] Yeni görsel render sistemi...');
    if (!window.AppDB) return;
    
    // Eğer bir arama yapılmışsa direkt o bölüme gidebilir logic (şu anlık step 1 e zorla)
    if (craftState.step === 1) renderCraftStep1();
    else if (craftState.step === 2) craftGoBack(1); // Basitçe 1'e dön
};

window.craftGoBack = function(step) {
    craftState.step = step;
    
    // Hide all steps
    for(let i=1; i<=4; i++) {
        const el = document.getElementById(`craft-step-${i}`);
        if(el) el.style.display = 'none';
    }
    
    // Show current step
    const target = document.getElementById(`craft-step-${step}`);
    if(target) target.style.display = 'block';

    if(step === 1) renderCraftStep1();
    if(step === 2) renderCraftStep2(craftState.mainCat);
    if(step === 3) renderCraftStep3(craftState.subCat);
};

// 1. AŞAMA: ANA KATEGORİLER
function renderCraftStep1() {
    craftState.step = 1;
    craftState.mainCat = null; craftState.subCat = null; craftState.selectedItemData = null;
    
    const container = document.getElementById('craft-categories');
    if(!container) return;
    container.innerHTML = '';

    document.getElementById('craft-step-1').style.display = 'block';
    for(let i=2; i<=4; i++) document.getElementById(`craft-step-${i}`).style.display = 'none';

    // Kategorileri veritabanından bul
    const mainCats = Object.keys(window.AppDB || {});
    
    mainCats.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'craft-card';
        div.innerHTML = `
            <div class="craft-card-icon">📦</div>
            <div class="craft-card-title">${cat.toUpperCase()}</div>
        `;
        div.onclick = () => renderCraftStep2(cat);
        container.appendChild(div);
    });
}

// 2. AŞAMA: ALT KATEGORİLER
function renderCraftStep2(mainCat) {
    craftState.step = 2;
    craftState.mainCat = mainCat;
    
    document.getElementById('craft-sub-title').textContent = mainCat.toUpperCase() + ' - Alt Kategoriler';
    
    const container = document.getElementById('craft-subcategories');
    container.innerHTML = '';
    
    document.getElementById('craft-step-1').style.display = 'none';
    document.getElementById('craft-step-2').style.display = 'block';
    
    const subCats = Object.keys(window.AppDB[mainCat] || {});
    
    subCats.forEach(sub => {
        const firstItem = window.AppDB[mainCat][sub][0];
        let baseId = firstItem ? firstItem.id.split('_')[0] : 'UNKNOWN';
        if(firstItem && firstItem.id.includes('BOW')) baseId = 'T4_BOW';
        else if (firstItem && firstItem.id) baseId = firstItem.id.replace(/T\d+_/,'T4_');

        const div = document.createElement('div');
        div.className = 'craft-card';
        div.innerHTML = `
            <img src="https://render.albiononline.com/v1/item/${baseId}.png?size=64" onerror="this.src=''" alt="Icon">
            <div class="craft-card-title">${sub.toUpperCase()}</div>
        `;
        div.onclick = () => renderCraftStep3(sub);
        container.appendChild(div);
    });
}

// 3. AŞAMA: EŞYA SEÇİMİ (TIER'lere göre gruplanmış)
function renderCraftStep3(subCat) {
    craftState.step = 3;
    craftState.subCat = subCat;
    
    document.getElementById('craft-item-title').textContent = subCat.toUpperCase() + ' - Seçenekler';
    
    const container = document.getElementById('craft-items-list');
    container.innerHTML = '';
    
    document.getElementById('craft-step-2').style.display = 'none';
    document.getElementById('craft-step-3').style.display = 'block';
    
    let items = window.AppDB[craftState.mainCat][subCat] || [];
    
    // Eşyaları isim bazında veya Tier bazında gruplayıp göster
    items.forEach(item => {
        // Enchantsız halini gösterelim, seçince detayda enchant seçtiririz
        const div = document.createElement('div');
        div.className = 'craft-card item-card';
        div.innerHTML = `
            <div class="tier-bubble">${item.tier}</div>
            <img src="https://render.albiononline.com/v1/item/${item.id}.png?size=64">
            <div class="craft-card-title">${item.name || item.id}</div>
        `;
        div.onclick = () => renderCraftStep4(item);
        container.appendChild(div);
    });
}

// 4. AŞAMA: EŞYA DETAYI VE MATERYALLER
function renderCraftStep4(itemData) {
    craftState.step = 4;
    craftState.selectedItemData = itemData;
    
    document.getElementById('craft-step-3').style.display = 'none';
    document.getElementById('craft-step-4').style.display = 'block';
    
    const container = document.getElementById('craft-detail-content');
    
    let matHtml = '';
    Object.entries(itemData.materials || {}).forEach(([mId, count]) => {
        matHtml += `
            <div class="mat-detail-box" data-mat="${mId}">
                <img src="https://render.albiononline.com/v1/item/${mId}.png?size=48" title="${mId}">
                <span>${count}x</span>
                <div class="mat-price-tag">0 S</div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="detail-header">
            <img src="https://render.albiononline.com/v1/item/${itemData.id}.png?size=96">
            <div class="detail-info">
                <span class="tier-badge">${itemData.tier}</span>
                <h2>${itemData.name || itemData.id}</h2>
                <div class="ench-selector">
                    Büyü Seçimi: 
                    <button class="ench-btn active" data-e="0">.0</button>
                    <button class="ench-btn" data-e="1">.1</button>
                    <button class="ench-btn" data-e="2">.2</button>
                    <button class="ench-btn" data-e="3">.3</button>
                    <button class="ench-btn" data-e="4">.4</button>
                </div>
            </div>
        </div>
        
        <div class="materials-section">
            <h3 style="color:#fff; margin:15px 0 10px 0;">Gereken Materyaller</h3>
            <div class="mat-grid">
                ${matHtml}
            </div>
        </div>
        
        <div class="calc-section" style="margin-top:20px; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>Toplam Maliyet:</span>
                <strong id="detail-total-cost" style="color:#ffb84d">0 S</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>Satış Fiyatı:</span>
                <strong id="detail-sell-price" style="color:#4ade80">0 S</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                <span>Net Kar:</span>
                <strong id="detail-net-profit" style="color:#fff">0 S</strong>
            </div>
        </div>
        
        <button id="btn-calc-single" style="margin-top:20px; width:100%; padding:15px; background:var(--accent); color:#1a1d26; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
            Piyasa Fiyatlarını Getir ve Hesapla
        </button>
    `;
    
    // Enchant tıklamalarını bağla (Görsel değişim)
    const enchBtns = container.querySelectorAll('.ench-btn');
    enchBtns.forEach(b => {
        b.onclick = () => {
            enchBtns.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            let ench = b.dataset.e;
            let currentId = itemData.id;
            if(ench !== "0") currentId += "@" + ench;
            container.querySelector('.detail-header img').src = `https://render.albiononline.com/v1/item/${currentId}.png?size=96`;
            
            // Eğer istersen materyallerin resimlerini de .X'e göre güncelleyebilirsin
        };
    });

    // Hesapla Butonu
    const btnCalc = document.getElementById('btn-calc-single');
    if(btnCalc) {
        btnCalc.onclick = async () => {
            btnCalc.textContent = "Fiyatlar Çekiliyor...";
            btnCalc.disabled = true;
            await calculateSingleCraft(itemData);
            btnCalc.textContent = "Piyasa Fiyatlarını Getir ve Hesapla";
            btnCalc.disabled = false;
        };
    }
}

// Override CalculateCrafting (üstteki butona da basıldığında sadece ekranda seçili eşya varsa onu hesaplasın)
window.calculateCrafting = async function() {
    if(craftState.step === 4 && craftState.selectedItemData) {
        await calculateSingleCraft(craftState.selectedItemData);
    } else {
        alert("Pazar fiyatlarını getirmek için lütfen bir eşya seçin ve Detaylar sayfasına gidin.");
    }
};

async function calculateSingleCraft(itemData) {
    if(!window.ApiService) return;
    const locs = window.ApiService.getSelectedLocations();
    const qual = window.ApiService.getSelectedQuality();
    const sellLoc = document.getElementById('sell-location')?.value || locs;
    
    // Hangi büyüyü seçtik?
    const activeEnch = document.querySelector('.ench-btn.active');
    const enchStr = activeEnch && activeEnch.dataset.e !== "0" ? "@" + activeEnch.dataset.e : "";
    
    const targetItem = itemData.id + enchStr;
    const reqMatIds = [];
    Object.keys(itemData.materials || {}).forEach(mId => {
        let fetchId = mId;
        if(enchStr && !mId.includes('RUNE') && !mId.includes('SOUL') && !mId.includes('RELIC')) {
            fetchId = mId + "_LEVEL" + activeEnch.dataset.e;
        }
        reqMatIds.push(fetchId);
    });
    
    const idsToFetch = [targetItem, ...reqMatIds];
    
    try {
        const prices = await window.ApiService.getPrices(idsToFetch, locs, [qual]);
        
        let totalCost = 0;
        
        // Fiyatları Ekrana Yaz
        const matBoxes = document.querySelectorAll('.mat-detail-box');
        matBoxes.forEach(box => {
            let baseMat = box.dataset.mat;
            let mId = baseMat;
            if(enchStr && !baseMat.includes('RUNE') && !baseMat.includes('SOUL') && !baseMat.includes('RELIC')) {
                mId = baseMat + "_LEVEL" + activeEnch.dataset.e;
            }
            
            const reqCount = parseInt(box.querySelector('span').textContent);
            const prArr = prices.filter(p => p.item_id === mId && p.sell_price_min > 0);
            let costPc = 0;
            if(prArr.length > 0) {
                costPc = Math.min(...prArr.map(p => p.sell_price_min));
            }
            
            totalCost += (costPc * reqCount);
            box.querySelector('.mat-price-tag').textContent = costPc > 0 ? costPc.toLocaleString() + ' S' : 'Yok';
        });
        
        // Eşya Satış Fiyatı
        let sellP = 0;
        const sellArr = await window.ApiService.getPrices([targetItem], sellLoc, [qual]);
        const sPr = sellArr.filter(p => p.sell_price_min > 0);
        if(sPr.length > 0) {
            sellP = Math.min(...sPr.map(p => p.sell_price_min));
        }

        const feeCraft = parseFloat(document.getElementById('fee-craft')?.value || 0)/100;
        const taxVal = parseFloat(document.getElementById('tax-sell')?.value || 0)/100;
        
        let retBonus = window.ApiService.getCurrentReturnRate() / 100;
        const hasPrem = document.getElementById('use-focus')?.checked; // Eğer basılıysa extra
        if(hasPrem) retBonus += 0.43; // Focus + Premium örneği
        
        const feeDed = sellP * feeCraft;
        const netCost = totalCost * (1 - retBonus);
        const finalSell = sellP * (1 - taxVal);
        const netProfit = finalSell - netCost - feeDed;

        document.getElementById('detail-total-cost').textContent = Math.floor(netCost).toLocaleString() + ' S';
        document.getElementById('detail-sell-price').textContent = Math.floor(finalSell).toLocaleString() + ' S';
        const pEl = document.getElementById('detail-net-profit');
        pEl.textContent = Math.floor(netProfit).toLocaleString() + ' S';
        pEl.style.color = netProfit >= 0 ? '#4ade80' : '#ff4d4d';

    } catch(e) {
        console.error("Single craft price fetch err:", e);
    }
}
