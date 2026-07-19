module.exports = {
  port: process.env.PORT || 3006,
  mongoUri: process.env.MONGODB_URI || '',
  saveIntervalMs: 10_000
};
