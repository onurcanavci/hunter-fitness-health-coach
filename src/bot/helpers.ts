import { Context } from "grammy";

const MAX_MESSAGE_LENGTH = 4000;

/**
 * Sends a message that may exceed Telegram's 4096 char limit
 * by splitting it into multiple messages at natural break points.
 */
export async function sendLongMessage(
  ctx: Context,
  text: string,
): Promise<void> {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    await trySendMarkdown(ctx, text);
    return;
  }

  const parts = splitMessage(text, MAX_MESSAGE_LENGTH);

  for (const part of parts) {
    await trySendMarkdown(ctx, part);
  }
}

/**
 * Tries to send with Markdown parsing, falls back to plain text
 * if Telegram rejects the formatting.
 */
async function trySendMarkdown(ctx: Context, text: string): Promise<void> {
  await ctx
    .reply(text, { parse_mode: "Markdown" })
    .catch(() => ctx.reply(text));
}

function splitMessage(text: string, maxLength: number): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }

    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt === -1 || splitAt < maxLength / 2) {
      splitAt = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitAt === -1 || splitAt < maxLength / 2) {
      splitAt = maxLength;
    }

    parts.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  return parts;
}
