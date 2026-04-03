import { Bot } from "grammy";
import { config } from "../config.js";
import { getOrCreateUser } from "../db/users.js";
import { chat } from "../services/claude.js";
import { sendLongMessage } from "./helpers.js";

export function registerHandlers(bot: Bot): void {
  bot.on("message:photo", async (ctx) => {
    getOrCreateUser(ctx.from.id, ctx.from.username);
    await ctx.replyWithChatAction("typing");

    try {
      const photos = ctx.message.photo;
      const photo = photos[photos.length - 1]; // highest resolution
      const file = await ctx.api.getFile(photo.file_id);

      const url = `https://api.telegram.org/file/bot${config.telegramToken}/${file.file_path}`;
      const imageResponse = await fetch(url);
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      const base64 = buffer.toString("base64");

      const caption = ctx.message.caption ?? "";
      const ext = file.file_path?.split(".").pop()?.toLowerCase();
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";

      const response = await chat(ctx.from.id, caption, base64, mimeType);
      await sendLongMessage(ctx, response);
    } catch (error) {
      console.error("Photo processing error:", error);
      await ctx.reply("❌ Error processing the photo. Please try again.");
    }
  });

  bot.on("message:text", async (ctx) => {
    getOrCreateUser(ctx.from.id, ctx.from.username);
    await ctx.replyWithChatAction("typing");

    try {
      const response = await chat(ctx.from.id, ctx.message.text);
      await sendLongMessage(ctx, response);
    } catch (error) {
      console.error("Chat error:", error);
      await ctx.reply(
        "❌ Something went wrong. Please try again, or use /reset to clear the conversation.",
      );
    }
  });
}
