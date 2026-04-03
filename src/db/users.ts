import db from "./index.js";

export interface UserRow {
  telegram_id: number;
  username: string;
  profile: string;
  created_at: string;
  updated_at: string;
}

export function getOrCreateUser(
  telegramId: number,
  username?: string,
): UserRow {
  const existing = db
    .prepare("SELECT * FROM users WHERE telegram_id = ?")
    .get(telegramId) as UserRow | undefined;

  if (existing) return existing;

  db.prepare("INSERT INTO users (telegram_id, username) VALUES (?, ?)").run(
    telegramId,
    username ?? "",
  );

  return db
    .prepare("SELECT * FROM users WHERE telegram_id = ?")
    .get(telegramId) as UserRow;
}

export function saveUserProfile(
  telegramId: number,
  profile: Record<string, unknown>,
): void {
  db.prepare(
    "UPDATE users SET profile = ?, updated_at = datetime('now') WHERE telegram_id = ?",
  ).run(JSON.stringify(profile), telegramId);
}

export function getUserProfile(telegramId: number): Record<string, unknown> {
  const row = db
    .prepare("SELECT profile FROM users WHERE telegram_id = ?")
    .get(telegramId) as { profile: string } | undefined;

  if (!row) return {};

  try {
    return JSON.parse(row.profile);
  } catch {
    return {};
  }
}
