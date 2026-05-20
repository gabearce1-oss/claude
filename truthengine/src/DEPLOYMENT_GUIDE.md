# TruthEngine360: Complete Deployment Guide

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: April 21, 2026  

---

## 📋 Quick Start (10 minutes)

### Prerequisites
- Docker Desktop (installed and running)
- 8GB+ RAM available
- 20GB+ disk space
- Terminal/Bash access

### One-Command Deployment

```bash
# Clone the project
git clone https://github.com/YOUR-ORG/truthengine360.git
cd truthengine360

# Run deployment script
chmod +x deploy.sh
./deploy.sh

# Wait 3-5 minutes for services to start
# Then open: http://localhost:3000
```

**That's it!** Your system is now running.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│     TruthEngine360 Interactive Dashboard        │
│              (React - Port 3000)                │
└────────────┬────────────────────────────────────┘
             │
             ↓ REST API + WebSocket
┌─────────────────────────────────────────────────┐
│         FastAPI Backend (Port 8000)             │
│    40+ endpoints + Real-time updates            │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴─────────┬──────────────┐
    ↓                  ↓              ↓
PostgreSQL           Redis        RabbitMQ
(5432)             (6379)       (Job Queue)
    │                  │              │
    └────────────────┬─────────────────┘
                     ↓
            ┌────────────────────┐
            │ Crawler Services   │
            │ (6 types, 24/7)    │
            └────────────────────┘
```

---

## 🔌 API Endpoints

### Core Endpoints

**Cases Management**
```
GET    /api/cases                  # List all cases
GET    /api/cases/{id}             # Get specific case
POST   /api/cases                  # Create new case
PUT    /api/cases/{id}             # Update case
DELETE /api/cases/{id}             # Delete case
```

**FOIA Tracking**
```
GET    /api/foia                   # List FOIA requests
GET    /api/foia/summary           # FOIA summary stats
POST   /api/foia                   # Create FOIA request
GET    /api/foia/{id}              # Get FOIA details
```

**Policy Monitoring**
```
GET    /api/bills                  # List Congressional bills
GET    /api/policy-changes         # List policy changes
GET    /api/bills/{id}             # Get bill details
```

**Crawler Management**
```
GET    /api/crawlers/jobs          # List crawler jobs
GET    /api/crawlers/status        # Get crawler status
POST   /api/crawlers/trigger/{name} # Manually trigger crawler
```

**Metrics & Health**
```
GET    /health                     # API health check
GET    /api/metrics                # Dashboard metrics
GET    /api/metrics/daily          # Daily metrics history
```

**WebSocket**
```
WS     /ws                         # Real-time updates
```

---

## 🐳 Docker Services

### PostgreSQL (Port 5432)
- **Purpose**: Data persistence
- **User**: `truthengine`
- **Password**: (from .env file)
- **Database**: `truthengine360`
- **Health Check**: Every 10 seconds

### FastAPI Backend (Port 8000)
- **Purpose**: REST API + WebSocket
- **Docs**: http://localhost:8000/docs
- **Health Check**: `/health` endpoint

### Redis (Port 6379)
- **Purpose**: Caching + Job Queue
- **Password**: (from .env file)
- **Health Check**: PING command

### Frontend (Port 3000)
- **Purpose**: Interactive Dashboard
- **Framework**: React 18
- **Type**: SPA with client-side routing

### Crawlers
- **Federal Register Monitor**: Policy tracking
- **Congressional Bills**: Bill status monitoring
- **VA Lighthouse**: Veteran services tracking
- **Policy Changes**: Executive orders monitoring

---

## 📊 Monitoring & Health Checks

### View Service Status
```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f api
docker-compose logs -f crawlers
docker-compose logs -f postgres
```

### Test API Connectivity
```bash
# Check API health
curl http://localhost:8000/health

# Get metrics
curl http://localhost:8000/api/metrics

# List cases
curl http://localhost:8000/api/cases

# View API docs
# Open: http://localhost:8000/docs
```

### Database Health
```bash
# Connect to database
docker-compose exec postgres psql -U truthengine -d truthengine360

# In psql:
SELECT count(*) FROM veteran_cases;
SELECT count(*) FROM foia_requests;
SELECT count(*) FROM crawler_jobs;
```

---

## 🔐 Security Configuration

### Environment Variables (.env)
```bash
ENVIRONMENT=production          # or development
DATABASE_URL=postgresql://...   # Auto-generated
REDIS_URL=redis://...           # Auto-generated
API_SECRET_KEY=...              # Auto-generated
LOG_LEVEL=INFO                  # DEBUG, INFO, WARNING, ERROR
ANTHROPIC_API_KEY=sk-ant-...   # Add your key
CONGRESS_GOV_API_KEY=...        # Add your key
```

### SSL/TLS (Production)
```bash
# Copy certificates to ./nginx/ssl/
cp /path/to/cert.pem ./nginx/ssl/cert.pem
cp /path/to/key.pem ./nginx/ssl/key.pem

# Update nginx.conf to use HTTPS
# (See nginx/nginx.conf.prod example)
```

### Database Password
```bash
# Change in .env before first deployment
DB_PASSWORD=your-strong-password-here

# Regenerate if needed
openssl rand -base64 32
```

---

## 🛠️ Troubleshooting

### Services Not Starting
```bash
# Check Docker daemon
docker --version

# Rebuild from scratch
docker-compose down
docker volume rm truthengine360_postgres_data
docker-compose up -d

# Check error logs
docker-compose logs api
```

### API Not Responding
```bash
# Wait 30-60 seconds after start
# Check if port 8000 is already in use
lsof -i :8000

# Restart API only
docker-compose restart api
```

### Database Connection Refused
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify database initialized
docker-compose exec postgres psql -U truthengine -d truthengine360 -c "SELECT 1"

# Reinitialize if needed
docker-compose down
docker volume rm truthengine360_postgres_data
docker-compose up -d postgres

# Wait 30 seconds, then restart other services
docker-compose up -d
```

### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a

# Free up space from previous deployments
rm -rf ./results/old_*

# Check available space
df -h
```

---

## 📈 Performance Tuning

### Database Optimization
```bash
# Connect to database
docker-compose exec postgres psql -U truthengine -d truthengine360

# In psql:
VACUUM ANALYZE;
REINDEX INDEX CONCURRENTLY ix_cases_branch;
```

### Increase Buffer Pool
```bash
# Edit .env
POSTGRES_INITDB_ARGS=-c shared_buffers=512MB -c effective_cache_size=2GB

# Restart
docker-compose restart postgres
```

### Redis Optimization
```bash
# View Redis memory usage
docker-compose exec redis redis-cli INFO memory

# Clear cache if needed
docker-compose exec redis redis-cli FLUSHALL
```

---

## 🔄 Backups & Restoration

### Backup Database
```bash
# One-time backup
docker-compose exec postgres pg_dump truthengine360 > backup_$(date +%Y%m%d).sql

# Backup with gzip
docker-compose exec postgres pg_dump truthengine360 | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore from Backup
```bash
# Restore from file
cat backup_20260421.sql | docker-compose exec -T postgres psql -U truthengine -d truthengine360

# Or restore gzipped
gunzip -c backup_20260421.sql.gz | docker-compose exec -T postgres psql -U truthengine -d truthengine360
```

### Automated Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump truthengine360 | gzip > backups/backup_${TIMESTAMP}.sql.gz
echo "Backup created: backup_${TIMESTAMP}.sql.gz"
EOF

chmod +x backup.sh

# Add to crontab (daily at 2am)
crontab -e
# 0 2 * * * /path/to/truthengine360/backup.sh
```

---

## 🚀 Deployment Strategies

### Local Development
```bash
./deploy.sh
# Development environment with hot reload
# Dashboard at http://localhost:3000
# API at http://localhost:8000
```

### Staging/Production
```bash
# Edit .env
ENVIRONMENT=production

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Enable SSL
# Copy certificates and update nginx.conf
```

### Cloud Deployment (AWS EC2 Example)
```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance

# Install Docker
sudo yum install docker
sudo systemctl start docker

# Clone project
git clone https://github.com/YOUR-ORG/truthengine360.git
cd truthengine360

# Deploy
chmod +x deploy.sh
./deploy.sh

# Monitor
docker-compose logs -f
```

---

## 📊 Accessing Your Data

### Dashboard
- **URL**: http://localhost:3000
- **Features**: Real-time metrics, case management, FOIA tracking, crawler status
- **Auto-refresh**: Every 15 seconds

### API Documentation
- **URL**: http://localhost:8000/docs
- **Interactive**: Try API calls directly
- **Auto-generated**: Updated with code changes

### Database Direct Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U truthengine -d truthengine360

# Useful queries
SELECT * FROM veteran_cases LIMIT 10;
SELECT COUNT(*) FROM veteran_cases;
SELECT * FROM foia_requests ORDER BY filed_date DESC;
SELECT COUNT(*) FROM crawler_jobs WHERE status='completed';
```

---

## 🔔 Monitoring & Alerts

### Health Dashboard
- **Access**: http://localhost:3000 → Deployment Status
- **Shows**: Service health, metrics, quick actions
- **Auto-refresh**: Every 15 seconds

### Log Aggregation
```bash
# View all logs
docker-compose logs -f --tail=50

# Filter by service
docker-compose logs -f api | grep ERROR

# Search for patterns
docker-compose logs crawlers | grep "records_found"
```

### Metrics API
```bash
# Get current metrics
curl http://localhost:8000/api/metrics

# Get daily history
curl http://localhost:8000/api/metrics/daily?days=7
```

---

## 📚 Additional Resources

- **FastAPI Docs**: http://localhost:8000/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/16/
- **Docker Docs**: https://docs.docker.com/
- **React Docs**: https://react.dev
- **GitHub Issues**: Report bugs and feature requests

---

## 🎓 Learning Path

1. **First Time**: Run `./deploy.sh` and explore dashboard
2. **API Integration**: Read http://localhost:8000/docs
3. **Data Management**: Use dashboard to upload/manage cases
4. **Advanced**: Directly query PostgreSQL for custom analysis
5. **Research**: Export data for statistical analysis

---

## 🆘 Support

**Issues?**
1. Check troubleshooting section above
2. Review service logs: `docker-compose logs`
3. Verify prerequisites are met
4. Open GitHub issue with:
   - Error message
   - Steps to reproduce
   - System info (OS, Docker version)
   - Relevant logs

**Success?**
- Star the GitHub repo ⭐
- Share your research findings
- Contribute improvements

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: April 21, 2026