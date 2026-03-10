let fs, path, https, dbFile;

// Check if running in Electron/Node environment
if (typeof require !== 'undefined') {
    fs = require('fs');
    path = require('path');
    https = require('https');

    let appRoot = path.join(__dirname, '..');
    if (!fs.existsSync(path.join(appRoot, 'data', 'db.json'))) {
        appRoot = path.join(process.resourcesPath, 'app');
    }
    if (!fs.existsSync(path.join(appRoot, 'data', 'db.json'))) {
        appRoot = process.cwd();
    }
    const dataDir = path.join(appRoot, 'data');
    dbFile = path.join(dataDir, 'db.json');
}


const ApiService = {
    BASE_URL: 'https://www.albion-online-data.com/api/v2/stats',

    async getPrices(itemsArray, locationsArray = []) {
        if (!itemsArray || itemsArray.length === 0) return [];
        // The API actually fails if the URL is too long. We should chunk requests if > 50 items.
        // For now, chunk into batches of 50
        const chunkSize = 50;
        let allResults = [];

        for (let i = 0; i < itemsArray.length; i += chunkSize) {
            const chunk = itemsArray.slice(i, i + chunkSize);
            const itemsStr = chunk.join(',');

            let url = `${this.BASE_URL}/prices/${itemsStr}`;
            if (locationsArray.length > 0) {
                url += `?locations=${locationsArray.join(',')}`;
            }

            try {
                const res = await this._fetchJson(url);
                if (Array.isArray(res)) allResults = allResults.concat(res);
            } catch (e) {
                console.error("Chunk fail", e);
            }
        }

        return allResults;
    },

    async getLocalDatabase() {
        // If we are in a web browser (GitHub Pages doesn't have require)
        if (typeof window !== 'undefined' && typeof window.require === 'undefined') {
            try {
                // Önce tam veritabanını dene
                try {
                    const fullRes = await fetch('data/db-complete.json');
                    const fullDb = await fullRes.json();
                    window.FullAppDB = fullDb;
                    window.AppDB = fullDb; // Tam veritabanını ana veritabanı yap
                    console.log('[API] TAM veritabanı yüklendi:', Object.keys(fullDb).length, 'kategori');
                } catch (e) {
                    console.log('[API] Tam veritabanı bulunamadı, standart veritabanı kullanılıyor');
                }
                
                // Sınıf veritabanını yükle
                try {
                    const classRes = await fetch('data/db-classes.json');
                    const classDb = await classRes.json();
                    window.ClassDB = classDb;
                    console.log('[API] SINIF veritabanı yüklendi:', Object.keys(classDb).length, 'sınıf');
                } catch (e) {
                    console.log('[API] Sınıf veritabanı bulunamadı');
                }
                
                // Standart veritabanını yükle (geriye dönük uyumluluk)
                const res = await fetch('data/db.json');
                const db = await res.json();
                if (!window.AppDB) window.AppDB = db;
                return db;
            } catch (e) {
                console.error("Fetch DB error:", e);
                return null;
            }
        }

        // Otherwise we are in Electron / Node
        const fs = require('fs');
        const dbPath = typeof window !== 'undefined' && window.process ? dbFile : 'data/db.json';
        const fullDbPath = typeof window !== 'undefined' && window.process ? 
            path.join(path.dirname(dbFile), 'db-complete.json') : 'data/db-complete.json';
        const classDbPath = typeof window !== 'undefined' && window.process ? 
            path.join(path.dirname(dbFile), 'db-classes.json') : 'data/db-classes.json';

        // Tam veritabanını yükle
        if (fs.existsSync(fullDbPath)) {
            try {
                const fullData = fs.readFileSync(fullDbPath, 'utf8');
                const fullDb = JSON.parse(fullData);
                if (typeof window !== 'undefined') {
                    window.FullAppDB = fullDb;
                    window.AppDB = fullDb; // Tam veritabanını ana veritabanı yap
                }
                console.log('[API] TAM veritabanı yüklendi (Node):', Object.keys(fullDb).length, 'kategori');
            } catch (e) {
                console.error("Error parsing full DB:", e);
            }
        }

        // Sınıf veritabanını yükle
        if (fs.existsSync(classDbPath)) {
            try {
                const classData = fs.readFileSync(classDbPath, 'utf8');
                const classDb = JSON.parse(classData);
                if (typeof window !== 'undefined') {
                    window.ClassDB = classDb;
                }
                console.log('[API] SINIF veritabanı yüklendi (Node):', Object.keys(classDb).length, 'sınıf');
            } catch (e) {
                console.error("Error parsing class DB:", e);
            }
        }

        // Standart veritabanını yükle
        if (fs.existsSync(dbPath)) {
            try {
                const data = fs.readFileSync(dbPath, 'utf8');
                const db = JSON.parse(data);
                if (typeof window !== 'undefined' && !window.AppDB) {
                    window.AppDB = db;
                }
                return db;
            } catch (e) {
                console.error("Error parsing local DB:", e);
                return null;
            }
        }
        return null;
    },

    _fetchJson(url) {
        // Browser compatible fetch
        if (typeof window !== 'undefined' && typeof window.require === 'undefined') {
            return fetch(url).then(r => r.json());
        }

        // Node / Electron compatible https
        const https = require('https');
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }
};

window.ApiService = ApiService;
