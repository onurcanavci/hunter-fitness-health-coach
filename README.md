# Hunter - Fitness & Health Coach

An AI-powered Telegram bot that acts as your personal fitness, nutrition, and health coach. Built with [Claude](https://www.anthropic.com/claude) by Anthropic, it provides personalized advice, meal plans, workout programs, food photo analysis, and health data tracking — all through a simple Telegram chat.

## Motivation

I'm a developer who recently started paying closer attention to fitness and nutrition. Like many people, I spent time Googling meal plans, calculating calories manually, and trying to piece together workout routines from different sources.

Then I came across [this post](https://x.com/Hawks0x/status/2039438255653806526) by [@Hawks0x](https://x.com/Hawks0x) — a guide on turning Claude into the ultimate personal trainer. The idea of using AI as a fitness coach clicked immediately. Instead of just using prompts in a chat window, I wanted something I could use on the go — right from Telegram.

So I built Hunter. It started as a personal tool, but I figured if it helps me, it might help others too. That's why it's open source. Whether you're cutting for summer, bulking, or just trying to eat better — Hunter is here to help.

## Features

- **Ask anything** — fitness, nutrition, supplements, recovery, motivation
- **Food photo analysis** — send a photo of your meal, get calorie & macro estimates (auto-logged)
- **Personalized profiles** — save your stats, goals, and preferences once; get tailored advice every time
- **7-day meal plans** — customized to your calories, macros, and food preferences
- **Workout programs** — goal-specific training splits with exercises, sets, and reps
- **Health data tracking** — food, exercise, sleep, and blood test results logged automatically
- **Health history recall** — ask about any past data (e.g. "how was my blood test?") and Hunter queries your logs automatically
- **Daily & weekly reports** — summaries with totals, trends, scores, and actionable tips
- **Blood test analysis** — share lab results for interpretation in context of your lifestyle
- **Multilingual** — write in any language, Hunter responds in the same language

## Commands

| Command    | Description                                              |
| ---------- | -------------------------------------------------------- |
| `/start`   | Welcome message and overview                             |
| `/profile` | Set up your personal profile (stats, goals, preferences) |
| `/plan`    | Generate a personalized 7-day meal plan                  |
| `/workout` | Get a goal-specific training program                     |
| `/report`  | Today's health summary (food, exercise, sleep)           |
| `/weekly`  | This week's health report with trends                    |
| `/reset`   | Clear conversation history (profile & logs stay saved)   |
| `/help`    | Show all available commands                              |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [pnpm](https://pnpm.io/) (enable via `corepack enable` — comes with Node.js)
- A [Telegram Bot Token](https://core.telegram.org/bots#how-do-i-create-a-bot) (free, from @BotFather)
- An [Anthropic API Key](https://console.anthropic.com/settings/keys)

### Installation

```bash
git clone https://github.com/onurcanavci/hunter-fitness-health-coach.git
cd hunter-fitness-health-coach
pnpm install
```

### Configuration

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ANTHROPIC_API_KEY=your_anthropic_api_key
CLAUDE_MODEL=claude-sonnet-4-6-20250514    # optional, defaults to Sonnet
```

**Getting your Telegram Bot Token:**

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy the token into your `.env` file

**Getting your Anthropic API Key:**

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create a new key and copy it into your `.env` file

### Running Locally

```bash
# Development (auto-reload on changes)
pnpm dev

# Production
pnpm build
pnpm start
```

Open Telegram, find your bot, and send `/start`.

## Deployment

Hunter needs to run continuously to receive Telegram messages. The easiest way is to deploy from GitHub to a cloud platform.

### Railway (Recommended)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/IQa0i-?referralCode=-PJzkP&utm_medium=integration&utm_source=template&utm_campaign=generic)

Click the button above, fill in `TELEGRAM_BOT_TOKEN` and `ANTHROPIC_API_KEY`, and you're done.

Or manually:

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub Repo** → select your repo
3. Add environment variables: `TELEGRAM_BOT_TOKEN` and `ANTHROPIC_API_KEY`
4. Deploy happens automatically

Railway's free tier ($5/month credit) is more than enough for a personal bot.

### Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a **Background Worker**
3. Connect your GitHub repo
4. Set the build command to `corepack enable && pnpm install && pnpm build`
5. Set the start command to `pnpm start`
6. Add environment variables

### Docker

```bash
docker build -t hunter-bot .
docker run -d \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e ANTHROPIC_API_KEY=your_key \
  -v hunter-data:/app/data \
  hunter-bot
```

## Project Structure

```
src/
├── index.ts                # Entry point
├── config.ts               # Environment validation
├── bot/
│   ├── index.ts            # Bot creation and middleware
│   ├── commands.ts         # Command handlers (/profile, /plan, etc.)
│   ├── handlers.ts         # Message handlers (text, photos)
│   └── helpers.ts          # Telegram utilities (message splitting)
├── services/
│   ├── claude.ts           # Claude API integration and tool handling
│   └── reports.ts          # Daily/weekly report data aggregation
├── db/
│   ├── index.ts            # SQLite setup and migrations
│   ├── users.ts            # User profile queries
│   ├── messages.ts         # Conversation history queries
│   └── health-logs.ts      # Health data log queries
└── prompts/
    └── system.ts           # System prompt builder
```

## How It Works

1. You send a message or photo on Telegram
2. The bot loads your saved profile and recent conversation history
3. Everything is sent to Claude with a detailed fitness coach system prompt
4. Claude responds with personalized advice and automatically logs health data
5. When you ask for a report, logged data is aggregated and sent to Claude for analysis

**Data stays local** — all data is stored in a SQLite file (`data/bot.db`) on your server. Nothing is sent to third parties beyond the Claude API.

## Roadmap

- [ ] Apple Health / Google Fit integration
- [ ] Progress photo tracking and comparison
- [ ] Automated daily report scheduling
- [ ] Grocery list generation from meal plans
- [ ] Weight trend charts and visualizations
- [ ] Webhook support for higher-traffic deployments

## Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or documentation improvement.

### Setup

1. Fork the repository
2. Clone and install:
   ```bash
   git clone https://github.com/<your-username>/hunter-fitness-health-coach.git
   cd hunter-fitness-health-coach
   corepack enable
   pnpm install
   ```
   `pnpm install` automatically sets up Git hooks via Husky — every commit will be checked with ESLint and Prettier.

### Code Style

This project uses **ESLint** and **Prettier** to enforce consistent code style. A pre-commit hook runs automatically on staged files, so you don't need to think about it.

If you use VS Code, the included `.vscode/settings.json` will format on save — just make sure you have the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) installed.

You can also run these manually:

```bash
pnpm lint        # Check for lint errors
pnpm lint:fix    # Auto-fix lint errors
pnpm format      # Format all source files
```

### Submitting Changes

1. Create a feature branch (`git checkout -b feature/my-feature`)
2. Make your changes
3. Run `pnpm build` to make sure everything compiles
4. Commit your changes (`git commit -m 'Add my feature'`)
5. Push to the branch (`git push origin feature/my-feature`)
6. Open a Pull Request

Please keep the code modular — each function should do one thing, and each file should have a clear responsibility.

## License

MIT — see [LICENSE](LICENSE) for details.

## Credits

- Inspired by [@Hawks0x](https://x.com/Hawks0x) and his guide on [turning Claude into the ultimate personal trainer](https://x.com/Hawks0x/status/2039438255653806526)
- Powered by [Claude](https://www.anthropic.com/claude) by Anthropic
- Built with [grammY](https://grammy.dev/) (Telegram Bot Framework)
