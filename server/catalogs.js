const mines = [
  ['bronze', 'Mina de Cobre', '#c77b42', 500, 0.005, 0.5], ['silver', 'Mina de Plata', '#c2d5e2', 1000, 0.015, 1.5],
  ['gold', 'Mina de Oro', '#ffca55', 2000, 0.03, 3], ['platinum', 'Mina de Platino', '#91e7df', 4000, 0.06, 6],
  ['diamond', 'Mina Diamante', '#7dceff', 8000, 0.12, 12], ['titanium', 'Mina Titanio', '#ae90ff', 16000, 0.24, 24]
].map(([id, name, color, health, geoliteMin, geoliteMax], index) => ({ id, name, color, health, geoliteMin, geoliteMax, geoReward: 100 + (index + 1) * 100 }));

const picks = [
  // id, name, totalHourlyDamage, geoliteCost
  // Damage increased 10x, costs set to requested values
  ['bronze', 'Pico de Bronce', 50 * 10, 5],
  ['silver', 'Pico de Plata', 100 * 10, 15],
  ['gold', 'Pico de Oro', 200 * 10, 40],
  ['platinum', 'Pico de Platino', 400 * 10, 100],
  ['diamond', 'Pico Diamante', 800 * 10, 200],
  ['titanium', 'Pico Titanio', 1600 * 10, 380],
].map(([id, name, damage, geoliteCost]) => ({ id, name, damage, geoliteCost }));

const upgrades = [
  { id: 'tapPower', name: 'Fuerza de golpe', description: '+1 daño por toque', baseCost: 100, factor: 1.55, max: 100 },
  { id: 'energyRegen', name: 'Recarga energética', description: '+1 energía por minuto', baseCost: 180, factor: 1.6, max: 55 },
  { id: 'maxEnergy', name: 'Batería ampliada', description: '+10 energía máxima', baseCost: 220, factor: 1.65, max: 90 },
  { id: 'criticalChance', name: 'Golpe crítico', description: '+1% de probabilidad crítica', baseCost: 250, factor: 1.75, max: 40 },
  { id: 'mineSearch', name: 'Radar geológico', description: '+1% de probabilidad de encontrar minas mejores', baseCost: 1000, factor: 2, max: 40 }
];
module.exports = { mines, picks, upgrades };
