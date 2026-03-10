// killboard.js - SIFIRDAN YENI CALISAN VERSIYON
// Basit ve garantili çözüm

const KB_API = 'https://gameinfo.albiononline.com/api/gameinfo';

let currentServer = 'west';

function initKillboard() {
    console.log('[KB] KillBoard başlatılıyor...');
    
    // Sunucu seçimi
    currentServer = localStorage.getItem('albion-server') || 'west';
    
    // Arama inputu
    const searchInput = document.getElementById('kb-player-search');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchPlayer(query);
                } else {
                    loadRecentKills();
                }
            }
        });
    }
    
    // Sunucu butonları
    setupServerButtons();
    
    // Son kill'leri yükle
    loadRecentKills();
}

function setupServerButtons() {
    console.log('[KB] Sunucu butonları ayarlanıyor...');
    
    const buttons = document.querySelectorAll('#kb-server-toggle button');
    buttons.forEach(function(btn) {
        btn.onclick = function() {
            const server = btn.dataset.val;
            setServer(server);
        };
    });
    
    updateServerButtons();
}

function setServer(server) {
    console.log('[KB] Sunucu değiştiriliyor:', server);
    currentServer = server;
    localStorage.setItem('albion-server', server);
    updateServerButtons();
    loadRecentKills();
}

// setKbServer alias'i ekle
function setKbServer(server) {
    setServer(server);
}

function updateServerButtons() {
    const buttons = document.querySelectorAll('#kb-server-toggle button');
    buttons.forEach(function(btn) {
        if (btn.dataset.val === currentServer) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function loadRecentKills() {
    const container = document.getElementById('killboard-container');
    if (!container) return;
    
    container.innerHTML = '<div style="padding:20px; text-align:center;">Yükleniyor...</div>';
    
    try {
        console.log('[KB] API çağrısı:', KB_API + '/events?limit=20&offset=0');
        const response = await fetch(KB_API + '/events?limit=20&offset=0');
        
        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        
        const data = await response.json();
        console.log('[KB] API yanıtı:', data);
        
        if (data && data.length > 0) {
            displayKills(data);
        } else {
            container.innerHTML = '<div style="padding:20px; text-align:center;">Kill verisi bulunamadı.</div>';
        }
    } catch (error) {
        console.error('[KB] Hata detayı:', error);
        container.innerHTML = '<div style="padding:20px; text-align:center;">Hata: ' + error.message + '<br><small>API: ' + KB_API + '</small></div>';
    }
}

async function searchPlayer(query) {
    const container = document.getElementById('killboard-container');
    if (!container) return;
    
    container.innerHTML = '<div style="padding:20px; text-align:center;">"' + query + '" aranıyor...</div>';
    
    try {
        // Events API'den oyuncu ara
        const response = await fetch(KB_API + '/search?q=' + encodeURIComponent(query));
        const searchData = await response.json();
        
        const playerEvents = searchData.map(function(eventId) {
            return fetch(KB_API + '/events/' + eventId).then(response => response.json());
        });
        
        const allEvents = await Promise.all(playerEvents);
        
        // Oyuncunun kill'lerini bul
        const playerEventsFiltered = allEvents.filter(function(event) {
            return (event.Killer && event.Killer.Name === query) || 
                   (event.Victim && event.Victim.Name === query);
        });
        
        if (playerEvents.length > 0) {
            displayPlayerResults(query, playerEvents);
        } else {
            container.innerHTML = '<div style="padding:20px; text-align:center;">"' + query + '" bulunamadı.</div>';
        }
    } catch (error) {
        console.error('[KB] Arama hatası:', error);
        container.innerHTML = '<div style="padding:20px; text-align:center;">Arama hatası: ' + error.message + '</div>';
    }
}

function displayKills(kills) {
    const container = document.getElementById('killboard-container');
    
    let html = '<div style="padding:15px;">';
    html += '<h3>💀 Son Kill\'ler</h3>';
    
    kills.forEach(function(kill) {
        const killer = kill.Killer || {};
        const victim = kill.Victim || {};
        const fame = kill.TotalVictimKillFame || 0;
        const location = kill.Location || 'Bilinmiyor';
        const time = new Date(kill.TimeStamp).toLocaleString('tr-TR');
        
        html += '<div style="border:1px solid #333; margin:10px 0; padding:10px; border-radius:5px;">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        html += '<div>';
        html += '<strong>💀 ' + (killer.Name || 'Bilinmiyor') + '</strong>';
        if (killer.GuildName) html += ' [' + killer.GuildName + ']';
        html += ' vs ';
        html += '<strong>☠️ ' + (victim.Name || 'Bilinmiyor') + '</strong>';
        if (victim.GuildName) html += ' [' + victim.GuildName + ']';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div>💰 ' + fame.toLocaleString('tr-TR') + ' Fame</div>';
        html += '<div>📍 ' + location + '</div>';
        html += '<div>⏰ ' + time + '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function displayPlayerResults(query, events) {
    const container = document.getElementById('killboard-container');
    
    // İstatistikleri hesapla
    const kills = events.filter(e => e.Killer && e.Killer.Name === query);
    const deaths = events.filter(e => e.Victim && e.Victim.Name === query);
    
    const totalKillFame = kills.reduce((sum, e) => sum + (e.TotalVictimKillFame || 0), 0);
    const totalDeathFame = deaths.reduce((sum, e) => sum + (e.TotalVictimKillFame || 0), 0);
    
    let html = '<div style="padding:15px;">';
    html += '<h3>🔍 ' + query + ' - Oyuncu Bilgileri</h3>';
    
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin:20px 0;">';
    html += '<div><strong>💀 Kill Fame:</strong><br>' + totalKillFame.toLocaleString('tr-TR') + '</div>';
    html += '<div><strong>☠️ Death Fame:</strong><br>' + totalDeathFame.toLocaleString('tr-TR') + '</div>';
    html += '<div><strong>⚔️ Kill/Death:</strong><br>' + kills.length + '/' + deaths.length + '</div>';
    html += '<div><strong>📊 K/D Oranı:</strong><br>' + (deaths.length > 0 ? (kills.length/deaths.length).toFixed(2) : '∞') + '</div>';
    html += '</div>';
    
    html += '<h4>📋 Son Kayıtlar</h4>';
    
    events.slice(0, 10).forEach(function(event) {
        const isKill = event.Killer && event.Killer.Name === query;
        const opponent = isKill ? event.Victim : event.Killer;
        const fame = event.TotalVictimKillFame || 0;
        const time = new Date(event.TimeStamp).toLocaleString('tr-TR');
        
        html += '<div style="border:1px solid #333; margin:10px 0; padding:10px; border-radius:5px;">';
        html += '<div style="color:' + (isKill ? '#4CAF50' : '#F44336') + ';">';
        html += '<strong>' + (isKill ? '💀 KILL' : '☠️ DEATH') + '</strong> ';
        html += (opponent ? opponent.Name : 'Bilinmiyor');
        if (opponent && opponent.GuildName) html += ' [' + opponent.GuildName + ']';
        html += '</div>';
        html += '<div style="margin-top:5px;">';
        html += '💰 ' + fame.toLocaleString('tr-TR') + ' Fame | 📍 ' + (event.Location || 'Bilinmiyor') + ' | ⏰ ' + time;
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Global olarak export et
window.initKillboard = initKillboard;
window.searchKillboard = searchPlayer;
window.setKbServer = setServer;
window.loadKillboard = loadRecentKills;
