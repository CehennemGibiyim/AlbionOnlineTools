const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.json';

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

console.log("Downloading items JSON...");

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            console.log("Parsing JSON...");
            const fullJson = JSON.parse(data);
            const itemsObj = fullJson.items;

            const keysToScan = ['weapon', 'equipmentitem', 'consumable', 'mount', 'simpleitem', 'journalitem'];
            let db = {};
            let parsedCount = 0;

            keysToScan.forEach(key => {
                if (itemsObj[key]) {
                    let itemsArray = itemsObj[key];
                    if (!Array.isArray(itemsArray)) itemsArray = [itemsArray];

                    itemsArray.forEach(item => {
                        const id = item['@uniquename'];
                        if (!id) return;

                        let reqs = item.craftingrequirements;
                        if (!reqs) return;
                        if (!Array.isArray(reqs)) reqs = [reqs];

                        let primaryReq = reqs[0];
                        if (!primaryReq || !primaryReq.craftresource) return;

                        let resources = primaryReq.craftresource;
                        if (!Array.isArray(resources)) resources = [resources];

                        let mats = {};
                        resources.forEach(r => {
                            if (r['@uniquename'] && r['@count']) {
                                mats[r['@uniquename']] = parseInt(r['@count']);
                            }
                        });

                        let shopCat = item['@shopcategory'] || 'other';
                        let shopSubCat = item['@shopsubcategory1'] || 'other';

                        let tierMatch = id.match(/^(T\\d)_/);
                        let tier = tierMatch ? tierMatch[1] : 'T1';

                        // Parse Localized Names if available
                        let name = id;
                        if (item.LocalizedNames && item.LocalizedNames['TR-TR']) {
                            name = item.LocalizedNames['TR-TR'];
                        } else if (item.LocalizedNames && item.LocalizedNames['EN-US']) {
                            name = item.LocalizedNames['EN-US'];
                        }

                        if (!db[shopCat]) db[shopCat] = {};
                        if (!db[shopCat][shopSubCat]) db[shopCat][shopSubCat] = [];

                        db[shopCat][shopSubCat].push({
                            id: id,
                            name: name,
                            tier: tier,
                            materials: mats,
                            craftFeeValue: parseInt(primaryReq['@silver'] || 0) || 120
                        });

                        parsedCount++;
                    });
                }
            });

            fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(db, null, 2));
            console.log(`Success! Extracted ${parsedCount} craftable items into data/db.json`);

        } catch (e) {
            console.error(e);
        }
    });
});
