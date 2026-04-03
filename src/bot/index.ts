import { Bot } from "grammy";
import { config } from "../config.js";
import { registerCommands } from "./commands.js";
import { registerHandlers } from "./handlers.js";

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  bot.catch((err) => {
    console.error("Bot error:", err.message);
  });

  // Restrict access to allowed users if configured
  if (config.allowedUsers.length > 0) {
    bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      if (!userId || !config.allowedUsers.includes(userId)) {
        await ctx.reply(
          "This bot is private. You are not authorized to use it.",
        );
        return;
      }
      await next();
    });
  }

  // Register commands first (they take priority over generic handlers)
  registerCommands(bot);
  registerHandlers(bot);

  return bot;
}
