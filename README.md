# DynamicLinker

A Bitly-style dynamic link redirection platform built with Next.js, PostgreSQL, and Redis.

## Features

- **Dynamic Links**: Create short links that can be updated anytime without changing the URL
- **Analytics**: Track clicks, referers, countries, and browsers
- **Fast Redirects**: Redis caching for lightning-fast performance
- **User Management**: Secure authentication with JWT
- **Dashboard**: Beautiful, modern UI for managing your links

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Deployment**: Docker, Docker Compose, Nginx

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd link-project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
- `JWT_EXPIRES_IN`: JWT expiration time (default: 24h)

## Docker Deployment

1. Build and start services:
```bash
docker-compose up -d
```

2. Run migrations:
```bash
docker-compose exec app npx prisma migrate deploy
```

3. Access the application:
- Application: http://localhost:3000
- Nginx: http://localhost (port 80)

## Project Structure

```
link-project/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   ├── api/                # API routes
│   └── [slug]/             # Dynamic redirect handler
├── components/             # React components
├── lib/                    # Utilities and services
├── prisma/                 # Database schema
├── store/                   # State management
├── types/                   # TypeScript types
└── docs/                    # Documentation
```

## Documentation

- [API Documentation](./docs/API.md) - Complete API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Step-by-step deployment instructions
- [Web Design Document (WDD)](./docs/WDD.md) - Complete project specification and architecture

## License

MIT
