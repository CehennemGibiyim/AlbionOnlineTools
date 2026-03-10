// builds.js - Builds Guide with role/gear/skill data for all content types

const RENDER = 'https://render.albiononline.com/v1/item/';
const Q = (id) => id ? `<div class="gear-slot"><img src="${RENDER}${id}.png?size=40" width="36" height="36" onerror="this.parentElement.classList.add('slot-missing')" title="${id}"></div>` : `<div class="gear-slot empty-gear-slot">✕</div>`;

// Difficulty: easy=green, medium=yellow, hard=red
const DIFF = {
    easy: '<span class="dot-green">●</span>',
    medium: '<span class="dot-yellow">●</span>',
    hard: '<span class="dot-red">●</span>',
};

// Skill notation helper
const SKILL = (q, w, e, r, passive, notes) => `
    <div class="skill-row">
        <span class="skill-key">Q</span><span class="skill-val">${q}</span>
        <span class="skill-key">W</span><span class="skill-val">${w}</span>
        <span class="skill-key">E</span><span class="skill-val">${e}</span>
        ${r ? `<span class="skill-key">R</span><span class="skill-val">${r}</span>` : ''}
    </div>
    ${passive ? `<div class="skill-passive">P: ${passive}</div>` : ''}
    ${notes ? `<div class="skill-notes">${notes}</div>` : ''}
`;

// Common item IDs
const ITEMS = {
    // Weapons
    WARCALLER: ITEMS.WARCALLER,
    CHILLHOWL: ITEMS.CHILLHOWL,
    SHADOWCALLER: ITEMS.SHADOWCALLER,
    LIFETOUCH: ITEMS.HALLOWFALL,
    DIVINE: ITEMS.DIVINE,
    HALLOWFALL: ITEMS.HALLOWFALL,
    GREATARCANE: ITEMS.GREATARCANE,
    IRON_BREAKER: ITEMS.IRON_BREAKER,
    CLARENT: ITEMS.CLARENT,
    LIGHT_CROSSBOW: ITEMS.LIGHT_CROSSBOW,
    WEEPING: ITEMS.WEEPING,
    BLAZING: ITEMS.BLAZING,
    LIGHTCALLER: ITEMS.LIGHTCALLER,
    IRONROOT: ITEMS.IRONROOT,
    BOW_BADON: ITEMS.BOW_BADON,
    BOLTCASTER: ITEMS.BOLTCASTER,
    DOUBLEBLADE: ITEMS.DOUBLEBLADE,
    GRAILSEEKER: ITEMS.GRAILSEEKER,
    SPIRITHUNTER: ITEMS.SPIRITHUNTER,
    OATHKEEPERS: ITEMS.OATHKEEPERS,
    CARRIONCALLER: ITEMS.CARRIONCALLER,
    WILDSTAFF: ITEMS.WILDSTAFF,
    INFERNAL_SCYTHE: ITEMS.INFERNAL_SCYTHE,
    REALMBREAKER: ITEMS.REALMBREAKER,
    BEARCLAWS: ITEMS.BEARCLAWS,
    DEATHGIVERS: ITEMS.DEATHGIVERS,
    WHISPERING: ITEMS.WHISPERING,

    
    INCUBUS_MACE: ITEMS.INCUBUS_MACE,
    CAMLANN_MACE: ITEMS.CAMLANN_MACE,
    GALATINE_PAIR: ITEMS.GALATINE_PAIR,
    BROADSWORD: ITEMS.BROADSWORD,
    PRISMATIC_STAFF: ITEMS.PRISMATIC_STAFF,
    BLIGHT_STAFF: ITEMS.BLIGHT_STAFF,
    BLOODLETTER: ITEMS.BLOODLETTER,
    WAILING_BOW: ITEMS.WAILING_BOW,
    LOCUS: ITEMS.LOCUS,
    ARCANE_STAFF: ITEMS.ARCANE_STAFF,
    GREATAXE: ITEMS.GREATAXE,
    BATTLEAXE: ITEMS.BATTLEAXE,
    FALLEN_STAFF: ITEMS.FALLEN_STAFF,
    WILDFIRE_STAFF: ITEMS.WILDFIRE_STAFF,
    FIRESTAFF: ITEMS.FIRESTAFF,
    SANDWICH: ITEMS.SANDWICH,
    PIE: ITEMS.PIE,

// Off Hands
    SHIELD_ROYAL: ITEMS.SHIELD_ROYAL,
    MISTCALLER: ITEMS.MISTCALLER,
    EYE_OF_SECRETS: ITEMS.EYE_OF_SECRETS,
    LYMHURST_ORB: ITEMS.LYMHURST_ORB,

    // Helmets
    HELMET_CLOTH_DW: ITEMS.HELMET_CLOTH_DW,
    HELMET_PLATE_DW: ITEMS.HELMET_PLATE_DW,
    HELMET_LEATHER_DW: ITEMS.HELMET_LEATHER_DW,
    HOOD_GRAVEGUARD: ITEMS.HOOD_GRAVEGUARD,
    COWL_CLOTH: ITEMS.COWL_CLOTH,
    HOOD_ASSASSIN: ITEMS.HOOD_ASSASSIN,
    HUNTER_HOOD: ITEMS.HUNTER_HOOD,
    MAGE_COWL: ITEMS.MAGE_COWL,
    SOLDIER_HELMET: ITEMS.SOLDIER_HELMET,

    // Armors
    ROBE_OF_PROT: ITEMS.ROBE_OF_PROT,
    KNIGHT_ARMOR: ITEMS.KNIGHT_ARMOR,
    ASSASSIN_JACKET: ITEMS.ASSASSIN_JACKET,
    REINFORCED_CHEST: ITEMS.REINFORCED_CHEST,
    CLERIC_ROBE: ITEMS.CLERIC_ROBE,
    ROYAL_JACKET: ITEMS.ROYAL_JACKET,
    DRUID_ROBE: ITEMS.DRUID_ROBE,
    GUARD_ARMOR: ITEMS.GUARD_ARMOR,
    STALKER_JACKET: ITEMS.STALKER_JACKET,

    // Boots
    BOOTS_PLATE_DW: ITEMS.BOOTS_PLATE_DW,
    BOOTS_CLOTH_DW: ITEMS.BOOTS_CLOTH_DW,
    BOOTS_LEATHER_DW: ITEMS.BOOTS_LEATHER_DW,
    SOLDIER_BOOTS: ITEMS.SOLDIER_BOOTS,
    SCHOLAR_SANDALS: ITEMS.SCHOLAR_SANDALS,
    HUNTER_SHOES: ITEMS.HUNTER_SHOES,
    GUARDIAN_BOOTS: ITEMS.GUARDIAN_BOOTS,
    CULTIST_SANDALS: ITEMS.CULTIST_SANDALS,
    ASSASSIN_SHOES: ITEMS.ASSASSIN_SHOES,

    // Capes
    LYMHURST_CAPE: ITEMS.LYMHURST_CAPE,
    MARTLOCK_CAPE: ITEMS.MARTLOCK_CAPE,
    BRIDGEWATCH_CAPE: ITEMS.BRIDGEWATCH_CAPE,
    THETFORD_CAPE: ITEMS.THETFORD_CAPE,
    BLANKET_CAPE: ITEMS.BLANKET_CAPE,
    FORT_CAPE: ITEMS.FORT_CAPE,
    CAERLEON_CAPE: ITEMS.CAERLEON_CAPE,

    // Food — verified Albion render API IDs
    PORK_OMELETTE: 'T7_MEAL_OMELETTE@1',
    BEEF_STEW: ITEMS.BEEF_STEW,
    BREAD: ITEMS.SANDWICH,
    ROAST_PORK: ITEMS.ROAST_PORK,
    PIE: ITEMS.PIE,
    SALAD: ITEMS.SALAD,

    // Potions — verified Albion render API IDs
    MAJOR_HEALING: 'T6_POTION_HEAL@1',
    MAJOR_RESISTANCE: ITEMS.MAJOR_RESISTANCE,
    ENERGY_POTION: ITEMS.ENERGY_POTION,
    GIANT_STRENGTH: ITEMS.GIANT_STRENGTH,
    INVISIBILITY: ITEMS.INVISIBILITY,
    CLEANSE: ITEMS.CLEANSE,
};

// =================== BUILDS DATABASE ===================
const BUILDS_DB = {
    solo_dungeon: {
        title: '⚔️ Solo Dungeon', minPlayers: 1, maxPlayers: 1,
        description: 'Solo içerikler için yüksek hasar ve hayatta kalma dengesi. Mobil ve güçlü buildler önerilir.',
        roles: [
            {
                role: 'Hasar (Çifte Hançer)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta',
                    '2× E + R + QQ → kaç'),
                swaps: [ITEMS.DOUBLEBLADE, ITEMS.BEARCLAWS, ITEMS.WHISPERING]
            },
            {
                role: 'Hasar (Fısıldayan Yay)', difficulty: 'easy',
                weapon: ITEMS.WHISPERING, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.STALKER_JACKET, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Multishot', 'Sniper Shot', 'Deadly Shot', null, 'Bow of Badon passive',
                    'Q spam → W → E full dolu'),
                swaps: [ITEMS.BOW_BADON, ITEMS.BOLTCASTER]
            },
            {
                role: 'Şifacı (Vahşi Asa)', difficulty: 'medium',
                weapon: ITEMS.WILDSTAFF, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.ROAST_PORK, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Wrath of Nature', 'Entangle', 'Rampant Growth', null, 'Equilibrium', 'E basarken W ve Q kullan'),
                swaps: [ITEMS.IRONROOT, ITEMS.LIGHTCALLER]
            },
        ]
    },
    group_dungeon_4: {
        title: '👥 Grup Dungeon (4 Kişi)', minPlayers: 4, maxPlayers: 4,
        description: '4 kişilik hızlı zindan partisi (HCE veya Açık Dünya). Hızlı temizleme üzerine kurulu.',
        roles: [
            {
                role: 'Ana Tank (Demir Gürz)', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.SANDWICH, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Defensive Slam', 'Snare Charge', 'Deep Leap', 'Wall of Blades', 'Toughness', 'Önden atla ve canavarları bir araya sıkıştır.'),
                swaps: [ITEMS.CAMLANN_MACE, ITEMS.INCUBUS_MACE]
            },
            {
                role: 'Ana Şifacı (Kutsal Asası)', difficulty: 'easy',
                weapon: ITEMS.DIVINE, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Generous Heal', 'Holy Beam', 'Holy Explosion', null, 'Adrenaline Driven', 'Ön saftaki tanka kesintisiz can ver.'),
                swaps: [ITEMS.HALLOWFALL, ITEMS.FALLEN_STAFF]
            },
            {
                role: 'Alan Menzilli Hasarı (Ağlayan Arbalet)', difficulty: 'easy',
                weapon: ITEMS.WEEPING, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Explosive Bolt', 'Caltrops', 'Explosive Mine', null, 'Well-Prepared', 'Tank canavarları topladığında Mayın (E) atıp üstüne Q ile patlat.'),
                swaps: [ITEMS.LIGHT_CROSSBOW]
            },
            {
                role: 'Alan Menzilli Hasarı (Ateş Asası)', difficulty: 'medium',
                weapon: ITEMS.BLAZING, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Fire Bolt', 'Wall of Flames', 'Flame Pillar', null, 'Aggressive Caster', 'Düşmanların altına lav sütunları (E) atarak ani hasar çıkar.'),
                swaps: [ITEMS.FIRESTAFF]
            }
        ]
    },
    group_dungeon_7: {
        title: '👥 Grup Dungeon (7 Kişi)', minPlayers: 7, maxPlayers: 7,
        description: '7 kişilik grup zindanları (PvE). Hızlı temizleme (Clear) ve boss kesme (Bossing) ağırlıklı roller.',
        roles: [
            {
                role: 'Ana Tank (Incubus)', difficulty: 'medium',
                weapon: ITEMS.INCUBUS_MACE, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.SANDWICH, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Defensive Slam', 'Snare Charge', 'Shrinking Curse', 'Wall of Blades', 'Toughness', 'Yaratıkları topla ve E yeteneğiyle canavarları küçült/zayıflat.'),
                swaps: [ITEMS.IRON_BREAKER]
            },
            {
                role: 'Destek/İkincil Tank (Arkana)', difficulty: 'medium',
                weapon: ITEMS.GREATARCANE, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Chain Missile', 'Enigma Blade', 'Time Freeze', null, 'Arcane Mastery', 'Zamanı durdurarak (E) tankın hasar almasını engelle.'),
                swaps: [ITEMS.LOCUS]
            },
            {
                role: 'Ana Şifacı (Kutsal Asası)', difficulty: 'easy',
                weapon: ITEMS.DIVINE, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Generous Heal', 'Holy Beam', 'Holy Explosion', null, 'Adrenaline Driven', 'Ön saftaki tanka sürekli Can Işını (W) uygula.'),
                swaps: [ITEMS.HALLOWFALL, ITEMS.FALLEN_STAFF]
            },
            {
                role: 'Zırh Kırıcı (Gölgegetiren)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Cursed Sickle', 'Armor Piercer', 'Inner Fire', null, 'Furious', 'Bossların zırhını Armur Piercer (W) ile sürekli kırık tut.'),
                swaps: [ITEMS.CARRIONCALLER]
            },
            {
                role: 'Alan Hasarı (Ağlayan Arbalet)', difficulty: 'easy',
                weapon: ITEMS.WEEPING, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Explosive Bolt', 'Caltrops', 'Explosive Mine', null, 'Well-Prepared', 'Tank canavarları topladığında Mayın (E) atıp üstüne Q ile patlat.'),
                swaps: [ITEMS.LIGHT_CROSSBOW]
            },
            {
                role: 'Alan Menzilli Hasarı (Buzul Asası)', difficulty: 'medium',
                weapon: ITEMS.PRISMATIC_STAFF, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Ice Shard', 'Frost Nova', 'Ice Storm', null, 'Aggressive Caster', 'Büyük canavar gruplarına Q ile sürekli hasar (Spam) uygula.'),
                swaps: [ITEMS.CHILLHOWL]
            },
            {
                role: 'Sürekli Hasar (Ateş Asası)', difficulty: 'easy',
                weapon: ITEMS.BLAZING, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Fire Bolt', 'Wall of Flames', 'Flame Pillar', null, 'Aggressive Caster', 'Menzilli büyük alan hasarları(E) çıkar.'),
                swaps: [ITEMS.FIRESTAFF]
            }
        ]
    },
    avalon_dungeon: {
        title: '⚔️ Avalon Dungeon (10 Kişi)', minPlayers: 10, maxPlayers: 12,
        description: '10+ kişilik Avalon içerikleri. Resim referansı: 10 Man Ava Dungeon Builds.',
        roles: [
            {
                role: 'Ana Tank', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BREAD, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Empowered Slam', 'Magnetic Zone', 'Wall of Blades', 'Toughness', 'Boss hedef al → E tank pozisyonu'),
                swaps: [ITEMS.CLARENT, ITEMS.OATHKEEPERS, ITEMS.SPIRITHUNTER]
            },
            {
                role: 'İkincil Tank', difficulty: 'medium',
                weapon: ITEMS.CLARENT, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.SOLDIER_HELMET,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.SOLDIER_BOOTS,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BREAD, potion: ITEMS.GIANT_STRENGTH,
                skills: SKILL('Heroic Cleave', 'Blade AoE', 'Energetic', null, 'Defiant', 'Main tankı destekle'),
                swaps: [ITEMS.IRON_BREAKER, ITEMS.SHIELD_ROYAL, ITEMS.BOOTS_PLATE_DW]
            },
            {
                role: 'Ana Şifacı', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', 'E → R düşükte → W pozisyonu koru'),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE, ITEMS.BOOTS_CLOTH_DW]
            },
            {
                role: 'Destek (Büyük Arkana)', difficulty: 'medium',
                weapon: ITEMS.GREATARCANE, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Arcane Eye', 'Enfeeble Aura', 'Arcane Orb', null, 'Arcane Mastery', 'E buff tank → W debuff boss'),
                swaps: [ITEMS.LIFETOUCH, ITEMS.MISTCALLER, ITEMS.COWL_CLOTH]
            },
            {
                role: 'Zırh Kırıcı (Demirkökü)', difficulty: 'hard',
                weapon: ITEMS.IRONROOT, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Thorns', 'Briar Patch', 'Rampant Growth', null, 'Equilibrium', 'W yerleştir → Q × spam → E dolduğunda patlat'),
                swaps: [ITEMS.WILDSTAFF, ITEMS.LIGHTCALLER, ITEMS.STALKER_JACKET]
            },
            {
                role: 'Alan Hasarı (Gölgegetiren)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', 'E x Q Sürekli → W → R (Bossa) Değişim: Ağlayan/Okatar (Min T7.3)'),
                swaps: [ITEMS.WEEPING, ITEMS.BOLTCASTER, ITEMS.WARCALLER]
            },
            {
                role: 'Alan Hasarı (Azap Asası)', difficulty: 'medium',
                weapon: ITEMS.BLAZING, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Searing Flame', 'Lava Sphere', 'Flame Pillar', null, 'Pyromaniac', 'Q× → E stack → W alan'),
                swaps: [ITEMS.SHADOWCALLER, ITEMS.CARRIONCALLER]
            },
            {
                role: 'Hasar (Gölgegetiren)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', ''),
                swaps: [ITEMS.WEEPING, ITEMS.LIGHT_CROSSBOW, ITEMS.ROYAL_JACKET]
            },
            {
                role: 'Hasar (Hafif Arbalet)', difficulty: 'easy',
                weapon: ITEMS.LIGHT_CROSSBOW, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.KNIGHT_ARMOR, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.THETFORD_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Bolt', 'Explosive Bolt', 'Snipe', 'Energy Shield', 'Veteran', 'Güvenli uzak mesafe DPS'),
                swaps: [ITEMS.BOLTCASTER, ITEMS.BOW_BADON, ITEMS.STALKER_JACKET]
            },
            {
                role: 'Hasar (Ağlayan Arbalet)', difficulty: 'hard',
                weapon: ITEMS.WEEPING, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.ROAST_PORK, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Vile Curse', 'Corpse Explosion', 'Soulburn', 'Reap', 'Endless Dark', 'W Yerleştir → Q Tüm Gruba → E Yaratıkları Patlat'),
                swaps: [ITEMS.SHADOWCALLER, ITEMS.BLAZING]
            },
            {
                role: 'Hasar (Kırağı Asası)', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', 'Q dolu → E yığ → W nova'),
                swaps: [ITEMS.WARCALLER, ITEMS.SHADOWCALLER]
            },
            {
                role: 'Gözcü / Kaçış', difficulty: 'easy',
                weapon: ITEMS.DOUBLEBLADE, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.SALAD, potion: ITEMS.INVISIBILITY,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', null, 'Vendetta', 'Kapıda bekle → bilgi ver → gerekirse kaç. Herkese min 8 ayar set zorunlu!'),
                swaps: [ITEMS.DEATHGIVERS, ITEMS.BEARCLAWS]
            },
        ]
    },
    avalon_gold: {
        title: '🪙 Avalon Gold', minPlayers: 5, maxPlayers: 10,
        description: 'Avalon altın kazanma içerikleri. Hızlı temizleme ve hayatta kalma öncelikli.',
        roles: [
            {
                role: 'Hasar (Çifte Hançer)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta', 'Hızlı temizleme → kaç'),
                swaps: [ITEMS.BEARCLAWS, ITEMS.DOUBLEBLADE]
            },
            {
                role: 'Şifacı (Kutsal Hazan)', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', ''),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
        ]
    },
    tracking_solo: {
        title: '🔍 Tracking (Solo)', minPlayers: 1, maxPlayers: 1,
        description: 'Tek kişilik takip ve gankleme. Yüksek mobilite ve sürpriz hasar.',
        roles: [
            {
                role: 'Pusucu (Çifte Hançer)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.INVISIBILITY,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta', 'Invisibility iksiri → yaklaş → E → R burst → kaç'),
                swaps: [ITEMS.BEARCLAWS, ITEMS.DOUBLEBLADE, ITEMS.WHISPERING]
            },
            {
                role: 'Pusucu (Ayı Pençesi)', difficulty: 'medium',
                weapon: ITEMS.BEARCLAWS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.INVISIBILITY,
                skills: SKILL('Bear Paws Q', 'Rending Spin', 'Deadly Lunge', null, 'Predatory Focus', 'Görünmezlik → W Dönüş → Q x R Patlama'),
                swaps: [ITEMS.DEATHGIVERS, ITEMS.DOUBLEBLADE]
            },
        ]
    },
    tracking_4: {
        title: '🔍 Tracking (4 Kişi)', minPlayers: 4, maxPlayers: 4,
        description: '4 kişilik gank grubu. Holder, DPS, Healer kombinasyonu.',
        roles: [
            {
                role: 'Yakalayıcı (Çifteler)', difficulty: 'medium',
                weapon: ITEMS.DOUBLEBLADE, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.CLEANSE,
                skills: SKILL('Surging Strikes', 'Stun Run', 'Dancing Blades', null, 'Vendetta', 'Hedefi yakala → E tut → grubun gelmesini bekle'),
                swaps: [ITEMS.REALMBREAKER, ITEMS.SPIRITHUNTER]
            },
            {
                role: 'Hasar (Ayı Pençesi)', difficulty: 'easy', isGankGear: true,
                weapon: ITEMS.BEARCLAWS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Bear Paws Q', 'Rending Spin', 'Deadly Lunge', null, 'Predatory Focus', ''),
                swaps: [ITEMS.DEATHGIVERS, ITEMS.WHISPERING]
            },
            {
                role: 'Hasar (Tek Elli Lanetli)', difficulty: 'medium',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Soulburn', 'Desecrate', null, 'Black Hands', ''),
                swaps: [ITEMS.CARRIONCALLER, ITEMS.WEEPING]
            },
            {
                role: 'Şifacı (Kutsal Hazan)', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', 'Grubun gerisinde bekle → gerekirse kaç'),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
        ]
    },
    tracking_7: {
        title: '🔍 Tracking (7 Kişi)', minPlayers: 7, maxPlayers: 7,
        description: '7 kişilik gank grubu. Daha organize holder + burst DPS setup.',
        roles: [
            {
                role: 'Yakalayıcı (Çifteler)', difficulty: 'medium',
                weapon: ITEMS.DOUBLEBLADE, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.CLEANSE,
                skills: SKILL('Surging Strikes', 'Stun Run', 'Dancing Blades', null, 'Vendetta', ''),
                swaps: [ITEMS.REALMBREAKER, ITEMS.SPIRITHUNTER]
            },
            {
                role: 'Yakalayıcı (Tek Elli Büyü)', difficulty: 'hard',
                weapon: ITEMS.WARCALLER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.THETFORD_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.CLEANSE,
                skills: SKILL('Shatter Lance', 'Ice Block', 'Frost Bomb', null, 'Battle Frenzy', 'E durdur → W blok → Q hasar'),
                swaps: [ITEMS.CHILLHOWL, ITEMS.IRON_BREAKER]
            },
            {
                role: 'Hasar (Ayı Pençesi)', difficulty: 'easy',
                weapon: ITEMS.BEARCLAWS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Bear Paws Q', 'Rending Spin', 'Deadly Lunge', null, 'Predatory Focus', ''),
                swaps: [ITEMS.DEATHGIVERS, ITEMS.DOUBLEBLADE]
            },
            {
                role: 'Hasar (Fısıldayan Yay)', difficulty: 'easy',
                weapon: ITEMS.WHISPERING, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.STALKER_JACKET, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Multishot', 'Sniper Shot', 'Deadly Shot', null, 'Bow of Badon passive', ''),
                swaps: [ITEMS.BOW_BADON, ITEMS.BOLTCASTER]
            },
            {
                role: 'Hasar (Tek Elli Lanetli)', difficulty: 'medium',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Soulburn', 'Desecrate', null, 'Black Hands', ''),
                swaps: [ITEMS.WEEPING, ITEMS.CARRIONCALLER]
            },
            {
                role: 'Hasar (Çifte Hançer)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta', ''),
                swaps: [ITEMS.BEARCLAWS, ITEMS.DOUBLEBLADE]
            },
            {
                role: 'Şifacı (Kutsal Hazan)', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', ''),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
        ]
    },
    static: {
        title: '🏰 Statik Zindan (Dive / Fame)', minPlayers: 5, maxPlayers: 7,
        description: 'Statik zindanlarda sürekli alan hasarına (Fame) ve olası düşman baskınlarına (PvP Dive) karşı hazırlıklı setler.',
        roles: [
            {
                role: 'Ana Tank (Demir Gürz)', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.SANDWICH, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Defensive Slam', 'Snare Charge', 'Deep Leap', 'Wall of Blades', 'Toughness', 'Statik canavarlarını bir araya toplayıp sersemlet (E).'),
                swaps: [ITEMS.CAMLANN_MACE]
            },
            {
                role: 'Ana Şifacı (Kutsal Asası)', difficulty: 'easy',
                weapon: ITEMS.DIVINE, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Generous Heal', 'Holy Beam', 'Holy Explosion', null, 'Adrenaline Driven', 'Ön saftaki tanka kesintisiz can ver.'),
                swaps: [ITEMS.HALLOWFALL]
            },
            {
                role: 'Hasar / Zırh Delici (Realmbreaker)', difficulty: 'hard',
                weapon: ITEMS.REALMBREAKER, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ROYAL_JACKET, boots: ITEMS.SOLDIER_BOOTS,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Rending Strike', 'Internal Bleeding', 'Aftershock', null, 'Deep Cuts', 'Tankın üzerine sıçrayıp hedeflerin Maks HP değerini düşürür.'),
                swaps: [ITEMS.BATTLEAXE]
            },
            {
                role: 'Sabit Hasar (Hafif Arbalet)', difficulty: 'easy',
                weapon: ITEMS.LIGHT_CROSSBOW, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Auto Fire', 'Sunder Earth', 'Explosive Bolt', null, 'Well-Prepared', 'Boslara ve gruplara yüksek, hızlı Q hasarı cıkar.'),
                swaps: [ITEMS.WEEPING]
            },
            {
                role: 'Menzilli Destek Hasarı (Doğa Asası)', difficulty: 'medium',
                weapon: ITEMS.BLIGHT_STAFF, offhand: ITEMS.LYMHURST_ORB, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Thorns', 'Revitalize', 'Circle of Life', null, 'Calm', 'Menzilli saldırılarla canavarları tankla beraber erit ve ikincil şifa ver.'),
                swaps: [ITEMS.IRONROOT]
            },
            {
                role: 'Büyü Hasarı (Gölgegetiren)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Cursed Sickle', 'Armor Piercer', 'Inner Fire', null, 'Furious', 'Zindan bosslarına zırh delme desteği sağlayıp sürekli hasar bırakır.'),
                swaps: [ITEMS.CARRIONCALLER]
            }
        ]
    },
    group_camp: {
        title: '⛺ Grup Camp', minPlayers: 4, maxPlayers: 8,
        description: 'Grup kampı içerikleri. Uzun süreli kaynakta kalma için dayanaklı buildler.',
        roles: [
            {
                role: 'Tank', difficulty: 'easy',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.KNIGHT_ARMOR, boots: ITEMS.BOOTS_PLATE_DW,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BREAD, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Empowered Slam', 'Magnetic Zone', 'Wall of Blades', 'Toughness', ''),
                swaps: [ITEMS.CLARENT, ITEMS.REALMBREAKER]
            },
            {
                role: 'Hasar (Kırağı Asası)', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', ''),
                swaps: [ITEMS.BLAZING, ITEMS.WARCALLER]
            },
        ]
    },
    zvz_20: {
        title: '⚔️ ZvZ (Büyük Savaş)', minPlayers: 20, maxPlayers: 100,
        description: 'Büyük ölçekli birlik savaşları (ZvZ). Çakışmaları yönetecek çok güçlü kitle kontrol ve ordu koruma yetenekleri içerir.',
        roles: [
            {
                role: 'Ana Tank (Topuz)', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.SANDWICH, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Defensive Slam', 'Snare Charge', 'Deep Leap', 'Wall of Blades', 'Toughness', 'Düşman ordusuna önden atla ve kitle kontrol uygula.'),
                swaps: [ITEMS.CAMLANN_MACE]
            },
            {
                role: 'Alan Kesici Tank (Clarent Kılıcı / Camlann)', difficulty: 'hard',
                weapon: ITEMS.CLARENT, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.SANDWICH, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Heroic Cleave', 'Iron Will', 'Mighty Blow', null, 'Deep Cuts', 'Görünmezlikle düşmanın arka safına sızıp susturucuyu (Helmet) at.'),
                swaps: [ITEMS.CAMLANN_MACE]
            },
            {
                role: 'Destek/Kargaşa (Locus Arkana)', difficulty: 'hard',
                weapon: ITEMS.LOCUS, offhand: null, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Chain Missile', 'Enigma Blade', 'Void', null, 'Arcane Mastery', 'Düşman bombacıları girince Void (E) aç ve alanlarını temizle.'),
                swaps: [ITEMS.GREATARCANE]
            },
            {
                role: 'Alan Hasarı (Buzul Asası)', difficulty: 'medium',
                weapon: ITEMS.PRISMATIC_STAFF, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.FORT_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Ice Shard', 'Frost Nova', 'Ice Storm', null, 'Aggressive Caster', 'Ordu karşı karşıya gelince ön saflara Buz Fırtınası(E) yağdır.'),
                swaps: [ITEMS.CHILLHOWL]
            },
            {
                role: 'Alan Menzilli Hasarı (Ateş Şube / Cehennem)', difficulty: 'easy',
                weapon: ITEMS.BLAZING, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Fire Bolt', 'Wall of Flames', 'Flame Pillar', null, 'Aggressive Caster', 'Karşı atak yapan tankların geçişini Ateş Duvarı ile engelle.'),
                swaps: [ITEMS.WILDFIRE_STAFF]
            },
            {
                role: 'Yıkıcı Hasar Delici (Wailing Bow)', difficulty: 'medium',
                weapon: ITEMS.WAILING_BOW, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Multishot', 'Explosive Arrows', 'Demon Arrow', null, 'Piercing Arrows', 'Ön saflardaki çekişme esnasında W + E kombonu yapıp düşman ordusunu del.'),
                swaps: [ITEMS.BOW_BADON, ITEMS.WEEPING]
            },
            {
                role: 'Bitirici - Suikast (Realmbreaker / Kan Emici)', difficulty: 'hard',
                weapon: ITEMS.REALMBREAKER, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ROYAL_JACKET, boots: ITEMS.SOLDIER_BOOTS,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Rending Strike', 'Internal Bleeding', 'Aftershock', null, 'Deep Cuts', 'Callage atıldığı anda Tank ile birlikte gir ve rakip ordunun can kapasitesini sil.'),
                swaps: [ITEMS.BLOODLETTER]
            },
            {
                role: 'Grup Şifacısı (Yabani Asa / Düşmüş Asa)', difficulty: 'medium',
                weapon: ITEMS.BLIGHT_STAFF, offhand: ITEMS.LYMHURST_ORB, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Rejuvenation', 'Protection of Nature', 'Well of Life', null, 'Calm', 'Savaşta canı çok düşen veya alan hasarı yiyen ordu bloğuna hayat ağacı (E) aç.'),
                swaps: [ITEMS.FALLEN_STAFF]
            }
        ]
    },
    outpost: {
        title: '🏯 Outpost (10v10)', minPlayers: 10, maxPlayers: 10,
        description: '10vs10 Outpost savaşları. Hızlı çapraz tutuşlar ve büyük alan hasarına odaklanan meta.',
        roles: [
            {
                role: 'Ana Tank (Kırıcı)', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.SANDWICH, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Snare Charge', 'Silencing Strike', 'Wall of Blades', 'Toughness', 'Önden gir, rakip healerları sustur ve yavaşlat.'),
                swaps: [ITEMS.CAMLANN_MACE]
            },
            {
                role: 'Ana Şifacı (Hallowfall)', difficulty: 'medium',
                weapon: ITEMS.HALLOWFALL, offhand: ITEMS.LYMHURST_ORB, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Generous Heal', 'Holy Orb', 'Divine Intervention', null, 'Adrenaline Driven', 'Ön saftaki tankı kurtar ve zıpla (E).'),
                swaps: [ITEMS.DIVINE]
            },
            {
                role: 'Destek (Locus / Arkana)', difficulty: 'hard',
                weapon: ITEMS.LOCUS, offhand: null, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Chain Missile', 'Enigma Blade', 'Void', null, 'Arcane Mastery', 'Düşman bufflarını temizle (E) ve saldırıyı hiç et.'),
                swaps: [ITEMS.GREATARCANE, ITEMS.ARCANE_STAFF]
            },
            {
                role: 'Zırh Kırıcı Delici (Realmbreaker)', difficulty: 'medium',
                weapon: ITEMS.REALMBREAKER, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ROYAL_JACKET, boots: ITEMS.SOLDIER_BOOTS,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Rending Strike', 'Internal Bleeding', 'Aftershock', null, 'Deep Cuts', 'Ana tankın girdiği yere R+E atıp zırhları kır.'),
                swaps: [ITEMS.GREATAXE, ITEMS.CAMLANN_MACE]
            },
            {
                role: 'Büyük Alan Hasarı (Galatine Pair)', difficulty: 'hard',
                weapon: ITEMS.GALATINE_PAIR, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.BOOTS_PLATE_DW,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Heroic Cleave', 'Iron Will', 'Soulless Stream', null, 'Deep Cuts', '3 Yük biriktir. Görünmezlik(Boots) ile rakip arkasına sız ve tek at.'),
                swaps: [ITEMS.BROADSWORD]
            },
            {
                role: 'Alan Menzilli Hasarı (Buzul Asası)', difficulty: 'easy',
                weapon: ITEMS.PRISMATIC_STAFF, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.FORT_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Ice Shard', 'Frost Nova', 'Ice Storm', null, 'Aggressive Caster', 'Tankın tuttuğu grubun üzerine yavaşlatıcı kar fırtınası (E) bırak.'),
                swaps: [ITEMS.CHILLHOWL]
            },
            {
                role: 'Sürekli Hasar (Ateş Şube)', difficulty: 'easy',
                weapon: ITEMS.BLAZING, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Fire Bolt', 'Wall of Flames', 'Flame Pillar', null, 'Aggressive Caster', 'Düşman geçişini Ateş Duvarı ile engelle, uzaktan sürekli hasar ver.'),
                swaps: [ITEMS.WILDFIRE_STAFF]
            },
            {
                role: 'Kontrol / Zırh Delici (Gölgegetiren)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Cursed Sickle', 'Armor Piercer', 'Inner Fire', null, 'Furious', 'Hasarı zırhtan geçiren lanet atışları yap, tanklık yapabilir.'),
                swaps: [ITEMS.CARRIONCALLER]
            },
            {
                role: 'Grup Şifacısı (Doğa Asası)', difficulty: 'medium',
                weapon: ITEMS.BLIGHT_STAFF, offhand: ITEMS.LYMHURST_ORB, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Rejuvenation', 'Protection of Nature', 'Well of Life', null, 'Calm', 'Grubun içine girilen ani yüksek hasarları alan yeteneğiyle onar.'),
                swaps: [ITEMS.IRONROOT]
            },
            {
                role: 'Bitirici - Yürütücü (Bloodletter)', difficulty: 'hard',
                weapon: ITEMS.BLOODLETTER, offhand: ITEMS.MISTCALLER, helmet: ITEMS.HOOD_GRAVEGUARD,
                armor: ITEMS.STALKER_JACKET, boots: ITEMS.BOOTS_LEATHER_DW,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Assassin Spirit', 'Dash', 'Lunging Stabs', null, 'Deep Cuts', '40% Canın altındaki hedefleri tespit et ve anında E ile infaz et.'),
                swaps: [ITEMS.DEATHGIVERS]
            }
        ]
    },
};

let currentDiffFilter = 'all';

function initBuilds() {
    // Difficulty filter
    document.querySelectorAll('#builds-difficulty button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#builds-difficulty button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDiffFilter = btn.dataset.val;
            renderBuilds();
        });
    });
    renderBuilds();
}

function renderBuilds() {
    const contentType = document.getElementById('builds-content-type')?.value || 'solo_dungeon';
    const data = BUILDS_DB[contentType];
    if (!data) return;

    // Info box
    const infoEl = document.getElementById('builds-content-info');
    if (infoEl) {
        infoEl.innerHTML = `
            <div class="content-info-badge">
                <span class="content-badge-title">${data.title}</span>
                <span class="content-badge-players">👥 ${data.minPlayers}${data.maxPlayers !== data.minPlayers ? '–' + data.maxPlayers : ''} Kişi</span>
            </div>
            <p class="content-info-desc">${data.description}</p>
        `;
    }

    const tbody = document.getElementById('builds-tbody');
    if (!tbody) return;

    let roles = data.roles;
    if (currentDiffFilter !== 'all') {
        roles = roles.filter(r => r.difficulty === currentDiffFilter);
    }

    tbody.innerHTML = '';
    roles.forEach(role => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="role-name-cell">
                <div class="role-diff">${DIFF[role.difficulty] || ''}</div>
                <strong>${role.role}</strong>
            </td>
            <td class="gear-cell">${Q(role.weapon)}</td>
            <td class="gear-cell">${role.offhand ? Q(role.offhand) : '<div class="gear-slot empty-gear-slot">✕</div>'}</td>
            <td class="gear-cell">${Q(role.helmet)}</td>
            <td class="gear-cell">${Q(role.armor)}</td>
            <td class="gear-cell">${Q(role.boots)}</td>
            <td class="gear-cell">${Q(role.cape)}</td>
            <td class="gear-cell">${Q(role.food)}</td>
            <td class="gear-cell">${Q(role.potion)}</td>
            <td class="skill-cell">${role.skills}</td>
            <td class="swaps-cell">${(role.swaps || []).map(s => Q(s)).join('')}</td>
        `;
        tbody.appendChild(tr);
    });

    if (roles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><span>🛡️</span><p>Bu filtre için rol bulunamadı.</p></div></td></tr>`;
    }
}

window.initBuilds = initBuilds;
window.renderBuilds = renderBuilds;
