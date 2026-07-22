const mongoose = require("mongoose");
const Player = require("./player.model");


/* ==========================================================
   MEMORY STORAGE
========================================================== */

const memory = new Map();

let useMongo = false;


/* ==========================================================
   CONNECTION
========================================================== */

async function connect(uri) {

    if (!uri) {

        return false;

    }

    try {

        await mongoose.connect(uri);

        useMongo = true;

        console.log("MongoDB connected");

        return true;

    }

    catch (error) {

        console.warn(

            `MongoDB unavailable, using memory: ${error.message}`

        );

        return false;

    }

}


/* ==========================================================
   GET PLAYER
========================================================== */

async function get(telegramId) {

    if (useMongo) {

        return Player.findOne({

            telegramId

        }).lean();

    }

    return memory.get(telegramId);

}


async function getLeaderboard(limit = 10, currentId) {
    const allPlayers = useMongo
        ? await Player.find().lean()
        : Array.from(memory.values());

    const normalized = allPlayers.map((player) => ({
        telegramId: player.telegramId,
        name: String(player.name || "MINERO").slice(0, 24).toUpperCase(),
        upgrades: player.upgrades || {},
        geopointsEarned: Number(player.geopointsEarned || 0),
        geoliteEarned: Number(player.geoliteEarned || 0),
    }));

    const withUpgradeCount = normalized.map((player) => ({
        ...player,
        upgradeCount: Object.values(player.upgrades || {}).reduce(
            (sum, value) => sum + (Number(value) || 0),
            0,
        ),
    }));

    const sortDesc = (items, key) =>
        items
            .slice()
            .sort((a, b) => b[key] - a[key])
            .map((item, index) => ({
                rank: index + 1,
                name: item.name,
                value: item[key],
                id: item.telegramId,
            }));

    const ranked = {
        upgrades: sortDesc(withUpgradeCount, "upgradeCount"),
        geopoints: sortDesc(withUpgradeCount, "geopointsEarned"),
        geolite: sortDesc(withUpgradeCount, "geoliteEarned"),
    };

    const sliceTop = (items) => items.slice(0, limit);
    const currentRank = (items, key) => {
        if (!currentId) return null;
        const current = items.find((item) => item.id === currentId);
        if (!current) return null;
        return current.rank <= limit ? null : current;
    };

    return {
        topUpgrades: sliceTop(ranked.upgrades),
        topGeoPoints: sliceTop(ranked.geopoints),
        topGeolite: sliceTop(ranked.geolite),
        currentUpgrade: currentRank(ranked.upgrades, "upgradeCount"),
        currentGeoPoints: currentRank(ranked.geopoints, "geopointsEarned"),
        currentGeolite: currentRank(ranked.geolite, "geoliteEarned"),
    };
}

/* ==========================================================
   SAVE PLAYER
========================================================== */

async function save(player) {

    const upgrades =

        player.upgrades instanceof Map

            ? Object.fromEntries(player.upgrades)

            : (player.upgrades || {});

    const value = {

        ...player,

        upgrades

    };

    if (useMongo) {

        await Player.findOneAndUpdate(

            {

                telegramId: player.telegramId

            },

            value,

            {

                upsert: true,

                returnDocument: "after"

            }

        );

        return;

    }

    memory.set(

        player.telegramId,

        value

    );

}


/* ==========================================================
   EXPORTS
========================================================== */

module.exports = {

    connect,

    get,

    save,

    getLeaderboard,

};