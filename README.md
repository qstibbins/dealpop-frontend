# DealPop Feature Matrix (Product Owner View)

This matrix outlines all core and future features for DealPop, organized by priority. It’s designed to support strategic planning, MVP scoping, and long-term roadmap development.

---

## ✅ MVP vs. Future Enhancements

| Feature Area                    | Feature Description                                                       | MVP | Future |
|--------------------------------|----------------------------------------------------------------------------|:---:|:------:|
| **Product Tracking**           | Add and manage product URLs for price tracking                            | ✅  |        |
|                                | Auto-detect title, price, and product image                               | ✅  |        |
|                                | Handle variant-based product pages (e.g., sizes, colors)                 | ✅  |        |
|                                | Support for multiple retail domains (Amazon, etc.)                        | ✅  |        |
|                                | Screenshot fallback with OCR for unstructured sites                       |     |   ✅   |
|                                | Accessibility fallback scraping                                           |     |   ✅   |
|                                | Product deduplication and canonicalization                                |     |   ✅   |

| **User Alerts**                | Set a custom price threshold for alerts                                   | ✅  |        |
|                                | View active and expired alerts                                            | ✅  |        |
|                                | Trigger alerts based on scheduled jobs                                    | ✅  |        |
|                                | In-app alert display                                                      | ✅  |        |
|                                | Email and/or browser push notifications                                   |     |   ✅   |
|                                | Alert suppression or batching preferences                                 |     |   ✅   |

| **Frontend Dashboard (UX/UI)** | Responsive dashboard (mobile + desktop)                                   | ✅  |        |
|                                | Dark mode toggle                                                          | ✅  |        |
|                                | Product list with key details                                             | ✅  |        |
|                                | Product detail view                                                       | ✅  |        |
|                                | Settings view to update tracking options                                 | ✅  |        |
|                                | Fallback image for missing thumbnails                                     | ✅  |        |
|                                | Skeleton loaders and transitions                                          | ✅  |        |
|                                | Historical price chart (line graph)                                       |     |   ✅   |
|                                | Filter and sort by discount, price, site                                  |     |   ✅   |
|                                | Nav bar alert badge                                                       |     |   ✅   |
|                                | Search and keyword filter                                                 |     |   ✅   |

| **Authentication & Auth**      | Login with Auth0 (Google, Apple, etc.)                                    | ✅  |        |
|                                | Token-based session handling                                              | ✅  |        |
|                                | Backend middleware for token validation                                   | ✅  |        |

| **Real-Time Updates**          | Web PubSub connection for real-time alert updates                         | ✅  |        |
|                                | Frontend subscribes to backend changes                                    | ✅  |        |
|                                | User-initiated update requests over Web PubSub                            |     |   ✅   |

| **Infrastructure & API**       | REST API for products, alerts, and jobs                                   | ✅  |        |
|                                | Daily background job for price polling                                    | ✅  |        |
|                                | Redis or other caching for job state                                      |     |   ✅   |
|                                | Alert throttling and rate-limiting middleware                             |     |   ✅   |
|                                | Performance tuning for scraper execution                                 |     |   ✅   |

| **Deployment & DevOps**        | Local development via Docker Compose                                      | ✅  |        |
|                                | CI/CD with GitHub Actions                                                 | ✅  |        |
|                                | One-click deploy to Railway / Render                                      | ✅  |        |
|                                | Observability: monitoring, logs, errors                                   |     |   ✅   |

| **Testing & QA**               | Unit tests for utilities and key flows                                    | ✅  |        |
|                                | End-to-end integration testing                                            |     |   ✅   |
|                                | Load and stress testing                                                   |     |   ✅   |
|                                | Maintain 90%+ test coverage across codebase                               |     |   ✅   |

---

> 💡 **Roadmap Note:** MVP is focused on core utility and user retention through functional alerts and clean UI. Future enhancements prioritize trust (notifications, error handling), stickiness (charts, filters), and scale (scraper reliability, performance tuning).