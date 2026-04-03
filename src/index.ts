import { config } from "./config.js";
import { createBot } from "./bot/index.js";

const bot = createBot(config.telegramToken);

const shutdown = () => {
  console.log("\nShutting down Hunter...");
  bot.stop();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

bot.start({
  onStart: () => {
    console.log("Hunter Fitness & Health Coach is running!");
  },
});
