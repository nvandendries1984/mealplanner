# 🍽️ MealPlanner Deployment Guide

Een complete gids voor het deployen van MealPlanner op je eigen server of VPS.

## 📋 Opties voor Deployment

### Option 1: Traditional Server Deployment (Aanbevolen)
- Gebruikt PM2 voor process management
- Nginx voor reverse proxy
- Automatische SSL setup met Let's Encrypt
- Geschikt voor VPS/dedicated servers

### Option 2: Docker Deployment
- Containerized deployment
- Includes PostgreSQL, Nginx
- Eenvoudig te beheren en schalen
- Geschikt voor alle platforms

## 🚀 Optie 1: Traditional Server Deployment

### Vereisten
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Node.js 18+ 
- 2GB+ RAM
- 10GB+ disk space
- Root/sudo toegang

### Stap-voor-stap Installatie

1. **Clone het project naar je server:**
```bash
git clone <your-repo-url> mealplanner
cd mealplanner
```

2. **Run de installer:**
```bash
./install.sh
```

3. **Volg de prompts:**
- Domain naam
- Database keuze (SQLite of PostgreSQL)
- Admin user gegevens
- SSL certificaat setup

### Wat doet de installer?

✅ **System Requirements Check**
- Controleert Node.js, npm, git
- Installeert PM2 voor process management

✅ **Application Setup**
- Kopieert bestanden naar productie locatie
- Installeert dependencies
- Bouwt de applicatie
- Configureert environment variables

✅ **Database Setup**
- SQLite (standaard) of PostgreSQL
- Voert database migraties uit
- Genereert Prisma client

✅ **Process Management**
- Configureert PM2 voor auto-restart
- Setup process monitoring
- Logging configuratie

✅ **Web Server (Nginx)**
- Reverse proxy configuratie
- Security headers
- Static file serving
- Rate limiting

✅ **SSL/HTTPS**
- Let's Encrypt certificaten (gratis)
- Auto-renewal setup
- Redirect HTTP naar HTTPS

✅ **Monitoring**
- Basis monitoring scripts
- Log rotation
- Health checks

### Na de Installatie

**DNS Setup:**
```bash
# Point je domain naar je server IP
A record: mealplanner.jouwdomein.nl -> YOUR_SERVER_IP
```

**Toegang:**
- Open https://jouwdomein.nl
- Log in met je admin gegevens
- Start met meal planning!

**Beheer Commands:**
```bash
# Status bekijken
pm2 status

# Logs bekijken
pm2 logs mealplanner

# App herstarten
pm2 restart mealplanner

# App stoppen
pm2 stop mealplanner

# Monitor real-time
pm2 monit
```

## 🐳 Optie 2: Docker Deployment

### Vereisten
- Docker & Docker Compose
- 2GB+ RAM
- 10GB+ disk space

### Stap-voor-stap Installatie

1. **Clone het project:**
```bash
git clone <your-repo-url> mealplanner
cd mealplanner
```

2. **Run de Docker installer:**
```bash
./docker-install.sh
```

3. **Volg de prompts:**
- Domain naam
- Database wachtwoord
- SSL certificaat opties

### Wat bevat de Docker setup?

🐳 **Services:**
- **mealplanner**: Main Next.js applicatie
- **postgres**: PostgreSQL database
- **nginx**: Reverse proxy met SSL

📁 **Volumes:**
- Database data persistent storage
- Application logs
- SSL certificaten

🔧 **Features:**
- Auto-restart containers
- Health checks
- Log rotation
- Security headers

### Docker Beheer

**Status bekijken:**
```bash
docker-compose ps
```

**Logs bekijken:**
```bash
docker-compose logs -f mealplanner
```

**Services herstarten:**
```bash
docker-compose restart
```

**Database backup:**
```bash
docker-compose exec postgres pg_dump -U mealplanner mealplanner > backup.sql
```

**Update applicatie:**
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Configuratie Opties

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"  # PostgreSQL
DATABASE_URL="file:./dev.db"                       # SQLite

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Application
NODE_ENV="production"
PORT=3000
```

### Database Opties

**SQLite (Default):**
- ✅ Eenvoudige setup
- ✅ Geen extra database server
- ✅ Perfect voor kleine tot middelgrote websites
- ❌ Beperkte concurrent users

**PostgreSQL:**
- ✅ Betere performance
- ✅ Meer concurrent users
- ✅ Betere data integriteit
- ❌ Complexere setup

## 🔒 Security Best Practices

### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Setup firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### Application Security
- ✅ HTTPS/SSL geconfigureerd
- ✅ Security headers ingesteld
- ✅ Rate limiting actief
- ✅ Input validatie
- ✅ SQL injection bescherming (Prisma)

## 📊 Monitoring & Maintenance

### Log Locaties
```bash
# Traditional deployment
/opt/mealplanner/logs/

# Docker deployment
docker-compose logs
```

### Backup Strategie

**Database Backup (PostgreSQL):**
```bash
# Manual backup
pg_dump mealplanner > backup-$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump mealplanner > /backups/mealplanner-$(date +\%Y\%m\%d).sql
```

**Bestanden Backup:**
```bash
# Backup upload directory (als je file uploads hebt)
tar -czf uploads-backup.tar.gz uploads/

# Backup configuratie
cp .env.production backup/
```

### Performance Monitoring

**Server Resources:**
```bash
# CPU & Memory
htop

# Disk usage
df -h

# Application processes
pm2 monit
```

**Application Metrics:**
- Response times via Nginx logs
- Error rates via application logs
- Database performance via PostgreSQL logs

## 🚨 Troubleshooting

### Veelvoorkomende Problemen

**App start niet:**
```bash
# Check logs
pm2 logs mealplanner

# Check database connectie
npx prisma db push

# Herstart service
pm2 restart mealplanner
```

**Database connectie problemen:**
```bash
# Check database status
sudo systemctl status postgresql

# Test connectie
psql -h localhost -U mealplanner -d mealplanner
```

**SSL certificaat problemen:**
```bash
# Hernieuw certificaat
sudo certbot renew

# Check certificaat status
sudo certbot certificates
```

**Performance problemen:**
```bash
# Check server resources
free -h
df -h

# Check process status
pm2 monit

# Check database size
du -sh /var/lib/postgresql/
```

## 📞 Support

Voor technische ondersteuning:

1. **Check de logs** in `/opt/mealplanner/logs/`
2. **Bekijk common issues** in de troubleshooting sectie
3. **Monitor system resources** met `htop` en `pm2 monit`

## 🔄 Updates

### Update Procedure

**Traditional Deployment:**
```bash
cd /opt/mealplanner
git pull
npm install
npm run build
npx prisma db push
pm2 restart mealplanner
```

**Docker Deployment:**
```bash
cd mealplanner
git pull
docker-compose build --no-cache
docker-compose up -d
```

### Database Migraties

Als er database schema wijzigingen zijn:
```bash
npx prisma db push
```

---

**Veel succes met je MealPlanner deployment! 🍽️✨**
