# API Documentation

## Authentication

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

### GET /api/auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Links

### GET /api/links

Get all links for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "links": [
    {
      "id": 1,
      "slug": "abc123",
      "targetUrl": "https://example.com",
      "ownerId": "uuid",
      "hits": 42,
      "isActive": true,
      "allowEdit": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/links

Create a new short link.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "targetUrl": "https://example.com",
  "slug": "custom-slug" // optional
}
```

**Response:**
```json
{
  "link": {
    "id": 1,
    "slug": "custom-slug",
    "targetUrl": "https://example.com",
    "ownerId": "uuid",
    "hits": 0,
    "isActive": true,
    "allowEdit": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/links/:slug

Get a specific link by slug.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "link": {
    "id": 1,
    "slug": "abc123",
    "targetUrl": "https://example.com",
    "ownerId": "uuid",
    "hits": 42,
    "isActive": true,
    "allowEdit": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/links/:slug

Update a link.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "targetUrl": "https://new-url.com", // optional
  "isActive": true, // optional
  "allowEdit": true // optional
}
```

**Response:**
```json
{
  "link": {
    "id": 1,
    "slug": "abc123",
    "targetUrl": "https://new-url.com",
    "ownerId": "uuid",
    "hits": 42,
    "isActive": true,
    "allowEdit": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

### DELETE /api/links/:slug

Delete a link.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Link deleted successfully"
}
```

### GET /api/links/:slug/stats

Get analytics for a link.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "totalHits": 100,
    "dailyHits": [
      { "date": "2024-01-01", "count": 10 },
      { "date": "2024-01-02", "count": 20 }
    ],
    "topReferers": [
      { "referer": "https://google.com", "count": 50 },
      { "referer": "direct", "count": 30 }
    ],
    "topCountries": [
      { "country": "US", "count": 60 },
      { "country": "UK", "count": 40 }
    ],
    "topBrowsers": [
      { "browser": "Chrome", "count": 70 },
      { "browser": "Firefox", "count": 30 }
    ]
  }
}
```

## Redirect

### GET /:slug

Redirect to the target URL. This endpoint is public and does not require authentication.

**Response:**
- 302 Redirect to target URL
- 404 if link not found
- 410 if link is inactive
- 429 if rate limit exceeded

