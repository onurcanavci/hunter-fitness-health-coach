import db from "./index.js";

export interface MessageRow {
  role: "user" | "assistant";
  content: string;
}

export function addMessage(
  telegramId: number,
  role: "user" | "assistant",
  content: string,
): void {
  db.prepare(
    "INSERT INTO messages (telegram_id, role, content) VALUES (?, ?, ?)",
  ).run(telegramId, role, content);
}

export function getRecentMessages(
  telegramId: number,
  limit = 30,
): MessageRow[] {
  return db
    .prepare(
      "SELECT role, content FROM messages WHERE telegram_id = ? ORDER BY id DESC LIMIT ?",
    )
    .all(telegramId, limit)
    .reverse() as MessageRow[];
}

export function clearMessages(telegramId: number): void {
  db.prepare("DELETE FROM messages WHERE telegram_id = ?").run(telegramId);
}
