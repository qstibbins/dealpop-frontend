# DealPop Frontend Dashboard Overview

## Technology Stack

### Framework
- **React 18.2.0** with TypeScript
- **Vite** as build tool (not Next.js)
- **React Router DOM v7.6.3** for routing

### Styling & UI
- **Tailwind CSS** for styling
- Custom theme system with CSS variables
- Responsive design

### Authentication & Backend
- **Firebase** for authentication
- Custom API adapter for backend communication
- Protected route system

### State Management
- **React Context** for global state
  - `AuthContext` - User authentication state
  - `AlertContext` - Alert management state
- Custom hooks for data fetching and search

## Dashboard Features

### 1. Product Tracking System
- **Product Management**: Track products with target prices and expiration dates
- **Price Monitoring**: Real-time price tracking and comparison
- **Savings Calculation**: Automatic calculation of potential savings
- **Status Management**: Products can be Active, Paused, Completed, or Expired

### 2. Search & Filtering
- **Advanced Search**: Search by product name, vendor, price range
- **Smart Filtering**: Multiple filter options with real-time updates
- **Smart Sorting**: Intelligent product sorting based on relevance
- **Filter Categories**:
  - All products
  - DealPop (products at or below target price)
  - Expired products
  - Active tracking
  - Completed deals

### 3. Alert Management
- **Price Drop Alerts**: Create alerts for specific price thresholds
- **Alert History**: View and manage all created alerts
- **Notification Preferences**: Email, push, and SMS notifications
- **Alert Statistics**: Track triggered alerts and performance

### 4. Authentication & Security
- **Protected Routes**: Secure access to dashboard features
- **Firebase Integration**: Robust authentication system
- **Session Management**: Automatic token refresh and session handling
- **User Context**: Global user state management

### 5. Data Visualization
- **Price Trend Charts**: Visual representation of price changes
- **Savings Dashboard**: Total potential savings calculation
- **Product Statistics**: Comprehensive product metrics
- **Real-time Updates**: Live data refresh capabilities

### 6. Chrome Extension Integration
- **Product Extraction**: Extract product data from web pages
- **Seamless Integration**: Direct integration with browser extension
- **Image Handling**: CORS-safe image loading with proxy
- **URL Management**: Direct links to product pages

## Architecture

### File Structure
```
src/
├── components/          # Reusable UI components
├── views/              # Page components (Dashboard, Login, etc.)
├── contexts/           # React Context providers
├── services/           # API and business logic
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes
```

### Key Components
- **Dashboard**: Main product tracking interface
- **SearchFilters**: Advanced filtering system
- **SearchResults**: Product display and management
- **CreateAlertModal**: Alert creation interface
- **AlertsListModal**: Alert management interface
- **ProductCard**: Individual product display
- **PriceDisplay**: Price formatting and display
- **StatusBadge**: Product status indicators

### API Integration
- **apiAdapter**: Centralized API communication
- **searchService**: Product search and filtering logic
- **alertService**: Alert management operations
- **imageService**: Image handling and CORS management

## Development Features

### Development Tools
- **TypeScript**: Full type safety
- **ESLint**: Code quality and consistency
- **Vite**: Fast development server and build
- **Hot Module Replacement**: Instant development updates

### Debug Features
- **Alert Debug Info**: Development-only debugging component
- **Console Logging**: Comprehensive logging for development
- **Error Handling**: Graceful error states and user feedback

### Deployment
- **AWS S3**: Static site hosting
- **Build Scripts**: Automated deployment with rollback capability
- **Environment Configuration**: Development and production modes

## User Experience

### Navigation
- **Sidebar Navigation**: Persistent navigation with user context
- **Breadcrumb System**: Clear navigation hierarchy
- **Modal System**: Non-intrusive overlays for actions

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Mobile-optimized interactions
- **Progressive Enhancement**: Works across all devices

### Performance
- **Lazy Loading**: Efficient component loading
- **Debounced Search**: Optimized search performance
- **Image Optimization**: CORS-safe image loading
- **Caching**: Intelligent data caching strategies
