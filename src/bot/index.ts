import { Bot } from "grammy";
import { registerCommands } from "./commands.js";
import { registerHandlers } from "./handlers.js";

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  bot.catch((err) => {
    console.error("Bot error:", err.message);
  });

  // Register commands first (they take priority over generic handlers)
  registerCommands(bot);
  registerHandlers(bot);

  return bot;
}
