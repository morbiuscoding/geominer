const repository = require("./player.repository");
const game = require("./game.service");


/* ==========================================================
   PLAYER IDENTITY
========================================================== */

function identity(socket) {

    const user = socket.handshake.auth?.user;

    return {

        id: String(

            user?.id || "guest-local"

        ),

        name: String(

            user?.first_name || "MINERO"

        )
            .slice(0, 24)
            .toUpperCase()

    };

}


/* ==========================================================
   SOCKET
========================================================== */

module.exports = io => {

    io.on("connection", async socket => {

        const account = identity(socket);

        let player =

            await repository.get(account.id) ||

            game.newPlayer(

                account.id,

                account.name

            );

        async function sync() {

            const state =

                game.publicState(player);

            await repository.save(player);

            socket.emit(

                "state",

                state

            );

        }

        await sync();

        registerEvents();

        const ticker = setInterval(

            sync,

            1000

        );

        socket.on("disconnect", async () => {

            clearInterval(ticker);

            await repository.save(player);

        });




        /* ==================================================
           EVENTS
        ================================================== */

        function registerEvents() {

            socket.on(

                "mine",

                onMine

            );

            socket.on(

                "buyPick",

                onBuyPick

            );

            socket.on(

                "buyUpgrade",

                onBuyUpgrade

            );

            socket.on(

                "selectMine",

                onSelectMine

            );

        }




        /* ==================================================
           MINE
        ================================================== */

        async function onMine() {

            try {

                const result =

                    game.mine(player);

                await repository.save(player);

                socket.emit(

                    "mined",

                    result

                );

                await sync();

            }

            catch (error) {

                socket.emit(

                    "gameError",

                    error.message

                );

            }

        }




        /* ==================================================
           BUY PICK
        ================================================== */

        async function onBuyPick(id) {

            try {

                const pick =

                    game.buyPick(

                        player,

                        id

                    );

                await repository.save(player);

                socket.emit(

                    "notice",

                    `${pick.name} equipado: +${pick.dps} GEO/s`

                );

                await sync();

            }

            catch (error) {

                socket.emit(

                    "gameError",

                    error.message

                );

            }

        }




        /* ==================================================
           BUY UPGRADE
        ================================================== */

        async function onBuyUpgrade(id) {

            try {

                const upgrade =

                    game.buyUpgrade(

                        player,

                        id

                    );

                await repository.save(player);

                socket.emit(

                    "notice",

                    `${upgrade.name} mejorada`

                );

                await sync();

            }

            catch (error) {

                socket.emit(

                    "gameError",

                    error.message

                );

            }

        }




        /* ==================================================
           SELECT MINE
        ================================================== */

        async function onSelectMine(id) {

            try {

                game.selectMine(

                    player,

                    id

                );

                await repository.save(player);

                await sync();

            }

            catch (error) {

                socket.emit(

                    "gameError",

                    error.message

                );

            }

        }

    });

};