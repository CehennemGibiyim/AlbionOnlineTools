const fs = require('fs');
const path = require('path');

// Albion Online sınıf sistemine göre veritabanı
const CLASS_SYSTEM = {
    // Warrior Sınıfları
    WARRIOR: {
        name: "Savaşçı",
        icon: "⚔️",
        weapons: ["SWORD", "AXE", "HAMMER", "MAUL", "DUALSWORD", "DUALAXE"],
        armor: ["PLATE"],
        main_stats: ["HP", "DEFENSE", "RESISTANCE"]
    },
    
    // Mage Sınıfları  
    MAGE: {
        name: "Büyücü",
        icon: "🔮",
        weapons: ["STAFF", "CURSESTAFF", "FIRESTAFF", "FROSTSTAFF", "HOLYSTAFF", "NATURESTAFF", "ARCANE"],
        armor: ["CLOTH"],
        main_stats: ["MAGIC_POWER", "HEALING", "ENERGY_REGEN"]
    },
    
    // Ranger Sınıfları
    RANGER: {
        name: "Okçu",
        icon: "🏹",
        weapons: ["BOW", "CROSSBOW", "DAGGER"],
        armor: ["LEATHER"],
        main_stats: ["ATTACK_SPEED", "CRIT_CHANCE", "RANGE_DAMAGE"]
    },
    
    // Assassin/Rogue Sınıfları
    ASSASSIN: {
        name: "Suikastçi",
        icon: "🗡️",
        weapons: ["DAGGER", "SWORD", "FIST"],
        armor: ["LEATHER"],
        main_stats: ["STEALTH", "CRIT_DAMAGE", "ATTACK_SPEED"]
    },
    
    // Healer/Support Sınıfları
    HEALER: {
        name: "Şifacı",
        icon: "💚",
        weapons: ["STAFF", "HOLYSTAFF", "NATURESTAFF", "FIRESTAFF"],
        armor: ["CLOTH"],
        main_stats: ["HEALING", "SUPPORT_POWER", "ENERGY_REGEN"]
    },
    
    // Tank Sınıfları
    TANK: {
        name: "Tank",
        icon: "🛡️",
        weapons: ["HAMMER", "MAUL", "SWORD", "AXE"],
        armor: ["PLATE"],
        main_stats: ["HP", "DEFENSE", "CROWD_CONTROL"]
    }
};

async function buildClassDatabase() {
    console.log("🎯 ALBION ONLINE SINIF VERİTABANI OLUŞTURULUYOR...");
    
    // Mevcut veritabanını oku
    const dbPath = path.join(__dirname, 'data', 'db-complete.json');
    if (!fs.existsSync(dbPath)) {
        console.error("❌ db-complete.json bulunamadı! Önce build-complete-db.js çalıştırın.");
        return;
    }
    
    const completeDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const classDb = {};
    
    let totalItems = 0;
    let classStats = {};
    
    // Her sınıf için eşyaları grupla
    Object.keys(CLASS_SYSTEM).forEach(classKey => {
        const classInfo = CLASS_SYSTEM[classKey];
        classDb[classKey] = {
            name: classInfo.name,
            icon: classInfo.icon,
            weapons: [],
            armor: [],
            artifacts: [],
            mounts: [],
            consumables: [],
            main_stats: classInfo.main_stats
        };
        
        classStats[classKey] = 0;
        
        // Tüm kategorilerdeki eşyaları tara
        Object.keys(completeDb).forEach(category => {
            Object.keys(completeDb[category]).forEach(subCategory => {
                completeDb[category][subCategory].forEach(item => {
                    const itemId = item.id || item.uniqueName || '';
                    const itemName = item.name || itemId;
                    
                    // Silahları sınıflara göre ayır
                    if (category === 'weapon' || category === 'artefacts') {
                        let weaponType = null;
                        
                        // Silah tipini belirle
                        if (itemId.includes('STAFF')) weaponType = 'STAFF';
                        else if (itemId.includes('SWORD')) weaponType = 'SWORD';
                        else if (itemId.includes('AXE')) weaponType = 'AXE';
                        else if (itemId.includes('HAMMER') || itemId.includes('MAUL')) weaponType = 'HAMMER';
                        else if (itemId.includes('BOW')) weaponType = 'BOW';
                        else if (itemId.includes('CROSSBOW')) weaponType = 'CROSSBOW';
                        else if (itemId.includes('DAGGER')) weaponType = 'DAGGER';
                        else if (itemId.includes('FIST')) weaponType = 'FIST';
                        else if (itemId.includes('CURSESTAFF')) weaponType = 'CURSESTAFF';
                        else if (itemId.includes('FIRESTAFF')) weaponType = 'FIRESTAFF';
                        else if (itemId.includes('FROSTSTAFF')) weaponType = 'FROSTSTAFF';
                        else if (itemId.includes('HOLYSTAFF')) weaponType = 'HOLYSTAFF';
                        else if (itemId.includes('NATURESTAFF')) weaponType = 'NATURESTAFF';
                        else if (itemId.includes('ARCANE')) weaponType = 'ARCANE';
                        else if (itemId.includes('DUALSWORD')) weaponType = 'DUALSWORD';
                        else if (itemId.includes('DUALAXE')) weaponType = 'DUALAXE';
                        
                        if (weaponType) {
                            // Hangi sınıfa ait olduğunu bul
                            let assignedClass = null;
                            
                            Object.keys(CLASS_SYSTEM).forEach(className => {
                                const classData = CLASS_SYSTEM[className];
                                if (classData.weapons.includes(weaponType)) {
                                    assignedClass = className;
                                }
                            });
                            
                            if (assignedClass && classDb[assignedClass]) {
                                classDb[assignedClass].weapons.push({
                                    ...item,
                                    class: assignedClass,
                                    weapon_type: weaponType,
                                    display_name: getDisplayName(itemName, weaponType)
                                });
                                classStats[assignedClass]++;
                                totalItems++;
                            }
                        }
                    }
                    
                    // Zırhları sınıflara göre ayır
                    if (category === 'armor') {
                        let armorType = null;
                        
                        if (itemId.includes('PLATE')) armorType = 'PLATE';
                        else if (itemId.includes('LEATHER')) armorType = 'LEATHER';
                        else if (itemId.includes('CLOTH')) armorType = 'CLOTH';
                        
                        if (armorType) {
                            // Hangi sınıfa ait olduğunu bul
                            let assignedClass = null;
                            
                            Object.keys(CLASS_SYSTEM).forEach(className => {
                                const classData = CLASS_SYSTEM[className];
                                if (classData.armor.includes(armorType)) {
                                    assignedClass = className;
                                }
                            });
                            
                            if (assignedClass && classDb[assignedClass]) {
                                classDb[assignedClass].armor.push({
                                    ...item,
                                    class: assignedClass,
                                    armor_type: armorType,
                                    display_name: getDisplayName(itemName, armorType)
                                });
                                classStats[assignedClass]++;
                                totalItems++;
                            }
                        }
                    }
                    
                    // Artifact'ları ekle
                    if (category === 'artefacts') {
                        Object.keys(CLASS_SYSTEM).forEach(className => {
                            if (classDb[className]) {
                                classDb[className].artifacts.push({
                                    ...item,
                                    class: className,
                                    display_name: itemName
                                });
                                classStats[className]++;
                                totalItems++;
                            }
                        });
                    }
                    
                    // Mount'ları ekle
                    if (category === 'mount') {
                        Object.keys(CLASS_SYSTEM).forEach(className => {
                            if (classDb[className]) {
                                classDb[className].mounts.push({
                                    ...item,
                                    class: className,
                                    display_name: itemName
                                });
                                classStats[className]++;
                                totalItems++;
                            }
                        });
                    }
                    
                    // Consumable'ları ekle
                    if (category === 'consumables') {
                        Object.keys(CLASS_SYSTEM).forEach(className => {
                            if (classDb[className]) {
                                classDb[className].consumables.push({
                                    ...item,
                                    class: className,
                                    display_name: itemName
                                });
                                classStats[className]++;
                                totalItems++;
                            }
                        });
                    }
                });
            });
        });
    });
    
    // İstatistikleri göster
    console.log("✅ SINIF VERİTABANI OLUŞTURULDU:");
    Object.keys(classDb).forEach(className => {
        const classData = classDb[className];
        console.log(`   ${classData.icon} ${classData.name}:`);
        console.log(`      ⚔️ Silah: ${classData.weapons.length}`);
        console.log(`      🛡️ Zırh: ${classData.armor.length}`);
        console.log(`      🎯 Artifact: ${classData.artifacts.length}`);
        console.log(`      🐴 Mount: ${classData.mounts.length}`);
        console.log(`      🧪 Consumable: ${classData.consumables.length}`);
        console.log(`      📊 Toplam: ${classStats[className]}`);
    });
    console.log(`   🎯 GENEL TOPLAM: ${totalItems} eşya`);
    
    // Veritabanını kaydet
    const classDbPath = path.join(__dirname, 'data', 'db-classes.json');
    fs.writeFileSync(classDbPath, JSON.stringify(classDb, null, 2));
    
    console.log(`💾 Kaydedildi: data/db-classes.json`);
    console.log(`🎉 Artık sınıf sistemine göre gruplandırılmış eşyalar mevcut!`);
}

function getDisplayName(name, type) {
    // Kullanıcı dostu isimler
    const nameMap = {
        'STAFF': 'Asa',
        'SWORD': 'Kılıç', 
        'AXE': 'Balta',
        'HAMMER': 'Çekiç',
        'MAUL': 'Topuz',
        'BOW': 'Yay',
        'CROSSBOW': 'Arbalet',
        'DAGGER': 'Hançer',
        'FIST': 'Yumruk',
        'PLATE': 'Plaka Zırh',
        'LEATHER': 'Deri Zırh',
        'CLOTH': 'Bez Zırh',
        'CURSESTAFF': 'Lanet Asası',
        'FIRESTAFF': 'Ateş Asası',
        'FROSTSTAFF': 'Buz Asası',
        'HOLYSTAFF': 'Kutsal Asa',
        'NATURESTAFF': 'Doğa Asası',
        'ARCANE': 'Gizemli'
    };
    
    let displayName = name;
    Object.keys(nameMap).forEach(key => {
        if (name.includes(key)) {
            displayName = name.replace(key, nameMap[key]);
        }
    });
    
    return displayName;
}

// Çalıştır
buildClassDatabase().catch(console.error);
