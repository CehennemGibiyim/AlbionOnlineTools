const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const items = JSON.parse(data);
        console.log("Total items:", items.length);
        const craftable = items.filter(i => i.craftingRequirements && Object.keys(i.craftingRequirements).length > 0);
        console.log("Craftable items:", craftable.length);
        if (craftable.length > 0) {
            console.log("Sample craftable:", JSON.stringify(craftable[0].craftingRequirements, null, 2));
        }
    });
});
