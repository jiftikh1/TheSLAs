# The SLAs - Peer Software Reality Check

An honest, transparent, practitioner-driven forum for discussing software — how it actually works in the real world.

## Quick Start

### Development Mode (No OAuth Setup Required!)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

4. **Sign in with a test user:**
   - Click "Sign in with LinkedIn" or use the development login
   - Select a test user from the dropdown
   - Start exploring!

See [`docs/DEV_AUTH.md`](docs/DEV_AUTH.md) for details on development authentication.

---

## Project Structure

```
├── app/                      # Next.js 16 app directory
│   ├── api/auth/            # NextAuth API routes
│   ├── feed/                # Main feed page (protected)
│   ├── login/               # Login page
│   └── page.tsx             # Landing page
├── components/              # React components
├── lib/                     # Utilities and configuration
│   ├── auth.ts             # NextAuth configuration
│   ├── auth-dev.ts         # Development authentication
│   └── prisma.ts           # Prisma client
├── prisma/                  # Database schema and migrations
├── docs/                    # Documentation
└── middleware.ts            # Route protection
```

## Features Implemented

### ✅ Milestone 1: Foundation & LinkedIn Authentication

- LinkedIn OAuth authentication (production)
- Development authentication bypass (local dev)
- User model with professional profile fields
- Protected routes with middleware
- Session management
- Landing page and basic UI

### ✅ Milestone 2: Core Data Models & Software Catalog

- Complete database schema (Software, Post, Validation models)
- Dimension enum (Partnerships, Integrations, Workflows, Issues)
- Trust scoring and reputation fields
- AI slop detection fields
- Seed data with 10 popular software platforms
- Software catalog page with category grouping
- Query utilities for software data

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: SQLite (dev) with Prisma 7
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS 4
- **Runtime**: Node.js 20+

## Documentation

- [`SETUP.md`](SETUP.md) - Full setup guide including LinkedIn OAuth
- [`docs/DEV_AUTH.md`](docs/DEV_AUTH.md) - Development authentication guide
- [`docs/MILESTONE_1_COMPLETE.md`](docs/MILESTONE_1_COMPLETE.md) - Milestone 1 details
- [`docs/PRD.md`](docs/PRD.md) - Product requirements
- [`docs/aislop.md`](docs/aislop.md) - AI slop prevention strategy
- [`docs/Scoring.md`](docs/Scoring.md) - Trust and reputation scoring

## Development

### Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# TypeScript type checking
npx tsc --noEmit

# Prisma commands
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migrations
npx prisma studio        # Open Prisma Studio (database GUI)
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required for production
LINKEDIN_CLIENT_ID="your-client-id"
LINKEDIN_CLIENT_SECRET="your-client-secret"

# Auto-generated (already set)
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="auto-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## What's Next

### Upcoming Milestones

1. ✅ **Milestone 1**: Foundation & Authentication (Complete)
2. **Milestone 2**: Core Data Models & Software Catalog
3. **Milestone 3**: Software Profile Pages (Read-Only)
4. **Milestone 4**: Anonymous Posting with Dimensions
5. **Milestone 5**: Trust Scoring & Anti-Slop Nudges
6. **Milestone 6**: Peer Validation & Basic Feed
7. **Milestone 7**: Reputation System (Backend)
8. **Milestone 8**: Moderation & Polish

## Contributing

This is currently in MVP development. See the documentation for the product vision and roadmap.

## License

[License TBD]
