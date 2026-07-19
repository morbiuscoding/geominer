import { socket } from "./api.js";
import { render, toast } from "./ui.js";
import { MineScene } from "./mine-scene.js";

let scene = null;
let state = null;


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


game.events.once("ready", initializeScene);


/* ==========================================================
   INITIALIZE
========================================================== */

function initializeScene(){

    scene = game.scene.getScene("mine");

    scene.events.on("mine", payload => {

        socket.emit("mine", payload);

    });

}


/* ==========================================================
   SOCKET EVENTS
========================================================== */

socket.on("state", updateState);

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

    const mine = state.catalogs.mines.find(

        m => m.id === state.player.activeMine

    );

    if(mine){

        scene?.setMine(mine.color);

    }

}


/* ==========================================================
   MINING RESULT
========================================================== */

function onMineReward(result){

    window.Telegram
        ?.WebApp
        ?.HapticFeedback
        ?.impactOccurred("light");

    scene?.float(

        result.gain,
        null,
        result.superior

    );

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
        .querySelector(`[data-tab="${view}"]`)
        ?.classList
        .add("active");

    document
        .getElementById(`${view}-view`)
        ?.classList
        .add("active");

}