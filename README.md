# CryptoTerminal - Professional Trading Platform

A professional crypto trading analysis platform built with Next.js, TypeScript, React, and Tailwind CSS. Features real-time market data integration, paper trading, signals, and advanced charting capabilities.

## 🚀 Quick Start

### Installation

```bash
cd crypto-trading-platform
npm install
```

### Development

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main application routes (with layout)
│   │   ├── dashboard/            # Dashboard page
│   │   ├── chart-analysis/       # Chart Analysis page
│   │   ├── paper-trading/        # Paper Trading page
│   │   ├── signals/              # Trading Signals page
│   │   ├── order-flow/           # Order Flow page
│   │   ├── market-data/           # Market Data Hub page
│   │   └── settings/             # Settings page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Root redirect to dashboard
│   └── globals.css              # Global styles
│
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components
│   │   ├── card.tsx            # Card component
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input, Select, Badge components
│   │   └── skeleton.tsx        # Loading skeleton components
│   ├── layout/                  # Layout components
│   │   ├── sidebar.tsx         # Sidebar navigation
│   │   └── header.tsx          # Header component
│   └── dashboard/              # Dashboard-specific components
│       ├── ticker-card.tsx     # Ticker card display
│       ├── market-overview.tsx # Market overview
│       └── stats-grid.tsx      # Stats display
│
├── services/                    # Business logic services
│   └── market-data/            # Market Data Hub service
│       └── index.ts            # Central data management
│
├── hooks/                       # React custom hooks
│   └── index.ts                # Market data hooks
│
├── types/                       # TypeScript type definitions
│   └── index.ts                # All type definitions
│
├── constants/                   # Application constants
│   └── index.ts                # Routes, intervals, API endpoints
│
└── utils/                       # Utility functions
    └── index.ts                # Helper functions
```

## 🏗️ Architecture

### Layer Separation

The platform follows a clean architecture pattern with distinct layers:

1. **UI Layer** (`/components`)
   - Reusable UI components (Card, Button, Input)
   - Layout components (Sidebar, Header)
   - Page-specific components

2. **Services Layer** (`/services`)
   - Market Data Hub (single source of truth for all market data)
   - Data provider abstraction for future exchange integrations

3. **Data Layer** (`/types`, `/services`)
   - TypeScript interfaces for all data structures
   - API integrations (Binance ready, structure for Bybit, OKX)

4. **State Management** (`/hooks`)
   - React hooks for market data consumption
   - Caching layer through Market Data Hub

### Market Data Hub

The Market Data Hub is the single source of truth for all market data:

```
Exchange API → Market Data Hub → All Consumers
     ↓
Binance Provider
     ↓
Cache Layer
     ↓
WebSocket Subscriptions
```

**Features:**
- Centralized data caching
- WebSocket subscriptions for real-time updates
- Multiple exchange support (Binance primary)
- Type-safe data structures

### Page Structure

1. **Dashboard** - Real-time market overview with ticker data
2. **Chart Analysis** - Advanced charting (placeholder)
3. **Paper Trading** - Practice trading without risk
4. **Signals** - AI-powered trading signals (placeholder)
5. **Order Flow** - Order book and trade visualization
6. **Market Data Hub** - Centralized data management
7. **Settings** - Platform configuration

## 🎨 Design System

### Colors
- **Background**: Slate-950 (#0f172a)
- **Cards**: Slate-800 with border
- **Primary**: Blue-500 (#3b82f6)
- **Success/Profit**: Emerald-500 (#10b981)
- **Danger/Loss**: Red-500 (#ef4444)

### Typography
- Clean sans-serif font stack
- Consistent sizing scale

### Components
- Cards with proper spacing and borders
- Consistent button variants
- Form elements with proper focus states

## 🔌 Data Integration

### Binance Integration
- REST API for ticker, klines, order book, trades
- WebSocket for real-time streaming
- CORS-enabled endpoints

### Available Endpoints
- Ticker: 24-hour price change statistics
- Klines: OHLCV candle data
- Order Book: Bid/ask depth
- Trades: Recent trade history

## 📱 Responsive Design

- Mobile-friendly sidebar (collapsible on mobile)
- Grid-based layouts that adapt to screen size
- Touch-friendly interactions
- Consistent spacing across breakpoints

## 🚧 Future Extensions

### Planned Features
1. **Charting** - TradingView integration, custom indicators
2. **Signals Engine** - AI-powered signal generation
3. **Exchange Integration** - Bybit, OKX, Coinbase
4. **Paper Trading Engine** - Full order matching
5. **Order Flow Analysis** - Delta calculations, heatmaps
6. **Custom Strategies** - Strategy builder and backtesting

### Extension Points
- Add new data providers in `/services/market-data`
- Create new components in `/components`
- Add new pages in `/app/(main)`
- Extend types in `/types`

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **Package Manager**: npm

## 📄 License

This project is for educational and development purposes.
