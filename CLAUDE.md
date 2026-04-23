# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kapitalist** is a Nuxt 4 full-stack cryptocurrency portfolio tracker with Binance integration. It tracks asset prices, trade history, and portfolio aggregates. Background workers sync data from Binance and send Telegram alerts.

Package manager: **yarn**

## Commands

```bash
yarn dev          # Start dev server
yarn build        # Production build
yarn preview      # Preview production build locally
yarn lint         # Run ESLint
yarn lint:fix     # Auto-fix ESLint issues
```

### Database (Prisma)
```bash
yarn db:migrate   # Create + apply a new migration (dev only)
yarn db:deploy    # Apply existing migrations (production)
yarn db:seed      # Seed database (uses tsx ./prisma/seed.ts)
yarn db:studio    # Open Prisma Studio GUI
```

No test suite exists in this project.

## Architecture

### Stack
- **Nuxt 4** with SSR (file-based routing, H3 server, auto-imports)
- **PostgreSQL** via **Prisma 7** (schema at `prisma/schema.prisma`, config at `prisma.config.ts`)
- **Prisma adapter**: `@prisma/adapter-pg` for direct PostgreSQL connection
- **Bulma CSS** for styling
- **JWT** (`jose`) for auth stored in a `session` cookie
- **Binance Connector TypeScript SDK** for exchange data
- **Telegram bot** for price alerts

### Directory Layout

| Path | Purpose |
|---|---|
| `pages/` | Route pages (index, login, jobs, administration/assets) |
| `components/` | Auto-imported Vue components, organized by feature (`app/`, `assets/`, `trades/`) |
| `composables/useApi.ts` | Wraps `useFetch` — propagates cookies SSR→client, redirects to `/login` on 401 |
| `middleware/auth.js` | Client-side route guard; redirects unauthenticated users to `/login` |
| `server/api/` | H3 API routes (REST endpoints) |
| `server/protectRoute.ts` | JWT middleware for protected API routes — reads `session` cookie, sets `event.context.userId` |
| `server/apiKeyProtectRoute.ts` | API key middleware for worker endpoints — requires `x-api-key` header |
| `lib/` | Business logic (not Nuxt-specific) |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/auth.ts` | JWT sign/verify helpers |
| `lib/clients/` | `binanceClient.ts`, `telegramClient.ts` wrappers |
| `lib/bots/` | Background job logic: `pricesBot`, `priceChangeBot`, `tradeHistoryBot` |
| `lib/apiModels/` | Shared TypeScript types for API request/response shapes |
| `prisma/` | Schema, migrations, seed script |
| `prisma.config.ts` | Prisma 7 config — schema path and database URL for CLI tools |

### Authentication Flow
1. `POST /api/login` verifies `USER_NAME`/`USER_PASSWORD` env vars and signs a JWT
2. JWT is stored as a `session` cookie (name from `SESSION_COOKIE_NAME` in `lib/auth.ts`)
3. Server routes import and call `protectRoute.ts` to validate the cookie
4. Client `middleware/auth.js` redirects to `/login` if no session

### Background Workers
Three worker endpoints under `server/api/workers/` are triggered externally via cron (HTTP `POST` with `x-api-key` header). Each endpoint invokes the corresponding bot in `lib/bots/`:

| Endpoint | Bot | What it does |
|---|---|---|
| `/api/workers/prices` | `lib/bots/pricesBot.ts` | Fetches all tracked symbol prices from Binance, upserts into `AssetPrices`, purges records older than 10 minutes |
| `/api/workers/price-change` | `lib/bots/priceChangeBot.ts` | Fetches 24h tickers from Binance; sends a Telegram alert if `|priceChangePercent| > 5%` and the last alert for that symbol was more than 24 h ago (throttled via `PriceNotifications`) |
| `/api/workers/trade-history` | `lib/bots/tradeHistoryBot.ts` | Syncs new trades from Binance since last known timestamp per symbol, saves to `Trades`, recomputes `TradesAggr`, sends Telegram notifications for new trades |
| `/api/workers/wallet` | `lib/bots/walletBot.ts` | Fetches all non-zero account balances from Binance, joins with 24h ticker data, upserts into `WalletBalance` (stablecoins get price=1, PNL=0) |

All bots call `saveJobRunTime()` on success to record execution in `JobsHistory`. Errors are caught and forwarded to Telegram via `printError()`.

### Database Models
Defined in `prisma/schema.prisma`. Read that file for the authoritative field list.
- `Asset` — tracked cryptocurrencies (id = symbol, e.g. `BTCUSDT`)
- `Stable` — stablecoin denominations (one marked `isDefault`)
- `AssetPrices` — price snapshots over time
- `Trades` — raw trade records from Binance
- `TradesAggr` — per-symbol aggregated trade summary (qty, quoteQty, avgPrice)
- `JobsHistory` — execution log for worker jobs (auto-created on first run via upsert in `saveJobRunTime`)
- `WalletBalance` — latest per-asset balances synced from Binance (`symbol` = coin code, e.g. `BTC`)
- `PriceNotifications` — tracks when alerts were sent
- `User` — application users (email + hashed password)

### Key Environment Variables
```
DATABASE_URL       # PostgreSQL connection string
TOKEN_SECRET       # JWT signing secret
TOKEN_EXP          # JWT expiry (seconds, e.g. 3600)
BNB_API_KEY        # Binance API key
BNB_SECRET_KEY     # Binance secret
TLG_TOKEN_ID       # Telegram bot token
TLG_CHAT_ID        # Telegram chat ID
API_KEY            # Worker endpoint protection key
```

### Sitemap

#### Pages
| Route | File | Description |
|---|---|---|
| `/` | `pages/index.vue` | Portfolio dashboard — asset prices, trade aggregates |
| `/login` | `pages/login.vue` | Login form |
| `/jobs` | `pages/jobs.vue` | Job run history + manual trigger buttons |
| `/profile` | `pages/profile.vue` | User profile — email display, change password |
| `/wallet` | `pages/wallet.vue` | Live wallet — total value, today's PNL, per-asset breakdown |
| `/administration/assets` | `pages/administration/assets.vue` | Manage tracked assets (add/delete) |

#### API Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/login` | — | Authenticate; sets `session` cookie |
| `POST` | `/api/logout` | JWT | Clear session cookie |
| `GET` | `/api/assets` | JWT | List tracked assets |
| `POST` | `/api/assets` | JWT | Add a tracked asset |
| `DELETE` | `/api/assets/[id]` | JWT | Remove a tracked asset |
| `GET` | `/api/asset-prices` | JWT | Latest price snapshots |
| `GET` | `/api/trades-aggregates` | JWT | Per-symbol trade aggregates |
| `GET` | `/api/jobs` | JWT | Job run history |
| `POST` | `/api/jobs/[name]` | JWT | Manually trigger a job by name (case-insensitive, ignores whitespace) |
| `GET` | `/api/profile` | JWT | Current user profile |
| `PUT` | `/api/profile/password` | JWT | Change password |
| `GET` | `/api/wallet` | JWT | Wallet balances + total value + today's PNL |
| `POST` | `/api/workers/prices` | API key | Worker: sync asset prices |
| `POST` | `/api/workers/price-change` | API key | Worker: check price changes, send alerts |
| `POST` | `/api/workers/trade-history` | API key | Worker: sync trade history |
| `POST` | `/api/workers/wallet` | API key | Worker: sync wallet balances from Binance account |

### Deployment
Run on any Node.js server:
```bash
yarn install && yarn db:deploy && yarn build
node .output/server/index.mjs
```

Local PostgreSQL via Docker:
```bash
docker-compose -p postgres up -d --build
```
