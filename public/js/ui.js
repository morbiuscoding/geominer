const $ = (id) => document.getElementById(id);
const icons = {
  tapPower: "strike",
  energyRegen: "regen",
  maxEnergy: "battery",
  criticalChance: "critical",
  mineSearch: "radar",
};
// Use the bronze pick icon for all picks, color it per-tier
const bronzePickIcon = "⛏";
const pickColors = {
  bronze: "#c77b42",
  silver: "#c2d5e2",
  gold: "#ffca55",
  platinum: "#91e7df",
  diamond: "#7dceff",
  titanium: "#ae90ff",
};
export const els = [
  "player-name",
  "geopoints",
  "geolite",
  "geolite-usd",
  "profile-geolite",
  "profile-geolite-usd",
  "energy",
  "energy-text",
  "max-energy",
  "energy-fill",
  "per-tap",
  "per-second",
  "regen",
  "mine-name",
  "mine-health",
  "mine-health-fill",
  "find-mine",
  "search-chances",
  "upgrade-list",
  "pick-list",
  "rank-upgrades",
  "rank-geopoints",
  "rank-geolite",
  "toast",
].reduce((out, id) => ({ ...out, [id]: $(id) }), {});
export const fmt = (n) => Math.floor(n).toLocaleString("en-US");
export const geoliteFmt = (n) => Number(n).toFixed(4);
export function toast(text) {
  els.toast.textContent = text;
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}
export function render(state, emit) {
  const { player, stats, catalogs, searchChances } = state,
    mine = catalogs.mines.find((m) => m.id === player.activeMine);
  els["player-name"].textContent = player.name;
  const usdPrice = player.geolite * 0.01;
  els.geopoints.textContent = fmt(player.geopoints);
  els.geolite.textContent = geoliteFmt(player.geolite);
  els["geolite-usd"].textContent = `≈ $${usdPrice.toFixed(2)}`;
  els["profile-geolite"].textContent = `${geoliteFmt(player.geolite)} ✦`;
  els["profile-geolite-usd"].textContent = `≈ $${usdPrice.toFixed(2)}`;
  els.energy.textContent = `${player.energy} / ${stats.maxEnergy}`;
  els["energy-text"].textContent = player.energy;
  els["max-energy"].textContent = `/${stats.maxEnergy}`;
  els["energy-fill"].style.width =
    `${(player.energy / stats.maxEnergy) * 100}%`;
  els["per-tap"].textContent =
    `${stats.damage} · ${stats.criticalChance}% CRIT`;
  els["per-second"].textContent =
    stats.autoDamage ? `${stats.autoDamage} / h` : "—";
  els.regen.textContent = `+${stats.regenPerMinute} / min`;
  els["mine-name"].textContent = mine.name;
  els["mine-health"].textContent = `${player.mineHealth} / ${mine.health} HP`;
  els["mine-health-fill"].style.width =
    `${(player.mineHealth / mine.health) * 100}%`;
  els["search-chances"].textContent = catalogs.mines
    .map(
      (m) =>
        `${m.name.replace("Mina de ", "")}: ${searchChances[m.id].toFixed(1)}%`,
    )
    .join(" · ");
  els["find-mine"].onclick = () => emit("findMine");
  els["upgrade-list"].innerHTML = catalogs.upgrades
    .map(
      (u) =>
        `<article class="shop-card"><span class="upgrade-icon icon-${icons[u.id] || "radar"}"></span><div><strong>${u.name} <small>NV. ${u.level}/${u.max}</small></strong><p>${u.description}</p></div><button data-upgrade="${u.id}">◆ ${fmt(u.cost)}</button></article>`,
    )
    .join("");
  const counts = player.picks.reduce(
    (o, p) => ((o[p.id] = (o[p.id] || 0) + 1), o),
    {},
  );
  els["pick-list"].innerHTML = catalogs.picks
    .map(
      (p) => {
        const icon = bronzePickIcon;
        const color = pickColors[p.id] || "#ffffff";
        // p.damage is interpreted as total hourly damage; UI explains it's applied over time
        return `<article class="shop-card pick"><span class="pick-icon" style="background: ${color}22; color: ${color};">${icon}</span><div><strong>${p.name}${counts[p.id] ? ` <small>×${counts[p.id]} activo</small>` : ""}</strong><p>${p.damage} daño / h (aplicado gradualmente)</p></div><button data-pick="${p.id}">✦ ${p.geoliteCost}</button></article>`;
      },
    )
    .join("");
  document
    .querySelectorAll("[data-upgrade]")
    .forEach((b) => (b.onclick = () => emit("buyUpgrade", b.dataset.upgrade)));
  renderLeaderboard(state.leaderboard);
  document
    .querySelectorAll("[data-pick]")
    .forEach((b) => (b.onclick = () => emit("buyPick", b.dataset.pick)));
}

function renderLeaderboard(leaderboard) {
  if (!leaderboard) return;
  const renderLines = (list) =>
    list
      .map(
        (item) =>
          `<div class="leaderboard-item"><span class="leaderboard-rank">${item.rank}</span><span class="leaderboard-name">${item.name}</span><span class="leaderboard-value">${item.value}</span></div>`,
      )
      .join("");
  const renderCurrent = (current) =>
    current
      ? `<div class="leaderboard-current">Tu posición: #${current.rank} — ${current.name} — ${current.value}</div>`
      : "";

  els["rank-upgrades"].innerHTML =
    renderLines(leaderboard.topUpgrades) + renderCurrent(leaderboard.currentUpgrade);
  els["rank-geopoints"].innerHTML =
    renderLines(leaderboard.topGeoPoints) + renderCurrent(leaderboard.currentGeoPoints);
  els["rank-geolite"].innerHTML =
    renderLines(leaderboard.topGeolite) + renderCurrent(leaderboard.currentGeolite);
}
