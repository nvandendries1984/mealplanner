#!/bin/bash

# MealPlanner Docker Deployment Script
# This script sets up MealPlanner using Docker and Docker Compose

set -e

echo "🍽️  MealPlanner Docker Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check for Docker and Docker Compose
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_status "✅ Docker and Docker Compose are available"
}

# Get configuration
get_docker_config() {
    echo ""
    print_status "Docker Configuration"
    echo "===================="
    
    read -p "Enter your domain name: " DOMAIN
    read -p "Enter database password: " DB_PASSWORD
    read -p "Enter NextAuth secret (or press enter to generate): " NEXTAUTH_SECRET
    
    if [[ -z "$NEXTAUTH_SECRET" ]]; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        print_status "Generated NextAuth secret"
    fi
    
    NEXTAUTH_URL="https://$DOMAIN"
    read -p "Enter NextAuth URL [$NEXTAUTH_URL]: " CUSTOM_URL
    NEXTAUTH_URL=${CUSTOM_URL:-$NEXTAUTH_URL}
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    cat > .env.production << EOF
# MealPlanner Production Environment
DATABASE_URL=postgresql://mealplanner:${DB_PASSWORD}@postgres:5432/mealplanner
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${NEXTAUTH_URL}
NODE_ENV=production
PORT=3000
EOF

    # Update docker-compose.yml with new values
    sed -i.bak "s/password/${DB_PASSWORD}/g" docker-compose.yml
    sed -i.bak "s|NEXTAUTH_URL=http://localhost:3000|NEXTAUTH_URL=${NEXTAUTH_URL}|g" docker-compose.yml
    sed -i.bak "s/NEXTAUTH_SECRET=your-secret-key-here/NEXTAUTH_SECRET=${NEXTAUTH_SECRET}/g" docker-compose.yml
    
    rm docker-compose.yml.bak
    
    print_status "✅ Environment configured"
}

# Setup SSL certificates
setup_ssl_docker() {
    print_status "Setting up SSL certificates..."
    
    mkdir -p ssl
    
    echo "SSL Certificate Options:"
    echo "1) Generate self-signed certificates (for testing)"
    echo "2) Use existing certificates"
    echo "3) Skip SSL setup (HTTP only)"
    read -p "Choose option (1-3): " SSL_OPTION
    
    case $SSL_OPTION in
        1)
            print_status "Generating self-signed certificates..."
            openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
                -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=MealPlanner/CN=$DOMAIN"
            print_warning "Self-signed certificates generated. Use Let's Encrypt for production!"
            ;;
        2)
            print_status "Please place your certificate files in the ssl/ directory:"
            echo "  ssl/cert.pem - Your SSL certificate"
            echo "  ssl/key.pem - Your private key"
            read -p "Press enter when certificates are in place..."
            ;;
        3)
            print_warning "Skipping SSL setup. Application will run on HTTP only."
            # Modify nginx config to remove SSL
            sed -i.bak '/ssl_/d' nginx.conf
            sed -i.bak 's/listen 443 ssl http2;/listen 80;/g' nginx.conf
            sed -i.bak '/return 301 https/d' nginx.conf
            rm nginx.conf.bak
            ;;
    esac
}

# Build and start services
start_services() {
    print_status "Building and starting MealPlanner services..."
    
    # Copy environment file
    cp .env.production .env
    
    # Build and start services
    docker-compose down --remove-orphans
    docker-compose build --no-cache
    docker-compose up -d
    
    print_status "Waiting for services to start..."
    sleep 30
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec mealplanner npx prisma db push
    
    print_status "✅ Services started successfully"
}

# Create admin user
create_docker_admin() {
    print_status "Creating admin user..."
    
    read -p "Enter admin email: " ADMIN_EMAIL
    read -s -p "Enter admin password: " ADMIN_PASSWORD
    echo ""
    read -p "Enter admin name: " ADMIN_NAME
    
    # Create admin user
    docker-compose exec mealplanner node -e "
        const bcrypt = require('bcryptjs');
        const { PrismaClient } = require('@prisma/client');
        
        async function createAdmin() {
            const prisma = new PrismaClient();
            try {
                const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 12);
                const admin = await prisma.user.create({
                    data: {
                        name: '$ADMIN_NAME',
                        email: '$ADMIN_EMAIL',
                        password: hashedPassword,
                        isAdmin: true
                    }
                });
                console.log('Admin user created:', admin.email);
            } catch (error) {
                console.error('Error:', error.message);
            } finally {
                await prisma.\$disconnect();
            }
        }
        createAdmin();
    "
    
    print_status "✅ Admin user created"
}

# Show final instructions
show_docker_instructions() {
    echo ""
    echo "🎉 MealPlanner Docker Deployment Complete!"
    echo "=========================================="
    echo ""
    print_status "Application URL: $NEXTAUTH_URL"
    print_status "Services are running with Docker Compose"
    echo ""
    print_status "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Restart services: docker-compose restart"
    echo "  Stop services: docker-compose down"
    echo "  Update application: docker-compose pull && docker-compose up -d"
    echo ""
    print_status "Service status:"
    docker-compose ps
    echo ""
    print_warning "Remember to:"
    echo "- Configure your DNS to point $DOMAIN to this server"
    echo "- Set up proper SSL certificates for production"
    echo "- Monitor the logs regularly"
    echo "- Backup your database regularly"
}

# Main Docker installation flow
main_docker() {
    check_docker
    get_docker_config
    create_env_file
    setup_ssl_docker
    start_services
    create_docker_admin
    show_docker_instructions
}

# Run the Docker installer
main_docker
