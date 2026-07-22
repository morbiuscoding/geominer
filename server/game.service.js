const { picks, mines, upgrades } = require("./catalogs");
const DAY = 86_400_000;
// Interval (ms) at which auto-pick ticks are applied when elapsed time passes.
// Use a small interval so periodic damage is more visible in the client.
const TICK_MS = 5_000; // 5 seconds
const byId = (list, id) => list.find((item) => item.id === id);
const upgradeCost = (upgrade, level) =>
  upgrade.fixedCost
    ? upgrade.baseCost
    : Math.ceil(upgrade.baseCost * Math.pow(upgrade.factor, level));
const activeMine = (player) => byId(mines, player.activeMine) || mines[0];
function newPlayer(telegramId, name = "MINERO") {
  return {
    telegramId,
    name,
    geopoints: 0,
    geopointsEarned: 0,
    geolite: 0,
    geoliteEarned: 0,
    energy: 100,
    lastUpdated: Date.now(),
    activeMine: "bronze",
    mineHealth: 250,
    picks: [],
    upgrades: {},
  };
}
function normalizePlayer(player) {
  player.geopoints ??= player.balance || 0;
  player.geopointsEarned ??= 0;
  player.geolite ??= 0;
  player.geoliteEarned ??= 0;
  player.energy ??= 100;
  player.activeMine ??= "bronze";
  player.mineHealth ??= activeMine(player).health;
  player.picks ??= [];
  player.upgrades ??= {};
  player.lastUpdated ??= Date.now();
  player.autoTickRemainderMs ??= 0;
}
function stats(player) {
  const u = player.upgrades || {};
  const upgradeCount = Object.values(u).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );
  return {
    damage: 1 + (u.tapPower || 0),
    maxEnergy: 100 + (u.maxEnergy || 0) * 10,
    regenPerMinute: 1 + (u.energyRegen || 0),
    criticalChance: 10 + (u.criticalChance || 0),
    upgradeCount,
  };
}
function searchChances(player) {
  const bonus = player.upgrades?.mineSearch || 0,
    rare = 60 + bonus;
  return {
    bronze: Math.max(0, 40 - bonus),
    silver: rare * 0.5,
    gold: (rare * 17) / 60,
    platinum: (rare * 8) / 60,
    diamond: (rare * 4) / 60,
    titanium: rare / 60,
  };
}
function rollMine(player) {
  const chances = searchChances(player),
    roll = Math.random() * 100;
  let sum = 0;
  for (const mine of mines) {
    sum += chances[mine.id];
    if (roll < sum) return mine;
  }
  return mines[0];
}
function clearExpiredPicks(player, now = Date.now()) {
  player.picks = (player.picks || []).filter((p) => p.expiresAt > now);
}
function equippedPick(player) {
  clearExpiredPicks(player);
  return (
    player.picks
      .map((p) => byId(picks, p.id))
      .filter(Boolean)
      .sort((a, b) => b.damage - a.damage)[0] || null
  );
}
function finishMine(player) {
  const mine = activeMine(player),
    geolite =
      mine.geoliteMin + Math.random() * (mine.geoliteMax - mine.geoliteMin);
  player.geopoints += mine.geoReward;
  player.geopointsEarned += mine.geoReward;
  player.geolite += geolite;
  player.geoliteEarned += geolite;
  const nextMine = rollMine(player);
  player.activeMine = nextMine.id;
  player.mineHealth = nextMine.health;
  return {
    mine: mine.name,
    geopoints: mine.geoReward,
    geolite: Number(geolite.toFixed(4)),
    nextMine: nextMine.name,
  };
}
function strike(player, damage, source) {
  const s = stats(player),
    critical = Math.random() * 100 < s.criticalChance,
    dealt = damage * (critical ? 2 : 1);
  player.mineHealth -= dealt;
  // Award geopoints proportional to damage dealt (allow fractional accumulation)
  const earnedPoints = dealt;
  player.geopoints += earnedPoints;
  player.geopointsEarned += earnedPoints;
  return {
    damage: dealt,
    critical,
    source,
    completed: player.mineHealth <= 0 ? finishMine(player) : null,
  };
}
function applyElapsed(player) {
  normalizePlayer(player);
  const now = Date.now(),
    elapsedMs = Math.max(0, now - player.lastUpdated),
    s = stats(player);
  player.energy = Math.min(
    s.maxEnergy,
    player.energy + (elapsedMs / 60000) * s.regenPerMinute,
  );
  clearExpiredPicks(player, now);

  const events = [];
  const pick = equippedPick(player);
  if (pick) {
    const totalElapsed = player.autoTickRemainderMs + elapsedMs;
    const ticks = Math.floor(totalElapsed / TICK_MS);
    const remainder = totalElapsed - ticks * TICK_MS;
    player.autoTickRemainderMs = remainder;

    if (ticks) {
      const upgradeBonus = Math.max(0, s.damage - 1) * 10;
      const perHour = pick.damage + upgradeBonus;
      const perTick = perHour * (TICK_MS / 3_600_000);
      for (let i = 0; i < ticks; i++) {
        const res = strike(player, perTick, "auto");
        events.push(res);
        if (res.completed) break; // stop further ticks if mine finished
      }
    }
  }

  player.lastUpdated = now;
  return events;
}
function publicState(player) {
  const events = applyElapsed(player) || [];
  const s = stats(player),
    mine = activeMine(player),
    equipped = equippedPick(player);
  return {
    player: {
      name: player.name,
      geopoints: Math.floor(player.geopoints),
      geopointsEarned: Math.floor(player.geopointsEarned),
      geolite: Number(player.geolite.toFixed(4)),
      geoliteEarned: Number(player.geoliteEarned.toFixed(4)),
      energy: Math.floor(player.energy),
      activeMine: player.activeMine,
      mineHealth: Math.max(0, Math.floor(player.mineHealth)),
      picks: player.picks,
      upgrades: player.upgrades,
    },
    stats: {
      ...s,
      equippedPick: equipped?.id || null,
      autoDamage: equipped ? equipped.damage + Math.max(0, s.damage - 1) * 10 : 0,
    },
    searchChances: searchChances(player),
    catalogs: {
      mines,
      picks,
      upgrades: upgrades.map((up) => ({
        ...up,
        level: player.upgrades?.[up.id] || 0,
        cost: upgradeCost(up, player.upgrades?.[up.id] || 0),
      })),
    },
    events
  };
}
function mine(player) {
  applyElapsed(player);
  if (player.energy < 1) throw Error("Energía insuficiente");
  player.energy--;
  return strike(player, stats(player).damage, "manual");
}
function buyPick(player, id) {
  applyElapsed(player);
  const pick = byId(picks, id);
  if (!pick) throw Error("Pico no encontrado");
  if (player.geolite < pick.geoliteCost)
    throw Error("No tienes Geolita suficiente");
  player.geolite -= pick.geoliteCost;
  player.picks.push({ id, expiresAt: Date.now() + DAY });
  return pick;
}
function buyUpgrade(player, id) {
  applyElapsed(player);
  const up = byId(upgrades, id),
    level = player.upgrades?.[id] || 0;
  if (!up) throw Error("Mejora no encontrada");
  if (level >= up.max) throw Error("Mejora al máximo");
  const price = upgradeCost(up, level);
  if (player.geopoints < price) throw Error("No tienes GeoPoints suficientes");
  player.geopoints -= price;
  player.upgrades[id] = level + 1;
  return up;
}
function findMine(player) {
  applyElapsed(player);
  if (player.energy < 50) throw Error("Necesitas 50 de energía para buscar");
  player.energy -= 50;
  const mine = rollMine(player);
  player.activeMine = mine.id;
  player.mineHealth = mine.health;
  return mine;
}
module.exports = {
  newPlayer,
  publicState,
  mine,
  buyPick,
  buyUpgrade,
  findMine,
};
