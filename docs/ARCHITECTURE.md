# DealPop System Architecture

## Overview

DealPop is a distributed system consisting of four main components that work together to provide comprehensive price tracking and deal discovery functionality. This document outlines the complete system architecture, data flows, and inter-component relationships.

## System Components

### 1. Frontend Dashboard (React)
- **Purpose**: User interface for managing tracked products and alerts
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS
- **Deployment**: AWS S3 + CloudFront
- **Repository**: `dealpop-frontend`

### 2. Backend API (Node.js)
- **Purpose**: REST API for data management and business logic
- **Technology**: Node.js, Express, PostgreSQL, Firebase Auth
- **Deployment**: AWS App Runner
- **Repository**: `deal-pop/backend-api`

### 3. Chrome Extension (Manifest V3)
- **Purpose**: Product scraping and browser integration
- **Technology**: JavaScript, Chrome APIs, Playwright
- **Deployment**: Chrome Web Store
- **Repository**: `deal-pop/chrome-extension`

### 4. Price Checker Service (Node.js)
- **Purpose**: Automated price monitoring and alerting
- **Technology**: Node.js, Playwright, Cron Jobs
- **Deployment**: AWS App Runner (integrated with backend)
- **Repository**: `deal-pop/puppeteer-scraper`

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DealPop System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Chrome        │    │   Frontend      │    │   Backend   │ │
│  │   Extension     │◄──►│   Dashboard     │◄──►│   API       │ │
│  │                 │    │                 │    │             │ │
│  │ • Product       │    │ • React UI      │    │ • Express   │ │
│  │   Scraping      │    │ • Auth          │    │ • PostgreSQL│ │
│  │ • Browser       │    │ • State Mgmt    │    │ • Firebase  │ │
│  │   Integration   │    │ • API Client    │    │ • Business  │ │
│  └─────────────────┘    └─────────────────┘    │   Logic     │ │
│           │                       │             └─────────────┘ │
│           │                       │                     │       │
│           │                       │                     │       │
│           ▼                       ▼                     ▼       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Product       │    │   Firebase      │    │   Price     │ │
│  │   Websites      │    │   Auth          │    │   Checker   │ │
│  │                 │    │                 │    │             │ │
│  │ • Amazon        │    │ • Google OAuth  │    │ • Cron Jobs │ │
│  │ • Target        │    │ • JWT Tokens    │    │ • Scraping  │ │
│  │ • Walmart       │    │ • User Mgmt     │    │ • Alerts    │ │
│  │ • Other Retail  │    │                 │    │ • Notifications│ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. User Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Chrome    │    │   Frontend  │    │   Firebase  │    │   Backend   │
│  Extension  │    │  Dashboard  │    │    Auth     │    │     API     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Open Auth      │                   │                   │
       │    Window         │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │                   │                   │
       │                   │ 2. Google OAuth   │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ 3. Auth Success   │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 4. Send Token     │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 5. API Calls      │                   │                   │
       ├──────────────────────────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ 6. API Calls      │                   │
       │                   ├──────────────────────────────────────►│
```

### 2. Product Tracking Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Chrome    │    │   Frontend  │    │   Backend   │    │  PostgreSQL │
│  Extension  │    │  Dashboard  │    │     API     │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Scrape Product │                   │                   │
       │    Data           │                   │                   │
       │                   │                   │                   │
       │ 2. Send to API    │                   │                   │
       ├──────────────────────────────────────►│                   │
       │                   │                   │                   │
       │                   │                   │ 3. Store Product  │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 4. Fetch Products │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 5. Query Database │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 6. Return Data    │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 7. Display in UI  │                   │                   │
       │◄──────────────────┤                   │                   │
```

### 3. Price Checking & Alert Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Price     │    │   Backend   │    │  PostgreSQL │    │  Notification│
│  Checker    │    │     API     │    │  Database   │    │   Services  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Cron Trigger   │                   │                   │
       │    (Every 10min)  │                   │                   │
       │                   │                   │                   │
       │ 2. Get Products   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 3. Query Active   │                   │
       │                   │    Products       │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ 4. Return List    │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 5. Scrape Prices  │                   │                   │
       │                   │                   │                   │
       │ 6. Update Prices  │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 7. Store in DB    │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ 8. Check Alerts   │                   │
       │                   │                   │                   │
       │                   │ 9. Send Alerts    │                   │
       │                   ├──────────────────────────────────────►│
```

## Repository Dependencies

### Dependency Graph

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└─────────────────┘
         │
         │ Depends on
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Backend API   │◄───│   Chrome        │
│   (Node.js)     │    │   Extension     │
└─────────────────┘    └─────────────────┘
         │                       │
         │ Depends on            │ Depends on
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Product       │
│   Database      │    │   Websites      │
└─────────────────┘    └─────────────────┘
         ▲
         │
         │ Depends on
         ▼
┌─────────────────┐
│   Price         │
│   Checker       │
└─────────────────┘
```

### Cross-Repository Dependencies

| Component | Dependencies | Communication Method |
|-----------|-------------|---------------------|
| **Frontend** | Backend API, Firebase Auth, Chrome Extension | REST API, Firebase SDK, Chrome Messaging |
| **Backend API** | PostgreSQL, Firebase Auth, Price Checker | Database queries, Firebase Admin SDK, Internal API |
| **Chrome Extension** | Backend API, Frontend Dashboard | REST API, Chrome Messaging API |
| **Price Checker** | Backend API, Product Websites | REST API, Web Scraping |

## Communication Patterns

### 1. REST API Communication

**Frontend ↔ Backend API**
- **Protocol**: HTTPS REST API
- **Authentication**: Firebase JWT Bearer tokens
- **Data Format**: JSON
- **Error Handling**: HTTP status codes with error messages

**Chrome Extension ↔ Backend API**
- **Protocol**: HTTPS REST API
- **Authentication**: Firebase JWT Bearer tokens (from frontend)
- **Data Format**: JSON
- **Error Handling**: HTTP status codes with error messages

**Price Checker ↔ Backend API**
- **Protocol**: HTTPS REST API
- **Authentication**: Internal API key
- **Data Format**: JSON
- **Error Handling**: HTTP status codes with error messages

### 2. Chrome Extension Communication

**Extension ↔ Frontend Dashboard**
- **Protocol**: Chrome Runtime Messaging API
- **Purpose**: Authentication token exchange
- **Data Format**: JSON messages
- **Error Handling**: Chrome runtime error callbacks

**Extension ↔ Product Websites**
- **Protocol**: Content Script injection
- **Purpose**: Product data extraction
- **Data Format**: DOM parsing and structured data
- **Error Handling**: Try-catch blocks and fallback selectors

### 3. Database Communication

**Backend API ↔ PostgreSQL**
- **Protocol**: PostgreSQL wire protocol
- **Authentication**: Database credentials
- **Data Format**: SQL queries and results
- **Connection**: Connection pooling for performance

## Security Architecture

### Authentication & Authorization

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   Firebase      │    │   Backend       │
│   Browser       │    │   Auth          │    │   API           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Google OAuth       │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. JWT Token          │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 3. API Request        │                       │
         │    + Bearer Token     │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │                       │ 4. Verify Token       │
         │                       │◄──────────────────────┤
         │                       │                       │
         │ 5. Authorized         │                       │
         │    Response           │                       │
         │◄──────────────────────────────────────────────┤
```

### Security Layers

1. **Firebase Authentication**
   - Google OAuth integration
   - JWT token management
   - User session handling
   - Automatic token refresh

2. **API Security**
   - Bearer token authentication
   - CORS configuration
   - Rate limiting
   - Input validation

3. **Database Security**
   - Connection encryption (SSL)
   - Parameterized queries (SQL injection prevention)
   - User-based data isolation
   - Backup and recovery procedures

4. **Chrome Extension Security**
   - Manifest V3 security model
   - Content Security Policy
   - Minimal permissions
   - Secure message passing

## Database Architecture

### PostgreSQL Schema

```sql
-- Core Tables
users                    -- Firebase user extensions
tracked_products         -- Product tracking data
alerts                   -- Price alert configurations
alert_history           -- Alert trigger history
user_alert_preferences  -- User notification settings
notification_logs       -- Notification delivery tracking
price_history          -- Historical price data
saved_searches         -- User search preferences
ab_test_events         -- A/B testing analytics
```

### Data Relationships

```
users (1) ──→ (many) tracked_products
users (1) ──→ (many) alerts
users (1) ──→ (1) user_alert_preferences
tracked_products (1) ──→ (many) price_history
alerts (1) ──→ (many) alert_history
alerts (1) ──→ (many) notification_logs
```

## Scalability Considerations

### Current Architecture Strengths

1. **Stateless Frontend**: S3 + CloudFront provides global CDN
2. **API-First Design**: RESTful API enables multiple client types
3. **Database Separation**: PostgreSQL can be scaled independently
4. **Microservice Ready**: Components can be deployed separately

### Scaling Strategies

#### Horizontal Scaling
- **Frontend**: CloudFront CDN handles global traffic
- **Backend API**: App Runner auto-scaling based on demand
- **Database**: Read replicas for query distribution
- **Price Checker**: Multiple instances with job distribution

#### Performance Optimization
- **Caching**: Redis for API response caching
- **Database**: Query optimization and indexing
- **CDN**: Static asset caching via CloudFront
- **API**: Request batching and pagination

#### Monitoring & Observability
- **Application Metrics**: Performance and error tracking
- **Database Metrics**: Query performance and connection pooling
- **Infrastructure Metrics**: CPU, memory, and network usage
- **Business Metrics**: User engagement and conversion tracking

## Deployment Architecture

### AWS Services Used

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Infrastructure                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │     S3      │  │ CloudFront  │  │  Route 53   │        │
│  │             │  │     CDN     │  │     DNS     │        │
│  │ • Frontend  │  │ • Global    │  │ • Domain    │        │
│  │   Assets    │  │   Cache     │  │   Routing   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ App Runner  │  │     RDS     │  │   Secrets   │        │
│  │             │  │ PostgreSQL  │  │  Manager    │        │
│  │ • Backend   │  │ • Database  │  │ • API Keys  │        │
│  │ • Price     │  │ • Backups   │  │ • Passwords │        │
│  │   Checker   │  │ • Scaling   │  │ • Tokens    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │     SES     │  │   CloudWatch│  │     IAM     │        │
│  │             │  │             │  │             │        │
│  │ • Email     │  │ • Logs      │  │ • Roles     │        │
│  │   Alerts    │  │ • Metrics   │  │ • Policies  │        │
│  │ • SendGrid  │  │ • Alarms    │  │ • Access    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Flow

1. **Frontend Deployment**
   - Build React application
   - Upload to S3 bucket
   - Invalidate CloudFront cache
   - Update Route 53 if needed

2. **Backend API Deployment**
   - Build Docker container
   - Deploy to App Runner
   - Update environment variables
   - Run database migrations

3. **Price Checker Deployment**
   - Build Docker container
   - Deploy to App Runner
   - Configure cron schedules
   - Test scraping functionality

4. **Chrome Extension Deployment**
   - Build extension package
   - Upload to Chrome Web Store
   - Update extension ID in frontend
   - Test authentication flow

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups with point-in-time recovery
- **Code**: Git repositories with multiple remotes
- **Configuration**: Infrastructure as Code (CloudFormation/Terraform)
- **Secrets**: AWS Secrets Manager with versioning

### Recovery Procedures
- **Database Recovery**: Restore from latest backup
- **Application Recovery**: Redeploy from Git repository
- **Infrastructure Recovery**: Recreate from Infrastructure as Code
- **Data Recovery**: Restore from backup with minimal data loss

### Monitoring & Alerting
- **Health Checks**: Automated health monitoring for all services
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Monitoring**: Real-time performance metrics
- **Business Continuity**: Alert on critical system failures

---

This architecture provides a robust, scalable foundation for the DealPop platform while maintaining security, performance, and maintainability. For specific implementation details, refer to the individual component documentation.
