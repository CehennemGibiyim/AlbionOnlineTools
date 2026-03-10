# Albion Tools - Kapsamlı API Entegrasyon Planı

## 📡 MEVCUT API ENDPOINTS (Albion Online Data Project)

### 1. **Price & Market Data**
- `GET /api/v2/stats/prices/{item_id}` - Şehir bazlı aktif fiyatlar
- `GET /api/v2/stats/history/{item_id}` - Fiyat geçmişi (timescale: 1/7/24)
- `GET /api/v2/stats/gold` - Gold ↔ Silver dönüşüm oranı

### 2. **Player & Guild Stats**
- `GET /api/v2/players?name={player_name}` - Oyuncu bilgisi
- `GET /api/v2/players/{player_id}` - Detailed oyuncu stats
- `GET /api/v2/guilds?name={guild_name}` - Guild bilgisi
- `GET /api/v2/guilds/{guild_id}` - Guild detayları

### 3. **Kill & Death Events**
- `GET /api/v2/events` - Son PvP events (kills, deaths)
- `GET /api/v2/events/{event_id}` - Event detayları
- Filters: player_name, guild_id, location, timestamp range

### 4. **Territory & War Data**
- `GET /api/v2/clusters` - Harita alanları (cluster info)
- `GET /api/v2/territories` - Territory bilgileri (guild owner, status)
- `GET /api/v2/wars` - Active savaşlar

### 5. **Server Status**
- `GET /api/v2/servers/info` - Server durumu (up/down)
- `GET /api/v2/servers/online` - Online oyuncu sayısı

### 6. **Search & Autocomplete**
- `GET /api/v2/search` - Global arama (items, players, guilds)

---

## 🎯 YENI PANEL PLANI

### Panel 1: **Guild Wars Analytics** ⚔️
- Guild stats (kills, fame, losses)
- War history
- Member list performance
- Territory holdings
- Win/loss ratio trends

### Panel 2: **Territory Control Map** 🗺️
- Real-time harita
- Guild territories
- War zones
- Market hubs
- Claimed vs unclaimed

### Panel 3: **Battle Analytics & Hot Zones** 🔥
- Active PvP events real-time
- Hot zones (en çok kill/death)
- Fame farming zones
- Dungeon activity
- Suggested gank spots

### Panel 4: **Player Rankings & Leaderboards** 🏆
- Top killers
- Top wealth (estimated from items)
- Most deaths
- Fame leaderboards
- Guild rankings

### Panel 5: **Resource Market Tracker** 📊
- Tier-wise pricing (T4-T8)
- Enchantment level tracking
- Profit margins by enchant
- Trend analysis
- Price alert system

### Panel 6: **Loot Calculator** 💰
- Mob drop rates
- Dungeon loot tables
- Farming profit/hour
- Best farming zones
- Risk vs reward analysis

### Panel 7: **Enchantment & Artifact ROI** ✨
- Enchantment cost calculator
- Artifact refund rates
- ROI by tier/enchant
- Material cost breakdown
- Success rate analysis

---

## 🔧 TEKNIK STACK

**Frontend:**
- Chart.js (existing) ✅
- D3.js (harita visualizasyonu) - YENİ
- Socket.io (real-time updates) - YENİ
- Service Workers (offline cache) - YENİ

**Backend (Node.js):**
- Express routes (existing) ✅
- Cron jobs (hourly API sync) - YENİ
- Redis (caching) - OPTIONAL
- WebSocket (real-time) - YENİ

---

## 📋 IMPLEMENTATION ORDER

1. ✅ Bug fixes & UX improvements (mevcut görevler)
2. ✅ Guild Wars Panel
3. ✅ Territory Map Panel
4. ✅ Battle Analytics
5. ✅ Player Rankings
6. ✅ Resource Tracker
7. ✅ Loot Calculator
8. ✅ Enchantment ROI

---

## 🚀 QUICK START

Başlamak için:
1. API endpoints test etme
2. Her panel için ayrı JS dosyası oluşturma
3. Backend route'ları ekleme
4. Frontend HTML panelleri ekleme
5. Real-time updates (WebSocket) kurma
