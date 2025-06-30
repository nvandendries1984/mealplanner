# MealPlanner - SaaS Maaltijd Planning Applicatie

Een moderne webapplicatie voor het plannen van maaltijden, beheren van voorraad en genereren van boodschappenlijsten. Gebouwd met Next.js 15, TypeScript, en Tailwind CSS.

## ✨ Features

### 🗓️ Maaltijd Planning
- **Kalender interface** met react-big-calendar
- Plan maaltijden per dag en maaltijdtype (ontbijt, lunch, diner, snack)
- Overzichtelijke weergave van geplande maaltijden
- Eenvoudig maaltijden toevoegen aan specifieke datums

### 🍳 Maaltijden Beheer
- Maak en beheer je eigen recepten
- Voeg ingrediënten, porties, bereidingstijd toe
- Bewaar instructies en notities
- Zoek en filter door je maaltijden

### 📦 Voorraad Beheer
- Houd je voorraad bij per ingrediënt
- Vervaldatum tracking met waarschuwingen
- Locatie beheer (koelkast, voorraadkast, etc.)
- Reserveer ingrediënten voor geplande maaltijden
- Categoriseer ingrediënten voor betere organisatie

### 🛒 Boodschappenlijst Generator
- **Automatische generatie** van weeklijkse boodschappenlijsten
- Gebaseerd op geplande maaltijden en huidige voorraad
- Handmatige boodschappenlijsten aanmaken
- Aankruisfunctie voor gekochte items
- Mobiel-vriendelijke interface voor in de supermarkt

### 👥 Multi-user Support
- Gebruikersregistratie en authenticatie
- Persoonlijke accounts met eigen data
- Admin dashboard voor gebruikersbeheer
- Rol-gebaseerde toegang

### 📱 Progressive Web App (PWA)
- Volledig mobiel-vriendelijk design
- Installeerbaar op mobiele apparaten
- Offline functionaliteit (planning voor toekomst)
- Native app-achtige ervaring

## 🛠️ Tech Stack

- **Framework**: Next.js 15 met App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM met SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js met credentials provider
- **Calendar**: react-big-calendar voor maaltijd planning
- **Icons**: Lucide React
- **PWA**: next-pwa voor Progressive Web App functionaliteit

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, of bun

### Installation

1. **Installeer dependencies**
   ```bash
   npm install
   ```

2. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Configure environment**
   Update `.env` bestand met je eigen waarden:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="jouw-geheime-sleutel-hier"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open applicatie**
   Navigeer naar [http://localhost:3000](http://localhost:3000)

## 📖 Gebruiksflow

### 1. Account Setup
- Registreer een nieuw account via `/auth/signup`
- Log in met je credentials

### 2. Voorraad Beheer
- Ga naar "Voorraad" om je ingrediënten toe te voegen
- Voeg hoeveelheden, vervaldatums en locaties toe
- Bekijk welke items binnenkort vervallen

### 3. Maaltijden Aanmaken  
- Ga naar "Maaltijden" om recepten toe te voegen
- Voeg ingrediënten en instructies toe
- Stel porties en bereidingstijd in

### 4. Maaltijden Plannen
- Gebruik de "Maaltijd Kalender" om maaltijden in te plannen
- Selecteer datum en maaltijdtype
- Kies uit je bestaande maaltijden

### 5. Boodschappenlijst Genereren
- Ga naar "Boodschappenlijst"
- Klik "Weeklijst genereren" voor automatische lijst
- Of maak handmatig een boodschappenlijst
- Vink items af tijdens het winkelen

## 🔧 Project Structuur

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── calendar/          # Calendar functionality
│   ├── meals/             # Meal management
│   ├── inventory/         # Inventory management
│   └── shopping/          # Shopping lists
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Database client
└── types/                 # TypeScript type definitions

prisma/
└── schema.prisma          # Database schema

public/
├── manifest.json          # PWA manifest
└── icons/                 # PWA icons
```

## 🚀 Production Deployment

Deploy MealPlanner to your own server with one command:

### Quick Deploy (Recommended)
```bash
# On your VPS/server (Ubuntu/Debian):
curl -sSL https://raw.githubusercontent.com/yourusername/mealplanner/main/quick-deploy.sh | bash
```

Or manually:
```bash
git clone https://github.com/yourusername/mealplanner.git
cd mealplanner
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Deployment Options

1. **🚀 Quick Deploy** - One command setup with Nginx, SSL, PM2
2. **⚙️ Custom Install** - Full control installation with `./install.sh`  
3. **🐳 Docker Deploy** - Container-based deployment with `./docker-install.sh`

### What You Get

✅ **Production-ready setup**
- Nginx reverse proxy with SSL
- PM2 process management
- Automatic SSL certificates (Let's Encrypt)
- Security headers and rate limiting
- Automatic restarts and monitoring

✅ **Database options**
- SQLite (default) - Perfect for most users
- PostgreSQL - For high-traffic sites

✅ **Zero-downtime updates**
- PM2 managed processes
- Database migrations
- Asset optimization

### Requirements

- Ubuntu 20.04+ / Debian 11+ VPS
- 2GB+ RAM, 10GB+ storage
- Domain name pointing to your server
- Root/sudo access

### After Deployment

1. Point your domain DNS to the server IP
2. Visit `https://yourdomain.com`
3. Login with admin credentials
4. Start meal planning! 🍽️

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
