const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Routes

// ========== ALBION ONLINE DATA API PROXY ==========
// Proxy Albion Online Data Project endpoints to avoid CORS
app.get('/api/albion/*', async (req, res) => {
    try {
        const path = req.path.replace('/api/albion', '');
        const server = req.query.server || 'west';
        const baseUrls = {
            west: 'https://west.albion-online-data.com/api/v2/stats',
            east: 'https://east.albion-online-data.com/api/v2/stats',
            europe: 'https://europe.albion-online-data.com/api/v2/stats'
        };
        
        const url = `${baseUrls[server] || baseUrls.west}${path}?${new URLSearchParams(req.query).toString()}`;
        console.log('[PROXY] API:', url);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { timeout: 10000 });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: `API returned ${response.status}` });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('[PROXY] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========== GAMEINFO API PROXY ==========
// Proxy gameinfo.albiononline.com endpoints (kills, events, guilds)
app.get('/api/gameinfo/*', async (req, res) => {
    try {
        const path = req.path.replace('/api/gameinfo', '');
        const url = `https://gameinfo.albiononline.com/api/gameinfo${path}?${new URLSearchParams(req.query).toString()}`;
        console.log('[GAMEINFO] API:', url);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { timeout: 15000 });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: `GameInfo returned ${response.status}` });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('[GAMEINFO] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========== KILLBOARD / EVENTS ==========
app.get('/api/events', async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const url = `https://gameinfo.albiononline.com/api/gameinfo/events?limit=${limit}&offset=${offset}`;
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('[EVENTS] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Player stats
app.get('/api/players/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const url = `https://gameinfo.albiononline.com/api/gameinfo/players?name=${encodeURIComponent(name)}`;
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('[PLAYERS] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Guild stats
app.get('/api/guilds/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const url = `https://gameinfo.albiononline.com/api/gameinfo/guilds?name=${encodeURIComponent(name)}`;
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('[GUILDS] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========== LOCAL DATABASE ==========
app.get('/api/db', (req, res) => {
    try {
        const dbPath = path.join(__dirname, 'data', 'db.json');
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Database not found' });
        }
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        res.json(db);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// ========== SEARCH MULTI ==========
// Combined search for items, players, guilds
app.get('/api/search', async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;
        if (!q || q.length < 2) {
            return res.json({ items: [], players: [], guilds: [] });
        }
        
        const results = { items: [], players: [], guilds: [] };
        const fetch = (await import('node-fetch')).default;
        
        // Search players
        if (type === 'all' || type === 'player') {
            try {
                const playerRes = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/players?name=${encodeURIComponent(q)}`, { timeout: 5000 });
                if (playerRes.ok) {
                    results.players = await playerRes.json();
                }
            } catch (e) { console.error('[SEARCH] Player search failed:', e.message); }
        }
        
        // Search guilds
        if (type === 'all' || type === 'guild') {
            try {
                const guildRes = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/guilds?name=${encodeURIComponent(q)}`, { timeout: 5000 });
                if (guildRes.ok) {
                    results.guilds = await guildRes.json();
                }
            } catch (e) { console.error('[SEARCH] Guild search failed:', e.message); }
        }
        
        res.json(results);
    } catch (error) {
        console.error('[SEARCH] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========== SPA ROUTING ==========
app.get('*', (req, res) => {
    // API endpoint'leri hariç SPA'yı serve et
    if (req.path.startsWith('/api') || req.path.startsWith('/css') || req.path.startsWith('/js') || req.path.startsWith('/data')) {
        return res.status(404).json({ error: 'Not found' });
    }
    
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html not found');
    }
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ========== SERVER START ==========
const server = app.listen(PORT, () => {
    console.log(`✅ Albion Tools Web Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`📂 Serving from: ${__dirname}`);
    console.log(`🔌 API Endpoints:`);
    console.log(`   - /api/albion/* - Albion Online Data Project proxy`);
    console.log(`   - /api/gameinfo/* - GameInfo API proxy`);
    console.log(`   - /api/events - Recent PvP events`);
    console.log(`   - /api/players/:name - Player stats`);
    console.log(`   - /api/guilds/:name - Guild stats`);
    console.log(`   - /api/search - Multi-search`);
    console.log(`   - /api/db - Local database`);
    if (NODE_ENV === 'development') {
        console.log('💡 Hot-reload available. Changes to files will be reflected.');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹️  Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
