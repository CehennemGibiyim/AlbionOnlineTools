# 📡 Albion Online API - KAPSAMLI ARAŞTIRMA & DOKUMENTASYON

## 🌐 API KAYNAKLAR

### Birincil Kaynaklar:
1. **Albion Online Data Project** - `https://www.albion-online-data.com/`
   - Public API (CORS enabled)
   - Ratelimit: ~60 requests/minute
   - Response: JSON

2. **GameInfo API** - `https://gameinfo.albiononline.com/`
   - Official Albion API
   - Requires authentication for some endpoints
   - Real-time events, kills, guilds

3. **Server Status** - `https://status.albiononline.com/`
   - Server uptime
   - Maintenance schedules
   - Online player counts

---

## 📊 PRICE & MARKET DATA API

### Base URLs:
```
West: https://west.albion-online-data.com/api/v2/stats
East: https://east.albion-online-data.com/api/v2/stats
Europe: https://europe.albion-online-data.com/api/v2/stats
```

### 1. GET /prices/{item_id}
**Current Market Prices by City**
```
Endpoint: /prices/T4_2HSWORD_CLARENT
Query Params:
  - locations: Caerleon,Bridgewatch,FortSterling (comma-separated)
  - qualities: 1,2,3,4,5 (optional, defaults to 1)

Response Example:
[
  {
    city: "Caerleon",
    quality: 1,
    sell_price_min: 45230,
    sell_price_max: 48900,
    buy_price_min: 43100,
    buy_price_max: 46500,
    sell_price_min_date: "2024-01-15T12:34:56Z",
    buy_price_max_date: "2024-01-15T12:40:00Z"
  }
]

Usage: Market pricing, arbitrage detection, sell price suggestions
```

### 2. GET /history/{item_id}
**Historical Price Data**
```
Query Params:
  - time-scale: 1 (daily) | 7 (weekly) | 24 (monthly)
  - count: 100 (number of datapoints)
  - locations: Caerleon (single or multiple)

Response Example:
[
  {
    location: "Caerleon",
    data: [
      {
        timestamp: "2024-01-15T00:00:00Z",
        avg_price: 45600,
        min_price: 44200,
        max_price: 47100,
        volume: 1250
      }
    ]
  }
]

Usage: Price trends, market analysis, profit forecasting
```

### 3. GET /gold
**Gold Price (Silver Conversion Rate)**
```
Query Params:
  - count: 168 (hours of data, default 7 days * 24)

Response Example:
[
  {
    price: 3250,
    timestamp: "2024-01-15T12:00:00Z"
  }
]

Usage: Premium cost calculations, gold trading
```

### 4. GET /items
**All Available Items**
```
Response: Array of all items with:
  - id: T4_2HSWORD_CLARENT
  - name: Clarent Blade
  - tier: 4
  - enchantment: 0
  - category: 2HSwords
  - subcategory: Swords
  - rarity: 0 (normal) to 5 (legendary)

Usage: Database building, autocomplete, item validation
```

---

## 💀 EVENTS & KILLBOARD API

### Base URL: https://gameinfo.albiononline.com/api/gameinfo

### 1. GET /events
**Recent PvP Kill Events**
```
Query Params:
  - limit: 50
  - offset: 0
  - sortBy: EventId (default)
  - sortDirection: Descending

Response Example:
[
  {
    EventId: 123456789,
    TimeStamp: "2024-01-15T15:30:45Z",
    Killer: {
      Name: "PlayerName",
      Id: 12345,
      GuildName: "GuildTag",
      GuildId: 999,
      AllianceId: 0,
      AllianceName: "",
      Avatar: "url_to_image",
      AvatarRing: "ring_image_url"
    },
    Victim: {
      Name: "VictimName",
      Id: 54321,
      GuildName: "OtherGuild",
      GuildId: 888,
      AllianceId: 0
    },
    Location: "Blackpeak Strait",
    Participants: [
      {
        Name: "Participant1",
        Damage: 15000,
        KilledCount: 0,
        DeadCount: 0
      }
    ],
    TotalVictimKillFame: 450000,
    TotalKillerKillFame: 450000,
    TotalFame: 900000
  }
]

Usage: Killboard, battle tracking, hot zone detection
```

### 2. GET /players
**Player Search**
```
Query Params:
  - name: PlayerName

Response Example:
[
  {
    Id: 12345,
    Name: "PlayerName",
    Guild: {
      Id: 999,
      Name: "GuildName",
      AllianceId: 0
    },
    LifeTimeStatistics: {
      PvpKills: 1250,
      PvpDeaths: 340,
      Fame: 12500000
    }
  }
]

Usage: Player lookup, stat tracking
```

### 3. GET /guilds
**Guild Search & Info**
```
Query Params:
  - name: GuildName

Response Example:
[
  {
    Id: 999,
    Name: "GuildName",
    AllianceId: 0,
    AllianceName: "",
    Leader: {
      Id: 12345,
      Name: "LeaderName"
    },
    Founded: "2022-06-15T10:30:00Z",
    Members: [
      {
        Id: 12345,
        Name: "MemberName",
        JoinedAt: "2023-01-20T08:00:00Z",
        Role: "officer"
      }
    ]
  }
]

Usage: Guild analytics, member tracking
```

### 4. GET /wars
**Territory Wars (If Available)**
```
Potential Response:
[
  {
    WarId: 555,
    AttackerGuild: "Attacker Guild",
    DefenderGuild: "Defender Guild",
    Territory: "Avermere",
    StartTime: "2024-01-20T15:00:00Z",
    EndTime: "2024-01-20T16:00:00Z",
    Status: "Active" | "Scheduled" | "Completed",
    AttackerScore: 5,
    DefenderScore: 3
  }
]

Usage: Territory tracking, war scheduling
```

---

## 🗺️ TERRITORY CONTROL API

### Territory Endpoints (via gameinfo):
```
GET /api/gameinfo/territories
- Returns all territories with current owners
- Fields: id, name, zone, owner (guild), status

GET /api/gameinfo/territories/{territory_id}
- Detailed territory info
- Historical ownership
- War schedules
```

---

## 📈 SERVER & CAPACITY DATA

### 1. GET /servers/info
**Server Status**
```
Response:
{
  serverId: 1,
  name: "Europe",
  status: "Online" | "Maintenance",
  currentPlayers: 2500,
  maxPlayers: 5000,
  region: "EU",
  lastUpdated: "2024-01-15T15:30:00Z"
}

Usage: Server selection, queue monitoring
```

### 2. GET /servers/online
**Online Player Count**
```
Response:
{
  totalOnline: 12500,
  byServer: {
    west: 4000,
    east: 3500,
    europe: 5000
  },
  timestamp: "2024-01-15T15:30:00Z"
}

Usage: Peak time detection, activity monitoring
```

---

## 🎯 LOOT DISTRIBUTION DATA

### Potential Sources:
1. **Wiki Community Data** - `https://wiki.albiononline.com/`
   - Manually curated loot tables
   - Mob drop rates
   - Dungeon boss drops

2. **Player-Collected Data** - Third-party APIs
   - Drop rate statistics
   - Farming efficiency reports

### Structure (To Be Built):
```javascript
{
  mobId: "MOB_T4_ELEMENTALGOLEM",
  mobName: "Elemental Golem",
  drops: [
    {
      itemId: "T4_CLOTH_CLOTH_STARTER",
      itemName: "Starter Cloth",
      dropRate: 0.15, // 15%
      quantity: "1-3",
      rarity: "common"
    }
  ],
  location: "Royal Valleys",
  tier: 4,
  difficulty: "medium",
  avgKillTime: 45, // seconds
  lootPerKill: 5000 // silver value
}
```

---

## 🔄 RATE LIMITING & BEST PRACTICES

### Rate Limits:
- Albion Data Project: ~60 requests/minute
- GameInfo API: ~100 requests/minute
- Recommended: Implement exponential backoff

### Caching Strategy:
```javascript
// Cache durations (recommended)
prices: 5 minutes
history: 1 hour
events: 30 seconds (real-time feel)
guilds: 24 hours
players: 12 hours
```

### Headers:
```
User-Agent: AlbionTools/2.0 (Discord: AlbionTools#1234)
Accept: application/json
Accept-Encoding: gzip
```

---

## 🛠️ IMPLEMENTATION ENDPOINTS

### Proxy Server Implementation:
```bash
GET /api/prices/{item_id}
  → Proxy to: https://west.albion-online-data.com/api/v2/stats/prices/{item_id}

GET /api/history/{item_id}
  → Proxy to: https://west.albion-online-data.com/api/v2/stats/history/{item_id}

GET /api/gold
  → Proxy to: https://west.albion-online-data.com/api/v2/stats/gold

GET /api/events
  → Proxy to: https://gameinfo.albiononline.com/api/gameinfo/events

GET /api/players/:name
  → Proxy to: https://gameinfo.albiononline.com/api/gameinfo/players?name={name}

GET /api/guilds/:name
  → Proxy to: https://gameinfo.albiononline.com/api/gameinfo/guilds?name={name}
```

---

## 📋 FUTURE API OPPORTUNITIES

1. **Leaderboards** - Top players, guilds, alliances
2. **Achievement System** - Player accomplishments
3. **Trading Post** - Historical sales data
4. **Crafting Recipes** - Material requirements (from wiki)
5. **Server Queues** - Queue times by time of day
6. **Seasonal Events** - Event schedules, rewards
7. **Patch Notes** - Balance changes, updates
8. **Item Rarity** - Drop rate statistics

---

## ⚠️ API NOTES

- **No Official Authentication**: Most endpoints are public
- **CORS Enabled**: Can call from frontend with proxy
- **Rate Limiting**: Respectful usage recommended
- **Data Freshness**: Updates every 30 min to 1 hour
- **Timezone**: All times in UTC
- **Encoding**: UTF-8 JSON responses

---

## 📚 REFERENCES

- Albion Online Data Project: https://www.albion-online-data.com/
- GameInfo API: https://gameinfo.albiononline.com/
- Albion Wiki: https://wiki.albiononline.com/
- Server Status: https://status.albiononline.com/
