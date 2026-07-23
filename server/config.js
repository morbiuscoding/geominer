const path = require("path");
const result = require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
  override: true
});

if (result.error) {
  throw result.error;
}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is required in .env");
}

module.exports = {
  port: process.env.PORT || 3006,
  mongoUri,
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  botUsername: process.env.TELEGRAM_BOT_USERNAME || '',
  saveIntervalMs: 10_000
};
