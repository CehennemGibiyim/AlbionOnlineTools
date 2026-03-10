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
    WARCALLER: 'T8_2H_ICEEYE_CRYSTAL',
    CHILLHOWL: 'T8_MAIN_FROSTSTAFF_KEEPER',
    SHADOWCALLER: 'T8_MAIN_CURSEDSTAFF_AVALON',
    LIFETOUCH: 'T8_MAIN_HOLYSTAFF_AVALON',
    DIVINE: 'T8_MAIN_HOLYSTAFF',
    HALLOWFALL: 'T8_2H_HOLYSTAFF_HELL',
    GREATARCANE: 'T8_2H_ARCANESTAFF',
    IRON_BREAKER: 'T8_MAIN_MACE',
    CLARENT: 'T8_MAIN_SWORD_CRYSTAL',
    LIGHT_CROSSBOW: 'T8_MAIN_CROSSBOW',
    WEEPING: 'T8_2H_CROSSBOW_CRYSTAL',
    BLAZING: 'T8_2H_FIRESTAFF_HELL',
    LIGHTCALLER: 'T8_MAIN_NATURESTAFF_AVALON',
    IRONROOT: 'T8_2H_NATURESTAFF_KEEPER',
    BOW_BADON: 'T8_2H_BOW_HELL',
    BOLTCASTER: 'T8_2H_CROSSBOW_KEEPER',
    DOUBLEBLADE: 'T8_2H_QUARTERSTAFF_HELL',
    GRAILSEEKER: 'T8_2H_QUARTERSTAFF_AVALON',
    SPIRITHUNTER: 'T8_2H_SPEAR_HELL',
    OATHKEEPERS: 'T8_2H_HAMMER_HELL',
    CARRIONCALLER: 'T8_2H_CURSEDSTAFF_HELL',
    WILDSTAFF: 'T8_2H_WILDSTAFF',
    INFERNAL_SCYTHE: 'T8_2H_SCYTHE_HELL',
    REALMBREAKER: 'T8_2H_AXE_HELL',
    BEARCLAWS: 'T8_2H_DAGGER_HELL',
    DEATHGIVERS: 'T8_2H_DAGGERPAIR',
    WHISPERING: 'T8_2H_BOW_UNDEAD',

    // Off Hands
    SHIELD_ROYAL: 'T8_OFF_SHIELD_KEEPER',
    MISTCALLER: 'T8_OFF_TOTEM_KEEPER',
    EYE_OF_SECRETS: 'T8_OFF_ORB_MORGANA',
    LYMHURST_ORB: 'T8_OFF_BOOK',

    // Helmets
    HELMET_CLOTH_DW: 'T8_HEAD_CLOTH_SET3',
    HELMET_PLATE_DW: 'T8_HEAD_PLATE_SET3',
    HELMET_LEATHER_DW: 'T8_HEAD_LEATHER_SET3',
    HOOD_GRAVEGUARD: 'T8_HEAD_PLATE_SET1',
    COWL_CLOTH: 'T8_HEAD_CLOTH_SET1',
    HOOD_ASSASSIN: 'T8_HEAD_LEATHER_SET1',
    HUNTER_HOOD: 'T8_HEAD_LEATHER_SET2',
    MAGE_COWL: 'T8_HEAD_CLOTH_SET2',
    SOLDIER_HELMET: 'T8_HEAD_PLATE_SET2',

    // Armors
    ROBE_OF_PROT: 'T8_ARMOR_CLOTH_SET3',
    KNIGHT_ARMOR: 'T8_ARMOR_PLATE_SET3',
    ASSASSIN_JACKET: 'T8_ARMOR_LEATHER_SET3',
    REINFORCED_CHEST: 'T8_ARMOR_PLATE_SET1',
    CLERIC_ROBE: 'T8_ARMOR_CLOTH_SET1',
    ROYAL_JACKET: 'T8_ARMOR_LEATHER_SET1',
    DRUID_ROBE: 'T8_ARMOR_CLOTH_SET2',
    GUARD_ARMOR: 'T8_ARMOR_PLATE_SET2',
    STALKER_JACKET: 'T8_ARMOR_LEATHER_SET2',

    // Boots
    BOOTS_PLATE_DW: 'T8_SHOES_PLATE_SET3',
    BOOTS_CLOTH_DW: 'T8_SHOES_CLOTH_SET3',
    BOOTS_LEATHER_DW: 'T8_SHOES_LEATHER_SET3',
    SOLDIER_BOOTS: 'T8_SHOES_PLATE_SET2',
    SCHOLAR_SANDALS: 'T8_SHOES_CLOTH_SET2',
    HUNTER_SHOES: 'T8_SHOES_LEATHER_SET2',
    GUARDIAN_BOOTS: 'T8_SHOES_PLATE_SET1',
    CULTIST_SANDALS: 'T8_SHOES_CLOTH_SET1',
    ASSASSIN_SHOES: 'T8_SHOES_LEATHER_SET1',

    // Capes
    LYMHURST_CAPE: 'T8_CAPEITEM_FW_LYMHURST',
    MARTLOCK_CAPE: 'T8_CAPEITEM_FW_MARTLOCK',
    BRIDGEWATCH_CAPE: 'T8_CAPEITEM_FW_BRIDGEWATCH',
    THETFORD_CAPE: 'T8_CAPEITEM_FW_THETFORD',
    BLANKET_CAPE: 'T8_CAPEITEM_AVALON',
    FORT_CAPE: 'T8_CAPEITEM_FW_FORTSTERLING',
    CAERLEON_CAPE: 'T8_CAPEITEM_CAERLEON',

    // Food — verified Albion render API IDs
    PORK_OMELETTE: 'T7_MEAL_OMELETTE@1',
    BEEF_STEW: 'T8_MEAL_STEW@1',
    BREAD: 'T8_MEAL_SANDWICH@1',
    ROAST_PORK: 'T8_MEAL_ROASTPORK@1',
    PIE: 'T8_MEAL_PIE@1',
    SALAD: 'T8_MEAL_SALAD@1',

    // Potions — verified Albion render API IDs
    MAJOR_HEALING: 'T6_POTION_HEAL@1',
    MAJOR_RESISTANCE: 'T8_POTION_STONESKIN@1',
    ENERGY_POTION: 'T8_POTION_ENERGY@1',
    GIANT_STRENGTH: 'T8_POTION_GIGANTIFY@1',
    INVISIBILITY: 'T8_POTION_INVISIBILITY@1',
    CLEANSE: 'T8_POTION_CLEANSE@1',
};

// =================== BUILDS DATABASE ===================
const BUILDS_DB = {
    solo_dungeon: {
        title: '⚔️ Solo Dungeon', minPlayers: 1, maxPlayers: 1,
        description: 'Solo içerikler için yüksek hasar ve hayatta kalma dengesi. Mobil ve güçlü buildler önerilir.',
        roles: [
            {
                role: 'DPS (Deathgivers)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta',
                    '2× E + R + QQ → kaç'),
                swaps: [ITEMS.DOUBLEBLADE, ITEMS.BEARCLAWS, ITEMS.WHISPERING]
            },
            {
                role: 'DPS (Whispering Bow)', difficulty: 'easy',
                weapon: ITEMS.WHISPERING, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.STALKER_JACKET, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Multishot', 'Sniper Shot', 'Deadly Shot', null, 'Bow of Badon passive',
                    'Q spam → W → E full dolu'),
                swaps: [ITEMS.BOW_BADON, ITEMS.BOLTCASTER]
            },
            {
                role: 'Self-Heal (Wildstaff)', difficulty: 'medium',
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
        description: '4 kişilik grup içerikleri. 1 tank, 1 healer, 2 DPS kompozisyonu önerilir.',
        roles: [
            {
                role: 'Ana Tank', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.BOOTS_PLATE_DW,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BREAD, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Empowered Slam', 'Magnetic Zone', 'Wall of Blades', 'Toughness', 'Gruba doğru E → W → Q zinciri'),
                swaps: [ITEMS.CLARENT, ITEMS.OATHKEEPERS]
            },
            {
                role: 'Healer (Hallowfall)', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Summon Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', 'E → W arkaplana → R düşükte'),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
            {
                role: 'DPS (Shadowcaller)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', 'E → Q×3 → W → R boss→'),
                swaps: [ITEMS.WEEPING, ITEMS.CARRIONCALLER]
            },
            {
                role: 'DPS (Chillhowl)', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', 'Q dolu → E yığ → W frost nova'),
                swaps: [ITEMS.WARCALLER, ITEMS.BLAZING]
            },
        ]
    },
    group_dungeon_7: {
        title: '👥 Grup Dungeon (7 Kişi)', minPlayers: 7, maxPlayers: 7,
        description: '7 kişilik grup içerikleri. 1-2 tank, 1-2 healer, 3-4 DPS önerilir.',
        roles: [
            {
                role: 'Ana Tank', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BREAD, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Empowered Slam', 'Magnetic Zone', 'Wall of Blades', 'Toughness', ''),
                swaps: [ITEMS.CLARENT, ITEMS.OATHKEEPERS]
            },
            {
                role: 'Off Tank', difficulty: 'medium',
                weapon: ITEMS.CLARENT, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.SOLDIER_HELMET,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.SOLDIER_BOOTS,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BREAD, potion: ITEMS.GIANT_STRENGTH,
                skills: SKILL('Heroic Cleave', 'Blade AoE', 'Energetic', null, 'Defiant', 'Tankın arkasında durup hasar al'),
                swaps: [ITEMS.SPIRITHUNTER, ITEMS.REALMBREAKER]
            },
            {
                role: 'Ana Healer', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Summon Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', ''),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
            {
                role: 'Great Arcane', difficulty: 'medium',
                weapon: ITEMS.GREATARCANE, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Arcane Eye', 'Enfeeble Aura', 'Arcane Orb', null, 'Arcane Mastery', 'E buff + W debuff → Q zinciri'),
                swaps: [ITEMS.LIFETOUCH, ITEMS.MISTCALLER]
            },
            {
                role: 'DPS (Shadowcaller)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', ''),
                swaps: [ITEMS.WEEPING, ITEMS.CARRIONCALLER]
            },
            {
                role: 'DPS (Chillhowl)', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', ''),
                swaps: [ITEMS.WARCALLER, ITEMS.BLAZING]
            },
            {
                role: 'DPS (Light Crossbow)', difficulty: 'easy',
                weapon: ITEMS.LIGHT_CROSSBOW, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.KNIGHT_ARMOR, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.THETFORD_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Bolt', 'Explosive Bolt', 'Snipe', 'Energy Shield', 'Veteran', 'W → Q×3 → E max range'),
                swaps: [ITEMS.BOLTCASTER, ITEMS.BOW_BADON]
            },
        ]
    },
    avalon_dungeon: {
        title: '⚔️ Avalon Dungeon (10 Kişi)', minPlayers: 10, maxPlayers: 12,
        description: '10+ kişilik Avalon içerikleri. Resim referansı: 10 Man Ava Dungeon Builds.',
        roles: [
            {
                role: 'MAIN TANK', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BREAD, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Empowered Slam', 'Magnetic Zone', 'Wall of Blades', 'Toughness', 'Boss hedef al → E tank pozisyonu'),
                swaps: [ITEMS.CLARENT, ITEMS.OATHKEEPERS, ITEMS.SPIRITHUNTER]
            },
            {
                role: 'SECOND TANK', difficulty: 'medium',
                weapon: ITEMS.CLARENT, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.SOLDIER_HELMET,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.SOLDIER_BOOTS,
                cape: ITEMS.FORT_CAPE, food: ITEMS.BREAD, potion: ITEMS.GIANT_STRENGTH,
                skills: SKILL('Heroic Cleave', 'Blade AoE', 'Energetic', null, 'Defiant', 'Main tankı destekle'),
                swaps: [ITEMS.IRON_BREAKER, ITEMS.SHIELD_ROYAL, ITEMS.BOOTS_PLATE_DW]
            },
            {
                role: 'MAIN HEALER', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', 'E → R düşükte → W pozisyonu koru'),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE, ITEMS.BOOTS_CLOTH_DW]
            },
            {
                role: 'GREAT ARCANE', difficulty: 'medium',
                weapon: ITEMS.GREATARCANE, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Arcane Eye', 'Enfeeble Aura', 'Arcane Orb', null, 'Arcane Mastery', 'E buff tank → W debuff boss'),
                swaps: [ITEMS.LIFETOUCH, ITEMS.MISTCALLER, ITEMS.COWL_CLOTH]
            },
            {
                role: 'IR STALKER', difficulty: 'hard',
                weapon: ITEMS.IRONROOT, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Thorns', 'Briar Patch', 'Rampant Growth', null, 'Equilibrium', 'W yerleştir → Q × spam → E dolduğunda patlat'),
                swaps: [ITEMS.WILDSTAFF, ITEMS.LIGHTCALLER, ITEMS.STALKER_JACKET]
            },
            {
                role: 'CRYSTAL REAPER', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', 'E × Q spam → W → R boss dön swap: Weeping/Boltcaster/Artic (min T7.3)'),
                swaps: [ITEMS.WEEPING, ITEMS.BOLTCASTER, ITEMS.WARCALLER]
            },
            {
                role: 'BLAZING', difficulty: 'medium',
                weapon: ITEMS.BLAZING, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Searing Flame', 'Lava Sphere', 'Flame Pillar', null, 'Pyromaniac', 'Q× → E stack → W alan'),
                swaps: [ITEMS.SHADOWCALLER, ITEMS.CARRIONCALLER]
            },
            {
                role: 'SHADOWCALLER', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', ''),
                swaps: [ITEMS.WEEPING, ITEMS.LIGHT_CROSSBOW, ITEMS.ROYAL_JACKET]
            },
            {
                role: 'LIGHT CROSSBOW', difficulty: 'easy',
                weapon: ITEMS.LIGHT_CROSSBOW, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.KNIGHT_ARMOR, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.THETFORD_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Bolt', 'Explosive Bolt', 'Snipe', 'Energy Shield', 'Veteran', 'Güvenli uzak mesafe DPS'),
                swaps: [ITEMS.BOLTCASTER, ITEMS.BOW_BADON, ITEMS.STALKER_JACKET]
            },
            {
                role: 'WEEPING', difficulty: 'hard',
                weapon: ITEMS.WEEPING, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.ROAST_PORK, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Vile Curse', 'Corpse Explosion', 'Soulburn', 'Reap', 'Endless Dark', 'W yerleştir → Q tüm gruba → E canavar patlat'),
                swaps: [ITEMS.SHADOWCALLER, ITEMS.BLAZING]
            },
            {
                role: 'CHILLHOWL', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', 'Q dolu → E yığ → W nova'),
                swaps: [ITEMS.WARCALLER, ITEMS.SHADOWCALLER]
            },
            {
                role: 'SCOUT / KAÇIŞ', difficulty: 'easy',
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
                role: 'DPS (Deathgivers)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta', 'Hızlı temizleme → kaç'),
                swaps: [ITEMS.BEARCLAWS, ITEMS.DOUBLEBLADE]
            },
            {
                role: 'Healer (Hallowfall)', difficulty: 'easy',
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
                role: 'Ganker (Deathgivers)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.INVISIBILITY,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta', 'Invisibility iksiri → yaklaş → E → R burst → kaç'),
                swaps: [ITEMS.BEARCLAWS, ITEMS.DOUBLEBLADE, ITEMS.WHISPERING]
            },
            {
                role: 'Ganker (Bearclaws)', difficulty: 'medium',
                weapon: ITEMS.BEARCLAWS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.INVISIBILITY,
                skills: SKILL('Bear Paws Q', 'Rending Spin', 'Deadly Lunge', null, 'Predatory Focus', 'Invisible → W spin → Q × R burst'),
                swaps: [ITEMS.DEATHGIVERS, ITEMS.DOUBLEBLADE]
            },
        ]
    },
    tracking_4: {
        title: '🔍 Tracking (4 Kişi)', minPlayers: 4, maxPlayers: 4,
        description: '4 kişilik gank grubu. Holder, DPS, Healer kombinasyonu.',
        roles: [
            {
                role: 'Holder (Double Blade)', difficulty: 'medium',
                weapon: ITEMS.DOUBLEBLADE, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.CLEANSE,
                skills: SKILL('Surging Strikes', 'Stun Run', 'Dancing Blades', null, 'Vendetta', 'Hedefi yakala → E tut → grubun gelmesini bekle'),
                swaps: [ITEMS.REALMBREAKER, ITEMS.SPIRITHUNTER]
            },
            {
                role: 'DPS (Bearclaws)', difficulty: 'easy', isGankGear: true,
                weapon: ITEMS.BEARCLAWS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Bear Paws Q', 'Rending Spin', 'Deadly Lunge', null, 'Predatory Focus', ''),
                swaps: [ITEMS.DEATHGIVERS, ITEMS.WHISPERING]
            },
            {
                role: 'DPS (1H Cursed)', difficulty: 'medium',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Soulburn', 'Desecrate', null, 'Black Hands', ''),
                swaps: [ITEMS.CARRIONCALLER, ITEMS.WEEPING]
            },
            {
                role: 'Healer (Hallowfall)', difficulty: 'easy',
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
                role: 'Holder (Double Blade)', difficulty: 'medium',
                weapon: ITEMS.DOUBLEBLADE, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BLANKET_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.CLEANSE,
                skills: SKILL('Surging Strikes', 'Stun Run', 'Dancing Blades', null, 'Vendetta', ''),
                swaps: [ITEMS.REALMBREAKER, ITEMS.SPIRITHUNTER]
            },
            {
                role: 'Holder (1H Frost)', difficulty: 'hard',
                weapon: ITEMS.WARCALLER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.THETFORD_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.CLEANSE,
                skills: SKILL('Shatter Lance', 'Ice Block', 'Frost Bomb', null, 'Battle Frenzy', 'E durdur → W blok → Q hasar'),
                swaps: [ITEMS.CHILLHOWL, ITEMS.IRON_BREAKER]
            },
            {
                role: 'DPS (Bearclaws)', difficulty: 'easy',
                weapon: ITEMS.BEARCLAWS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Bear Paws Q', 'Rending Spin', 'Deadly Lunge', null, 'Predatory Focus', ''),
                swaps: [ITEMS.DEATHGIVERS, ITEMS.DOUBLEBLADE]
            },
            {
                role: 'DPS (Whispering Bow)', difficulty: 'easy',
                weapon: ITEMS.WHISPERING, offhand: null, helmet: ITEMS.HUNTER_HOOD,
                armor: ITEMS.STALKER_JACKET, boots: ITEMS.HUNTER_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Multishot', 'Sniper Shot', 'Deadly Shot', null, 'Bow of Badon passive', ''),
                swaps: [ITEMS.BOW_BADON, ITEMS.BOLTCASTER]
            },
            {
                role: 'DPS (1H Cursed)', difficulty: 'medium',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Soulburn', 'Desecrate', null, 'Black Hands', ''),
                swaps: [ITEMS.WEEPING, ITEMS.CARRIONCALLER]
            },
            {
                role: 'DPS (1H Deathgivers)', difficulty: 'easy',
                weapon: ITEMS.DEATHGIVERS, offhand: null, helmet: ITEMS.HOOD_ASSASSIN,
                armor: ITEMS.ASSASSIN_JACKET, boots: ITEMS.ASSASSIN_SHOES,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.PORK_OMELETTE, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Deadly Swipe', 'Stun Run', 'Dancing Blades', 'Relentless Focus', 'Vendetta', ''),
                swaps: [ITEMS.BEARCLAWS, ITEMS.DOUBLEBLADE]
            },
            {
                role: 'Healer (Hallowfall)', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', ''),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
        ]
    },
    static: {
        title: '🏰 Statik', minPlayers: 5, maxPlayers: 7,
        description: 'Statik dungeon içerikleri. Düzenli grup ile tekrarlanan dungeon temizleme.',
        roles: [
            {
                role: 'Tank', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BREAD, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Empowered Slam', 'Magnetic Zone', 'Wall of Blades', 'Toughness', ''),
                swaps: [ITEMS.CLARENT, ITEMS.OATHKEEPERS]
            },
            {
                role: 'Healer', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', ''),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
            {
                role: 'DPS (Shadowcaller)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', ''),
                swaps: [ITEMS.WEEPING, ITEMS.CARRIONCALLER]
            },
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
                role: 'DPS (Chillhowl)', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', ''),
                swaps: [ITEMS.BLAZING, ITEMS.WARCALLER]
            },
        ]
    },
    zvz_20: {
        title: '⚔️ ZvZ — 20+ Kişi', minPlayers: 20, maxPlayers: 100,
        description: 'Büyük ölçekli ZvZ savaşları. Özel ZvZ silahları ve koordineli roller.',
        roles: [
            {
                role: 'Off Tank / Silence', difficulty: 'hard',
                weapon: ITEMS.CLARENT, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.SOLDIER_HELMET,
                armor: ITEMS.GUARD_ARMOR, boots: ITEMS.SOLDIER_BOOTS,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.BREAD, potion: ITEMS.GIANT_STRENGTH,
                skills: SKILL('Heroic Cleave', 'Blade AoE', 'Energetic', null, 'Defiant', 'Düşman healeri sustur → tank yaklaş'),
                swaps: [ITEMS.SPIRITHUNTER, ITEMS.REALMBREAKER, ITEMS.IRON_BREAKER]
            },
            {
                role: 'Great Arcane', difficulty: 'medium',
                weapon: ITEMS.GREATARCANE, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.CAERLEON_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Arcane Eye', 'Enfeeble Aura', 'Arcane Orb', null, 'Arcane Mastery', 'E arkadaş buff → W düşman debuff'),
                swaps: [ITEMS.LIFETOUCH, ITEMS.LYMHURST_ORB]
            },
            {
                role: 'Main Healer', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', ''),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE, ITEMS.LIGHTCALLER]
            },
            {
                role: 'Shadowcaller DPS', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', 'Komutanı vur → E × spam'),
                swaps: [ITEMS.WEEPING, ITEMS.LIGHT_CROSSBOW, ITEMS.CARRIONCALLER]
            },
            {
                role: 'Lightcaller', difficulty: 'medium',
                weapon: ITEMS.LIGHTCALLER, offhand: null, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.ROBE_OF_PROT, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Rejuvenate', 'Ray of Light', 'Lights Embrace', null, 'Enlightenment', 'E W Q döngü → verimine bak'),
                swaps: [ITEMS.IRONROOT, ITEMS.WILDSTAFF]
            },
            {
                role: 'Chillhowl DPS', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', ''),
                swaps: [ITEMS.BLAZING, ITEMS.WARCALLER]
            },
        ]
    },
    outpost: {
        title: '🏯 Outpost (10v10)', minPlayers: 10, maxPlayers: 10,
        description: '10vs10 Outpost savaşları. Hızlı reaksiyon ve pozisyonlama kritik.',
        roles: [
            {
                role: 'Main Tank', difficulty: 'medium',
                weapon: ITEMS.IRON_BREAKER, offhand: ITEMS.SHIELD_ROYAL, helmet: ITEMS.HELMET_PLATE_DW,
                armor: ITEMS.REINFORCED_CHEST, boots: ITEMS.GUARDIAN_BOOTS,
                cape: ITEMS.MARTLOCK_CAPE, food: ITEMS.BREAD, potion: ITEMS.MAJOR_RESISTANCE,
                skills: SKILL('Taunt Charge', 'Empowered Slam', 'Magnetic Zone', 'Wall of Blades', 'Toughness', 'Outpost kapısını tut'),
                swaps: [ITEMS.CLARENT, ITEMS.SPIRITHUNTER, ITEMS.OATHKEEPERS]
            },
            {
                role: 'Healer', difficulty: 'easy',
                weapon: ITEMS.HALLOWFALL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.CLERIC_ROBE, boots: ITEMS.SCHOLAR_SANDALS,
                cape: ITEMS.LYMHURST_CAPE, food: ITEMS.PIE, potion: ITEMS.ENERGY_POTION,
                skills: SKILL('Radiant Orb', 'Undead Cart', 'Holy Nova', 'Divine Intervention', 'Martyr', ''),
                swaps: [ITEMS.GRAILSEEKER, ITEMS.DIVINE]
            },
            {
                role: 'DPS (Shadowcaller)', difficulty: 'hard',
                weapon: ITEMS.SHADOWCALLER, offhand: ITEMS.EYE_OF_SECRETS, helmet: ITEMS.COWL_CLOTH,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.CULTIST_SANDALS,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Cursed Sickle', 'Inner Fire', 'Desecrate', 'Hellfire Hands', 'Black Hands', ''),
                swaps: [ITEMS.WEEPING, ITEMS.CARRIONCALLER]
            },
            {
                role: 'DPS (Chillhowl)', difficulty: 'medium',
                weapon: ITEMS.CHILLHOWL, offhand: null, helmet: ITEMS.MAGE_COWL,
                armor: ITEMS.DRUID_ROBE, boots: ITEMS.BOOTS_CLOTH_DW,
                cape: ITEMS.BRIDGEWATCH_CAPE, food: ITEMS.BEEF_STEW, potion: ITEMS.MAJOR_HEALING,
                skills: SKILL('Shatter Lance', 'Frost Nova', 'Avalanche', null, 'Battle Frenzy', ''),
                swaps: [ITEMS.BLAZING, ITEMS.WARCALLER]
            },
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
