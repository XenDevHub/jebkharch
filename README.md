# Jeb Kharch — Play Smart. Win Real.

A skill-based quiz gaming platform for Pakistani audiences. Players register with a phone number, play AI-generated quizzes, challenge friends 1v1, join tournaments, and withdraw earned coins as real money via Easypaisa.

---

## 🏗 Monorepo Structure

```
jebkharch/
├── apps/
│   ├── mobile/        # React Native (Expo) — iOS & Android
│   ├── admin/         # React + Vite + Tailwind — Admin Dashboard
│   └── api/           # NestJS — REST API + WebSockets
├── packages/
│   └── shared/        # Shared TypeScript types, DTOs, constants
├── docker-compose.yml # PostgreSQL + Redis
├── .env.example       # All required env vars documented here
└── README.md
```

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker + Docker Compose

### 1. Clone & Install
```bash
git clone <repo-url>
cd jebkharch
pnpm install
```

### 2. Environment Setup
```bash
# Copy root env template
cp .env.example .env

# Copy API env template
cp apps/api/.env.example apps/api/.env

# Edit .env files with your values (see comments in each file)
# At minimum for local dev, defaults will work without any changes
```

### 3. Start Database
```bash
docker-compose up -d
# PostgreSQL on :5432, Redis on :6379
```

### 4. Run Migrations & Seed
```bash
pnpm db:migrate    # Apply Prisma migrations
pnpm db:generate   # Generate Prisma client
pnpm db:seed       # Seed categories, test users
```

### 5. Start Services (in separate terminals)

```bash
# Backend API (http://localhost:3000)
pnpm dev:api

# Admin Panel (http://localhost:5173)
pnpm dev:admin

# Mobile App (Expo DevTools)
pnpm dev:mobile
```

---

## 📱 Mobile App
Built with **React Native (Expo)**. Runs on iOS simulator, Android emulator, or physical device via Expo Go.

```bash
cd apps/mobile
pnpm start          # Start Expo dev server
pnpm android        # Run on Android
pnpm ios            # Run on iOS (macOS only)
```

---

## 🖥 Admin Panel
Built with **React + Vite + Tailwind CSS**. Available at `http://localhost:5173`.

Default admin credentials (dev only):
- Phone: `03001234567`
- Seeded with ADMIN role via `pnpm db:seed`

---

## 🔧 API
Built with **NestJS** (TypeScript). Swagger docs at `http://localhost:3000/api/docs`.

```bash
cd apps/api
pnpm dev            # Start with hot reload
pnpm test           # Run unit tests
pnpm test:e2e       # Run e2e tests
```

---

## 🗄 Database
Using **PostgreSQL 16** via **Prisma ORM**.

```bash
pnpm db:migrate     # Run pending migrations
pnpm db:studio      # Open Prisma Studio (visual DB browser)
pnpm db:seed        # Seed test data
```

---

## 🔌 Third-Party Integrations (Stubbed)

All third-party services are abstracted behind clean interfaces. Stubs work for local dev.

| Service | Interface | Mock | Real Integration |
|---------|-----------|------|-----------------|
| SMS / OTP | `ISmsProvider` | `MockSmsProvider` (logs to console) | Replace in `apps/api/src/sms/providers/` |
| Easypaisa Payout | `IPayoutProvider` | `MockPayoutProvider` | Replace in `apps/api/src/payout/providers/` |
| AdMob | `AdProvider` hook | `MockAdProvider` | Replace in `apps/mobile/src/providers/` |
| Subscription Billing | `ISubscriptionProvider` | `MockSubscriptionProvider` | Replace in `apps/api/src/subscription/providers/` |
| File Storage | `IStorageService` | Local disk | Replace in `apps/api/src/storage/providers/` |
| OpenAI | `IQuestionGenerator` | Falls back to seeded Qs | Set `OPENAI_API_KEY` in env |

---

## 🪙 Coin Economy (Non-Negotiable Rules)
- Starting balance: **5 coins**
- Normal quiz entry: **5 coins**
- Challenge entry: **15 coins/player**
- Quiz rewards: 10/10 = 15 coins, 9/10 = 8, 8/10 = 5, <8 = 0
- Challenge win: **30 coins** (pot); tie = refund both
- Daily earning cap: **50 coins**
- Min withdrawal: **500 coins**
- Withdrawal cooldown: **24 hours**
- Large withdrawal (>1000 coins): **manual review required**

All coin logic is **server-side only**. Client scores are never trusted.

---

## 🧪 Testing
```bash
pnpm test           # All unit tests (Jest)
pnpm test:e2e       # API e2e tests
```

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo SDK 51) |
| Admin | React 18 + Vite 5 + Tailwind CSS 3 |
| API | NestJS 10 + TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| Realtime | Socket.io (NestJS Gateway) |
| Auth | JWT (access + refresh) + Phone OTP |
| AI | OpenAI GPT-4o |
| Payments | Easypaisa (stubbed) |
| Ads | AdMob (stubbed) |

---

## 🔐 Security Notes
- Secrets are **never** hardcoded — always via environment variables
- All coin/reward logic is server-side only
- Wallet writes use **DB transactions** (atomic balance + ledger entry)
- JWT tokens are short-lived (15m access, 7d refresh)
- OTP: max 5 attempts, 60s resend cooldown, auto-block on abuse

---

## 📄 License
Private & Proprietary — Jeb Kharch © 2024
