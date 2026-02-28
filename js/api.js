const fs = require('fs');
const path = require('path');
const https = require('https');

// A reliable way to get to the root of the app in both dev (where __dirname is ./js)
// and packed production (where relative paths get tricky)
let appRoot = path.join(__dirname, '..');

// Electron sometimes puts the app in resources/app
if (!fs.existsSync(path.join(appRoot, 'data', 'db.json'))) {
    appRoot = path.join(process.resourcesPath, 'app');
}

// Fallback just in case
if (!fs.existsSync(path.join(appRoot, 'data', 'db.json'))) {
    appRoot = process.cwd(); // Run from current working directory
}

const dataDir = path.join(appRoot, 'data');
const dbFile = path.join(dataDir, 'db.json');


const ApiService = {
    BASE_URL: 'https://west.albion-online-data.com/api/v2/stats',

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

    getLocalDatabase() {
        if (fs.existsSync(dbFile)) {
            try {
                const data = fs.readFileSync(dbFile, 'utf8');
                return JSON.parse(data);
            } catch (e) {
                console.error("Error parsing local DB:", e);
                return null;
            }
        }
        return null;
    },

    _fetchJson(url) {
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
