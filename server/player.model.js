const mongoose = require("mongoose");


/* ==========================================================
   PLAYER SCHEMA
========================================================== */

const playerSchema = new mongoose.Schema(

    {

        /* -----------------------------------------
           ACCOUNT
        ----------------------------------------- */

        telegramId: {

            type: String,

            unique: true,

            index: true

        },

        name: {

            type: String,

            default: "MINERO"

        },


        /* -----------------------------------------
           PLAYER
        ----------------------------------------- */

        balance: {

            type: Number,

            default: 0

        },

        energy: {

            type: Number,

            default: 500

        },

        lastUpdated: {

            type: Number,

            default: () => Date.now()

        },


        /* -----------------------------------------
           GAME
        ----------------------------------------- */

        activeMine: {

            type: String,

            default: "bronze"

        },

        ownedPicks: {

            type: [String],

            default: []

        },

        upgrades: {

            type: Map,

            of: Number,

            default: {}

        }

    },

    {

        versionKey: false

    }

);


/* ==========================================================
   MODEL
========================================================== */

module.exports =

    mongoose.models.Player ||

    mongoose.model(

        "Player",

        playerSchema

    );