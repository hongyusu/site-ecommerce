# E-commerce Frontend

Next.js 14-based frontend for the e-commerce platform.

## Prerequisites

- Node.js 20+ (LTS)
- npm or yarn package manager

## Setup (Phase 1: Local Terminal Development)

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# .env.local is already created with default values
# Modify if your backend runs on a different port
```

### 3. Start Development Server

```bash
# Start frontend with hot reload
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint

# Run tests
npm test
```

## Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   │   └── api.ts        # API client
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript types
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
└── README.md             # This file
```

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 4.5
- **Server State**: React Query 5.20
- **HTTP Client**: Axios 1.6
- **Icons**: Lucide React
- **i18n**: next-i18next 15.2

## Supported Languages

The application UI supports three languages:
- **Finnish (fi)** - Default
- **Swedish (sv)**
- **English (en)**

## Features

- Server-side rendering (SSR)
- Static site generation (SSG) where applicable
- Client-side navigation
- Hot module replacement
- TypeScript type safety
- Tailwind CSS utility-first styling
- Responsive design
- Multi-language support (FI, SE, EN)

## Environment Variables

```bash
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Environment
NODE_ENV=development
```

## Connecting to Backend

The frontend connects to the backend API at the URL specified in `.env.local`:

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

Make sure the backend is running before starting the frontend.

## Troubleshooting

### Port already in use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 npm run dev
```

### API connection error

Check if the backend is running:
- Backend should be at: http://localhost:8000
- Check `.env.local` has the correct API URL

### TypeScript errors

```bash
# Check for type errors
npm run type-check

# If errors persist, try deleting node_modules and reinstalling
rm -rf node_modules package-lock.json
npm install
```

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```
