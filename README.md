# DealPop - Price Tracking & Deal Discovery Platform

DealPop is a comprehensive price tracking and deal discovery platform that helps users monitor product prices across multiple retailers and get notified when prices drop. The platform consists of a web dashboard, Chrome extension, backend API, and automated price checking service.

## What DealPop Does

DealPop helps users save money by:
- **Tracking Product Prices**: Monitor prices of products you want to buy
- **Price Drop Alerts**: Get notified via email/SMS when prices fall below your target
- **Chrome Extension**: Easily add products to track while browsing shopping sites
- **Multi-Retailer Support**: Track products from Amazon, Target, Walmart, and more
- **Smart Notifications**: Receive alerts only when prices drop significantly

## System Architecture

DealPop consists of four main components working together:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chrome        │    │   Frontend      │    │   Backend API   │
│   Extension     │◄──►│   Dashboard     │◄──►│   (Node.js)     │
│   (Scraping)    │    │   (React)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Product       │    │   Firebase      │    │   PostgreSQL    │
│   Websites      │    │   Auth          │    │   Database      │
│   (Amazon, etc) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       ▲
                                │                       │
                                ▼                       │
                       ┌─────────────────┐              │
                       │   Price Checker │──────────────┘
                       │   (Cron Job)    │
                       └─────────────────┘
```

## Quick Start Guide

### For Developers
1. **Frontend Development**: See [docs/FRONTEND.md](./docs/FRONTEND.md) for React dashboard setup
2. **Backend Development**: See the `deal-pop/backend-api` repository for Node.js API setup
3. **Chrome Extension**: See the `deal-pop/chrome-extension` repository for extension development
4. **Price Checker**: See the `deal-pop/puppeteer-scraper` repository for scraping service setup

### For Project Owners
- **System Overview**: See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for complete system design
- **AWS Deployment**: See [docs/AWS_DEPLOYMENT.md](./docs/AWS_DEPLOYMENT.md) for infrastructure setup
- **Contributing**: See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines

### For New Contributors
1. Read the [Contributing Guide](./docs/CONTRIBUTING.md)
2. Set up your development environment following the repository-specific guides
3. Review the [Architecture Documentation](./docs/ARCHITECTURE.md) to understand system relationships

## Repository Structure

This repository contains the **Frontend Dashboard** component. The complete DealPop system includes:

| Repository | Purpose | Documentation |
|------------|---------|---------------|
| **dealpop-frontend** (this repo) | React dashboard for managing tracked products | [docs/FRONTEND.md](./docs/FRONTEND.md) |
| **deal-pop/backend-api** | Node.js REST API with PostgreSQL database | See backend repository |
| **deal-pop/chrome-extension** | Chrome extension for product scraping | See extension repository |
| **deal-pop/puppeteer-scraper** | Automated price checking service | See scraper repository |

## Key Features

- 🚀 **Modern React Stack**: Built with Vite, TypeScript, and Tailwind CSS
- ⚛️ **Real-time Updates**: Live product tracking and price monitoring
- 🎨 **Responsive Design**: Mobile-first approach with beautiful UI
- 🔐 **Secure Authentication**: Firebase Auth with Google OAuth
- 📊 **Comprehensive Dashboard**: Product management, alerts, and analytics
- 🛒 **Chrome Extension Integration**: Seamless product addition from any website
- 🌐 **Production Ready**: AWS deployment with rollback capabilities

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- AWS CLI (for deployment)
- Firebase project setup (see [Authentication Setup](./my-docs/AUTHENTICATION_SETUP.md))

### Quick Start

1. **Clone and install**:
```bash
git clone <repository-url>
cd dealpop-frontend
npm install
```

2. **Set up environment variables**:
```bash
# Copy example environment file
cp .env.example .env.local

# Add your Firebase configuration
# See my-docs/AUTHENTICATION_SETUP.md for details
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open your browser**: Navigate to `http://localhost:5173`

## Documentation

### Core Documentation
- **[docs/FRONTEND.md](./docs/FRONTEND.md)** - Complete frontend development guide
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and data flows
- **[docs/AWS_DEPLOYMENT.md](./docs/AWS_DEPLOYMENT.md)** - AWS infrastructure and deployment
- **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Development guidelines and workflows

### Repository-Specific Documentation
- **Backend API Documentation** - See the `deal-pop/backend-api` repository for Node.js API setup and endpoints
- **Chrome Extension Documentation** - See the `deal-pop/chrome-extension` repository for extension development and deployment  
- **Price Checker Documentation** - See the `deal-pop/puppeteer-scraper` repository for automated price checking service

### Setup Guides
- **[Authentication Setup](./my-docs/AUTHENTICATION_SETUP.md)** - Firebase Auth configuration
- **[AWS Setup Guide](./my-docs/AWS_SETUP_SIMPLE.md)** - Basic AWS infrastructure setup
- **[Deployment Guide](./my-docs/DEPLOYMENT_GUIDE.md)** - Safe deployment with rollback

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run build:timestamped` - Build with timestamped backup
- `npm run deploy:safe` - Safe deployment with automatic rollback
- `npm run rollback` - Rollback to previous deployment
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## System Dependencies

DealPop requires coordination between multiple services:

### Required Services
1. **Backend API** - Must be running for product data and authentication
2. **PostgreSQL Database** - Required for data persistence
3. **Firebase Project** - Required for user authentication
4. **Chrome Extension** - Optional but recommended for full functionality

### Development Setup Order
1. Set up Firebase project and authentication
2. Start Backend API with database connection
3. Start Frontend development server
4. Load Chrome Extension for testing (optional)

## Support & Troubleshooting

- **Common Issues**: See [docs/FRONTEND.md](./docs/FRONTEND.md) troubleshooting section
- **Deployment Issues**: See [docs/AWS_DEPLOYMENT.md](./docs/AWS_DEPLOYMENT.md)
- **Authentication Problems**: See [Authentication Setup](./my-docs/AUTHENTICATION_SETUP.md)
- **Chrome Extension Issues**: See the `deal-pop/chrome-extension` repository

## License

This project is licensed under the MIT License. 