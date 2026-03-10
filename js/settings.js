// settings.js - Theme selector, server, and about/update features

const THEMES = [
    { id: 'default', label: 'Dark Gold', accent: '#f59e0b', bg: '#101318' },
    { id: 'blue', label: 'Deep Blue', accent: '#64ffda', bg: '#0a192f' },
    { id: 'green', label: 'Cyber Green', accent: '#00ff00', bg: '#050505' },
    { id: 'purple', label: 'Dracula', accent: '#bd93f9', bg: '#282a36' },
    { id: 'light', label: 'Light', accent: '#2563eb', bg: '#f0f2f5' },
    { id: 'crimson', label: 'Crimson', accent: '#ef4444', bg: '#0f0a0a' },
    { id: 'teal', label: 'Teal', accent: '#14b8a6', bg: '#042f2e' },
    { id: 'amber', label: 'Amber', accent: '#f97316', bg: '#0c0a03' },
    { id: 'neon', label: 'Midnight Neon', accent: '#8b5cf6', bg: '#020617' },
    { id: 'obsidian', label: 'Obsidian Premium', accent: '#d4af37', bg: '#0a0a0a' },
];

const LANGS = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

function initSettings() {
    buildLangGrid();
    buildThemeGrid();
    loadSavedSettings();
}

function buildLangGrid() {
    const grid = document.getElementById('lang-grid');
    if (!grid) return;
    grid.innerHTML = '';
    LANGS.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = `lang-btn ${currentLang === lang.code ? 'active' : ''}`;
        btn.dataset.lang = lang.code;
        btn.innerHTML = `<span class="lang-flag">${lang.flag}</span><span class="lang-name">${lang.label}</span>`;
        btn.onclick = () => {
            window.I18n.setLanguage(lang.code);
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            saveSettings();
            // re-apply after nav click so placeholders update
            applyTranslations();
        };
        grid.appendChild(btn);
    });
}

function buildThemeGrid() {
    const grid = document.getElementById('theme-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const savedTheme = localStorage.getItem('albion-theme') || 'default';
    THEMES.forEach(theme => {
        const card = document.createElement('div');
        card.className = `theme-card ${savedTheme === theme.id ? 'selected' : ''}`;
        card.dataset.theme = theme.id;
        card.innerHTML = `
            <div class="theme-preview" style="background:${theme.bg}; border: 3px solid ${theme.accent}">
                <div style="background:${theme.accent}; height:6px; border-radius:2px; margin-bottom:4px"></div>
                <div style="background:${theme.accent}33; height:3px; border-radius:2px; margin-bottom:2px"></div>
                <div style="background:${theme.accent}22; height:3px; border-radius:2px"></div>
            </div>
            <span class="theme-name">${theme.label}</span>
        `;
        card.onclick = () => {
            applyTheme(theme.id);
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            saveSettings();
        };
        grid.appendChild(card);
    });
}

function applyTheme(themeId) {
    document.body.setAttribute('data-theme', themeId);
    localStorage.setItem('albion-theme', themeId);
}

function setServer(val) {
    console.log('[Settings] Sunucu değiştiriliyor:', val);
    localStorage.setItem('albion-server', val);

    // Ayarlar ve KillBoard butonlarını güncelle
    document.querySelectorAll('#server-toggle button, #kb-server-toggle button').forEach(b => {
        b.classList.toggle('active', b.dataset.val === val);
    });

    // Update API base URL
    const servers = {
        west: 'https://west.albion-online-data.com/api/v2/stats',
        east: 'https://east.albion-online-data.com/api/v2/stats',
        europe: 'https://europe.albion-online-data.com/api/v2/stats',
    };
    if (window.ApiService) window.ApiService.BASE_URL = servers[val] || servers.west;

    // KillBoard'ı yenile
    if (typeof window.loadKillboard === 'function') {
        window.loadKillboard();
    }
}

function applyDefaultSettings() {
    const tax = parseFloat(document.getElementById('s-tax-sell').value);
    const premium = parseFloat(document.getElementById('s-bonus-premium').value);
    if (!isNaN(tax)) document.getElementById('tax-sell').value = tax;
    if (!isNaN(premium)) document.getElementById('bonus-premium').value = premium;
    saveSettings();
    showToast('✅ Ayarlar uygulandı!');
}

function saveSettings() {
    const settings = {
        lang: window.I18n.currentLang(),
        theme: document.body.getAttribute('data-theme') || 'default',
        server: localStorage.getItem('albion-server') || 'west',
        taxSell: document.getElementById('tax-sell')?.value || '4.5',
        premiumBonus: document.getElementById('bonus-premium')?.value || '15.2',
    };
    localStorage.setItem('albion-settings', JSON.stringify(settings));
}

function loadSavedSettings() {
    const raw = localStorage.getItem('albion-settings');
    const saved = raw ? JSON.parse(raw) : {};

    // Theme
    const theme = saved.theme || localStorage.getItem('albion-theme') || 'default';
    applyTheme(theme);

    // Server
    const server = saved.server || 'west';
    setServer(server);

    // Tax/Premium
    if (saved.taxSell && document.getElementById('tax-sell')) {
        document.getElementById('tax-sell').value = saved.taxSell;
    }
    if (saved.premiumBonus && document.getElementById('bonus-premium')) {
        document.getElementById('bonus-premium').value = saved.premiumBonus;
    }
    // Sync settings tab inputs
    if (document.getElementById('s-tax-sell')) {
        document.getElementById('s-tax-sell').value = saved.taxSell || '4.5';
        document.getElementById('s-bonus-premium').value = saved.premiumBonus || '15.2';
    }

    // Last update info
    const lastUpdate = localStorage.getItem('albion-last-update');
    const el = document.getElementById('about-last-update');
    if (el) el.textContent = lastUpdate || 'Bilinmiyor';
}

function exportSettings() {
    saveSettings();
    const settings = localStorage.getItem('albion-settings');
    const blob = new Blob([settings], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'albion-settings.json';
    a.click();
}

function resetSettings() {
    if (!confirm('Tüm ayarlar sıfırlanacak. Emin misiniz?')) return;
    localStorage.removeItem('albion-settings');
    localStorage.removeItem('albion-theme');
    localStorage.removeItem('albion-lang');
    localStorage.removeItem('albion-server');
    applyTheme('default');
    window.I18n.setLanguage('tr');
    setServer('west');
    buildLangGrid();
    buildThemeGrid();
    showToast('🔃 Ayarlar sıfırlandı.');
}

async function checkForUpdates() {
    const btn = document.getElementById('btn-check-update');
    const log = document.getElementById('update-log');
    if (!btn || !log) return;

    btn.disabled = true;
    btn.innerHTML = '⏳ Kontrol ediliyor...';
    log.style.display = 'block';
    log.innerHTML = '<div class="update-entry">🔄 Albion Online item listesi kontrol ediliyor...</div>';

    try {
        // Fetch item list from Albion's asset CDN
        const res = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json');
        const items = await res.json();

        const currentDB = window.AppDB;
        const dbIds = new Set();
        if (currentDB) {
            for (const mainCat of Object.values(currentDB)) {
                for (const subCat of Object.values(mainCat)) {
                    for (const item of subCat) {
                        dbIds.add(item.id);
                    }
                }
            }
        }

        // Count items in the fetched list
        const totalOnline = items.length || '?';
        const totalLocal = dbIds.size;

        const newItems = [];
        if (Array.isArray(items)) {
            items.slice(0, 5000).forEach(item => {
                const id = item.UniqueName || item.uniqueName;
                if (id && !dbIds.has(id) && (id.includes('_SWORD') || id.includes('_ARMOR') || id.includes('_BOW'))) {
                    newItems.push(id);
                }
            });
        }

        const now = new Date().toLocaleString('tr-TR');
        localStorage.setItem('albion-last-update', now);
        document.getElementById('about-last-update').textContent = now;

        log.innerHTML = `
            <div class="update-entry success">✅ Kontrol tamamlandı — ${now}</div>
            <div class="update-entry">📦 Online item sayısı: <strong>${totalOnline}</strong></div>
            <div class="update-entry">📥 Yerel DB item sayısı: <strong>${totalLocal}</strong></div>
            ${newItems.length > 0
                ? `<div class="update-entry warning">⚠️ ${newItems.length} potansiyel yeni eşya tespit edildi. build-db.js'yi yeniden çalıştırın.</div>
                   <div class="update-entry" style="font-size:11px; color: var(--text-muted)">${newItems.slice(0, 10).join(', ')}${newItems.length > 10 ? '...' : ''}</div>`
                : '<div class="update-entry success">✅ Veritabanınız güncel görünüyor!</div>'
            }
        `;
    } catch (e) {
        log.innerHTML = `<div class="update-entry error">❌ Güncelleme kontrolü başarısız: ${e.message}</div>`;
    }

    btn.disabled = false;
    btn.innerHTML = '🔄 <span>Yeni Eşyaları Kontrol Et</span>';
}

function showToast(msg) {
    let toast = document.getElementById('toast-notif');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notif';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast-notif visible';
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

window.initSettings = initSettings;
window.applyTheme = applyTheme;
window.setServer = setServer;
window.applyDefaultSettings = applyDefaultSettings;
window.exportSettings = exportSettings;
window.resetSettings = resetSettings;
window.checkForUpdates = checkForUpdates;
window.showToast = showToast;
window.THEMES = THEMES;
window.LANGS = LANGS;
