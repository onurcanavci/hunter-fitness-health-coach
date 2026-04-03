import db from "./index.js";

export type HealthLogType =
  | "food"
  | "exercise"
  | "sleep"
  | "blood_test"
  | "body_metrics"
  | "other";

export interface HealthLogRow {
  id: number;
  telegram_id: number;
  type: HealthLogType;
  summary: string;
  details: string;
  date: string;
  created_at: string;
}

export interface HealthLogInput {
  type: HealthLogType;
  summary: string;
  details: Record<string, unknown>;
  date: string;
}

export function addHealthLog(telegramId: number, entry: HealthLogInput): void {
  db.prepare(
    "INSERT INTO health_logs (telegram_id, type, summary, details, date) VALUES (?, ?, ?, ?, ?)",
  ).run(
    telegramId,
    entry.type,
    entry.summary,
    JSON.stringify(entry.details),
    entry.date,
  );
}

export function getLogsByDate(
  telegramId: number,
  date: string,
): HealthLogRow[] {
  return db
    .prepare(
      "SELECT * FROM health_logs WHERE telegram_id = ? AND date = ? ORDER BY created_at ASC",
    )
    .all(telegramId, date) as HealthLogRow[];
}

export function getLogsByDateRange(
  telegramId: number,
  startDate: string,
  endDate: string,
): HealthLogRow[] {
  return db
    .prepare(
      "SELECT * FROM health_logs WHERE telegram_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC, created_at ASC",
    )
    .all(telegramId, startDate, endDate) as HealthLogRow[];
}

export function queryHealthLogs(
  telegramId: number,
  type?: HealthLogType,
  startDate?: string,
  endDate?: string,
  limit = 50,
): HealthLogRow[] {
  let sql = "SELECT * FROM health_logs WHERE telegram_id = ?";
  const params: (string | number)[] = [telegramId];

  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }
  if (startDate) {
    sql += " AND date >= ?";
    params.push(startDate);
  }
  if (endDate) {
    sql += " AND date <= ?";
    params.push(endDate);
  }

  sql += " ORDER BY date DESC, created_at DESC LIMIT ?";
  params.push(limit);

  return db.prepare(sql).all(...params) as HealthLogRow[];
}
