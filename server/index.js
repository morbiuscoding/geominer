const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const { port, mongoUri } = require("./config");

const repository = require("./player.repository");
const attachSocket = require("./socket");


/* ==========================================================
   EXPRESS
========================================================== */

const app = express();

app.use(

    express.static(

        path.join(
            __dirname,
            "..",
            "public"
        )

    )

);


/* ==========================================================
   HTTP SERVER
========================================================== */

const server = http.createServer(app);


/* ==========================================================
   SOCKET.IO
========================================================== */

const io = new Server(server);

attachSocket(io);


/* ==========================================================
   START SERVER
========================================================== */

start();


async function start() {

    try {

        await repository.connect(mongoUri);

        server.listen(port, () => {

            console.log(`
====================================
       GEOMINER SERVER
====================================

Servidor iniciado correctamente.

Local:
http://localhost:${port}

====================================
`);

        });

    }

    catch (error) {

        console.error(
            "Error iniciando el servidor:",
            error
        );

        process.exit(1);

    }

}