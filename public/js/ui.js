/* ==========================================================
   ELEMENTS
========================================================== */

const $ = id => document.getElementById(id);

export const els = [

    "player-name",
    "balance",

    "energy",
    "energy-text",
    "max-energy",
    "energy-fill",

    "per-tap",
    "per-second",
    "regen",

    "mine-selector",
    "upgrade-list",
    "pick-list",

    "toast"

].reduce((elements, id) => {

    elements[id] = $(id);

    return elements;

}, {});


/* ==========================================================
   HELPERS
========================================================== */

export function fmt(value) {

    return Math.floor(value)
        .toLocaleString("en-US");

}


/* ==========================================================
   TOAST
========================================================== */

export function toast(text) {

    els.toast.textContent = text;

    els.toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        els.toast.classList.remove("show");

    }, 1600);

}


/* ==========================================================
   RENDER
========================================================== */

export function render(state, emit) {

    const {

        player,
        stats,
        catalogs

    } = state;

    renderPlayer(player);

    renderStats(player, stats);

    renderMineSelector(
        player,
        catalogs,
        emit
    );

    renderUpgrades(
        catalogs,
        emit
    );

    renderPicks(
        player,
        catalogs,
        emit
    );

}


/* ==========================================================
   PLAYER
========================================================== */

function renderPlayer(player) {

    els["player-name"].textContent = player.name;

    els.balance.textContent = fmt(
        player.balance
    );

}


/* ==========================================================
   STATS
========================================================== */

function renderStats(player, stats) {

    els.energy.textContent =
        `${player.energy} / ${stats.maxEnergy}`;

    els["energy-text"].textContent =
        player.energy;

    els["max-energy"].textContent =
        `/${stats.maxEnergy}`;

    els["energy-fill"].style.width =
        `${player.energy / stats.maxEnergy * 100}%`;

    els["per-tap"].textContent =
        `+${stats.tap} GEO`;

    els["per-second"].textContent =
        `${stats.dps} GEO/s`;

    els.regen.textContent =
        `+${stats.regen} / seg`;

}


/* ==========================================================
   MINES
========================================================== */

function renderMineSelector(
    player,
    catalogs,
    emit
) {

    els["mine-selector"].innerHTML =
        catalogs.mines.map(mine => `

        <button
            class="mine-chip ${mine.id === player.activeMine ? "chosen" : ""}"
            data-mine="${mine.id}"
            style="--mine:${mine.color}">

            <i></i>

            ${mine.name}

        </button>

    `).join("");

    document
        .querySelectorAll("[data-mine]")
        .forEach(button => {

            button.onclick = () => {

                emit(
                    "selectMine",
                    button.dataset.mine
                );

            };

        });

}


/* ==========================================================
   UPGRADES
========================================================== */

function renderUpgrades(
    catalogs,
    emit
) {

    els["upgrade-list"].innerHTML =
        catalogs.upgrades.map(upgrade => `

        <article class="shop-card">

            <div>

                <strong>

                    ${upgrade.name}

                    <small>

                        NV. ${upgrade.level}/${upgrade.max}

                    </small>

                </strong>

                <p>

                    ${upgrade.description}

                </p>

            </div>

            <button
                data-upgrade="${upgrade.id}">

                ◆ ${fmt(upgrade.cost)}

            </button>

        </article>

    `).join("");

    document
        .querySelectorAll("[data-upgrade]")
        .forEach(button => {

            button.onclick = () => {

                emit(
                    "buyUpgrade",
                    button.dataset.upgrade
                );

            };

        });

}


/* ==========================================================
   PICKS
========================================================== */

function renderPicks(
    player,
    catalogs,
    emit
) {

    els["pick-list"].innerHTML =
        catalogs.picks.map(pick => {

            const owned =
                player.ownedPicks.includes(pick.id);

            return `

            <article
                class="shop-card pick ${owned ? "owned" : ""}">

                <div>

                    <strong>

                        ${pick.name}

                    </strong>

                    <p>

                        +${pick.dps} GEO / segundo

                    </p>

                </div>

                <button
                    data-pick="${pick.id}"
                    ${owned ? "disabled" : ""}>

                    ${
                        owned
                            ? "COMPRADO"
                            : `◆ ${fmt(pick.cost)}`
                    }

                </button>

            </article>

            `;

        }).join("");

    document
        .querySelectorAll("[data-pick]")
        .forEach(button => {

            button.onclick = () => {

                emit(
                    "buyPick",
                    button.dataset.pick
                );

            };

        });

}