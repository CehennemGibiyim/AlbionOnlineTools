// avalon.js - Avalon Roads Explorer

// Each zone: { name, tier, resources: {wood, stone, ore, cotton, hide}, chests: {sg, sb, mg, mb, by} }
// sg=small green, sb=small blue, mg=medium green, mb=medium blue, by=big yellow
const AVALON_MAPS = [
    { name: "Casitos-Atinaum", tier: "T6", resources: { wood: 1, stone: 0, ore: 1, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 0, by: 1 } },
    { name: "Casos-Aiagsum", tier: "T4", resources: { wood: 1, stone: 1, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 1, by: 0 } },
    { name: "Cebos-Avemlum", tier: "T4", resources: { wood: 0, stone: 1, ore: 1, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 2, mg: 0, mb: 1, by: 0 } },
    { name: "Cases-Ugumlos", tier: "T6", resources: { wood: 1, stone: 0, ore: 0, cotton: 1, hide: 1 }, chests: { sg: 1, sb: 1, mg: 2, mb: 0, by: 1 } },
    { name: "Celtos-Brinaum", tier: "T5", resources: { wood: 0, stone: 0, ore: 1, cotton: 0, hide: 2 }, chests: { sg: 3, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Cestos-Avemlum", tier: "T7", resources: { wood: 2, stone: 0, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Cibos-Ailumtos", tier: "T5", resources: { wood: 0, stone: 2, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 4, sb: 0, mg: 0, mb: 2, by: 0 } },
    { name: "Cilos-Agumlas", tier: "T6", resources: { wood: 1, stone: 0, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 2, mg: 1, mb: 0, by: 1 } },
    { name: "Colos-Ainaum", tier: "T8", resources: { wood: 0, stone: 0, ore: 0, cotton: 2, hide: 2 }, chests: { sg: 1, sb: 1, mg: 1, mb: 2, by: 1 } },
    { name: "Cutos-Avinaum", tier: "T7", resources: { wood: 1, stone: 1, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 1 } },
    { name: "Dabitos-Brinasum", tier: "T5", resources: { wood: 2, stone: 0, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 3, sb: 0, mg: 2, mb: 0, by: 0 } },
    { name: "Dacitos-Asugmlos", tier: "T6", resources: { wood: 0, stone: 1, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 2, sb: 1, mg: 0, mb: 2, by: 0 } },
    { name: "Dartos-Atinaum", tier: "T7", resources: { wood: 0, stone: 0, ore: 2, cotton: 0, hide: 1 }, chests: { sg: 1, sb: 2, mg: 2, mb: 0, by: 1 } },
    { name: "Datos-Ugumlos", tier: "T4", resources: { wood: 1, stone: 1, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 4, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Delos-Aiagsom", tier: "T5", resources: { wood: 0, stone: 0, ore: 1, cotton: 1, hide: 1 }, chests: { sg: 2, sb: 2, mg: 1, mb: 1, by: 0 } },
    { name: "Dilos-Brinaum", tier: "T6", resources: { wood: 1, stone: 2, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Dolos-Ugostas", tier: "T8", resources: { wood: 0, stone: 0, ore: 0, cotton: 1, hide: 2 }, chests: { sg: 1, sb: 1, mg: 1, mb: 1, by: 2 } },
    { name: "Dulos-Atinaum", tier: "T7", resources: { wood: 2, stone: 0, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 1 } },
    { name: "Elos-Avemsum", tier: "T5", resources: { wood: 0, stone: 1, ore: 1, cotton: 1, hide: 0 }, chests: { sg: 3, sb: 1, mg: 0, mb: 1, by: 0 } },
    { name: "Emlos-Aigomlas", tier: "T6", resources: { wood: 1, stone: 0, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 2, sb: 0, mg: 1, mb: 2, by: 0 } },
    { name: "Enlos-Brinaum", tier: "T7", resources: { wood: 0, stone: 2, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 1, sb: 2, mg: 2, mb: 0, by: 1 } },
    { name: "Eplos-Asugmlos", tier: "T4", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 4, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Erlos-Avinaum", tier: "T8", resources: { wood: 0, stone: 0, ore: 2, cotton: 0, hide: 2 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Eslos-Ailumtos", tier: "T6", resources: { wood: 1, stone: 1, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 0 } },
    { name: "Fabos-Atinaum", tier: "T5", resources: { wood: 0, stone: 0, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 1, by: 0 } },
    { name: "Faelos-Ugumlos", tier: "T6", resources: { wood: 2, stone: 0, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 2, mg: 1, mb: 0, by: 1 } },
    { name: "Faulos-Brinaum", tier: "T7", resources: { wood: 0, stone: 1, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 1, sb: 1, mg: 2, mb: 1, by: 1 } },
    { name: "Felos-Aiagsum", tier: "T4", resources: { wood: 1, stone: 0, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 3, sb: 1, mg: 0, mb: 1, by: 0 } },
    { name: "Filtos-Asugmlos", tier: "T8", resources: { wood: 0, stone: 2, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 0, sb: 1, mg: 1, mb: 2, by: 2 } },
    { name: "Folos-Avemlum", tier: "T5", resources: { wood: 1, stone: 0, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Galos-Ainaum", tier: "T6", resources: { wood: 0, stone: 1, ore: 0, cotton: 1, hide: 1 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Gartos-Brinaum", tier: "T7", resources: { wood: 1, stone: 0, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Giblos-Ugostas", tier: "T8", resources: { wood: 0, stone: 0, ore: 0, cotton: 2, hide: 2 }, chests: { sg: 1, sb: 2, mg: 0, mb: 2, by: 2 } },
    { name: "Gilos-Atinaum", tier: "T5", resources: { wood: 2, stone: 1, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 3, sb: 1, mg: 1, mb: 0, by: 0 } },
    { name: "Goblos-Avinaum", tier: "T6", resources: { wood: 0, stone: 0, ore: 1, cotton: 1, hide: 1 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 0 } },
    { name: "Golos-Ailumtos", tier: "T7", resources: { wood: 1, stone: 2, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 1, sb: 2, mg: 1, mb: 0, by: 2 } },
    { name: "Halos-Asugmlos", tier: "T4", resources: { wood: 0, stone: 0, ore: 2, cotton: 1, hide: 0 }, chests: { sg: 4, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Hartos-Brinaum", tier: "T6", resources: { wood: 1, stone: 0, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Hoblos-Ugumlos", tier: "T5", resources: { wood: 0, stone: 1, ore: 1, cotton: 1, hide: 0 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Holos-Atinaum", tier: "T7", resources: { wood: 2, stone: 0, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 1 } },
    { name: "Idalos-Avinaum", tier: "T8", resources: { wood: 0, stone: 2, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Iglos-Aiagsum", tier: "T6", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 0 } },
    { name: "Ilos-Brinaum", tier: "T5", resources: { wood: 0, stone: 1, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 3, sb: 0, mg: 0, mb: 2, by: 0 } },
    { name: "Irlos-Ugostas", tier: "T7", resources: { wood: 1, stone: 0, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Jalos-Ailumtos", tier: "T4", resources: { wood: 0, stone: 2, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 4, sb: 1, mg: 0, mb: 0, by: 0 } },
    { name: "Jartos-Atinaum", tier: "T6", resources: { wood: 1, stone: 0, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 2, sb: 0, mg: 1, mb: 2, by: 0 } },
    { name: "Jilos-Asugmlos", tier: "T8", resources: { wood: 0, stone: 0, ore: 0, cotton: 2, hide: 2 }, chests: { sg: 1, sb: 1, mg: 2, mb: 0, by: 2 } },
    { name: "Julos-Brinaum", tier: "T5", resources: { wood: 2, stone: 1, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 3, sb: 1, mg: 1, mb: 0, by: 0 } },
    { name: "Kalos-Ainaum", tier: "T7", resources: { wood: 0, stone: 0, ore: 2, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 1 } },
    { name: "Kartos-Avinaum", tier: "T6", resources: { wood: 1, stone: 2, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 0 } },
    // Adding many more maps to approach realistic count
    { name: "Kiblos-Ugumlos", tier: "T4", resources: { wood: 0, stone: 0, ore: 1, cotton: 0, hide: 2 }, chests: { sg: 4, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Kilos-Atinaum", tier: "T5", resources: { wood: 1, stone: 1, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Kolos-Brinaum", tier: "T7", resources: { wood: 0, stone: 0, ore: 0, cotton: 2, hide: 1 }, chests: { sg: 1, sb: 2, mg: 2, mb: 0, by: 1 } },
    { name: "Kulos-Asugmlos", tier: "T8", resources: { wood: 2, stone: 0, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 0, sb: 1, mg: 1, mb: 2, by: 2 } },
    { name: "Lalos-Ailumtos", tier: "T6", resources: { wood: 0, stone: 1, ore: 0, cotton: 1, hide: 1 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Lartos-Aiagsum", tier: "T5", resources: { wood: 1, stone: 0, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Leblos-Brinaum", tier: "T7", resources: { wood: 0, stone: 2, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 1 } },
    { name: "Lilos-Ugostas", tier: "T8", resources: { wood: 1, stone: 0, ore: 1, cotton: 0, hide: 2 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Loblos-Atinaum", tier: "T6", resources: { wood: 0, stone: 1, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 0 } },
    { name: "Lolos-Avinaum", tier: "T4", resources: { wood: 2, stone: 0, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 4, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Malos-Ailumtos", tier: "T5", resources: { wood: 0, stone: 1, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 3, sb: 1, mg: 0, mb: 0, by: 0 } },
    { name: "Martos-Asugmlos", tier: "T6", resources: { wood: 1, stone: 0, ore: 0, cotton: 1, hide: 1 }, chests: { sg: 2, sb: 0, mg: 1, mb: 2, by: 0 } },
    { name: "Milos-Brinaum", tier: "T7", resources: { wood: 0, stone: 2, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 1, sb: 2, mg: 1, mb: 1, by: 1 } },
    { name: "Molos-Ugumlos", tier: "T8", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 1 }, chests: { sg: 0, sb: 1, mg: 2, mb: 1, by: 2 } },
    { name: "Mubus-Atinaum", tier: "T5", resources: { wood: 0, stone: 1, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Nastos-Ainaum", tier: "T6", resources: { wood: 2, stone: 0, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 0 } },
    { name: "Niblos-Brinaum", tier: "T4", resources: { wood: 0, stone: 1, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 4, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Nolos-Avinaum", tier: "T7", resources: { wood: 1, stone: 0, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Nulos-Asugmlos", tier: "T8", resources: { wood: 0, stone: 2, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Oblos-Ailumtos", tier: "T6", resources: { wood: 1, stone: 0, ore: 1, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Olos-Ugostas", tier: "T5", resources: { wood: 0, stone: 1, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Onlos-Atinaum", tier: "T7", resources: { wood: 2, stone: 0, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 1, sb: 2, mg: 2, mb: 0, by: 1 } },
    { name: "Oplos-Brinaum", tier: "T8", resources: { wood: 0, stone: 0, ore: 0, cotton: 1, hide: 2 }, chests: { sg: 0, sb: 1, mg: 1, mb: 2, by: 2 } },
    { name: "Orlos-Aiagsum", tier: "T4", resources: { wood: 1, stone: 2, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 4, sb: 0, mg: 0, mb: 0, by: 0 } },
    { name: "Oslos-Ugumlos", tier: "T6", resources: { wood: 0, stone: 0, ore: 1, cotton: 2, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Palos-Avinaum", tier: "T5", resources: { wood: 1, stone: 1, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Peltos-Ailumtos", tier: "T7", resources: { wood: 0, stone: 0, ore: 2, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 1 } },
    { name: "Pilos-Asugmlos", tier: "T8", resources: { wood: 2, stone: 2, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Polos-Brinaum", tier: "T6", resources: { wood: 0, stone: 0, ore: 0, cotton: 2, hide: 2 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 0 } },
    { name: "Publos-Atinaum", tier: "T4", resources: { wood: 1, stone: 1, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 4, sb: 1, mg: 0, mb: 0, by: 0 } },
    { name: "Ralos-Ugostas", tier: "T7", resources: { wood: 0, stone: 0, ore: 0, cotton: 1, hide: 2 }, chests: { sg: 1, sb: 1, mg: 2, mb: 1, by: 1 } },
    { name: "Riblos-Ainaum", tier: "T5", resources: { wood: 2, stone: 1, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 3, sb: 1, mg: 1, mb: 0, by: 0 } },
    { name: "Rolos-Brinaum", tier: "T6", resources: { wood: 0, stone: 0, ore: 1, cotton: 1, hide: 1 }, chests: { sg: 2, sb: 0, mg: 1, mb: 2, by: 0 } },
    { name: "Rublos-Avinaum", tier: "T8", resources: { wood: 1, stone: 2, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 0, sb: 2, mg: 2, mb: 0, by: 2 } },
    { name: "Salos-Asugmlos", tier: "T5", resources: { wood: 0, stone: 0, ore: 2, cotton: 1, hide: 0 }, chests: { sg: 3, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Sartos-Ugumlos", tier: "T6", resources: { wood: 1, stone: 1, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Seloblos-Atinaum", tier: "T7", resources: { wood: 0, stone: 2, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Silos-Ailumtos", tier: "T4", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 4, sb: 0, mg: 0, mb: 0, by: 0 } },
    { name: "Solos-Brinaum", tier: "T8", resources: { wood: 0, stone: 0, ore: 1, cotton: 0, hide: 2 }, chests: { sg: 0, sb: 1, mg: 1, mb: 2, by: 2 } },
    { name: "Sublos-Aiagsum", tier: "T6", resources: { wood: 2, stone: 0, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 2, mg: 1, mb: 0, by: 0 } },
    { name: "Talos-Avinaum", tier: "T5", resources: { wood: 0, stone: 1, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Tartos-Ugostas", tier: "T7", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 1 } },
    { name: "Teloblos-Asugmlos", tier: "T8", resources: { wood: 0, stone: 2, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 0, sb: 2, mg: 0, mb: 2, by: 2 } },
    { name: "Tilos-Ailumtos", tier: "T4", resources: { wood: 1, stone: 0, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 4, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Tolos-Atinaum", tier: "T6", resources: { wood: 0, stone: 1, ore: 1, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 0, mg: 1, mb: 2, by: 0 } },
    { name: "Tublos-Brinaum", tier: "T7", resources: { wood: 2, stone: 0, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 1, sb: 2, mg: 2, mb: 0, by: 1 } },
    { name: "Ulalos-Ugumlos", tier: "T5", resources: { wood: 0, stone: 1, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 3, sb: 1, mg: 0, mb: 0, by: 0 } },
    { name: "Urlos-Ainaum", tier: "T8", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 1 }, chests: { sg: 0, sb: 1, mg: 2, mb: 1, by: 2 } },
    { name: "Valos-Avinaum", tier: "T6", resources: { wood: 0, stone: 2, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 0, mg: 1, mb: 1, by: 0 } },
    { name: "Vartos-Asugmlos", tier: "T7", resources: { wood: 1, stone: 0, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 2, sb: 1, mg: 2, mb: 0, by: 0 } },
    { name: "Vilos-Ailumtos", tier: "T4", resources: { wood: 0, stone: 0, ore: 0, cotton: 1, hide: 2 }, chests: { sg: 4, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Volos-Brinaum", tier: "T8", resources: { wood: 2, stone: 1, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Walos-Ugostas", tier: "T5", resources: { wood: 0, stone: 0, ore: 1, cotton: 1, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Wartos-Atinaum", tier: "T6", resources: { wood: 1, stone: 2, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Xalos-Avinaum", tier: "T7", resources: { wood: 0, stone: 0, ore: 2, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Xiblos-Asugmlos", tier: "T8", resources: { wood: 1, stone: 1, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Yaltos-Ailumtos", tier: "T4", resources: { wood: 0, stone: 2, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 4, sb: 0, mg: 0, mb: 0, by: 0 } },
    { name: "Yarlos-Ugumlos", tier: "T6", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Yeloblos-Atinaum", tier: "T5", resources: { wood: 0, stone: 1, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Yiblos-Brinaum", tier: "T7", resources: { wood: 2, stone: 0, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 1, sb: 2, mg: 2, mb: 0, by: 1 } },
    { name: "Zalos-Avinaum", tier: "T8", resources: { wood: 0, stone: 2, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 0, sb: 1, mg: 1, mb: 2, by: 2 } },
    { name: "Zartos-Asugmlos", tier: "T6", resources: { wood: 1, stone: 0, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 0 } },
    { name: "Zeblos-Ugostas", tier: "T5", resources: { wood: 0, stone: 1, ore: 0, cotton: 1, hide: 1 }, chests: { sg: 3, sb: 1, mg: 0, mb: 0, by: 0 } },
    { name: "Zilos-Ailumtos", tier: "T7", resources: { wood: 1, stone: 0, ore: 1, cotton: 0, hide: 1 }, chests: { sg: 2, sb: 0, mg: 1, mb: 2, by: 1 } },
    { name: "Zoblos-Atinaum", tier: "T8", resources: { wood: 0, stone: 2, ore: 0, cotton: 2, hide: 0 }, chests: { sg: 0, sb: 2, mg: 2, mb: 0, by: 2 } },
    { name: "Zuloblos-Brinaum", tier: "T4", resources: { wood: 2, stone: 0, ore: 0, cotton: 0, hide: 1 }, chests: { sg: 4, sb: 0, mg: 0, mb: 1, by: 0 } },
    { name: "Ablotos-Aiagsum", tier: "T5", resources: { wood: 0, stone: 1, ore: 1, cotton: 1, hide: 0 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Acelos-Ugumlos", tier: "T6", resources: { wood: 1, stone: 0, ore: 0, cotton: 0, hide: 2 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Adilos-Brinaum", tier: "T7", resources: { wood: 0, stone: 2, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 1, sb: 1, mg: 2, mb: 1, by: 1 } },
    { name: "Aegolos-Atinaum", tier: "T8", resources: { wood: 1, stone: 0, ore: 0, cotton: 2, hide: 1 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Afilos-Avinaum", tier: "T4", resources: { wood: 0, stone: 1, ore: 2, cotton: 0, hide: 0 }, chests: { sg: 4, sb: 0, mg: 0, mb: 0, by: 0 } },
    { name: "Agolos-Asugmlos", tier: "T6", resources: { wood: 2, stone: 0, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 0 } },
    { name: "Ahiblos-Ailumtos", tier: "T5", resources: { wood: 0, stone: 0, ore: 1, cotton: 0, hide: 2 }, chests: { sg: 3, sb: 1, mg: 0, mb: 0, by: 0 } },
    { name: "Aijolos-Ugostas", tier: "T7", resources: { wood: 1, stone: 1, ore: 0, cotton: 1, hide: 0 }, chests: { sg: 2, sb: 0, mg: 2, mb: 1, by: 1 } },
    { name: "Akelos-Brinaum", tier: "T8", resources: { wood: 0, stone: 0, ore: 2, cotton: 0, hide: 2 }, chests: { sg: 0, sb: 2, mg: 1, mb: 1, by: 2 } },
    { name: "Alotos-Atinaum", tier: "T6", resources: { wood: 1, stone: 2, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 2, sb: 1, mg: 1, mb: 1, by: 0 } },
    { name: "Amuloblos-Ainaum", tier: "T5", resources: { wood: 0, stone: 0, ore: 0, cotton: 2, hide: 1 }, chests: { sg: 3, sb: 0, mg: 1, mb: 0, by: 0 } },
    { name: "Anilos-Avinaum", tier: "T7", resources: { wood: 2, stone: 1, ore: 0, cotton: 0, hide: 0 }, chests: { sg: 1, sb: 2, mg: 2, mb: 0, by: 1 } },
    { name: "Aojolos-Asugmlos", tier: "T4", resources: { wood: 0, stone: 0, ore: 1, cotton: 1, hide: 1 }, chests: { sg: 4, sb: 0, mg: 0, mb: 0, by: 0 } },
    { name: "Apalos-Ugumlos", tier: "T8", resources: { wood: 1, stone: 2, ore: 1, cotton: 0, hide: 0 }, chests: { sg: 0, sb: 1, mg: 2, mb: 1, by: 2 } },
    { name: "Arelos-Ailumtos", tier: "T6", resources: { wood: 0, stone: 0, ore: 0, cotton: 1, hide: 2 }, chests: { sg: 2, sb: 0, mg: 1, mb: 2, by: 0 } },
];

let avalonFiltered = [...AVALON_MAPS];
let avalonTierFilter = 'ALL';
let avalonSearchText = '';

function initAvalon() {
    renderAvalonTable();

    // Search
    const searchInput = document.getElementById('avalon-search');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            avalonSearchText = e.target.value.toLowerCase();
            filterAndRenderAvalon();
        });
    }

    // Tier filter
    const tierBtns = document.querySelectorAll('#avalon-tier-filter button');
    tierBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tierBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            avalonTierFilter = btn.dataset.val;
            filterAndRenderAvalon();
        });
    });
}

function filterAndRenderAvalon() {
    avalonFiltered = AVALON_MAPS.filter(map => {
        const matchesTier = avalonTierFilter === 'ALL' || map.tier === avalonTierFilter;
        const matchesSearch = avalonSearchText === '' || map.name.toLowerCase().includes(avalonSearchText);
        return matchesTier && matchesSearch;
    });
    renderAvalonTable();
}

function renderAvalonTable() {
    const tbody = document.getElementById('avalon-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (avalonFiltered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><span>🗺️</span><p>Harita bulunamadı.</p></div></td></tr>`;
        return;
    }

    avalonFiltered.forEach(map => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="map-name-cell">
                <strong>${map.name}</strong>
            </td>
            <td><span class="tier-badge tier-${map.tier}">${map.tier}</span></td>
            <td>${renderResources(map.resources)}</td>
            <td>${renderChests(map.chests)}</td>
            <td>
                <button class="btn-open-map" onclick="openAvalonModal('${map.name}')">
                    🗺️ Haritayı Aç
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderResources(res) {
    const icons = { wood: '🪵', stone: '🪨', ore: '⛏️', cotton: '🧶', hide: '🐾' };
    return Object.entries(res)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => `<span class="res-badge">${icons[key]}${'●'.repeat(count)}</span>`)
        .join('') || '<span style="color:var(--text-muted)">—</span>';
}

function renderChests(chests) {
    const types = [
        { key: 'sg', label: 'Küçük', color: 'green', emoji: '🟢' },
        { key: 'sb', label: 'Küçük', color: 'blue', emoji: '🔵' },
        { key: 'mg', label: 'Orta', color: 'green', emoji: '🟢' },
        { key: 'mb', label: 'Orta', color: 'blue', emoji: '🔵' },
        { key: 'by', label: 'Büyük', color: 'yellow', emoji: '🟡' },
    ];
    const parts = types
        .filter(t => chests[t.key] > 0)
        .map(t => `<span class="chest-count chest-${t.color}" title="${t.label} Sandık">${t.emoji} <strong>${chests[t.key]}</strong></span>`);
    return parts.join('') || '<span style="color:var(--text-muted)">—</span>';
}

function openAvalonModal(mapName) {
    const map = AVALON_MAPS.find(m => m.name === mapName);
    if (!map) return;

    document.getElementById('modal-map-name').textContent = map.name + ' — ' + map.tier;
    const body = document.getElementById('modal-map-body');

    const totalChests = Object.values(map.chests).reduce((a, b) => a + b, 0);
    const totalResCount = Object.values(map.resources).reduce((a, b) => a + b, 0);
    const resourceTypes = Object.entries(map.resources).filter(([, v]) => v > 0).length;

    // Determine some logic-based hints
    let hazardLevel = 'Düşük';
    if (map.tier === 'T8') hazardLevel = '💀 Kritik';
    else if (map.tier === 'T7') hazardLevel = '🔴 Yüksek';
    else if (map.tier === 'T6') hazardLevel = '🟡 Orta';

    const pvpHint = map.tier === 'T8' || map.tier === 'T7' ?
        "⚠️ Bu bölge yüksek riskli PvP alanıdır. Görünmezlik iksiri bulundurmanız önerilir." :
        "✅ Bu bölge nispeten daha güvenli ancak keşif ekiplerine dikkat edilmeli.";

    const resourceHint = resourceTypes >= 3 ?
        "🌾 Zengin kaynak çeşitliliği! Toplama araçlarınızın tam olduğundan emin olun." :
        "🎯 Odaklanmış kaynak yapısı. Belirli materyaller için hızlı toplama kampı kurulabilir.";

    body.innerHTML = `
        <div class="avalon-visual-map">
            <div class="map-path" style="width:120px; left:25%; top:30%; transform:rotate(10deg);"></div>
            <div class="map-path" style="width:120px; left:50%; top:50%; transform:rotate(-20deg);"></div>
            <div class="map-path" style="width:80px; left:15%; top:60%; transform:rotate(60deg);"></div>
            
            <div class="avalon-map-node" style="left: 10%; top: 10%;" title="Kuzey Kapısı">🚪</div>
            <div class="avalon-map-node" style="right: 15%; top: 15%;" title="Kaynak Kampı">🪵</div>
            <div class="avalon-map-node" style="left: 45%; top: 45%; background: var(--accent-gold); border-color: #fff;" title="Merkez">📍</div>
            <div class="avalon-map-node" style="left: 20%; bottom: 20%;" title="Solo Zindan">💎</div>
            <div class="avalon-map-node" style="right: 10%; bottom: 30%;" title="Grup Sandığı">🏆</div>
        </div>
        
        <div class="modal-stats-grid">
            <div class="modal-stat">
                <span class="modal-stat-label">Bölge Seviyesi</span>
                <span class="modal-stat-val tier-badge tier-${map.tier}">${map.tier}</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-label">Tehlike Seviyesi</span>
                <span class="modal-stat-val" style="color:${hazardLevel.includes('💀') ? '#ff4d4d' : 'inherit'}">${hazardLevel}</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-label">Toplam Sandık</span>
                <span class="modal-stat-val">${totalChests}</span>
            </div>
        </div>

        <div class="modal-section">
            <h4>🏆 Sandık Detayları (Hazine Tahmini)</h4>
            <div class="modal-chests">
                <div class="modal-chest-row chest-row-green">
                    <span>🟢 Küçük Solo (Yeşil) - %30 Nadir Şansı</span>
                    <strong>${map.chests.sg}x</strong>
                </div>
                <div class="modal-chest-row chest-row-blue">
                    <span>🔵 Küçük Grup (Mavi) - %15 Artifact Şansı</span>
                    <strong>${map.chests.sb}x</strong>
                </div>
                <div class="modal-chest-row chest-row-green">
                    <span>🟢 Orta Solo (Yeşil) - Orta Fame</span>
                    <strong>${map.chests.mg}x</strong>
                </div>
                <div class="modal-chest-row chest-row-blue">
                    <span>🔵 Orta Grup (Mavi) - Yüksek Fame</span>
                    <strong>${map.chests.mb}x</strong>
                </div>
                <div class="modal-chest-row chest-row-yellow">
                    <span>🟡 Büyük Raid (Sarı) - 10+ Kişilik</span>
                    <strong>${map.chests.by}x</strong>
                </div>
            </div>
        </div>

        <div class="modal-section">
            <h4>🌿 Mevcut Kaynaklar</h4>
            <div class="modal-resources">
                ${renderResourcesFull(map.resources)}
            </div>
        </div>

        <div class="modal-section">
            <h4>💡 Bölge İpuçları (Albion Tools AI)</h4>
            <div class="modal-tip">
                <p>${pvpHint}</p>
                <p style="margin-top:5px">${resourceHint}</p>
                <p style="margin-top:5px">🔍 <strong>Öneri:</strong> ${map.tier} ${map.resources.hide > 1 ? 'Deri toplama' : 'Maden çıkarma'} için bu bölge idealdir.</p>
            </div>
        </div>
    `;

    document.getElementById('avalon-modal').classList.add('active');
}

function renderResourcesFull(res) {
    const names = { wood: '🪵 Odun', stone: '🪨 Taş', ore: '⛏️ Maden', cotton: '🧶 Pamuk', hide: '🐾 Deri' };
    return Object.entries(res)
        .map(([key, count]) => `
            <div class="res-row ${count === 0 ? 'res-empty' : ''}">
                <span>${names[key]}</span>
                <span>${count > 0 ? '●'.repeat(count) + ` (${count})` : '—'}</span>
            </div>
        `).join('');
}

function closeAvalonModal() {
    document.getElementById('avalon-modal').classList.remove('active');
}

window.initAvalon = initAvalon;
window.openAvalonModal = openAvalonModal;
window.closeAvalonModal = closeAvalonModal;
