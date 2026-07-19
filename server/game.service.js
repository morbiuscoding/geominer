const { picks, mines, upgrades } = require("./catalogs");


/* ==========================================================
   HELPERS
========================================================== */

function byId(list, id) {

    return list.find(item => item.id === id);

}

function upgradeCost(upgrade, level) {

    return Math.ceil(

        upgrade.baseCost *
        Math.pow(upgrade.factor, level)

    );

}


/* ==========================================================
   PLAYER
========================================================== */

function newPlayer(
    telegramId,
    name = "MINERO"
) {

    return {

        telegramId,

        name,

        balance: 0,

        energy: 500,

        lastUpdated: Date.now(),

        activeMine: "bronze",

        ownedPicks: [],

        upgrades: {}

    };

}


/* ==========================================================
   PASSIVE PRODUCTION
========================================================== */

function applyElapsed(player) {

    const now = Date.now();

    const seconds = Math.max(

        0,

        (now - player.lastUpdated) / 1000

    );

    const u = player.upgrades || {};

    const maxEnergy =
        500 + (u.maxEnergy || 0) * 100;

    const regen =
        5 + (u.energyRegen || 0) * 2;

    const dps = player.ownedPicks.reduce(

        (sum, id) =>

            sum + (byId(picks, id)?.dps || 0),

        0

    );

    if (dps > 0) {

        player.balance +=

            dps *

            seconds *

            (1 + (u.extraOre || 0) * 0.05);

    }

    player.energy = Math.min(

        maxEnergy,

        player.energy + regen * seconds

    );

    player.lastUpdated = now;

}


/* ==========================================================
   STATS
========================================================== */

function stats(player) {

    const u = player.upgrades || {};

    const dps = player.ownedPicks.reduce(

        (sum, id) =>

            sum + (byId(picks, id)?.dps || 0),

        0

    );

    return {

        tap:
            10 + (u.tapPower || 0) * 5,

        dps,

        maxEnergy:
            500 + (u.maxEnergy || 0) * 100,

        regen:
            5 + (u.energyRegen || 0) * 2,

        extraOre:
            (u.extraOre || 0) * 5,

        superChance:
            (u.superOre || 0) * 2

    };

}


/* ==========================================================
   PUBLIC STATE
========================================================== */

function publicState(player) {

    applyElapsed(player);

    const s = stats(player);

    return {

        player: {

            name: player.name,

            balance: Math.floor(player.balance),

            energy: Math.floor(player.energy),

            activeMine: player.activeMine,

            ownedPicks: player.ownedPicks,

            upgrades: player.upgrades

        },

        stats: s,

        catalogs: {

            mines,

            picks,

            upgrades: upgrades.map(upgrade => ({

                ...upgrade,

                level:
                    player.upgrades?.[upgrade.id] || 0,

                cost:
                    upgradeCost(

                        upgrade,

                        player.upgrades?.[upgrade.id] || 0

                    )

            }))

        }

    };

}


/* ==========================================================
   MANUAL MINING
========================================================== */

function mine(player) {

    applyElapsed(player);

    if (player.energy < 1) {

        throw Error(
            "Energía insuficiente"
        );

    }

    const s = stats(player);

    player.energy--;

    const multiplier =

        Math.random() * 100 < s.superChance

            ? 2

            : 1;

    const gain =

        s.tap *

        (1 + s.extraOre / 100) *

        multiplier;

    player.balance += gain;

    return {

        gain: Math.floor(gain),

        superior: multiplier === 2

    };

}


/* ==========================================================
   BUY PICKAXE
========================================================== */

function buyPick(player, id) {

    applyElapsed(player);

    const pick = byId(picks, id);

    if (!pick)

        throw Error("Pico no encontrado");

    if (player.ownedPicks.includes(id))

        throw Error("Ya tienes este pico");

    if (player.balance < pick.cost)

        throw Error("No tienes GEO suficientes");

    player.balance -= pick.cost;

    player.ownedPicks.push(id);

    return pick;

}


/* ==========================================================
   BUY UPGRADE
========================================================== */

function buyUpgrade(player, id) {

    applyElapsed(player);

    const upgrade = byId(upgrades, id);

    if (!upgrade)

        throw Error("Mejora no encontrada");

    const level =

        player.upgrades?.[id] || 0;

    if (level >= upgrade.max)

        throw Error("Mejora al máximo");

    const price =

        upgradeCost(upgrade, level);

    if (player.balance < price)

        throw Error("No tienes GEO suficientes");

    player.balance -= price;

    player.upgrades[id] = level + 1;

    return upgrade;

}


/* ==========================================================
   SELECT MINE
========================================================== */

function selectMine(player, id) {

    const mine = byId(mines, id);

    if (!mine)

        throw Error("Mina no encontrada");

    player.activeMine = id;

    return mine;

}


/* ==========================================================
   EXPORTS
========================================================== */

module.exports = {

    newPlayer,

    publicState,

    mine,

    buyPick,

    buyUpgrade,

    selectMine

};