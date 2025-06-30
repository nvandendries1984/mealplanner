#!/bin/bash

# MealPlanner Deployment Installer
# This script sets up MealPlanner on a production server

set -e

echo "🍽️  MealPlanner Production Deployment Installer"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check for required tools
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check for git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    
    # Check for PM2 (install if not present)
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not found. Installing PM2 globally..."
        npm install -g pm2
    fi
    
    print_status "✅ All requirements met!"
}

# Get configuration from user
get_config() {
    echo ""
    print_status "Configuration Setup"
    echo "===================="
    
    # Domain name
    read -p "Enter your domain name (e.g., mealplanner.yourdomain.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        print_error "Domain name is required"
        exit 1
    fi
    
    # Database choice
    echo ""
    echo "Database Options:"
    echo "1) SQLite (recommended for small-medium usage)"
    echo "2) PostgreSQL (recommended for production)"
    read -p "Choose database (1 or 2): " DB_CHOICE
    
    if [[ "$DB_CHOICE" == "2" ]]; then
        read -p "PostgreSQL connection string (postgresql://user:pass@host:port/dbname): " DATABASE_URL
        if [[ -z "$DATABASE_URL" ]]; then
            print_error "PostgreSQL connection string is required"
            exit 1
        fi
    else
        DATABASE_URL="file:./dev.db"
    fi
    
    # NextAuth secret
    print_status "Generating NextAuth secret..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Get external URL
    read -p "Enter the full URL (https://$DOMAIN): " -i "https://$DOMAIN" -e NEXTAUTH_URL
    
    # Port
    read -p "Enter port number (default: 3000): " PORT
    PORT=${PORT:-3000}
    
    # Install directory
    read -p "Enter installation directory (default: /opt/mealplanner): " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-/opt/mealplanner}
    
    print_status "Configuration complete!"
}

# Create installation directory
setup_directory() {
    print_status "Setting up installation directory..."
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Directory $INSTALL_DIR already exists"
        read -p "Do you want to continue? This will overwrite existing files. (y/N): " CONTINUE
        if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
            print_error "Installation cancelled"
            exit 1
        fi
    fi
    
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown $(whoami):$(whoami) "$INSTALL_DIR"
}

# Clone or copy application
setup_application() {
    print_status "Setting up MealPlanner application..."
    
    # Copy current directory to install directory
    cp -r . "$INSTALL_DIR/"
    cd "$INSTALL_DIR"
    
    # Create production environment file
    cat > .env.production << EOF
# MealPlanner Production Environment
DATABASE_URL="$DATABASE_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="$NEXTAUTH_URL"
NODE_ENV=production
PORT=$PORT
EOF
    
    # Create environment file for PM2
    cp .env.production .env
    
    print_status "✅ Application files copied"
}

# Install dependencies and build
build_application() {
    print_status "Installing dependencies and building application..."
    
    cd "$INSTALL_DIR"
    
    # Install dependencies
    npm ci --only=production
    
    # Generate Prisma client
    npx prisma generate
    
    # Run database migrations
    if [[ "$DB_CHOICE" == "2" ]]; then
        npx prisma db push
    else
        npx prisma db push
    fi
    
    # Build the application
    npm run build
    
    print_status "✅ Application built successfully"
}

# Setup PM2 configuration
setup_pm2() {
    print_status "Setting up PM2 process manager..."
    
    cd "$INSTALL_DIR"
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mealplanner',
    script: 'npm',
    args: 'start',
    cwd: '$INSTALL_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '$INSTALL_DIR/logs/err.log',
    out_file: '$INSTALL_DIR/logs/out.log',
    log_file: '$INSTALL_DIR/logs/combined.log',
    time: true
  }]
};
EOF
    
    # Create logs directory
    mkdir -p logs
    
    # Start the application with PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_status "✅ PM2 configured and application started"
}

# Setup Nginx (optional)
setup_nginx() {
    print_status "Setting up Nginx reverse proxy..."
    
    if ! command -v nginx &> /dev/null; then
        print_warning "Nginx not found. Skipping Nginx setup."
        print_warning "You'll need to configure your web server manually to proxy to port $PORT"
        return
    fi
    
    read -p "Do you want to configure Nginx automatically? (y/N): " SETUP_NGINX
    if [[ ! "$SETUP_NGINX" =~ ^[Yy]$ ]]; then
        print_warning "Skipping Nginx setup. Configure your web server to proxy to port $PORT"
        return
    fi
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/mealplanner << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL configuration (you need to add your SSL certificates)
    # ssl_certificate /path/to/your/certificate.crt;
    # ssl_certificate_key /path/to/your/private.key;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy settings
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files
    location /_next/static {
        proxy_pass http://localhost:$PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Favicon
    location /favicon.ico {
        proxy_pass http://localhost:$PORT;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/mealplanner /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        print_status "✅ Nginx configured successfully"
        print_warning "Remember to configure SSL certificates for HTTPS"
    else
        print_error "Nginx configuration test failed"
    fi
}

# Setup SSL with Certbot (optional)
setup_ssl() {
    read -p "Do you want to set up free SSL certificates with Let's Encrypt? (y/N): " SETUP_SSL
    if [[ ! "$SETUP_SSL" =~ ^[Yy]$ ]]; then
        return
    fi
    
    if ! command -v certbot &> /dev/null; then
        print_status "Installing Certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtain SSL certificate
    sudo certbot --nginx -d "$DOMAIN"
    
    # Setup auto-renewal
    sudo crontab -l > temp_cron 2>/dev/null || true
    echo "0 12 * * * /usr/bin/certbot renew --quiet" >> temp_cron
    sudo crontab temp_cron
    rm temp_cron
    
    print_status "✅ SSL certificates configured with auto-renewal"
}

# Create admin user
create_admin() {
    print_status "Creating admin user..."
    
    cd "$INSTALL_DIR"
    
    read -p "Enter admin email: " ADMIN_EMAIL
    read -s -p "Enter admin password: " ADMIN_PASSWORD
    echo ""
    read -p "Enter admin name: " ADMIN_NAME
    
    # Create admin user using Node.js script
    cat > create-admin.js << EOF
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
    
    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin();
EOF
    
    node create-admin.js
    rm create-admin.js
    
    print_status "✅ Admin user created"
}

# Setup monitoring (optional)
setup_monitoring() {
    read -p "Do you want to set up basic monitoring? (y/N): " SETUP_MONITORING
    if [[ ! "$SETUP_MONITORING" =~ ^[Yy]$ ]]; then
        return
    fi
    
    cd "$INSTALL_DIR"
    
    # Install PM2 monitoring
    pm2 install pm2-logrotate
    
    # Create monitoring script
    cat > monitor.sh << EOF
#!/bin/bash
# MealPlanner monitoring script

# Check if application is running
if ! pm2 show mealplanner > /dev/null 2>&1; then
    echo "$(date): MealPlanner is not running, restarting..." >> logs/monitor.log
    pm2 restart mealplanner
fi

# Check disk space
DISK_USAGE=\$(df / | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "$(date): Disk usage is at \${DISK_USAGE}%" >> logs/monitor.log
fi

# Check memory usage
MEMORY_USAGE=\$(free | grep Mem | awk '{printf("%.2f", \$3/\$2 * 100.0)}')
if [ \$(echo "\$MEMORY_USAGE > 80" | bc -l) -eq 1 ]; then
    echo "$(date): Memory usage is at \${MEMORY_USAGE}%" >> logs/monitor.log
fi
EOF
    
    chmod +x monitor.sh
    
    # Add to cron
    (crontab -l 2>/dev/null; echo "*/5 * * * * $INSTALL_DIR/monitor.sh") | crontab -
    
    print_status "✅ Basic monitoring set up"
}

# Final instructions
show_final_instructions() {
    echo ""
    echo "🎉 MealPlanner Installation Complete!"
    echo "====================================="
    echo ""
    print_status "Application URL: $NEXTAUTH_URL"
    print_status "Installation directory: $INSTALL_DIR"
    print_status "Application is running on port: $PORT"
    echo ""
    print_status "Useful commands:"
    echo "  View logs: pm2 logs mealplanner"
    echo "  Restart app: pm2 restart mealplanner"
    echo "  Stop app: pm2 stop mealplanner"
    echo "  Monitor: pm2 monit"
    echo ""
    print_status "Next steps:"
    echo "1. Configure your DNS to point $DOMAIN to this server"
    echo "2. If you didn't set up SSL, configure HTTPS manually"
    echo "3. Access your application at $NEXTAUTH_URL"
    echo "4. Log in with your admin credentials"
    echo ""
    print_warning "Security reminders:"
    echo "- Keep your system updated"
    echo "- Monitor the logs regularly"
    echo "- Backup your database regularly"
    echo "- Use strong passwords"
    echo ""
    print_status "For support, check the logs in $INSTALL_DIR/logs/"
}

# Main installation flow
main() {
    check_requirements
    get_config
    setup_directory
    setup_application
    build_application
    setup_pm2
    setup_nginx
    setup_ssl
    create_admin
    setup_monitoring
    show_final_instructions
}

# Run the installer
main
