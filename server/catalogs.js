/* ==========================================================
   MINES
========================================================== */

const mines = [

    {
        id: "bronze",
        name: "Mina de Bronce",
        color: "#bd7745",
        level: 1
    },

    {
        id: "silver",
        name: "Mina de Plata",
        color: "#c2d5e2",
        level: 4
    },

    {
        id: "gold",
        name: "Mina de Oro",
        color: "#ffca55",
        level: 8
    },

    {
        id: "platinum",
        name: "Mina de Platino",
        color: "#91e7df",
        level: 14
    },

    {
        id: "diamond",
        name: "Mina Diamante",
        color: "#7dceff",
        level: 22
    },

    {
        id: "titanium",
        name: "Mina Titanio",
        color: "#ae90ff",
        level: 32
    }

];


/* ==========================================================
   PICKAXES
========================================================== */

const picks = [

    {
        id: "bronze",
        name: "Pico de Bronce",
        dps: 6,
        cost: 250
    },

    {
        id: "silver",
        name: "Pico de Plata",
        dps: 18,
        cost: 1200
    },

    {
        id: "gold",
        name: "Pico de Oro",
        dps: 45,
        cost: 5500
    },

    {
        id: "platinum",
        name: "Pico de Platino",
        dps: 100,
        cost: 18000
    },

    {
        id: "diamond",
        name: "Pico Diamante",
        dps: 220,
        cost: 65000
    },

    {
        id: "titanium",
        name: "Pico Titanio",
        dps: 500,
        cost: 225000
    }

];


/* ==========================================================
   UPGRADES
========================================================== */

const upgrades = [

    {
        id: "tapPower",
        name: "Fuerza de golpe",
        description: "+5 GEO por toque",
        baseCost: 100,
        factor: 1.55,
        max: 50
    },

    {
        id: "energyRegen",
        name: "Recarga energética",
        description: "+2 energía por segundo",
        baseCost: 160,
        factor: 1.60,
        max: 25
    },

    {
        id: "maxEnergy",
        name: "Batería ampliada",
        description: "+100 energía máxima",
        baseCost: 220,
        factor: 1.65,
        max: 20
    },

    {
        id: "extraOre",
        name: "Veta abundante",
        description: "+5% mineral adicional",
        baseCost: 350,
        factor: 1.70,
        max: 20
    },

    {
        id: "superOre",
        name: "Detector superior",
        description: "+2% probabilidad de mineral x2",
        baseCost: 600,
        factor: 1.80,
        max: 20
    }

];


/* ==========================================================
   EXPORTS
========================================================== */

module.exports = {

    mines,
    picks,
    upgrades

};