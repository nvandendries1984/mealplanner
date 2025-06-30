#!/bin/bash

# MealPlanner Quick Deploy Script
# One-command deployment for VPS/Cloud servers

set -e

echo "🍽️  MealPlanner Quick Deploy"
echo "============================"
echo ""
echo "This script will automatically deploy MealPlanner on your server."
echo "Perfect for VPS providers like DigitalOcean, Linode, Vultr, etc."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# Quick configuration
echo "Quick Configuration (press Enter for defaults):"
echo "==============================================="

read -p "Domain name (e.g., mealplanner.yourdomain.com): " DOMAIN
if [[ -z "$DOMAIN" ]]; then
    print_error "Domain name is required"
    exit 1
fi

read -p "Your email for SSL certificates: " EMAIL
if [[ -z "$EMAIL" ]]; then
    print_error "Email is required for SSL certificates"
    exit 1
fi

read -p "Admin email for MealPlanner: " ADMIN_EMAIL
if [[ -z "$ADMIN_EMAIL" ]]; then
    ADMIN_EMAIL="admin@$DOMAIN"
fi

read -s -p "Admin password: " ADMIN_PASSWORD
echo ""
if [[ -z "$ADMIN_PASSWORD" ]]; then
    ADMIN_PASSWORD=$(openssl rand -base64 12)
    print_warning "Generated random password: $ADMIN_PASSWORD"
fi

read -p "Admin name [Admin]: " ADMIN_NAME
ADMIN_NAME=${ADMIN_NAME:-"Admin"}

# System setup
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing required packages..."
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Setup application
print_status "Setting up MealPlanner..."
sudo mkdir -p /opt/mealplanner
sudo chown $(whoami):$(whoami) /opt/mealplanner
cp -r . /opt/mealplanner/
cd /opt/mealplanner

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Create environment file
print_status "Creating production environment..."
cat > .env.production << EOF
DATABASE_URL="file:./prod.db"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://$DOMAIN"
NODE_ENV=production
PORT=3000
EOF

cp .env.production .env

# Install and build
print_status "Installing dependencies and building..."
npm ci --only=production
npx prisma generate
npx prisma db push
npm run build

# Setup PM2
print_status "Configuring PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mealplanner',
    script: 'npm',
    args: 'start',
    cwd: '/opt/mealplanner',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup | grep -E '^sudo' | bash

# Setup Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mealplanner << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mealplanner /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL
print_status "Setting up SSL certificates..."
sudo certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Create admin user
print_status "Creating admin user..."
node -e "
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
    console.log('✓ Admin user created');
  } catch (error) {
    console.log('ℹ Admin user might already exist');
  } finally {
    await prisma.\$disconnect();
  }
}
createAdmin();
"

# Setup basic monitoring
print_status "Setting up monitoring..."
cat > monitor.sh << 'EOF'
#!/bin/bash
if ! pm2 show mealplanner > /dev/null 2>&1; then
    echo "$(date): Restarting MealPlanner" >> /opt/mealplanner/monitor.log
    pm2 restart mealplanner
fi
EOF

chmod +x monitor.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/mealplanner/monitor.sh") | crontab -

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# Final status
print_status "Checking deployment status..."
sleep 5

if pm2 show mealplanner | grep -q "online"; then
    STATUS="✅ Running"
else
    STATUS="❌ Not running"
fi

echo ""
echo "🎉 MealPlanner Deployment Complete!"
echo "====================================="
echo ""
echo "📍 URL: https://$DOMAIN"
echo "👤 Admin Email: $ADMIN_EMAIL"
echo "🔑 Admin Password: $ADMIN_PASSWORD"
echo "📊 Status: $STATUS"
echo ""
echo "🔧 Management Commands:"
echo "  View logs: pm2 logs mealplanner"
echo "  Restart: pm2 restart mealplanner"
echo "  Monitor: pm2 monit"
echo ""
echo "📋 Next Steps:"
echo "1. Point your domain DNS to this server's IP"
echo "2. Wait for DNS propagation (5-30 minutes)"
echo "3. Visit https://$DOMAIN and login"
echo ""
echo "💡 Save your admin credentials in a secure location!"
echo ""

# Save credentials
cat > /opt/mealplanner/admin-credentials.txt << EOF
MealPlanner Admin Credentials
============================
URL: https://$DOMAIN
Email: $ADMIN_EMAIL
Password: $ADMIN_PASSWORD
Date: $(date)
EOF

print_status "Admin credentials saved to /opt/mealplanner/admin-credentials.txt"
print_warning "Remember to secure this file or delete it after noting the credentials!"

echo ""
print_status "Deployment completed successfully! 🚀"
