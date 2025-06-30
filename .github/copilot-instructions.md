# MealPlanner SaaS Project - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a MealPlanner SaaS application built with Next.js 15, TypeScript, and Tailwind CSS. The application provides meal planning, inventory management, and shopping list generation for multiple users.

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js
- **PWA**: next-pwa for Progressive Web App functionality
- **Calendar**: react-big-calendar for meal planning
- **Icons**: Lucide React

## Key Features
1. **User Authentication**: Multi-user support with registration and profiles
2. **Meal Planning**: Calendar-based meal scheduling
3. **Inventory Management**: Stock tracking and management
4. **Shopping Lists**: Automated generation based on planned meals
5. **Admin Dashboard**: User management for administrators
6. **PWA Support**: Mobile-friendly progressive web app

## Code Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling with mobile-first approach
- Implement proper error handling and validation
- Use server components where possible for better performance
- Follow proper database relationship modeling with Prisma
- Implement proper authentication and authorization patterns

## Database Schema Considerations
- Users table with profile information
- Meals table with ingredients and instructions
- Inventory table with quantities and expiration dates
- Planned meals table linking users, meals, and dates
- Shopping lists table for generated lists

## Security
- Always validate user inputs
- Implement proper authorization checks
- Use server actions for database operations
- Sanitize data before database operations
