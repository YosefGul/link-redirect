# Web Design Document (WDD)
## DynamicLinker - Dynamic Link Redirection Platform

---

## 1. Project Overview

### 1.1 Project Name
**DynamicLinker**

### 1.2 Purpose
A Bitly-style dynamic link redirection platform that allows users to create short, shareable links that can be dynamically updated to point to different target URLs without changing the short link itself.

### 1.3 Key Features
- **Dynamic Link Management**: Create short links with custom or auto-generated slugs
- **Dynamic Updates**: Change target URLs without changing the short link
- **Analytics**: Track clicks, referers, countries, and browser statistics
- **Fast Performance**: Redis caching for lightning-fast redirects
- **User Management**: Secure authentication with JWT
- **Modern Dashboard**: Beautiful, responsive UI for managing links

### 1.4 Target Domain
`link.yusufihsangul.info`

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | TailwindCSS 4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 with Prisma ORM |
| Cache | Redis 7 |
| Authentication | JWT (jsonwebtoken) |
| State Management | Zustand |
| Data Fetching | React Query (@tanstack/react-query) |
| Deployment | Docker, Docker Compose, Nginx |

### 2.2 System Architecture

```
┌─────────────────┐
│   Nginx (80/443) │
└────────┬────────┘
         │
┌────────▼────────┐
│  Next.js App    │
│  (Frontend +    │
│   API Routes)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Postgres│ │ Redis │
└────────┘ └───────┘
```

### 2.3 Application Flow

1. User registers/logs in → JWT token issued
2. User creates short link → Stored in PostgreSQL, cached in Redis
3. Visitor clicks short link → Redis cache checked first
4. If cache miss → Database query, then cache
5. Redirect to target URL → Log visit, increment hit counter
6. User updates link → Cache invalidated, new target cached

---

## 3. Database Schema

### 3.1 Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| username | VARCHAR | UNIQUE, NOT NULL | Username (3-30 chars) |
| email | VARCHAR | UNIQUE, NOT NULL | Email address |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| role | ENUM | DEFAULT 'USER' | User role (ADMIN, USER) |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |

### 3.2 Short Links Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| slug | VARCHAR(64) | UNIQUE, NOT NULL | Short link identifier |
| target_url | TEXT | NOT NULL | Target URL for redirect |
| owner_id | UUID | FK → users.id | Link owner |
| hits | BIGINT | DEFAULT 0 | Total click count |
| is_active | BOOLEAN | DEFAULT true | Link active status |
| allow_edit | BOOLEAN | DEFAULT true | Allow editing flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_short_links_owner_id` on `owner_id`
- `idx_short_links_slug` on `slug`

### 3.3 Link Logs Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| link_id | INTEGER | FK → short_links.id | Referenced link |
| ip | INET | NULLABLE | Visitor IP address |
| user_agent | TEXT | NULLABLE | Browser user agent |
| referer | TEXT | NULLABLE | HTTP referer |
| country | VARCHAR(64) | NULLABLE | Country code (GeoIP) |
| created_at | TIMESTAMP | DEFAULT NOW() | Log timestamp |

**Indexes:**
- `idx_link_logs_link_id` on `link_id`
- `idx_link_logs_created_at` on `created_at`

---

## 4. API Design

### 4.1 Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### POST /api/auth/login
Authenticate user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": { ... }
}
```

### 4.2 Link Management Endpoints

#### GET /api/links
Get all links for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "links": [ ... ]
}
```

#### POST /api/links
Create a new short link.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "targetUrl": "https://example.com",
  "slug": "custom-slug" // optional
}
```

**Response:** `201 Created`
```json
{
  "link": { ... }
}
```

#### GET /api/links/:slug
Get specific link by slug.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "link": { ... }
}
```

#### PUT /api/links/:slug
Update link.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "targetUrl": "https://new-url.com", // optional
  "isActive": true, // optional
  "allowEdit": true // optional
}
```

**Response:** `200 OK`
```json
{
  "link": { ... }
}
```

#### DELETE /api/links/:slug
Delete link.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Link deleted successfully"
}
```

#### GET /api/links/:slug/stats
Get link analytics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "stats": {
    "totalHits": 100,
    "dailyHits": [ ... ],
    "topReferers": [ ... ],
    "topCountries": [ ... ],
    "topBrowsers": [ ... ]
  }
}
```

### 4.3 Redirect Endpoint

#### GET /:slug
Public redirect endpoint.

**Response:** `302 Found` → Redirect to target URL
- `404 Not Found` if link doesn't exist
- `410 Gone` if link is inactive
- `429 Too Many Requests` if rate limited

---

## 5. Security Measures

### 5.1 Authentication
- JWT tokens with expiration (24 hours default)
- Password hashing with bcrypt (10 rounds)
- Token validation on protected routes
- Auto-logout on 401 responses

### 5.2 Input Validation
- Zod schemas for all API inputs
- URL validation (only http/https protocols)
- Open redirect prevention
- SQL injection prevention (Prisma ORM)

### 5.3 Rate Limiting
- Redis-based rate limiting
- API routes: 100 requests/minute per IP
- Redirect routes: 1000 requests/minute per IP
- Rate limit headers in responses

### 5.4 Security Headers
- Strict-Transport-Security
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### 5.5 CORS
- Configured in Next.js config
- Allowed origins in environment variables

---

## 6. Performance Optimizations

### 6.1 Caching Strategy
- Redis cache for slug → target URL mapping
- TTL: 1 hour (3600 seconds)
- Cache invalidation on link updates
- Hit counter caching in Redis

### 6.2 Database Optimization
- Indexes on frequently queried columns
- Connection pooling (Prisma)
- Efficient queries with proper joins

### 6.3 Frontend Optimization
- React Query for data caching
- Optimistic updates for mutations
- Skeleton loaders for better UX
- Code splitting (Next.js automatic)

---

## 7. Error Handling

### 7.1 API Error Responses
Standard error format:
```json
{
  "error": "Error message",
  "details": [ ... ] // optional
}
```

### 7.2 Error Boundaries
- React Error Boundaries for component errors
- Global error page (`app/error.tsx`)
- 404 page (`app/not-found.tsx`)

### 7.3 Error Logging
- Console logging for development
- Error tracking (optional: Sentry integration)

---

## 8. Deployment Configuration

### 8.1 Docker Setup
- Multi-stage Dockerfile
- Docker Compose for local development
- Production-ready configuration

### 8.2 Nginx Configuration
- Reverse proxy setup
- SSL/TLS termination
- Rate limiting at Nginx level
- Domain routing

### 8.3 Environment Variables
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret (min 32 chars)
- `JWT_EXPIRES_IN`: Token expiration (default: 24h)
- `NODE_ENV`: Environment (development/production)

---

## 9. Testing Strategy

### 9.1 Unit Tests
- API route handlers
- Utility functions
- Service layer functions

### 9.2 Integration Tests
- Database operations
- Redis operations
- Authentication flow

### 9.3 E2E Tests
- User registration/login
- Link creation/update
- Redirect functionality

---

## 10. Non-Functional Requirements

### 10.1 Performance
- Redirect response time: < 100ms (with cache)
- API response time: < 200ms
- Page load time: < 2 seconds

### 10.2 Scalability
- Horizontal scaling support
- Database connection pooling
- Redis clustering ready

### 10.3 Reliability
- 99.9% uptime target
- Graceful error handling
- Automatic failover

### 10.4 Security
- HTTPS only in production
- Regular security updates
- Secure password storage

---

## 11. Development Workflow

### 11.1 Local Development
1. Install dependencies: `npm install`
2. Setup environment: Copy `.env.example` to `.env`
3. Start PostgreSQL and Redis (Docker Compose)
4. Run migrations: `npm run db:migrate`
5. Start dev server: `npm run dev`

### 11.2 Production Deployment
1. Build Docker images
2. Run database migrations
3. Deploy with Docker Compose
4. Configure Nginx and SSL
5. Setup monitoring

---

## 12. Future Enhancements

### 12.1 Planned Features
- Multi-domain support (custom domains)
- Time-limited links (expiration dates)
- QR code generation
- A/B testing (traffic splitting)
- Webhook notifications
- API key authentication
- Bulk link operations
- Link collections/folders

### 12.2 Technical Improvements
- GraphQL API option
- Real-time analytics with WebSockets
- Advanced GeoIP integration
- Machine learning for click prediction
- CDN integration for static assets

---

## 13. Maintenance

### 13.1 Regular Tasks
- Database backups (daily)
- Log rotation
- Security updates
- Performance monitoring

### 13.2 Monitoring
- Application logs
- Error tracking
- Performance metrics
- Uptime monitoring

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** Development Team

