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

                new: true

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

    save

};