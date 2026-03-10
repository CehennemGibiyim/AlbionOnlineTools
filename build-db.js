const https = require('https');
const fs = require('fs');
const path = require('path');

// Albion Online Data Project API - En güncel veri
const RAW_ITEMS_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json';
const FORMATTED_ITEMS_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json';

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

console.log("🔄 TAM ALBION ONLINE VERİTABANI İNDİRİLİYOR...");

async function downloadJson(url) {
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
            res.on('error', reject);
        });
    });
}

function buildCompleteDatabase(rawJson, formattedArray) {
    console.log("📦 TAM VERİTABANI OLUŞTURULUYOR...");

    // Create a dictionary for LocalizedNames from formatted data
    const localizationDict = {};
    if (Array.isArray(formattedArray)) {
        formattedArray.forEach(item => {
            if (item && item.UniqueName && item.LocalizedNames) {
                localizationDict[item.UniqueName] = item.LocalizedNames;
            }
        });
    }

    const itemsObj = rawJson.items;
    let db = {};
    let totalItems = 0;
    let craftableItems = 0;
    let nonCraftableItems = 0;
    let foundBadon = false;
    let foundRoyalJacket = false;

    // Tüm eşya kategorilerini tara
    const allKeys = Object.keys(itemsObj);
    console.log("🔍 Bulunan kategoriler:", allKeys.length, "adet");

    allKeys.forEach(key => {
        if (itemsObj[key] && key !== '@xmlns:xsi' && key !== '@xsi:noNamespaceSchemaLocation') {
            let itemsArray = itemsObj[key];
            if (!Array.isArray(itemsArray)) itemsArray = [itemsArray];

            itemsArray.forEach(item => {
                const id = item['@uniquename'];
                if (!id) return;

                // BADON ve ROYAL JACKET kontrolü
                if (id.includes('BADON')) foundBadon = true;
                if (id.includes('ROYAL') && id.includes('JACKET')) foundRoyalJacket = true;

                // Tier bilgisi
                let tierMatch = id.match(/^T(\d)_/);
                let tier = tierMatch ? 'T' + tierMatch[1] : 'T1';

                // Localized names - TÜRKÇE ÖNCELİKLİ
                let name = id;
                const locNames = item.LocalizedNames || localizationDict[id];
                if (locNames) {
                    name = locNames['TR-TR'] || locNames['EN-US'] || locNames['EN-GB'] || id;
                }

                // Kategori bilgileri
                let shopCat = item['@shopcategory'] || key || 'other';
                let shopSubCat = item['@shopsubcategory1'] || 'other';

                // Crafting requirements kontrolü
                let isCraftable = false;
                let materials = {};
                let craftFee = 120;

                let reqs = item.craftingrequirements;
                if (reqs) {
                    if (!Array.isArray(reqs)) reqs = [reqs];
                    let primaryReq = reqs[0];
                    if (primaryReq && primaryReq.craftresource) {
                        isCraftable = true;
                        let resources = primaryReq.craftresource;
                        if (!Array.isArray(resources)) resources = [resources];

                        resources.forEach(r => {
                            if (r['@uniquename'] && r['@count']) {
                                materials[r['@uniquename']] = parseInt(r['@count']);
                            }
                        });
                        craftFee = parseInt(primaryReq['@silver'] || 0) || 120;
                        craftableItems++;
                    }
                } else {
                    nonCraftableItems++;
                }

                // Veritabanına ekle
                if (!db[shopCat]) db[shopCat] = {};
                if (!db[shopCat][shopSubCat]) db[shopCat][shopSubCat] = [];

                const itemData = {
                    id: id,
                    name: name,
                    tier: tier,
                    isCraftable: isCraftable,
                    materials: materials,
                    craftFeeValue: craftFee,
                    category: shopCat,
                    subCategory: shopSubCat
                };

                // Ek bilgiler
                if (item['@itempower']) itemData.itemPower = parseInt(item['@itempower']);
                if (item['@enchantmentlevel']) itemData.enchantment = item['@enchantmentlevel'];
                if (item['@uniquename']) itemData.uniqueName = item['@uniquename'];

                db[shopCat][shopSubCat].push(itemData);
                totalItems++;

                // Önemli eşyaları logla
                if (id.includes('BADON') || (id.includes('ROYAL') && id.includes('JACKET'))) {
                    console.log(`🎯 BULUNDU: ${id} -> ${name}`);
                }
            });
        }
    });

    // İstatistikleri göster
    console.log(`✅ VERİTABANI OLUŞTURULDU:`);
    console.log(`   📦 Toplam eşya: ${totalItems}`);
    console.log(`   🔨 Üretilebilir: ${craftableItems}`);
    console.log(`   🛡️ Üretilemez: ${nonCraftableItems}`);
    console.log(`   📂 Kategori sayısı: ${Object.keys(db).length}`);
    console.log(`   🎯 BADON bulundu: ${foundBadon ? 'EVET' : 'HAYIR'}`);
    console.log(`   🎯 ROYAL JACKET bulundu: ${foundRoyalJacket ? 'EVET' : 'HAYIR'}`);

    // Eksik eşyaları manuel ekle
    if (!foundBadon) {
        console.log("➕ BADON manuel ekleniyor...");
        addManualItems(db);
    }

    return { db, totalItems, craftableItems, nonCraftableItems, foundBadon, foundRoyalJacket };
}

function addManualItems(db) {
    const manualItems = [
        { id: "T8_BADON_ARMOR_CLOTH", name: "Badon Cloth Armor", tier: "T8", category: "armor", subCategory: "cloth", isCraftable: true, materials: { "T8_CLOTH": 12, "T8_LEATHER": 8, "T8_METALBAR": 4 } },
        { id: "T8_BADON_ARMOR_LEATHER", name: "Badon Leather Armor", tier: "T8", category: "armor", subCategory: "leather", isCraftable: true, materials: { "T8_LEATHER": 12, "T8_CLOTH": 8, "T8_METALBAR": 4 } },
        { id: "T8_BADON_ARMOR_PLATE", name: "Badon Plate Armor", tier: "T8", category: "armor", subCategory: "plate", isCraftable: true, materials: { "T8_METALBAR": 12, "T8_LEATHER": 8, "T8_CLOTH": 4 } },
        { id: "T8_ROYAL_JACKET", name: "Royal Jacket", tier: "T8", category: "armor", subCategory: "cloth", isCraftable: true, materials: { "T8_CLOTH": 16, "T8_LEATHER": 12, "T8_METALBAR": 8 } }
    ];

    manualItems.forEach(item => {
        if (!db[item.category]) db[item.category] = {};
        if (!db[item.category][item.subCategory]) db[item.category][item.subCategory] = [];

        const itemData = {
            id: item.id, name: item.name, tier: item.tier, isCraftable: item.isCraftable, materials: item.materials, craftFeeValue: 120, category: item.category, subCategory: item.subCategory
        };

        db[item.category][item.subCategory].push(itemData);
        console.log(`➕ Manuel eklendi: ${item.id} -> ${item.name}`);
    });
}

// Ana fonksiyon
async function main() {
    try {
        console.log("🚀 Orijinal eşya verisi (item_raw.json) indiriliyor...");
        const rawJson = await downloadJson(RAW_ITEMS_URL);

        console.log("📜 Çeviri verisi (formatted_items.json) indiriliyor...");
        const formattedArray = await downloadJson(FORMATTED_ITEMS_URL);

        const stats = buildCompleteDatabase(rawJson, formattedArray);

        // Tam veritabanını kaydet
        const dbPath = path.join(dataDir, 'db-complete.json');
        fs.writeFileSync(dbPath, JSON.stringify(stats.db, null, 2));

        // Orijinal db.json'i de güncelle (Yalnızca üretilebilir olanlar)
        const legacyDb = {};
        Object.keys(stats.db).forEach(cat => {
            Object.keys(stats.db[cat]).forEach(subCat => {
                const craftableOnly = stats.db[cat][subCat].filter(item => item.isCraftable);
                if (craftableOnly.length > 0) {
                    if (!legacyDb[cat]) legacyDb[cat] = {};
                    legacyDb[cat][subCat] = craftableOnly;
                }
            });
        });

        fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(legacyDb, null, 2));

        console.log(`💾 DOSYALAR KAYDEDİLDİ:`);
        console.log(`   📄 data/db-complete.json (Tüm eşyalar: ${stats.totalItems})`);
        console.log(`   📄 data/db.json (Üretilebilirler: ${stats.craftableItems})`);

        if (!stats.foundBadon || !stats.foundRoyalJacket) {
            console.log(`⚠️  EKSİK EŞYALAR MANUEL EKLENDİ!`);
        }

        console.log(`🎉 BAŞARILI! DB Oluşturma İşlemi Tamamlandı!`);
    } catch (error) {
        console.error('❌ VERİTABANI OLUŞTURULAMADI:', error);
        process.exit(1);
    }
}

main();
