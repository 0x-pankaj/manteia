#   Manteia — Real-Time Solana Prediction Arena

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![Magic Block](https://img.shields.io/badge/MagicBlock-Ephemeral%20Rollups-blue?style=for-the-badge)](https://magicblock.gg)
[![Anchor](https://img.shields.io/badge/Anchor-coral?style=for-the-badge)](https://www.anchor-lang.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Bun](https://img.shields.io/badge/Bun-000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

> **Manteia** *(Greek for Divination)* — A hyper-fast, gamified prediction market on Solana where users bet on SOL/USD price ranges in ultra-short windows. Powered by **MagicBlock Ephemeral Rollups** for sub-millisecond, gasless execution with real-time settlement against live Pyth price feeds.

---

## ✨ Highlights

| Feature | Detail |
|---|---|
| **⚡ 10-Second Predictions** | Pick a SOL/USD price range, choose a multiplier, and watch it resolve in real-time |
| **�️ Sub-ms Finality** | State is delegated to MagicBlock Ephemeral Rollups — zero gas, instant confirmation |
| **📡 Live Settlement** | Settlement service consumes on-chain events + live Pyth prices to resolve bets automatically |
| **🔐 Solana-Secured** | Final state commits back to Solana L1 on withdraw — full base-layer security |
| **🎮 Gamified Arena** | Multiplayer battles, leaderboards, and a practice arena — feels like a game, not a DEX |
| **📱 Mobile-First** | React Native + Skia for buttery-smooth charts and one-handed trading on iOS & Android |

---

## 🏗️ Architecture Overview

Manteia uses a **delegate → execute → settle → commit** lifecycle powered by MagicBlock Ephemeral Rollups. The user's on-chain PDA (`ProxyAccount`) is delegated to an ephemeral rollup for gasless, high-speed interactions, and committed back to Solana's base layer on withdrawal.

```mermaid
flowchart TB
    subgraph Client["Mobile App - React Native + Skia"]
        UI["Trading Arena UI"]
        WS_CLIENT["WebSocket Client"]
    end

    subgraph Solana["Solana Base Layer"]
        PROGRAM["Manteia Anchor Program"]
        PDA["ProxyAccount PDA"]
        GAME["GameAccount - Global Vault"]
    end

    subgraph MagicBlock["MagicBlock Ephemeral Rollup"]
        ER_STATE["Delegated ProxyAccount"]
        PYTH_ER["Pyth Price Feed - SOL/USD"]
    end

    subgraph Backend["Backend Services"]
        PRICE["Price Broadcaster - Bun WS :3001"]
        EVENTS["Event Listener"]
        REDIS["Redis Stream"]
        SETTLE["Settlement Service"]
    end

    UI -- "1. Create Account" --> PROGRAM
    PROGRAM -- "init ProxyAccount" --> PDA
    PDA -- "2. Delegate to ER" --> ER_STATE

    UI -- "3. Place Bet - gasless" --> ER_STATE
    ER_STATE -- "update state" --> ER_STATE

    ER_STATE -- "4. Emit Event" --> EVENTS
    EVENTS -- "push to stream" --> REDIS
    REDIS --> SETTLE

    PYTH_ER -- "live SOL/USD" --> PRICE
    PRICE -- "WS broadcast" --> WS_CLIENT
    PYTH_ER -- "settlement price" --> SETTLE

    SETTLE -- "5. Resolve Bet" --> ER_STATE

    ER_STATE -- "6. Commit and Undelegate" --> PDA
    PDA -- "SOL payout" --> UI

    style Client fill:#1a1a2e,stroke:#e94560,color:#fff
    style Solana fill:#0d1117,stroke:#9945FF,color:#fff
    style MagicBlock fill:#0d1117,stroke:#00d4ff,color:#fff
    style Backend fill:#0d1117,stroke:#00ff88,color:#fff
```

---

## 🔄 Lifecycle: Bet → Settle → Withdraw

The complete user journey from account creation to SOL withdrawal:

```mermaid
sequenceDiagram
    actor User as User
    participant App as Mobile App
    participant Program as Manteia Program
    participant ER as MagicBlock ER
    participant Events as Event Listener
    participant Redis as Redis Stream
    participant Settler as Settlement Service
    participant Pyth as Pyth Price Feed

    Note over User,Pyth: ACCOUNT CREATION and DELEGATION
    User->>App: Open app and connect wallet
    App->>Program: create_proxy_account()
    Program-->>Program: Init ProxyAccount PDA
    App->>Program: deposit(amount)
    Program-->>Program: Transfer SOL to GameAccount vault
    App->>Program: delegate_proxy_account()
    Program->>ER: Delegate ProxyAccount to Ephemeral Rollup

    Note over User,Pyth: PLACING BETS - Gasless on ER
    User->>App: Select price range and multiplier
    App->>ER: place_bet(amount, range, window, multiplier)
    ER-->>ER: Validate and store bet in ProxyAccount
    ER->>Events: Emit BetPlacedEvent

    Note over User,Pyth: REAL-TIME SETTLEMENT
    Events->>Redis: Push BetPlaced payload to stream
    Pyth-->>Settler: Live SOL/USD price feed
    Redis->>Settler: Consume bet events
    Settler->>Settler: Compare final price vs bet range
    Settler->>ER: resolve_bet(bet_id, won, payout)
    ER-->>ER: Update ProxyAccount unclaimed_balance
    ER->>Events: Emit BetResolvedEvent
    Events->>Redis: Push BetResolved payload to stream

    Note over User,Pyth: CLAIM and WITHDRAW - Commit to L1
    User->>App: Tap Claim Winnings
    App->>ER: claim_and_commit()
    ER-->>ER: Move unclaimed to balance
    User->>App: Tap Withdraw
    App->>ER: commit_and_undelegate()
    ER->>Program: Commit state and undelegate to Solana L1
    App->>Program: withdraw(amount)
    Program-->>User: SOL transferred to wallet
```

---

## � Smart Contract Deep Dive

The Manteia Anchor program ([`HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE`](https://explorer.solana.com/address/HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE)) is optimized for high-volume, low-latency execution on MagicBlock Ephemeral Rollups.

### On-Chain State

| Account | Purpose | Key Fields |
|---|---|---|
| **`ProxyAccount`** | Per-user PDA holding balance and up to **10 active bets** | `owner`, `balance`, `unclaimed_balance`, `bets[10]`, `active_bet_count` |
| **`GameAccount`** | Global vault managing pooled SOL liquidity | `authority`, `total_deposits`, `bump` |
| **`Bet`** | Individual bet struct (74 bytes each) | `target_price_range_start/end`, `prediction_start/end_time`, `payout_multiplier`, `won`, `resolved` |

### Instruction Set

| Instruction | Description |
|---|---|
| `create_proxy_account` | Initialize a user's ProxyAccount PDA |
| `initialize_game_account` | Set up the global game vault |
| `delegate_proxy_account` | Delegate ProxyAccount to MagicBlock Ephemeral Rollup |
| `deposit` | Transfer SOL into the GameAccount vault and credit user balance |
| `place_bet` | Place a price prediction bet with range, time window, and multiplier |
| `resolve_bet` | Settle a bet as won/lost with calculated payout |
| `claim_and_commit` | Claim winnings and commit state to the rollup |
| `commit_and_undelegate` | Commit final state back to Solana L1 and undelegate |
| `withdraw` | Withdraw SOL from the vault back to user wallet |

### Emitted Events

- **`BetPlacedEvent`** — user, bet_id, amount, price range, time window, multiplier
- **`BetResolvedEvent`** — user, bet_id, won, bet_amount, payout_amount
- **`DepositEvent`** / **`WithdrawEvent`** — user, amount, new_balance

---

## 🛠️ Tech Stack

### On-Chain Infrastructure
| Technology | Role |
|---|---|
| **Solana** | Base layer for final state settlement and SOL custody |
| **Anchor** | Solana program framework for type-safe smart contracts |
| **MagicBlock Ephemeral Rollups** | Gasless, sub-ms transaction execution via state delegation |
| **Pyth Network** | Real-time SOL/USD oracle price feeds |

### Backend Services
| Technology | Role |
|---|---|
| **Bun** | High-performance runtime for WebSocket price server (`:3001`) |
| **Redis + ioredis** | Event streaming pipeline (`xadd` / `xreadgroup`) for bet lifecycle |
| **@solana/web3.js** | On-chain event listener for program log parsing |

### Mobile Frontend
| Technology | Role |
|---|---|
| **React Native / Expo** | Cross-platform mobile framework |
| **React Native Skia** | GPU-accelerated charts, animations, and visual effects |
| **Zustand** | Lightweight reactive state management |

---

## 📂 Project Structure

```
manteia/
├── manteia-contract/       # Solana Anchor program
│   └── programs/
│       └── manteia-contract/src/
│           ├── lib.rs                  # Program entrypoint & instruction routing
│           ├── state.rs                # ProxyAccount, GameAccount, Bet structs
│           ├── events.rs               # On-chain event definitions
│           ├── errors.rs               # Custom error codes
│           └── instructions/
│               ├── create_proxy_account.rs
│               ├── initialize_game_account.rs
│               ├── deposit.rs
│               ├── place_bet.rs
│               ├── resolve_bet.rs
│               ├── claim.rs
│               └── withdraw.rs
├── backend/                # Bun WebSocket server — broadcasts live SOL/USD prices
├── price-poller/           # Raw Pyth price feed parser & debugger
├── event-listener/         # On-chain event → Redis stream bridge
└── skia/                   # React Native Expo app with Skia rendering
    ├── app/                # Expo Router screens
    ├── components/         # Reusable UI components
    ├── state/              # Zustand stores
    ├── server/             # API client layer
    ├── utils/              # Helpers (Solana, formatting, etc.)
    └── types/              # TypeScript type definitions
```

---

## ⚙️ Getting Started

### Prerequisites

- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.30+)
- [Bun](https://bun.sh) (v1.0+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Redis server running locally
- Solana CLI configured with a devnet/localnet wallet

### 1. Build the Smart Contract

```bash
cd manteia-contract
anchor build
anchor deploy          # Deploy to localnet or devnet
```

### 2. Start Backend Services

```bash
# Terminal 1 — Price broadcaster
cd backend
bun install && bun run index.ts

# Terminal 2 — Event listener
cd event-listener
bun install && bun run index.ts
```

### 3. Launch the Mobile App

```bash
cd skia
npm install
npx expo start
```

> **Tip**: Use Expo Go on your phone or an iOS/Android emulator to preview the app.

---

## 🎨 Design Philosophy

Manteia is built to feel like a **premium mobile game**, not a financial dashboard:

- **🎨 Visual Excellence** — Vibrant gradients, glassmorphism, and high-FPS Skia-rendered charts
- **⚡ Speed** — Interactions feel like gestures, not blockchain transactions
- **👆 One-Handed Flow** — All critical trading actions are within thumb-reach
- **🏆 Competitive Arena** — Real-time leaderboards & multiplayer prediction battles

---


