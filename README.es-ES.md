# Manteia — Arena de Predicciones de Solana en Tiempo Real

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![Magic Block](https://img.shields.io/badge/MagicBlock-Ephemeral%20Rollups-blue?style=for-the-badge)](https://magicblock.gg)
[![Anchor](https://img.shields.io/badge/Anchor-coral?style=for-the-badge)](https://www.anchor-lang.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Bun](https://img.shields.io/badge/Bun-000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

> **Manteia** *(Adivinación en griego)* — Un mercado de predicciones gamificado y ultra rápido en Solana donde los usuarios apuestan a rangos de precios de SOL/USD en ventanas de tiempo extremadamente cortas. Impulsado por **MagicBlock Ephemeral Rollups** para una ejecución sin gas y en submilisegundos, con liquidaciones en tiempo real basadas en feeds de precios vivos de Pyth.

---

## ✨ Aspectos Destacados

| Característica | Detalle |
|---|---|
| **⚡ Predicciones de 10 Segundos** | Elige un rango de precio SOL/USD, selecciona un multiplicador y observa la resolución en tiempo real |
| **🏎️ Finalidad en Sub-ms** | El estado se delega a MagicBlock Ephemeral Rollups — cero gas, confirmación instantánea |
| **📡 Liquidación en Vivo** | Un servicio de liquidación consume eventos on-chain + precios reales de Pyth para resolver apuestas automáticamente |
| **🔐 Asegurado por Solana** | El estado final se confirma en la L1 de Solana al retirar — seguridad total de la capa base |
| **🎮 Arena Gamificada** | Batallas multijugador, tablas de clasificación y una arena de práctica — se siente como un juego, no como un DEX |
| **📱 Enfoque Mobile-First** | React Native + Skia para gráficos fluidos y trading a una sola mano en iOS y Android |

---

## 🏗️ Descripción General de la Arquitectura

Manteia utiliza un ciclo de vida de **delegar → ejecutar → liquidar → confirmar** impulsado por MagicBlock Ephemeral Rollups. El PDA on-chain del usuario (`ProxyAccount`) se delega a un rollup efímero para interacciones de alta velocidad y sin gas, y se confirma nuevamente en la capa base de Solana al momento del retiro.

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

## 🔄 Ciclo de Vida: Apuesta → Liquidación → Retiro

El recorrido completo del usuario desde la creación de la cuenta hasta el retiro de SOL:

```mermaid
sequenceDiagram
    actor User as Usuario
    participant App as App Móvil
    participant Program as Programa Manteia
    participant ER as MagicBlock ER
    participant Events as Event Listener
    participant Redis as Redis Stream
    participant Settler as Servicio de Liquidación
    participant Pyth as Pyth Price Feed

    Note over User,Pyth: CREACIÓN DE CUENTA y DELEGACIÓN
    User->>App: Abre la app y conecta wallet
    App->>Program: create_proxy_account()
    Program-->>Program: Init ProxyAccount PDA
    App->>Program: deposit(amount)
    Program-->>Program: Transferir SOL al vault GameAccount
    App->>Program: delegate_proxy_account()
    Program->>ER: Delegar ProxyAccount al Ephemeral Rollup

    Note over User,Pyth: REALIZAR APUESTAS - Sin gas en ER
    User->>App: Selecciona rango de precio y multiplicador
    App->>ER: place_bet(amount, range, window, multiplier)
    ER-->>ER: Validar y almacenar apuesta en ProxyAccount
    ER->>Events: Emitir BetPlacedEvent

    Note over User,Pyth: LIQUIDACIÓN EN TIEMPO REAL
    Events->>Redis: Enviar payload BetPlaced al stream
    Pyth-->>Settler: Feed de precio vivo SOL/USD
    Redis->>Settler: Consumir eventos de apuestas
    Settler->>Settler: Comparar precio final vs rango de apuesta
    Settler->>ER: resolve_bet(bet_id, won, payout)
    ER-->>ER: Actualizar unclaimed_balance de ProxyAccount
    ER->>Events: Emitir BetResolvedEvent
    Events->>Redis: Enviar payload BetResolved al stream

    Note over User,Pyth: RECLAMAR y RETIRAR - Confirmar en L1
    User->>App: Toca en Reclamar Ganancias
    App->>ER: claim_and_commit()
    ER-->>ER: Mover no reclamado al balance
    User->>App: Toca en Retirar
    App->>ER: commit_and_undelegate()
    ER->>Program: Confirmar estado y desdelegar a Solana L1
    App->>Program: withdraw(amount)
    Program-->>User: SOL transferidos a la wallet
```

---

## ⛓️ Análisis Profundo del Smart Contract

El programa de Anchor de Manteia ([`HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE`](https://explorer.solana.com/address/HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE)) está optimizado para una ejecución de alto volumen y baja latencia en MagicBlock Ephemeral Rollups.

### Estado On-Chain

| Cuenta | Propósito | Campos Clave |
|---|---|---|
| **`ProxyAccount`** | PDA por usuario que contiene el balance y hasta **10 apuestas activas** | `owner`, `balance`, `unclaimed_balance`, `bets[10]`, `active_bet_count` |
| **`GameAccount`** | Vault global que gestiona la liquidez de SOL agrupada | `authority`, `total_deposits`, `bump` |
| **`Bet`** | Estructura de apuesta individual (74 bytes cada una) | `target_price_range_start/end`, `prediction_start/end_time`, `payout_multiplier`, `won`, `resolved` |

### Conjunto de Instrucciones

| Instrucción | Descripción |
|---|---|
| `create_proxy_account` | Inicializa el PDA ProxyAccount de un usuario |
| `initialize_game_account` | Configura el vault global del juego |
| `delegate_proxy_account` | Delega el ProxyAccount al MagicBlock Ephemeral Rollup |
| `deposit` | Transfiere SOL al vault GameAccount y acredita el balance del usuario |
| `place_bet` | Realiza una apuesta de predicción de precio con rango, ventana de tiempo y multiplicador |
| `resolve_bet` | Liquida una apuesta como ganada/perdida con el pago calculado |
| `claim_and_commit` | Reclama ganancias y confirma el estado en el rollup |
| `commit_and_undelegate` | Confirma el estado final en Solana L1 y desdelega |
| `withdraw` | Retira SOL del vault hacia la wallet del usuario |

### Eventos Emitidos

- **`BetPlacedEvent`** — usuario, bet_id, monto, rango de precio, ventana de tiempo, multiplicador
- **`BetResolvedEvent`** — usuario, bet_id, ganado, monto_apuesto, monto_pagado
- **`DepositEvent`** / **`WithdrawEvent`** — usuario, monto, nuevo_balance

---

## 🛠️ Stack Tecnológico

### Infraestructura On-Chain
| Tecnología | Rol |
|---|---|
| **Solana** | Capa base para la liquidación del estado final y custodia de SOL |
| **Anchor** | Framework de programas de Solana para smart contracts con seguridad de tipos |
| **MagicBlock Ephemeral Rollups** | Ejecución de transacciones sin gas y en submilisegundos mediante delegación de estado |
| **Pyth Network** | Feeds de precios oráculo SOL/USD en tiempo real |

### Servicios de Backend
| Tecnología | Rol |
|---|---|
| **Bun** | Runtime de alto rendimiento para el servidor de precios WebSocket (`:3001`) |
| **Redis + ioredis** | Pipeline de streaming de eventos (`xadd` / `xreadgroup`) para el ciclo de vida de la apuesta |
| **@solana/web3.js** | Escucha de eventos on-chain para el análisis de logs del programa |

### Frontend Móvil
| Tecnología | Rol |
|---|---|
| **React Native / Expo** | Framework móvil multiplataforma |
| **React Native Skia** | Gráficos, animaciones y efectos visuales acelerados por GPU |
| **Zustand** | Gestión de estado reactiva ligera |

---

## 📂 Estructura del Proyecto

```
manteia/
├── manteia-contract/       # Programa de Solana Anchor
│   └── programs/
│       └── manteia-contract/src/
│           ├── lib.rs                  # Punto de entrada del programa y enrutamiento de instrucciones
│           ├── state.rs                # Estructuras ProxyAccount, GameAccount, Bet
│           ├── events.rs               # Definiciones de eventos on-chain
│           ├── errors.rs               # Códigos de error personalizados
│           └── instructions/
│               ├── create_proxy_account.rs
│               ├── initialize_game_account.rs
│               ├── deposit.rs
│               ├── place_bet.rs
│               ├── resolve_bet.rs
│               ├── claim.rs
│               └── withdraw.rs
├── backend/                # Servidor WebSocket de Bun — transmite precios vivos de SOL/USD
├── price-poller/           # Analizador y depurador de feeds de precios crudos de Pyth
├── event-listener/         # Puente de eventos on-chain → stream de Redis
└── skia/                   # App de React Native Expo con renderizado de Skia
    ├── app/                # Pantallas de Expo Router
    ├── components/         # Componentes de UI reutilizables
    ├── state/              # Stores de Zustand
    ├── server/             # Capa de cliente API
    ├── utils/              # Helpers (Solana, formateo, etc.)
    └── types/              # Definiciones de tipos de TypeScript
```

---

## ⚙️ Primeros Pasos

### Prerrequisitos

- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.30+)
- [Bun](https://bun.sh) (v1.0+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Servidor Redis ejecutándose localmente
- Solana CLI configurado con una wallet de devnet/localnet

### 1. Construir el Smart Contract

```bash
cd manteia-contract
anchor build
anchor deploy          # Desplegar en localnet o devnet
```

### 2. Iniciar Servicios de Backend

```bash
# Terminal 1 — Transmisor de precios
cd backend
bun install && bun run index.ts

# Terminal 2 — Escucha de eventos
cd event-listener
bun install && bun run index.ts
```

### 3. Lanzar la App Móvil

```bash
cd skia
npm install
npx expo start
```

> **Tip**: Usa Expo Go en tu teléfono o un emulador de iOS/Android para previsualizar la app.

---

## 🎨 Filosofía de Diseño

Manteia está diseñada para sentirse como un **videojuego móvil premium**, no como un tablero financiero:

- **🎨 Excelencia Visual** — Degradados vibrantes, glassmorphism y gráficos renderizados con Skia a altos FPS
- **⚡ Velocidad** — Las interacciones se sienten como gestos, no como transacciones de blockchain
- **👆 Flujo a una sola mano** — Todas las acciones críticas de trading están al alcance del pulgar
- **🏆 Arena Competitiva** — Tablas de clasificación en tiempo real y batallas de predicción multijugador

---
