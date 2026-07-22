import { socket } from "./api.js";
import { render, toast } from "./ui.js";
import { MineScene } from "./mine-scene.js";

let scene = null;
let state = null;
window.geoMine = () => socket.emit("mine");


/* ==========================================================
   PHASER
========================================================== */

const game = new Phaser.Game({

    type: Phaser.AUTO,

    parent: "phaser-game",

    transparent: true,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 420,
        height: 390
    },

    scene: MineScene

});


setTimeout(initializeScene, 100);


/* ==========================================================
   INITIALIZE
========================================================== */

function initializeScene(){

    scene = game.scene.getScene("mine");

    if (state) refreshMineVisuals();

}


/* ==========================================================
   SOCKET EVENTS
========================================================== */

socket.on("state", (next) => {
    console.debug("state received", next);
    updateState(next);
});

socket.on("mined", onMineReward);

socket.on("notice", toast);

socket.on("gameError", toast);

socket.on("connect_error", () => {

    toast("No se pudo conectar al servidor");

});


/* ==========================================================
   STATE
========================================================== */

function updateState(next){

    state = next;

    render(state, (event, payload) => {

        socket.emit(event, payload);

    });

    refreshMineVisuals();

}

function refreshMineVisuals() {
    const mine = state?.catalogs.mines.find(m => m.id === state.player.activeMine);
    if (mine) scene?.setMine(mine.color);
    scene?.setPickActive(state?.stats.equippedPick);
}


/* ==========================================================
   MINING RESULT
========================================================== */

function onMineReward(result){

    window.Telegram
        ?.WebApp
        ?.HapticFeedback
        ?.impactOccurred("light");

    const displayDamage = Math.max(1, Math.floor(result.damage || 0));
    scene?.float(displayDamage, null, result.critical, result.source === "auto");

    if (result.completed) {
        toast(`¡${result.completed.mine} completada! +${result.completed.geopoints} GeoPoints, +${result.completed.geolite} Geolita. Nueva: ${result.completed.nextMine}`);
    }

}


/* ==========================================================
   NAVIGATION
========================================================== */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener("click", () => {

            changeView(button.dataset.tab);

        });

    });

document.querySelectorAll("[data-crypto]").forEach(button => {
    button.addEventListener("click", () => socket.emit("cryptoRequest", button.dataset.crypto));
});

document.querySelector(".profile")?.addEventListener("click", () => changeView("profile"));


function changeView(view){

    document
        .querySelector(".nav-item.active")
        ?.classList
        .remove("active");

    document
        .querySelector(".view.active")
        ?.classList
        .remove("active");

    document
        .querySelector(`.bottom-nav [data-tab="${view}"]`)
        ?.classList
        .add("active");

    document
        .getElementById(`${view}-view`)
        ?.classList
        .add("active");

}
