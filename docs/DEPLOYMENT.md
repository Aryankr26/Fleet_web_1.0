# Fleet Management System - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Scaling](#scaling)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Development**
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Disk: 10GB free space
- OS: Linux, macOS, or Windows with WSL2

**Production**
- CPU: 4+ cores
- RAM: 8GB minimum, 16GB recommended
- Disk: 50GB+ (depends on telemetry data retention)
- OS: Linux (Ubuntu 22.04 LTS recommended)

### Required Software

**Development**
- Docker 24.0+ and Docker Compose 2.0+
- Node.js 20.x LTS
- Python 3.11+
- Git

**Production**
- Docker 24.0+ and Docker Compose 2.0+
- OR: Kubernetes 1.28+
- Nginx 1.24+
- PostgreSQL 16+
- Redis 7.4+

## Development Setup

### Quick Start (Docker Compose)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/Fleet_1.0.git
cd Fleet_1.0

# 2. Create environment files
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Edit environment files
nano .env  # Set VITE_BACKEND_URL=http://localhost:8000
nano backend/.env  # Configure database, Redis, etc.

# 4. Install frontend dependencies
npm install

# 5. Start backend services (PostgreSQL, Redis, FastAPI)
cd backend
docker compose -f docker-compose.dev.yml up -d

# 6. Verify backend is running
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# 7. Start frontend development server
cd ..
npm run dev

# 8. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development (Without Docker)

```bash
# 1. Install PostgreSQL and Redis
sudo apt install postgresql-16 redis-server  # Ubuntu/Debian
brew install postgresql@16 redis  # macOS

# 2. Create database
sudo -u postgres createdb fleet
sudo -u postgres psql -c "CREATE USER fleetuser WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fleet TO fleetuser;"

# 3. Start Redis
redis-server

# 4. Set up Python backend
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 5. Configure environment
cp .env.example .env
# Edit .env with your local database and Redis URLs

# 6. Run database migrations
alembic upgrade head

# 7. Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 8. In another terminal, start frontend
cd ..
npm install
npm run dev
```

## Production Deployment

### Option 1: Docker Compose (Simple Deployment)

Best for: Small to medium deployments, single server

```bash
# 1. Prepare server
ssh user@your-server.com
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx

# 2. Clone repository
git clone https://github.com/yourusername/Fleet_1.0.git
cd Fleet_1.0

# 3. Create production environment files
cp .env.example .env.production
cp backend/.env.example backend/.env.production

# 4. Edit environment files with production values
nano .env.production
# Set VITE_BACKEND_URL=https://api.yourdomain.com

nano backend/.env.production
# Set strong passwords
# Set DATABASE_URL=******postgres:5432/fleet
# Set REDIS_URL=redis://redis:6379/0
# Generate JWT_SECRET: openssl rand -hex 32
# Set MILLITRACK_TOKEN=your_token_here
# Set SIMULATE_ON_STARTUP=false

# 5. Build frontend
npm install
VITE_BACKEND_URL=https://api.yourdomain.com npm run build

# 6. Create production Docker Compose file
cat > backend/docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  redis:
    image: redis:7.4-alpine
    restart: always
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-change_me_in_production}
      POSTGRES_DB: fleet
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    env_file:
      - .env.production
    volumes:
      - ./app:/app/app:ro
    ports:
      - "127.0.0.1:8000:8000"
    depends_on:
      - redis
      - postgres
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

volumes:
  redis_data:
  pgdata:
EOF

# 7. Start backend services
cd backend
docker compose -f docker-compose.prod.yml up -d

# 8. Run database migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 9. Configure Nginx
sudo cp ../infra/nginx.conf /etc/nginx/sites-available/fleet
# Edit the file to set your domain
sudo nano /etc/nginx/sites-available/fleet
# Replace fleet.example.com with your actual domain

sudo ln -s /etc/nginx/sites-available/fleet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 10. Set up SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
# Follow prompts to configure automatic renewal

# 11. Copy frontend build to Nginx
sudo mkdir -p /usr/share/nginx/html/fleet
sudo cp -r ../dist/* /usr/share/nginx/html/fleet/

# 12. Verify deployment
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

### Option 2: Kubernetes (Scalable Deployment)

Best for: Large deployments, high availability, auto-scaling

```bash
# 1. Prerequisites
# - Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
# - kubectl configured
# - Helm 3 installed

# 2. Create namespace
kubectl create namespace fleet

# 3. Create secrets
kubectl create secret generic fleet-secrets \
  --from-literal=jwt-secret=$(openssl rand -hex 32) \
  --from-literal=postgres-password=$(openssl rand -hex 32) \
  --from-literal=millitrack-token=your_token_here \
  -n fleet

# 4. Deploy PostgreSQL (using Helm)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --namespace fleet \
  --set auth.postgresPassword=$(kubectl get secret fleet-secrets -n fleet -o jsonpath='{.data.postgres-password}' | base64 -d) \
  --set auth.database=fleet \
  --set primary.persistence.size=50Gi

# 5. Deploy Redis
helm install redis bitnami/redis \
  --namespace fleet \
  --set auth.enabled=false \
  --set master.persistence.size=10Gi

# 6. Create Kubernetes manifests
mkdir -p k8s

# Backend Deployment
cat > k8s/backend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: fleet
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/yourusername/fleet-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "******postgres-postgresql:5432/fleet"
        - name: REDIS_URL
          value: "redis://redis-master:6379/0"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: fleet-secrets
              key: jwt-secret
        - name: MILLITRACK_TOKEN
          valueFrom:
            secretKeyRef:
              name: fleet-secrets
              key: millitrack-token
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: fleet
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
EOF

# Frontend Deployment
cat > k8s/frontend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: fleet
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: frontend-build
          mountPath: /usr/share/nginx/html
        - name: nginx-config
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
      volumes:
      - name: frontend-build
        # You'll need to create a ConfigMap or use a volume with your build
        emptyDir: {}
      - name: nginx-config
        configMap:
          name: nginx-config
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: fleet
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
EOF

# Ingress
cat > k8s/ingress.yaml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fleet-ingress
  namespace: fleet
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - yourdomain.com
    - api.yourdomain.com
    secretName: fleet-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8000
EOF

# HorizontalPodAutoscaler
cat > k8s/hpa.yaml << 'EOF'
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: fleet
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF

# 7. Apply manifests
kubectl apply -f k8s/

# 8. Check deployment status
kubectl get pods -n fleet
kubectl get services -n fleet
kubectl get ingress -n fleet

# 9. View logs
kubectl logs -f deployment/backend -n fleet
kubectl logs -f deployment/frontend -n fleet
```

## Environment Configuration

### Frontend (.env)

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:8000  # Development
# VITE_BACKEND_URL=https://api.yourdomain.com  # Production
```

### Backend (.env)

```env
# Logging
LOG_LEVEL=info  # debug, info, warning, error

# Millitrack API Configuration
MILLITRACK_TOKEN=your_millitrack_token_here
POLL_INTERVAL=10  # Minimum 10 seconds (respect rate limits)

# Redis Configuration
REDIS_URL=redis://localhost:6379/0  # Development
# REDIS_URL=redis://redis:6379/0  # Docker
REDIS_ENABLED=true

# PostgreSQL Configuration
DATABASE_URL=******localhost:5432/fleet  # Development
# DATABASE_URL=******postgres:5432/fleet  # Docker

# Security (CRITICAL: Change in production!)
JWT_SECRET=change-this-to-a-secure-random-value-use-openssl-rand-hex-32
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000  # Development
# CORS_ORIGINS=https://yourdomain.com  # Production

# Simulation Mode (for testing without Millitrack)
SIMULATE_ON_STARTUP=false

# Alert Configuration
ALERT_FUEL_DROP=15  # liters
ALERT_WINDOW_SECONDS=300  # 5 minutes
```

### Generating Secure Secrets

```bash
# JWT Secret
openssl rand -hex 32

# PostgreSQL Password
openssl rand -base64 32

# Redis Password (if using auth)
openssl rand -base64 24
```

## Database Setup

### Initial Migration

```bash
cd backend

# Create database (if not exists)
psql -U postgres -c "CREATE DATABASE fleet;"

# Run migrations
alembic upgrade head

# Verify tables created
psql -U postgres -d fleet -c "\dt"
```

### Creating a New Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add new_table"

# Edit generated migration file
nano alembic/versions/xxx_add_new_table.py

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Database Backup

```bash
# Manual backup
pg_dump -U postgres -d fleet -F c -f backup_$(date +%Y%m%d).dump

# Automated daily backup (cron)
0 2 * * * pg_dump -U postgres -d fleet -F c -f /backups/fleet_$(date +\%Y\%m\%d).dump

# Backup with Docker
docker compose exec postgres pg_dump -U postgres fleet > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
# Restore from dump
pg_restore -U postgres -d fleet -c backup_20251212.dump

# Restore from SQL
psql -U postgres -d fleet < backup_20251212.sql

# Restore with Docker
docker compose exec -T postgres psql -U postgres fleet < backup_20251212.sql
```

## SSL/HTTPS Configuration

### Let's Encrypt (Recommended for Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (interactive)
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew

# Auto-renewal cron (already set up by Certbot)
# Check with: sudo systemctl status certbot.timer
```

### Self-Signed Certificate (Development Only)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/fleet-selfsigned.key \
  -out /etc/ssl/certs/fleet-selfsigned.crt

# Update Nginx configuration
# ssl_certificate /etc/ssl/certs/fleet-selfsigned.crt;
# ssl_certificate_key /etc/ssl/private/fleet-selfsigned.key;
```

## Monitoring & Logging

### Prometheus Metrics

```bash
# Backend exposes metrics at /metrics
curl http://localhost:8000/metrics

# Sample metrics:
# - telemetry_published_total
# - ws_clients_total
# - http_requests_total
# - http_request_duration_seconds
```

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fleet-backend'
    static_configs:
      - targets: ['localhost:8000']
```

### Grafana Dashboard

```bash
# Install Grafana
docker run -d -p 3000:3000 grafana/grafana

# Add Prometheus data source
# URL: http://prometheus:9090

# Import dashboard template
# ID: 1860 (Node Exporter Full)
# Customize for Fleet metrics
```

### Application Logs

```bash
# Docker Compose logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose logs --tail=100 backend

# Kubernetes logs
kubectl logs -f deployment/backend -n fleet
kubectl logs --tail=100 deployment/backend -n fleet

# Filter by error level
docker compose logs backend | grep ERROR
kubectl logs deployment/backend -n fleet | grep ERROR
```

### Log Aggregation (ELK Stack)

```bash
# Deploy Elasticsearch, Logstash, Kibana
docker compose -f elk-stack.yml up -d

# Configure Logstash to read application logs
# Configure Kibana for log visualization
```

## Backup & Recovery

### Automated Backup Strategy

```bash
# Create backup script
cat > /usr/local/bin/fleet-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/backups/fleet
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker compose exec -T postgres pg_dump -U postgres fleet > $BACKUP_DIR/db_$DATE.sql

# Redis backup
docker compose exec redis redis-cli BGSAVE
docker compose exec redis cat /data/dump.rdb > $BACKUP_DIR/redis_$DATE.rdb

# Compress
tar -czf $BACKUP_DIR/fleet_backup_$DATE.tar.gz $BACKUP_DIR/db_$DATE.sql $BACKUP_DIR/redis_$DATE.rdb

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "fleet_backup_*.tar.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/fleet_backup_$DATE.tar.gz s3://your-bucket/backups/
EOF

chmod +x /usr/local/bin/fleet-backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /usr/local/bin/fleet-backup.sh
```

### Disaster Recovery Plan

1. **Database Restore**: Restore from latest backup
2. **Redis Restore**: Load dump.rdb file
3. **Application Restore**: Deploy latest Docker images
4. **Configuration Restore**: Restore .env files from secure storage
5. **SSL Certificates**: Restore or regenerate with Certbot
6. **Verification**: Run health checks and test critical functionality

## Scaling

### Horizontal Scaling

```bash
# Docker Compose (limited to single host)
docker compose -f docker-compose.prod.yml up -d --scale backend=3

# Kubernetes (recommended)
kubectl scale deployment backend --replicas=5 -n fleet

# Auto-scaling with HPA (already configured above)
kubectl get hpa -n fleet
```

### Database Scaling

```bash
# PostgreSQL Replication
# 1. Set up primary-replica configuration
# 2. Configure read replicas for queries
# 3. Use connection pooling (PgBouncer)

# Redis Clustering
# 1. Deploy Redis Cluster (3+ masters, 3+ replicas)
# 2. Update REDIS_URL to cluster endpoints
```

### Performance Tuning

```bash
# PostgreSQL
# Edit postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB

# Redis
# Edit redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru

# Nginx
# Edit nginx.conf
worker_processes auto;
worker_connections 1024;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

## Troubleshooting

### Frontend Cannot Connect to Backend

```bash
# 1. Check VITE_BACKEND_URL in .env
echo $VITE_BACKEND_URL

# 2. Verify backend is running
curl http://localhost:8000/health

# 3. Check browser console for CORS errors
# 4. Verify CORS_ORIGINS in backend/.env

# 5. Test Socket.IO connection
curl http://localhost:8000/socket.io/?EIO=4&transport=polling
```

### Database Connection Failed

```bash
# 1. Check DATABASE_URL
echo $DATABASE_URL

# 2. Test connection
psql $DATABASE_URL -c "SELECT 1;"

# 3. Check PostgreSQL status
docker compose ps postgres
docker compose logs postgres

# 4. Verify credentials
psql -U postgres -h localhost -d fleet
```

### Redis Connection Failed

```bash
# 1. Check REDIS_URL
echo $REDIS_URL

# 2. Test connection
redis-cli -u $REDIS_URL ping

# 3. Check Redis status
docker compose ps redis
docker compose logs redis
```

### High CPU/Memory Usage

```bash
# Check container stats
docker stats

# Backend: Reduce worker count or optimize queries
# PostgreSQL: Tune shared_buffers and work_mem
# Redis: Set maxmemory limit

# Kubernetes: Check resource limits
kubectl top pods -n fleet
```

### Slow API Response

```bash
# 1. Check Prometheus metrics
curl http://localhost:8000/metrics | grep http_request_duration

# 2. Enable database query logging
# Set LOG_LEVEL=debug in backend/.env

# 3. Check for slow queries
# PostgreSQL: Enable log_min_duration_statement
```

## Production Checklist

- [ ] All environment variables set securely
- [ ] JWT_SECRET is a strong random value
- [ ] Database passwords are strong and unique
- [ ] CORS origins restricted to your domains
- [ ] HTTPS/SSL enabled with valid certificates
- [ ] Firewall configured (only necessary ports open)
- [ ] Database backups automated and tested
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured
- [ ] Error tracking integrated
- [ ] Rate limiting enabled
- [ ] Security headers configured in Nginx
- [ ] Dependencies updated to latest stable versions
- [ ] Database migrations tested
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

## Support & Resources

- **Documentation**: See `docs/ARCHITECTURE.md`
- **GitHub Issues**: https://github.com/yourusername/Fleet_1.0/issues
- **API Documentation**: http://your-backend-url/docs
- **Monitoring Dashboard**: http://your-grafana-url

## Next Steps After Deployment

1. **Configure Monitoring**: Set up Prometheus + Grafana
2. **Set Up Alerting**: Configure alerts for critical metrics
3. **Performance Testing**: Run load tests with expected traffic
4. **Security Audit**: Perform security scan and penetration testing
5. **Documentation**: Update internal documentation with production URLs
6. **Training**: Train team on production monitoring and incident response
7. **Backup Verification**: Test restore procedures
8. **Scaling Plan**: Document scaling triggers and procedures
