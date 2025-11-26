# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured (e.g., link.yusufihsangul.info)
- SSL certificates (Let's Encrypt recommended)

## Step 1: Environment Setup

1. Clone the repository to your server
2. Copy `.env.example` to `.env` and configure:
   ```bash
   DATABASE_URL=postgresql://user:password@postgres:5432/dynamiclinker
   REDIS_URL=redis://redis:6379
   JWT_SECRET=your-super-secret-key-min-32-chars
   JWT_EXPIRES_IN=24h
   ```

3. Update `docker-compose.yml` with your PostgreSQL credentials

## Step 2: SSL Certificates

1. Create SSL directory:
   ```bash
   mkdir -p nginx/ssl
   ```

2. Place your SSL certificates:
   - `nginx/ssl/cert.pem` - SSL certificate
   - `nginx/ssl/key.pem` - SSL private key

   Or use Let's Encrypt:
   ```bash
   certbot certonly --standalone -d link.yusufihsangul.info
   cp /etc/letsencrypt/live/link.yusufihsangul.info/fullchain.pem nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/link.yusufihsangul.info/privkey.pem nginx/ssl/key.pem
   ```

## Step 3: Update Nginx Configuration

Edit `nginx/nginx.conf` and update:
- `server_name` with your domain
- SSL certificate paths if needed

## Step 4: Build and Start Services

```bash
docker-compose build
docker-compose up -d
```

## Step 5: Run Database Migrations

```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma generate
```

## Step 6: Verify Deployment

1. Check all services are running:
   ```bash
   docker-compose ps
   ```

2. Check logs:
   ```bash
   docker-compose logs -f app
   ```

3. Test the application:
   - Visit https://link.yusufihsangul.info
   - Create an account
   - Create a test link

## Step 7: Cloudflare DNS (Optional)

1. Add A record pointing to your server IP
2. Enable Proxy (orange cloud) for DDoS protection
3. SSL/TLS mode: Full (strict)

## Maintenance

### Update Application

```bash
git pull
docker-compose build app
docker-compose up -d app
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U dynamiclinker dynamiclinker > backup.sql
```

### View Logs

```bash
docker-compose logs -f app
docker-compose logs -f nginx
```

### Restart Services

```bash
docker-compose restart
```

## Troubleshooting

### Database Connection Issues

Check PostgreSQL is running:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Redis Connection Issues

Check Redis is running:
```bash
docker-compose ps redis
docker-compose logs redis
```

### Nginx Issues

Test Nginx configuration:
```bash
docker-compose exec nginx nginx -t
```

### Application Errors

Check application logs:
```bash
docker-compose logs -f app
```

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations run
- [ ] Nginx configuration updated
- [ ] DNS records configured
- [ ] Firewall rules configured
- [ ] Regular backups scheduled
- [ ] Monitoring set up
- [ ] Rate limiting configured
- [ ] Security headers enabled

