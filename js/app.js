document.addEventListener('DOMContentLoaded', () => {
    initThemes();
    initCities();

    // 1. Load the database
    window.AppDB = window.ApiService.getLocalDatabase();
    if (!window.AppDB) {
        alert("Ürün veritabanı bulunamadı (db.json). Lütfen önce build-db.js'yi çalıştırın.");
        return;
    }

    initCategoriesFromDB();
    initFilters();

    document.getElementById('btn-fetch-prices').addEventListener('click', calculateCrafting);

    // Auto-search logic
    document.getElementById('item-search').addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        renderTableFilter(val);
    });
});

const CITIES = [
    { id: 'Caerleon', label: 'Caerleon', returnRate: 15.2 },
    { id: 'Bridgewatch', label: 'Bridgewatch', returnRate: 15.2 },
    { id: 'FortSterling', label: 'Fort Sterling', returnRate: 15.2 },
    { id: 'Lymhurst', label: 'Lymhurst', returnRate: 15.2 },
    { id: 'Martlock', label: 'Martlock', returnRate: 15.2 },
    { id: 'Thetford', label: 'Thetford', returnRate: 15.2 },
    { id: 'Brecilien', label: 'Brecilien', returnRate: 15.2 }
];

let globalItemsList = []; // Flattened list for the current category
let currentMainCategory = '';
let currentSubCategory = '';
let currentTier = 'ALL';
let currentEnchant = 'ALL';

function initThemes() {
    const themes = ['default', 'blue', 'green', 'purple', 'light'];
    const container = document.getElementById('theme-selector');
    themes.forEach((t, i) => {
        const dot = document.createElement('div');
        dot.className = `theme-dot ${i === 0 ? 'selected' : ''}`;
        const colors = { 'default': '#f59e0b', 'blue': '#3b82f6', 'green': '#22c55e', 'purple': '#bd93f9', 'light': '#ffffff' };
        dot.style.backgroundColor = colors[t];
        dot.onclick = () => {
            document.body.setAttribute('data-theme', t);
            document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
        }
        container.appendChild(dot);
    });
}

function initCities() {
    const container = document.getElementById('city-list');
    CITIES.forEach((city, index) => {
        const lbl = document.createElement('label');
        lbl.innerHTML = `<input type="radio" name="city-radio" value="${city.id}" ${index === 0 ? 'checked' : ''}>
                         <span>${city.label} (${city.returnRate}%)</span>`;
        container.appendChild(lbl);
    });
}

function initCategoriesFromDB() {
    const ul = document.querySelector('#category-list ul');
    ul.innerHTML = '';

    // Categorizing based on main category + sub category loops
    // e.g. melee -> sword, melee -> axe, potion -> potion

    let isFirst = true;

    for (const [mainCat, subCatsObj] of Object.entries(window.AppDB)) {
        for (const [subCat, items] of Object.entries(subCatsObj)) {
            const li = document.createElement('li');
            li.dataset.maincat = mainCat;
            li.dataset.subcat = subCat;
            // Human readable mapping roughly
            let niceName = `${mainCat} - ${subCat}`.toUpperCase();
            if (subCat === 'potion') niceName = "POTIONS";
            else if (subCat === 'meal') niceName = "FOODS";
            else if (subCat === 'sword') niceName = "SWORDS";
            else if (subCat === 'axe') niceName = "AXES";
            else if (subCat === 'bow') niceName = "BOWS";
            else if (subCat === 'cloth_armor') niceName = "CLOTH ARMOR";

            li.innerText = niceName;

            if (isFirst) {
                li.classList.add('active');
                currentMainCategory = mainCat;
                currentSubCategory = subCat;
                isFirst = false;
            }

            li.onclick = () => {
                document.querySelectorAll('#category-list li').forEach(lc => lc.classList.remove('active'));
                li.classList.add('active');
                currentMainCategory = mainCat;
                currentSubCategory = subCat;
                document.getElementById('item-search').value = '';
                renderTable();
            }
            ul.appendChild(li);
        }
    }

    renderTable(); // First load
}

function initFilters() {
    const tiers = document.querySelectorAll('#tier-filters button');
    tiers.forEach(b => {
        b.onclick = () => {
            tiers.forEach(tb => tb.classList.remove('active'));
            b.classList.add('active');
            currentTier = b.dataset.val;
            renderTable();
        };
    });

    const enchants = document.querySelectorAll('#enchant-filters button');
    enchants.forEach(b => {
        b.onclick = () => {
            enchants.forEach(eb => eb.classList.remove('active'));
            b.classList.add('active');
            currentEnchant = b.dataset.val;
            renderTable();
        };
    });
}

function renderTableFilter(searchText) {
    const rows = document.querySelectorAll('#craft-table-body tr');
    rows.forEach(row => {
        const itemName = row.dataset.name.toLowerCase();
        if (itemName.includes(searchText)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    calculateGlobal();
}

function renderTable() {
    const tbody = document.getElementById('craft-table-body');
    tbody.innerHTML = '';

    if (!window.AppDB[currentMainCategory] || !window.AppDB[currentMainCategory][currentSubCategory]) return;

    let itemsToRender = window.AppDB[currentMainCategory][currentSubCategory];

    if (currentTier !== 'ALL') {
        itemsToRender = itemsToRender.filter(i => i.tier === currentTier);
    }

    let enchStr = currentEnchant !== 'ALL' && currentEnchant !== '0' ? `@${currentEnchant}` : '';

    itemsToRender.forEach(item => {
        // Build enchanted ID if applicable
        const realId = item.id + enchStr;

        // Materials Logic with Images
        let matHtml = '';
        Object.entries(item.materials).forEach(([matId, count]) => {
            // Apply enchantment logic to materials naturally if it's an enchanted item? 
            // Usually, enchanted items require enchanted materials (e.g. T4_PLANKS_LEVEL1 for weapon@1)
            // But this is complex. For now, we fetch the exact material from DB if we can, 
            // or just use generic string for testing since we didn't parse level recursively.
            let matIdEnchant = matId;
            if (enchStr && !matId.includes('LEVEL') && !matId.includes('RUNE') && !matId.includes('SOUL') && !matId.includes('RELIC')) {
                matIdEnchant = matId + "_LEVEL" + currentEnchant;
            }

            const imgUrl = `https://render.albiononline.com/v1/item/${matIdEnchant}.png?size=32`;
            matHtml += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                            <div style="display:flex; align-items:center; gap: 5px;">
                                <img src="${imgUrl}" width="24" height="24">
                                <span>${count}x</span>
                            </div>
                            <input type="number" class="item-input mat-cost" data-id="${matIdEnchant}" value="0">
                        </div>`;
        });

        const mainImgUrl = `https://render.albiononline.com/v1/item/${realId}.png?size=48`;

        const tr = document.createElement('tr');
        tr.dataset.itemId = realId;
        tr.dataset.name = String(item.name || item.id);

        tr.innerHTML = `
            <td>
                <div style="color: var(--text-muted); font-size: 10px; margin-bottom: 5px;">${currentMainCategory.toUpperCase()} > ${currentSubCategory.toUpperCase()}</div>
                <div style="display:flex; align-items:center; gap: 10px;">
                    <img src="${mainImgUrl}" width="40" height="40" style="background: rgba(0,0,0,0.5); border-radius: 4px;">
                    <div>
                        <strong class="item-tier">${item.tier}</strong> ${item.name || item.id}<br>
                        <span style="font-size: 10px; color: #888;">${realId}</span>
                    </div>
                </div>
            </td>
            <td>${matHtml}</td>
            <td>-</td>
            <td>0</td>
            <td class="total-mat-cost" style="color: #ffb84d;">0 S</td>
            <td class="return-val text-green">0 S</td>
            <td><input type="number" class="item-input craft-fee" value="${item.craftFeeValue}"></td>
            <td><input type="number" class="item-input sell-price" value="0"></td>
            <td class="net-cost">0 S</td>
            <td class="net-profit font-bold">0 S</td>
            <td class="profit-margin">0.0%</td>
            <td><input type="number" class="item-input craft-amount" value="1"></td>
        `;
        tbody.appendChild(tr);

        const inputs = tr.querySelectorAll('input');
        inputs.forEach(inp => inp.addEventListener('input', calculateRow.bind(null, tr)));
    });

    calculateGlobal();
}

function calculateRow(tr) {
    const taxSell = parseFloat(document.getElementById('tax-sell').value) / 100 || 0;

    let matCost = 0;
    const matInputs = tr.querySelectorAll('.mat-cost');
    matInputs.forEach(inp => matCost += parseFloat(inp.value) || 0);

    const craftFee = parseFloat(tr.querySelector('.craft-fee').value) || 0;
    const sellPrice = parseFloat(tr.querySelector('.sell-price').value) || 0;
    const amount = parseFloat(tr.querySelector('.craft-amount').value) || 1;

    // Default 15.2% return logic
    const returnRate = 0.152;
    const returnVal = matCost * returnRate;

    const netCost = matCost - returnVal + craftFee;
    const netSellPrice = sellPrice * (1 - taxSell);
    const profit = (netSellPrice - netCost) * amount;

    let margin = 0;
    if (netCost > 0) margin = (profit / netCost) * 100;

    tr.querySelector('.total-mat-cost').innerText = Math.round(matCost * amount) + " S";
    tr.querySelector('.return-val').innerText = Math.round(returnVal * amount) + " S";
    tr.querySelector('.net-cost').innerText = Math.round(netCost * amount) + " S";

    const profitEl = tr.querySelector('.net-profit');
    profitEl.innerText = Math.round(profit) + " S";
    profitEl.className = 'net-profit ' + (profit >= 0 ? 'profit-pos' : 'profit-neg');

    tr.querySelector('.profit-margin').innerText = margin.toFixed(1) + "%";
}

function calculateGlobal() {
    let sumCost = 0, sumReturn = 0, sumFee = 0, sumProfit = 0;

    const rows = document.querySelectorAll('#craft-table-body tr');
    rows.forEach(tr => {
        if (tr.style.display !== 'none') {
            sumCost += parseInt(tr.querySelector('.total-mat-cost').innerText) || 0;
            sumReturn += parseInt(tr.querySelector('.return-val').innerText) || 0;
            sumFee += parseInt(tr.querySelector('.craft-fee').value) * (parseInt(tr.querySelector('.craft-amount').value) || 1) || 0;
            sumProfit += parseInt(tr.querySelector('.net-profit').innerText) || 0;
        }
    });

    document.getElementById('sum-cost').innerHTML = sumCost + ' <span class="silver">S</span>';
    document.getElementById('sum-return').innerHTML = sumReturn + ' <span class="silver">S</span>';
    document.getElementById('sum-fee').innerHTML = sumFee + ' <span class="silver">S</span>';
    document.getElementById('sum-profit').innerHTML = sumProfit + ' <span class="silver">S</span>';

    const globalMargin = sumCost > 0 ? (sumProfit / sumCost) * 100 : 0;
    document.getElementById('sum-margin').innerText = globalMargin.toFixed(1) + "%";
}

async function calculateCrafting() {
    const btn = document.getElementById('btn-fetch-prices');
    btn.innerText = "Yükleniyor...";
    btn.disabled = true;

    const rows = document.querySelectorAll('#craft-table-body tr');
    let itemsToFetch = [];

    rows.forEach(tr => {
        if (tr.style.display !== 'none') {
            itemsToFetch.push(tr.dataset.itemId);
            const matInputs = tr.querySelectorAll('.mat-cost');
            matInputs.forEach(m => itemsToFetch.push(m.dataset.id));
        }
    });

    itemsToFetch = [...new Set(itemsToFetch)];
    if (itemsToFetch.length === 0) {
        btn.innerText = "⟳ Fiyatları Çek";
        btn.disabled = false;
        return;
    }

    try {
        const selectedCity = document.querySelector('input[name="city-radio"]:checked').value;
        const data = await window.ApiService.getPrices(itemsToFetch, [selectedCity]);

        const priceMap = {};
        data.forEach(d => {
            const price = d.sell_price_min > 0 ? d.sell_price_min : d.buy_price_max;
            priceMap[d.item_id] = price;
        });

        rows.forEach(tr => {
            if (tr.style.display !== 'none') {
                const itemId = tr.dataset.itemId;
                if (priceMap[itemId]) {
                    tr.querySelector('.sell-price').value = priceMap[itemId];
                }

                const matInputs = tr.querySelectorAll('.mat-cost');
                matInputs.forEach(mat => {
                    if (priceMap[mat.dataset.id]) {
                        mat.value = priceMap[mat.dataset.id];
                    }
                });
                calculateRow(tr);
            }
        });

    } catch (e) {
        console.error(e);
        alert("Fiyatlar çekilirken bir hata oluştu.");
    }

    btn.innerText = "⟳ Fiyatları Çek";
    btn.disabled = false;
    calculateGlobal();
}
