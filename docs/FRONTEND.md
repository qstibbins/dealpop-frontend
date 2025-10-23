# DealPop Frontend Documentation

## Overview

The DealPop Frontend is a modern React application that serves as the main dashboard for users to manage their tracked products, view price alerts, and configure their account settings. It's built with a focus on performance, user experience, and seamless integration with the Chrome extension and backend API.

## What This Component Does

The frontend provides:
- **Product Management Dashboard**: View, edit, and delete tracked products
- **Price Alert System**: Create and manage price drop alerts
- **User Authentication**: Secure login via Google OAuth through Firebase
- **Chrome Extension Integration**: Seamless communication with the browser extension
- **Real-time Updates**: Live data synchronization with the backend API
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Technology Stack

### Core Technologies
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Router** - Client-side routing and navigation

### Key Dependencies
- **Firebase Auth** - User authentication and session management
- **React Context API** - State management for auth and alerts
- **Chrome Extension APIs** - Integration with browser extension
- **Axios/Fetch** - HTTP client for API communication

## Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── ProductCard.tsx     # Product display and actions
│   ├── AlertCard.tsx       # Alert management interface
│   ├── CreateAlertModal.tsx # Alert creation form
│   ├── SearchFilters.tsx   # Product filtering controls
│   ├── PriceDisplay.tsx    # Price formatting and display
│   └── ui/                 # Base UI components
│       ├── Modal.tsx       # Reusable modal component
│       ├── StatusBadge.tsx # Status indicators
│       └── ConfirmDialog.tsx # Confirmation dialogs
├── views/                  # Main page components
│   ├── Dashboard.tsx       # Main product dashboard
│   ├── Login.tsx          # Authentication page
│   ├── Alerts.tsx         # Alert management page
│   ├── Settings.tsx       # User settings page
│   └── LandingPage.tsx    # Public landing page
├── services/              # API and service layer
│   ├── api.ts            # Main API service with auth
│   ├── apiAdapter.ts     # API response transformation
│   ├── authAdapter.ts    # Firebase auth integration
│   ├── chromeStorage.ts  # Chrome extension storage
│   └── alertService.ts   # Alert management service
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── AlertContext.tsx  # Alert state management
├── hooks/                # Custom React hooks
│   ├── useModal.ts       # Modal state management
│   ├── useSearch.ts      # Search and filtering logic
│   └── useImage.ts       # Image loading and fallbacks
├── utils/                # Utility functions
│   ├── priceFormatting.ts # Price display utilities
│   ├── priceUtils.ts     # Price calculation helpers
│   └── alertValidation.ts # Form validation
├── types/                # TypeScript type definitions
│   └── alerts.ts         # Alert-related types
├── config/               # Configuration files
│   ├── api.ts           # API configuration
│   └── staticMode.ts    # Static mode configuration
├── styles/               # Global styles
│   ├── globals.css      # Global CSS styles
│   └── theme.css        # Theme variables
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Developer Setup

### Prerequisites
- **Node.js 18+** - JavaScript runtime
- **npm or yarn** - Package manager
- **Git** - Version control
- **Firebase Project** - For authentication (see [Authentication Setup](./my-docs/AUTHENTICATION_SETUP.md))

### Installation Steps

1. **Clone the repository**:
```bash
git clone <repository-url>
cd dealpop-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
# Copy the example environment file
cp .env.example .env.local

# Add your configuration (see Environment Variables section)
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Open your browser**: Navigate to `http://localhost:5173`

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000  # Backend API URL
VITE_ENABLE_AUTH=true                    # Enable authentication

# Firebase Configuration (see Authentication Setup guide)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## API Integration

### Backend API Communication

The frontend communicates with the backend API through the `ApiService` class in `src/services/api.ts`. Here's how it works:

#### Authentication Flow
1. **User Login**: Firebase Auth handles Google OAuth
2. **Token Management**: Automatic token refresh and caching
3. **API Requests**: All requests include Bearer token in Authorization header
4. **Error Handling**: Automatic retry and error management

#### Key API Endpoints Used

| Endpoint | Method | Purpose | When Called |
|----------|--------|---------|-------------|
| `/api/products` | GET | Fetch user's tracked products | Dashboard load, filter changes |
| `/api/products` | POST | Add new product to tracking | Create alert modal submission |
| `/api/products/{id}/update` | PATCH | Update product settings | Edit target price, status |
| `/api/products/{id}` | DELETE | Remove product from tracking | Delete product action |
| `/api/alerts` | GET | Fetch user's alerts | Alerts page load |
| `/api/alerts` | POST | Create new price alert | Alert creation form |
| `/api/alerts/{id}` | DELETE | Remove alert | Delete alert action |
| `/api/users/profile` | GET | Get user profile data | Settings page load |
| `/api/users/preferences` | GET/PUT | User notification preferences | Settings management |

#### API Service Features
- **Automatic Token Refresh**: Tokens are refreshed 5 minutes before expiry
- **Request Caching**: Prevents duplicate requests
- **Error Handling**: Comprehensive error management with user feedback
- **Type Safety**: Full TypeScript support for all API responses

### Chrome Extension Integration

The frontend integrates with the Chrome extension through several mechanisms:

#### Authentication Flow
1. **Extension Opens Dashboard**: Extension opens frontend for user authentication
2. **User Signs In**: User completes Google OAuth on the frontend
3. **Token Transfer**: Frontend sends Firebase token to extension via `chrome.runtime.sendMessage`
4. **Window Management**: Authentication window closes automatically after token transfer

#### Key Integration Points

**AuthContext.tsx** - Handles extension authentication:
```typescript
// Detects extension authentication requests
const urlParams = new URLSearchParams(window.location.search);
const isExtensionAuth = urlParams.get('extension') === 'true';

// Sends auth data to extension
chrome.runtime.sendMessage(EXTENSION_ID, {
  type: 'EXTENSION_AUTH_SUCCESS',
  user: { uid, email, displayName, photoURL },
  token: token
});
```

**Token Refresh Service** - Provides fresh tokens to extension:
```typescript
// Extension can request fresh tokens
const tokenData = await apiService.refreshTokenForExtension();
```

#### Extension Communication
- **Message Passing**: Uses Chrome's runtime messaging API
- **Storage Sync**: Extension can access shared Chrome storage
- **Window Management**: Automatic window closing after auth
- **Error Handling**: Graceful fallback if extension is not available

## Development Workflow

### Local Development

1. **Start Backend API**: Ensure the backend is running on `http://localhost:3000`
2. **Start Frontend**: Run `npm run dev` in the frontend directory
3. **Load Chrome Extension**: Load the extension in Chrome for full testing
4. **Test Authentication**: Sign in and verify token refresh works
5. **Test API Integration**: Create products and alerts to verify backend communication

### Code Organization

#### Component Structure
- **Views**: Main page components that handle routing and data fetching
- **Components**: Reusable UI components with props interfaces
- **Services**: API communication and business logic
- **Hooks**: Custom logic for state management and side effects
- **Contexts**: Global state management for auth and alerts

#### State Management
- **AuthContext**: Manages user authentication state and Firebase integration
- **AlertContext**: Manages alert data and operations
- **Local State**: Component-level state using React hooks
- **URL State**: Search filters and pagination in URL parameters

### Testing

#### Manual Testing Checklist
- [ ] User authentication (Google OAuth)
- [ ] Product creation and editing
- [ ] Alert creation and management
- [ ] Chrome extension integration
- [ ] Responsive design on mobile/tablet
- [ ] Error handling and loading states
- [ ] API error scenarios

#### Development Tools
- **React DevTools**: Component inspection and debugging
- **Chrome DevTools**: Network monitoring and console debugging
- **Vite DevTools**: Hot module replacement and build analysis
- **TypeScript**: Compile-time error checking

## Common Gotchas & Troubleshooting

### Authentication Issues

**Problem**: User can't sign in with Google
- **Solution**: Check Firebase configuration in environment variables
- **Check**: Verify Firebase project has Google auth enabled
- **Debug**: Check browser console for Firebase errors

**Problem**: Extension authentication fails
- **Solution**: Verify extension ID matches in AuthContext
- **Check**: Ensure extension is loaded and running
- **Debug**: Check Chrome extension console for messaging errors

### API Integration Issues

**Problem**: API requests fail with 401 errors
- **Solution**: Check if Firebase token is valid and not expired
- **Check**: Verify backend API is running and accessible
- **Debug**: Check network tab for request/response details

**Problem**: Products don't load on dashboard
- **Solution**: Check API base URL configuration
- **Check**: Verify backend database connection
- **Debug**: Check API service logs and error handling

### Chrome Extension Issues

**Problem**: Extension can't communicate with frontend
- **Solution**: Check if extension is loaded in Chrome
- **Check**: Verify extension ID configuration
- **Debug**: Check Chrome extension console and runtime errors

**Problem**: Authentication window doesn't close
- **Solution**: Check if extension is listening for auth messages
- **Check**: Verify message passing implementation
- **Debug**: Add console logs to track message flow

### Build and Deployment Issues

**Problem**: Build fails with TypeScript errors
- **Solution**: Run `npm run lint` to identify issues
- **Check**: Verify all imports and type definitions
- **Debug**: Check TypeScript configuration in `tsconfig.json`

**Problem**: CloudFront shows old content after deployment
- **Solution**: Invalidate CloudFront cache after deployment
- **Check**: Verify S3 files were uploaded correctly
- **Debug**: Check deployment logs and S3 bucket contents

### Performance Issues

**Problem**: Slow page loads
- **Solution**: Check network tab for slow API requests
- **Check**: Verify backend API performance
- **Debug**: Use React DevTools Profiler to identify bottlenecks

**Problem**: Memory leaks in development
- **Solution**: Check for missing cleanup in useEffect hooks
- **Check**: Verify event listeners are properly removed
- **Debug**: Use Chrome DevTools Memory tab

## Deployment Process

### Development Build
```bash
npm run build
```

### Production Build with Backup
```bash
npm run build:timestamped
```

### Safe Deployment with Rollback
```bash
npm run deploy:safe
```

### Manual Rollback
```bash
npm run rollback
```

For detailed deployment instructions, see [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md).

## Performance Considerations

### Optimization Strategies
- **Code Splitting**: Route-based code splitting for faster initial loads
- **Image Optimization**: Lazy loading and fallback images
- **API Caching**: Token caching and request deduplication
- **Bundle Optimization**: Vite's built-in optimizations
- **Memory Management**: Proper cleanup of event listeners and subscriptions

### Monitoring
- **Bundle Size**: Monitor build output for size increases
- **API Performance**: Track API response times
- **User Experience**: Monitor loading states and error rates
- **Chrome Extension**: Monitor extension communication success rates

## Security Considerations

### Authentication Security
- **Firebase Auth**: Leverages Google's security infrastructure
- **Token Management**: Automatic token refresh and secure storage
- **Route Protection**: Authentication-based access control
- **CORS Configuration**: Proper origin validation

### Data Protection
- **Input Validation**: Client-side validation for all forms
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookie attributes
- **Secure Headers**: Helmet.js security headers

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live price updates
- **Advanced Filtering**: More sophisticated product filtering options
- **Analytics Dashboard**: User behavior and savings analytics
- **Mobile App**: React Native mobile application
- **Social Features**: Share deals and product recommendations

### Technical Improvements
- **Service Worker**: Offline functionality and caching
- **PWA Support**: Progressive Web App capabilities
- **Advanced Testing**: Unit and integration test coverage
- **Performance Monitoring**: Real-time performance tracking
- **Accessibility**: Enhanced accessibility features

---

For more information about the complete system architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).
