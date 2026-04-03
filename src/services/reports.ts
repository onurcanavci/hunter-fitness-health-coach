import {
  getLogsByDate,
  getLogsByDateRange,
  HealthLogRow,
} from "../db/health-logs.js";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  d.setDate(diff);
  return d;
}

function parseLogDetails(log: HealthLogRow): Record<string, unknown> {
  try {
    return JSON.parse(log.details);
  } catch {
    return {};
  }
}

export function getDailyLogs(telegramId: number, date?: string): string {
  const targetDate = date ?? formatDate(new Date());
  const logs = getLogsByDate(telegramId, targetDate);

  if (logs.length === 0) {
    return `No health data logged for ${targetDate}. Send me food photos or tell me what you ate/did today!`;
  }

  return formatLogsForClaude(logs, targetDate, targetDate);
}

export function getWeeklyLogs(telegramId: number): string {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const startDate = formatDate(weekStart);
  const endDate = formatDate(today);
  const logs = getLogsByDateRange(telegramId, startDate, endDate);

  if (logs.length === 0) {
    return `No health data logged for the week of ${startDate} to ${endDate}.`;
  }

  return formatLogsForClaude(logs, startDate, endDate);
}

function formatLogsForClaude(
  logs: HealthLogRow[],
  startDate: string,
  endDate: string,
): string {
  const grouped: Record<string, HealthLogRow[]> = {};

  for (const log of logs) {
    if (!grouped[log.date]) grouped[log.date] = [];
    grouped[log.date].push(log);
  }

  let result = `Health data from ${startDate} to ${endDate}:\n\n`;

  for (const [date, dayLogs] of Object.entries(grouped).sort()) {
    result += `--- ${date} ---\n`;

    for (const log of dayLogs) {
      const details = parseLogDetails(log);
      result += `[${log.type.toUpperCase()}] ${log.summary}`;
      if (Object.keys(details).length > 0) {
        result += ` | ${JSON.stringify(details)}`;
      }
      result += "\n";
    }

    result += "\n";
  }

  return result;
}
