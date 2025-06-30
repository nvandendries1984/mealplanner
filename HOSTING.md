# 🖥️ Server Requirements & Hosting Recommendations

## 💻 Minimum System Requirements

### Small-Medium Usage (1-50 users)
- **CPU**: 1-2 vCPU cores
- **RAM**: 2GB
- **Storage**: 10GB SSD
- **Bandwidth**: 100GB/month
- **OS**: Ubuntu 20.04+ / Debian 11+

### Medium-Large Usage (50-200 users)
- **CPU**: 2-4 vCPU cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Bandwidth**: 500GB/month
- **OS**: Ubuntu 20.04+ / Debian 11+

### Large Usage (200+ users)
- **CPU**: 4+ vCPU cores
- **RAM**: 8GB+
- **Storage**: 40GB+ SSD
- **Bandwidth**: 1TB+/month
- **Database**: Dedicated PostgreSQL server
- **OS**: Ubuntu 20.04+ / Debian 11+

## ☁️ Recommended VPS Providers

### Budget-Friendly Options

**🌊 DigitalOcean**
- ✅ Excellent documentation
- ✅ Simple pricing
- ✅ Great for beginners
- 💰 Starting at €5/month (1GB RAM, 1 vCPU)
- 🌍 Multiple datacenter locations

**🚀 Vultr**
- ✅ Good performance/price ratio
- ✅ Fast SSD storage
- ✅ Hourly billing
- 💰 Starting at €3.50/month (1GB RAM, 1 vCPU)
- 🌍 Global presence

**🔧 Linode**
- ✅ Reliable infrastructure
- ✅ Excellent support
- ✅ Developer-friendly
- 💰 Starting at €5/month (1GB RAM, 1 vCPU)
- 🌍 Good European presence

### Premium Options

**☁️ AWS Lightsail**
- ✅ Amazon infrastructure
- ✅ Easy scaling
- ✅ Integration with AWS services
- 💰 Starting at €3.50/month
- 🌍 Worldwide availability

**🌐 Google Cloud Platform**
- ✅ Google infrastructure
- ✅ Always-free tier available
- ✅ Excellent performance
- 💰 Starting at €4.50/month
- 🌍 Global network

## 🇳🇱 Dutch/European Hosting

**🇳🇱 TransIP**
- ✅ Dutch provider
- ✅ GDPR compliant
- ✅ Local support
- 💰 Starting at €5/month
- 🌍 Netherlands datacenters

**🇳🇱 Hostnet**
- ✅ Dutch provider
- ✅ Good support
- ✅ Reliable
- 💰 Starting at €8/month
- 🌍 Netherlands datacenters

**🇩🇪 Hetzner**
- ✅ Excellent value
- ✅ German quality
- ✅ GDPR compliant
- 💰 Starting at €3/month
- 🌍 EU datacenters

## 📊 Performance Benchmarks

### Database Size Estimates
```
Users     | Meals    | Storage | Monthly Bandwidth
----------|----------|---------|------------------
10 users  | ~100     | ~500MB  | ~10GB
50 users  | ~500     | ~2GB    | ~50GB
100 users | ~1,000   | ~5GB    | ~100GB
500 users | ~5,000   | ~20GB   | ~500GB
```

### Resource Usage (per user/month)
- **CPU**: ~0.02 vCPU
- **RAM**: ~20MB
- **Storage**: ~50MB
- **Bandwidth**: ~1GB

## 🔧 Deployment Recommendations

### For Beginners
1. **DigitalOcean Droplet** (€5/month)
2. Use **quick-deploy.sh** script
3. SQLite database (included)
4. Let's Encrypt SSL (free)

### For Production
1. **Vultr or Linode** (€10-20/month)
2. Use **install.sh** with PostgreSQL
3. Regular backups
4. Monitoring setup

### For High-Traffic
1. **Load balancer** + multiple app servers
2. **Dedicated PostgreSQL** server
3. **CDN** for static assets
4. **Redis** for session storage

## 🏗️ Architecture Examples

### Simple Setup (Most Users)
```
Internet → Domain → Server (Nginx + MealPlanner + SQLite)
```

### Production Setup
```
Internet → Cloudflare → Load Balancer → App Servers → PostgreSQL
```

### Enterprise Setup
```
Internet → CDN → Load Balancer → App Servers → PostgreSQL Cluster
                                             → Redis Cluster
                                             → File Storage
```

## 🔒 Security Recommendations

### Basic Security (Included in Scripts)
- ✅ Firewall configuration
- ✅ SSL/HTTPS enabled
- ✅ Security headers
- ✅ Rate limiting
- ✅ Auto-updates

### Additional Security
- 🔐 SSH key authentication
- 🛡️ Fail2ban for brute force protection
- 📊 Log monitoring
- 🔄 Regular security updates
- 🗄️ Database encryption at rest

## 💾 Backup Strategy

### Automated Backups
```bash
# Daily database backup
0 2 * * * pg_dump mealplanner > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly file backup
0 3 * * 0 tar -czf /backups/files-$(date +\%Y\%m\%d).tar.gz /opt/mealplanner

# Cleanup old backups (keep 30 days)
0 4 * * * find /backups -name "*.sql" -mtime +30 -delete
```

### Cloud Backup Options
- **AWS S3**: €0.023/GB/month
- **Google Cloud Storage**: €0.020/GB/month
- **Backblaze B2**: €0.005/GB/month

## 📈 Scaling Guide

### Vertical Scaling (Easier)
1. Upgrade server resources (CPU/RAM)
2. Optimize database queries
3. Enable caching

### Horizontal Scaling (Advanced)
1. Load balancer setup
2. Multiple app instances
3. Shared database
4. Session storage (Redis)

## 🎯 Quick Start Commands

### Check Server Resources
```bash
# CPU usage
htop

# Memory usage
free -h

# Disk usage
df -h

# Network usage
iftop
```

### Application Management
```bash
# View app status
pm2 status

# View logs
pm2 logs mealplanner

# Restart app
pm2 restart mealplanner

# Monitor resources
pm2 monit
```

## 🆘 Emergency Procedures

### App Not Responding
```bash
# Check PM2 status
pm2 list

# Restart application
pm2 restart mealplanner

# Check server resources
free -h && df -h
```

### Database Issues
```bash
# Check database size
du -sh /opt/mealplanner/prod.db

# Backup database
cp /opt/mealplanner/prod.db /backups/emergency-backup.db

# Reset database (last resort)
rm /opt/mealplanner/prod.db
npx prisma db push
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Restart nginx
sudo systemctl restart nginx
```

---

**Happy hosting! 🚀 Need help? Check the logs first, then consult the DEPLOYMENT.md guide.**
