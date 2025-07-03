# DealPop Feature Specification

This document outlines the full set of features for DealPop, a price tracking and alert system. Features are categorized by functional area and priority (MVP or Later).

---

## 📦 Functional Areas & Features

### 1. 🕷️ Product Scraping

- ✅ Variant-aware scraping with Puppeteer
- ✅ Dynamic DOM selector handling
- ✅ Auto-detection of title, price, and image
- ❌ Screenshot capture with OCR fallback (for unstructured pages)
- ❌ Accessibility markup exploitation as a fallback method

---

### 2. 🧠 Backend Infrastructure & API

- ✅ `POST /api/products` — Track a new product
- ✅ `PATCH /api/products/:id/update` — Update tracking options
- ✅ `POST /api/products/:id/stop` — Stop tracking a product
- ✅ `GET /api/alerts` — Fetch all active/expired alerts
- ✅ `POST /internal/jobs/daily` — Run the daily price-check job
- ✅ `POST /internal/variant/resolve` — Metadata/variant enrichment
- ❌ Redis caching for job state
- ❌ Notification deduplication/throttling middleware
- ❌ Product deduplication logic

---

### 3. 📈 Alerts & Notification System

- ✅ Threshold-based alerts (e.g., drop below $X)
- ✅ Daily job that triggers alerts
- ❌ Browser push notifications
- ❌ Email notification support
- ❌ Advanced alert frequency & suppression controls

---

### 4. 🌐 Frontend Dashboard (React + Vite)

- ✅ Mobile responsive layout
- ✅ Dark mode toggle
- ✅ Top nav with routing
- ✅ Login view
- ✅ Product list view
- ✅ Product detail view
- ✅ Settings view (thresholds, site options)
- ✅ Alerts view (active/expired)
- ✅ Fallback image for missing product thumbnails
- ✅ Skeleton loaders, page transitions, hover states
- ❌ Historical price chart (line chart)
- ❌ Alert badge in nav
- ❌ Filters and sorting (price, date, % off, etc.)
- ❌ Search bar for product list
- ❌ Edit product title (custom name)

---

### 5. 🔔 Real-Time Update System (Bridge + PubSub)

- ✅ Backend bridge processor that emits update events
- ✅ Azure Web PubSub integration
- ✅ Frontend subscription to real-time changes
- ❌ Bi-directional messaging (user → scraper triggers)

---

### 6. 🔐 Authentication

- ✅ Hosted login page (Auth0)
- ✅ Multi-provider login (Google, Apple, etc.)
- ✅ Backend Auth0 token validation
- ✅ Frontend token forwarding and session management

---

### 7. 🧪 Testing & QA

- ✅ Unit tests for utilities and key modules
- ❌ End-to-end tests
- ❌ 90%+ test coverage goal
- ❌ Load testing & performance monitoring

---

### 8. 🚀 Deployment & DevOps

- ✅ Docker Compose for full local stack (frontend, backend, Redis, Puppeteer)
- ✅ GitHub Actions for CI/CD
- ✅ Railway or Render deployment support
- ✅ Deploy guide or 1-click button
- ❌ Monitoring and logging dashboard (Grafana, Sentry, etc.)

---

## ✅ Feature Matrix: MVP vs. Later

| Feature                                              | MVP | Later |
|------------------------------------------------------|:---:|:-----:|
| Variant-aware Puppeteer scraping                     | ✅  |       |
| Auto-detect product title, price, image              | ✅  |       |
| Screenshot OCR fallback                              |     |  ✅   |
| Accessibility markup fallback                        |     |  ✅   |
| `POST /api/products`                                 | ✅  |       |
| `PATCH /api/products/:id/update`                     | ✅  |       |
| `POST /api/products/:id/stop`                        | ✅  |       |
| `GET /api/alerts`                                    | ✅  |       |
| `POST /internal/jobs/daily`                          | ✅  |       |
| `POST /internal/variant/resolve`                     | ✅  |       |
| Redis job caching                                    |     |  ✅   |
| Notification deduplication                           |     |  ✅   |
| Product deduplication                                |     |  ✅   |
| Threshold alerts                                     | ✅  |       |
| Daily alert jobs                                     | ✅  |       |
| Browser notifications                                |     |  ✅   |
| Email alerts                                         |     |  ✅   |
| Alert suppression controls                           |     |  ✅   |
| Mobile responsive UI                                 | ✅  |       |
| Dark mode toggle                                     | ✅  |       |
| Product list/detail/settings/alerts views            | ✅  |       |
| Skeleton loaders, transitions, hover states          | ✅  |       |
| Historical price chart                               |     |  ✅   |
| Nav alert badge                                      |     |  ✅   |
| Filters & sorting                                    |     |  ✅   |
| Search bar                                           |     |  ✅   |
| Custom title for product                             |     |  ✅   |
| Web PubSub backend bridge + frontend listener        | ✅  |       |
| Bi-directional Web PubSub                            |     |  ✅   |
| Auth0 login + multi-provider                         | ✅  |       |
| Token validation in backend                          | ✅  |       |
| Unit tests                                           | ✅  |       |
| End-to-end tests                                     |     |  ✅   |
| High test coverage (90%+)                            |     |  ✅   |
| Load/performance testing                             |     |  ✅   |
| Docker Compose setup                                 | ✅  |       |
| GitHub Actions CI/CD                                 | ✅  |       |
| Railway/Render deploy guides                         | ✅  |       |
| Logging/monitoring stack                             |     |  ✅   |