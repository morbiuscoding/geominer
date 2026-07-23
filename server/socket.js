const repository = require("./player.repository");
const game = require("./game.service");
const { botToken, botUsername } = require("./config");
const { verify } = require("./telegram-auth");


/* ==========================================================
   PLAYER IDENTITY
========================================================== */

function identity(socket) {

    const user = botToken
        ? verify(socket.handshake.auth?.initData, botToken)
        : socket.handshake.auth?.user;

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

        if (botToken && account.id === "guest-local") {
            socket.emit("gameError", "No se pudo validar la sesión de Telegram");
            return socket.disconnect(true);
        }

        const referrerId = socket.handshake.auth?.referrer || null;
        let player = await repository.get(account.id);
        const isNewPlayer = !player;
        if (!player) {
            player = game.newPlayer(account.id, account.name, referrerId);
        }

        async function registerReferrer() {
            if (!isNewPlayer || !player.referrer || player.referrer === player.telegramId) return;
            const referrer = await repository.get(player.referrer);
            if (!referrer) {
                player.referrer = null;
                return;
            }
            referrer.referrals = referrer.referrals || [];
            if (!referrer.referrals.includes(player.telegramId)) {
                referrer.referrals.push(player.telegramId);
                referrer.referralCount = referrer.referrals.length;
                referrer.geolite = (referrer.geolite || 0) + 1;
                referrer.geoliteEarned = (referrer.geoliteEarned || 0) + 1;
                await repository.save(referrer);
            }
        }

        async function handleReferralPayouts() {
            if (!player.referrer || !player.pendingReferralPoints) return;
            const referrer = await repository.get(player.referrer);
            if (!referrer) {
                player.referrer = null;
                player.pendingReferralPoints = 0;
                return;
            }
            const bonus = player.pendingReferralPoints * 0.05;
            referrer.geopoints = (referrer.geopoints || 0) + bonus;
            referrer.geopointsEarned = (referrer.geopointsEarned || 0) + bonus;
            await repository.save(referrer);
            player.pendingReferralPoints = 0;
        }

        async function sync() {

            const state = {
                ...game.publicState(player),
                referralBot: botUsername,
                leaderboard: await repository.getLeaderboard(10, account.id),
                topReferrers: await repository.getTopReferrers(5),
            };

            await handleReferralPayouts();
            await repository.save(player);

            socket.emit("state", state);

            // Emit any automatic strike events so the client can render them like taps
            if (state.events && state.events.length) {
                for (const ev of state.events) {
                    socket.emit("mined", ev);
                }
            }

        }

        await registerReferrer();
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

                "findMine",

                onFindMine

            );

            socket.on("cryptoRequest", type => {
                const action = type === "withdraw" ? "retiro" : "depósito";
                socket.emit("notice", `Solicitud de ${action} preparada. Conecta un proveedor cripto para procesarla.`);
            });

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

                    `${pick.name} activo: +${pick.damage} daño por segundo`

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

        async function onFindMine() {

            try {

                const mine = game.findMine(player);

                await repository.save(player);

                socket.emit("notice", `Encontraste: ${mine.name}`);
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
