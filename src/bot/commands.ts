import { Bot } from "grammy";
import { getOrCreateUser } from "../db/users.js";
import { clearMessages } from "../db/messages.js";
import { chat } from "../services/claude.js";
import { getDailyLogs, getWeeklyLogs } from "../services/reports.js";
import { sendLongMessage } from "./helpers.js";

export function registerCommands(bot: Bot): void {
  bot.command("start", handleStart);
  bot.command("help", handleHelp);
  bot.command("profile", handleProfile);
  bot.command("plan", handlePlan);
  bot.command("workout", handleWorkout);
  bot.command("report", handleDailyReport);
  bot.command("weekly", handleWeeklyReport);
  bot.command("reset", handleReset);
}

const handleStart: Parameters<Bot["command"]>[1] = async (ctx) => {
  getOrCreateUser(ctx.from!.id, ctx.from?.username);
  await ctx.reply(
    `*Welcome to Hunter — Fitness & Health Coach* 🏋️

Your AI-powered personal fitness, nutrition, and health companion.

*What can I do?*
• 💬 Ask any fitness, nutrition, or health question
• 📸 Send a food photo → get calorie & macro estimates
• 💪 Get personalized workout programs
• 📊 Track your food, exercise, sleep & get reports
• 🩸 Analyze blood test results

*Commands:*
/profile — Set up your personal profile
/plan — Get a 7-day meal plan
/workout — Get a training program
/report — Daily health summary
/weekly — Weekly health report
/reset — Clear conversation history
/help — Show all commands

Write in any language — I'll respond in yours!
Start by asking anything or use /profile to personalize your experience.`,
    { parse_mode: "Markdown" },
  );
};

const handleHelp: Parameters<Bot["command"]>[1] = async (ctx) => {
  await ctx.reply(
    `*Hunter — Help* 📋

*Commands:*
/profile — Build your personal profile (stats, goals, preferences)
/plan — Personalized 7-day meal plan
/workout — Goal-specific training program
/report — Today's health summary (food, exercise, sleep)
/weekly — This week's health report with trends
/reset — Clear conversation history (profile stays saved)

*Features:*
🍽️ Food photo → calorie & macro estimate (auto-logged)
💬 Ask any fitness, nutrition, or health question
🩸 Share blood test results for analysis
😴 Share sleep data for insights
🏃 Share Apple Fitness / workout data
📊 Daily & weekly health reports

*Tip:* Set up your profile first for personalized advice!
*Multilingual:* Write in any language — I'll match it.`,
    { parse_mode: "Markdown" },
  );
};

const handleProfile: Parameters<Bot["command"]>[1] = async (ctx) => {
  getOrCreateUser(ctx.from!.id, ctx.from?.username);
  await ctx.replyWithChatAction("typing");
  const response = await chat(
    ctx.from!.id,
    "I want to set up my profile. Ask me the questions section by section.",
  );
  await sendLongMessage(ctx, response);
};

const handlePlan: Parameters<Bot["command"]>[1] = async (ctx) => {
  getOrCreateUser(ctx.from!.id, ctx.from?.username);
  await ctx.replyWithChatAction("typing");
  const response = await chat(
    ctx.from!.id,
    "Create a personalized 7-day meal plan for me. Use my saved profile to calculate calories, set macros, give each day a theme, and provide a detailed plan.",
  );
  await sendLongMessage(ctx, response);
};

const handleWorkout: Parameters<Bot["command"]>[1] = async (ctx) => {
  getOrCreateUser(ctx.from!.id, ctx.from?.username);
  await ctx.replyWithChatAction("typing");
  const response = await chat(
    ctx.from!.id,
    "Create a training program suited to my goals. Consider my profile. Include which split you recommend, exercises, set/rep schemes, and the full weekly schedule.",
  );
  await sendLongMessage(ctx, response);
};

const handleDailyReport: Parameters<Bot["command"]>[1] = async (ctx) => {
  getOrCreateUser(ctx.from!.id, ctx.from?.username);
  await ctx.replyWithChatAction("typing");

  const logsContext = getDailyLogs(ctx.from!.id);
  const response = await chat(
    ctx.from!.id,
    `Generate my daily health report for today. Here is the logged data:\n\n${logsContext}\n\nAnalyze everything — food, exercise, sleep, any other data. Calculate totals, compare against my goals, give me a score and actionable tips for tomorrow.`,
  );
  await sendLongMessage(ctx, response);
};

const handleWeeklyReport: Parameters<Bot["command"]>[1] = async (ctx) => {
  getOrCreateUser(ctx.from!.id, ctx.from?.username);
  await ctx.replyWithChatAction("typing");

  const logsContext = getWeeklyLogs(ctx.from!.id);
  const response = await chat(
    ctx.from!.id,
    `Generate my weekly health report. Here is the logged data:\n\n${logsContext}\n\nShow daily breakdowns, trends, averages, a consistency score, highlight wins and areas to improve, and give recommendations for next week.`,
  );
  await sendLongMessage(ctx, response);
};

const handleReset: Parameters<Bot["command"]>[1] = async (ctx) => {
  clearMessages(ctx.from!.id);
  await ctx.reply(
    "🔄 Conversation cleared! Your profile and health logs are still saved.\n\nLet's start fresh 💪",
  );
};
