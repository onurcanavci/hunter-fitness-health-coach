import "dotenv/config";

function requireEnv(key: string, hint: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`${key} is required. ${hint}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  telegramToken: requireEnv(
    "TELEGRAM_BOT_TOKEN",
    "Create a bot via @BotFather on Telegram and paste the token in .env",
  ),
  anthropicApiKey: requireEnv(
    "ANTHROPIC_API_KEY",
    "Get one at https://console.anthropic.com/settings/keys",
  ),
  claudeModel: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6-20250514",
  conversationHistoryLimit:
    Number(process.env.CONVERSATION_HISTORY_LIMIT) || 30,
};
