import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { buildSystemPrompt } from "../prompts/system.js";
import { getUserProfile, saveUserProfile } from "../db/users.js";
import { addMessage, getRecentMessages } from "../db/messages.js";
import {
  addHealthLog,
  queryHealthLogs,
  HealthLogType,
} from "../db/health-logs.js";

const anthropic = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "save_user_profile",
    description:
      "Save the user's fitness profile after all profile sections have been collected.",
    input_schema: {
      type: "object" as const,
      properties: {
        age: { type: "number", description: "Age" },
        sex: { type: "string", description: "Biological sex (male/female)" },
        height_cm: { type: "number", description: "Height in cm" },
        weight_kg: { type: "number", description: "Current weight in kg" },
        goal_weight_kg: { type: "number", description: "Goal weight in kg" },
        goal_description: { type: "string", description: "Goal description" },
        pace: {
          type: "string",
          description: "Preferred pace of weight change",
        },
        job_type: { type: "string", description: "Job type" },
        exercise_frequency: {
          type: "string",
          description: "Weekly exercise frequency and type",
        },
        sleep_hours: { type: "number", description: "Daily sleep hours" },
        stress_level: { type: "string", description: "Stress level" },
        alcohol: { type: "string", description: "Alcohol consumption" },
        favorite_meals: {
          type: "array",
          items: { type: "string" },
          description: "Favorite meals",
        },
        hated_foods: {
          type: "array",
          items: { type: "string" },
          description: "Hated foods",
        },
        dietary_restrictions: {
          type: "string",
          description: "Dietary restrictions / allergies",
        },
        cooking_preference: {
          type: "string",
          description: "Cooking preference",
        },
        food_adventurousness: {
          type: "number",
          description: "Food adventurousness (1-10)",
        },
        current_snacks: {
          type: "array",
          items: { type: "string" },
          description: "Current snacks",
        },
        snack_reason: {
          type: "string",
          description: "Snacking reason (hunger/boredom/habit)",
        },
        snack_preference: {
          type: "string",
          description: "Sweet/savory preference",
        },
        late_night_snacking: {
          type: "boolean",
          description: "Late night snacking habit",
        },
      },
      required: ["age", "sex", "height_cm", "weight_kg"],
    },
  },
  {
    name: "log_health_entry",
    description:
      "Log a health entry. Call this whenever the user shares food (including photos), exercise, sleep, blood test results, or any health data.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: [
            "food",
            "exercise",
            "sleep",
            "blood_test",
            "body_metrics",
            "other",
          ],
          description: "Type of health entry",
        },
        summary: {
          type: "string",
          description:
            "Brief human-readable summary (e.g., 'Grilled chicken salad for lunch')",
        },
        details: {
          type: "object",
          description:
            "Structured data — calories, macros, duration, lab values, etc.",
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format. Use today if not specified.",
        },
      },
      required: ["type", "summary", "details", "date"],
    },
  },
  {
    name: "query_health_logs",
    description:
      "Query the user's past health logs. Use this to look up previously logged food, exercise, sleep, blood test results, or any health data. Always use this when the user asks about their past data.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: [
            "food",
            "exercise",
            "sleep",
            "blood_test",
            "body_metrics",
            "other",
          ],
          description: "Filter by type. Omit to search all types.",
        },
        start_date: {
          type: "string",
          description:
            "Start date in YYYY-MM-DD format. Omit for no lower bound.",
        },
        end_date: {
          type: "string",
          description:
            "End date in YYYY-MM-DD format. Omit for no upper bound.",
        },
        limit: {
          type: "number",
          description: "Max number of results to return (default 50).",
        },
      },
      required: [],
    },
  },
];

type ToolHandler = (
  telegramId: number,
  input: Record<string, unknown>,
) => string;

const toolHandlers: Record<string, ToolHandler> = {
  save_user_profile: (telegramId, input) => {
    saveUserProfile(telegramId, input);
    return "Profile saved successfully.";
  },
  log_health_entry: (telegramId, input) => {
    addHealthLog(telegramId, {
      type: input.type as HealthLogType,
      summary: input.summary as string,
      details: (input.details as Record<string, unknown>) ?? {},
      date: input.date as string,
    });
    return "Health entry logged successfully.";
  },
  query_health_logs: (telegramId, input) => {
    const logs = queryHealthLogs(
      telegramId,
      input.type as HealthLogType | undefined,
      input.start_date as string | undefined,
      input.end_date as string | undefined,
      (input.limit as number) ?? 50,
    );
    if (logs.length === 0) {
      return "No health logs found for the given filters.";
    }
    return logs
      .map((log) => {
        const details = JSON.parse(log.details);
        const detailStr =
          Object.keys(details).length > 0
            ? ` | ${JSON.stringify(details)}`
            : "";
        return `[${log.date}] [${log.type.toUpperCase()}] ${log.summary}${detailStr}`;
      })
      .join("\n");
  },
};

export async function chat(
  telegramId: number,
  userMessage: string,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<string> {
  const profile = getUserProfile(telegramId);
  const systemPrompt = buildSystemPrompt(profile);
  const history = getRecentMessages(
    telegramId,
    config.conversationHistoryLimit,
  );

  // Build user content blocks
  const userContent: Anthropic.ContentBlockParam[] = [];

  if (imageBase64 && imageMimeType) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMimeType as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp",
        data: imageBase64,
      },
    });
  }

  userContent.push({
    type: "text",
    text: userMessage || "Analyze this food photo.",
  });

  // Build conversation from history
  const messages: Anthropic.MessageParam[] = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
  messages.push({ role: "user", content: userContent });

  addMessage(telegramId, "user", userMessage || "[Photo sent]");

  // Call Claude — loop to handle tool use
  let assistantText = "";
  let response = await callClaude(systemPrompt, messages);

  while (response.stop_reason === "tool_use") {
    const { text, toolResults } = processToolUse(telegramId, response.content);
    assistantText += text;

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await callClaude(systemPrompt, messages);
  }

  // Extract final text
  for (const block of response.content) {
    if (block.type === "text") {
      assistantText += block.text;
    }
  }

  addMessage(telegramId, "assistant", assistantText);
  return assistantText;
}

async function callClaude(
  systemPrompt: string,
  messages: Anthropic.MessageParam[],
): Promise<Anthropic.Message> {
  return anthropic.messages.create({
    model: config.claudeModel,
    max_tokens: 4096,
    system: systemPrompt,
    tools,
    messages,
  });
}

function processToolUse(
  telegramId: number,
  content: Anthropic.ContentBlock[],
): {
  text: string;
  toolResults: Anthropic.ToolResultBlockParam[];
} {
  let text = "";
  const toolResults: Anthropic.ToolResultBlockParam[] = [];

  for (const block of content) {
    if (block.type === "text") {
      text += block.text;
    } else if (block.type === "tool_use") {
      const handler = toolHandlers[block.name];
      const result = handler
        ? handler(telegramId, block.input as Record<string, unknown>)
        : `Unknown tool: ${block.name}`;

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }
  }

  return { text, toolResults };
}
