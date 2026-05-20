#!/bin/bash
# TruthEngine360 One-Command Deployment Script
# Deploys full stack: PostgreSQL + FastAPI + Redis + Crawlers + React Dashboard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="truthengine360"
DOCKER_COMPOSE_VERSION="3.8"
ENVIRONMENT="${ENVIRONMENT:-development}"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Install from: https://docker.com"
        exit 1
    fi
    print_success "Docker installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Install from: https://docs.docker.com/compose/"
        exit 1
    fi
    print_success "Docker Compose installed"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_warning "Git not installed (optional)"
    else
        print_success "Git installed"
    fi
    
    # Check available disk space (need 20GB)
    AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
    if [ "$AVAILABLE_SPACE" -lt 20971520 ]; then  # 20GB in KB
        print_warning "Less than 20GB available (have ${AVAILABLE_SPACE}KB)"
    else
        print_success "20GB+ available"
    fi
    
    # Check available RAM (need 8GB)
    if command -v free &> /dev/null; then
        AVAILABLE_RAM=$(free -b | awk 'NR==2 {print $7}')
        if [ "$AVAILABLE_RAM" -lt 8589934592 ]; then  # 8GB in bytes
            print_warning "Less than 8GB RAM available"
        else
            print_success "8GB+ RAM available"
        fi
    fi
}

setup_directories() {
    print_header "Setting Up Directories"
    
    mkdir -p "$PROJECT_NAME"/{backend,crawlers,frontend,database,docs,results}
    print_success "Created project directories"
    
    cd "$PROJECT_NAME"
    pwd
}

create_env_file() {
    print_header "Creating Environment Configuration"
    
    if [ -f .env ]; then
        print_warning ".env already exists, skipping"
        return
    fi
    
    # Generate random passwords
    DB_PASSWORD=$(openssl rand -base64 32 2>/dev/null || echo "dev-password-$(date +%s)")
    REDIS_PASSWORD=$(openssl rand -base64 32 2>/dev/null || echo "redis-$(date +%s)")
    SECRET_KEY=$(openssl rand -base64 64 2>/dev/null || echo "secret-$(date +%s)")
    
    cat > .env << EOF
# TruthEngine360 Environment Configuration
# Generated: $(date)

# Environment
ENVIRONMENT=${ENVIRONMENT}
DEBUG=true

# Database
DATABASE_URL=postgresql://truthengine:${DB_PASSWORD}@postgres:5432/truthengine360
DB_PASSWORD=${DB_PASSWORD}
POSTGRES_INITDB_ARGS=-c shared_buffers=256MB

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# API Configuration
API_SECRET_KEY=${SECRET_KEY}
API_HOST=0.0.0.0
API_PORT=8000

# React Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws

# Logging
LOG_LEVEL=INFO

# Optional: API Keys (fill in your own)
ANTHROPIC_API_KEY=sk-ant-xxxx
CONGRESS_GOV_API_KEY=xxxx

# Deployment
DEPLOY_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DEPLOY_VERSION=1.0.0
EOF
    
    print_success "Created .env file"
    cat .env | grep -v PASSWORD | grep -v SECRET | grep -v API_KEY
}

create_docker_compose() {
    print_header "Creating Docker Compose Configuration"
    
    if [ -f docker-compose.yml ]; then
        print_warning "docker-compose.yml already exists, skipping"
        return
    fi
    
    cat > docker-compose.yml << 'DOCKER_COMPOSE_EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: truthengine
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: truthengine360
      POSTGRES_INITDB_ARGS: ${POSTGRES_INITDB_ARGS}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U truthengine"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - truthengine

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - truthengine

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      ENVIRONMENT: ${ENVIRONMENT}
      LOG_LEVEL: ${LOG_LEVEL}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
    volumes:
      - ./backend:/app
    networks:
      - truthengine

  crawlers:
    build:
      context: ./crawlers
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      ENVIRONMENT: ${ENVIRONMENT}
      LOG_LEVEL: ${LOG_LEVEL}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./crawlers:/app
      - ./results:/app/results
    networks:
      - truthengine

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: ${REACT_APP_API_URL}
      REACT_APP_WS_URL: ${REACT_APP_WS_URL}
    depends_on:
      - api
    volumes:
      - ./frontend/src:/app/src
    networks:
      - truthengine

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
      - frontend
    networks:
      - truthengine

volumes:
  postgres_data:
  redis_data:

networks:
  truthengine:
    driver: bridge
DOCKER_COMPOSE_EOF
    
    print_success "Created docker-compose.yml"
}

build_and_start_services() {
    print_header "Building and Starting Services"
    
    print_warning "This may take 3-5 minutes on first run..."
    
    # Build images
    docker-compose build --no-cache 2>/dev/null || docker-compose build
    print_success "Docker images built"
    
    # Start services
    docker-compose up -d
    print_success "Services started in detached mode"
    
    # Wait for services to be healthy
    print_warning "Waiting for services to become healthy..."
    
    RETRY_COUNT=0
    MAX_RETRIES=30
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if docker-compose exec -T postgres pg_isready -U truthengine &>/dev/null; then
            print_success "PostgreSQL is healthy"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        sleep 2
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        print_error "PostgreSQL failed to become healthy"
        exit 1
    fi
}

verify_services() {
    print_header "Verifying Services"
    
    # Check all services
    docker-compose ps
    
    # Test API
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "API is responding"
    else
        print_warning "API not yet responding (may take a moment)"
    fi
    
    # Test database
    if docker-compose exec -T postgres psql -U truthengine -d truthengine360 -c "SELECT 1" &>/dev/null; then
        print_success "Database is responding"
    else
        print_error "Database is not responding"
    fi
    
    # Test Redis
    if docker-compose exec -T redis redis-cli -a ${REDIS_PASSWORD} ping &>/dev/null; then
        print_success "Redis is responding"
    else
        print_warning "Redis not yet responding"
    fi
}

seed_sample_data() {
    print_header "Seeding Sample Data"
    
    # Create sample cases
    curl -s -X POST http://localhost:8000/api/cases \
        -H "Content-Type: application/json" \
        -d '{
            "service_number": "SAMPLE-001",
            "rank_final": "Cpl",
            "service_branch": "USMC",
            "discharge_status": "Honorable",
            "confidence_tier": 1,
            "confidence_score": 95.0
        }' > /dev/null 2>&1 || true
    
    print_success "Sample data created (check API for more)"
}

display_access_info() {
    print_header "🎉 Deployment Complete!"
    
    echo ""
    echo -e "${GREEN}Your TruthEngine360 system is now running!${NC}"
    echo ""
    echo "Access Points:"
    echo -e "  ${BLUE}Dashboard${NC}:        http://localhost:3000"
    echo -e "  ${BLUE}API${NC}:               http://localhost:8000"
    echo -e "  ${BLUE}API Documentation${NC}: http://localhost:8000/docs"
    echo -e "  ${BLUE}Database${NC}:         localhost:5432"
    echo -e "  ${BLUE}Redis${NC}:            localhost:6379"
    echo ""
    echo "Useful Commands:"
    echo "  View logs:          docker-compose logs -f"
    echo "  Stop all:           docker-compose down"
    echo "  Restart all:        docker-compose restart"
    echo "  View metrics:       curl http://localhost:8000/api/metrics"
    echo "  View cases:         curl http://localhost:8000/api/cases"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Upload your deported veteran case data"
    echo "  3. Monitor crawler status and real-time metrics"
    echo "  4. Run FOIA/policy tracking workflows"
    echo ""
}

show_logs() {
    print_header "Service Logs (Press Ctrl+C to exit)"
    sleep 3
    docker-compose logs -f --tail=20
}

cleanup_on_error() {
    print_error "Deployment failed. Rolling back..."
    docker-compose down
    exit 1
}

# Main execution
trap cleanup_on_error ERR

main() {
    print_header "TruthEngine360 Deployment Script"
    echo "Environment: $ENVIRONMENT"
    echo "Deploying to: $PROJECT_NAME"
    echo ""
    
    check_prerequisites
    setup_directories
    create_env_file
    create_docker_compose
    build_and_start_services
    sleep 5
    verify_services
    seed_sample_data
    display_access_info
    
    # Ask if user wants to see logs
    read -p "View live logs? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

# Run main function
main