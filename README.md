# DealPop Frontend

A modern React application built with Vite, TypeScript, and Tailwind CSS for displaying product deals and tracking prices. Features a two-tier deployment structure with a landing page and beta application.

## Features

- 🚀 Built with Vite for fast development and building
- ⚛️ React 18 with TypeScript for type safety
- 🎨 Tailwind CSS for styling with custom theme
- 📱 Responsive design with mobile-first approach
- 🔄 Hot module replacement for development
- 🌐 Two-tier deployment: Landing page + Beta app
- 🔐 Firebase authentication integration
- 📊 Price tracking and deal alerts
- 🛒 Chrome extension integration

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- AWS CLI (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dealpop-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/beta/`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run build:beta` - Build for beta deployment
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run deploy:landing` - Deploy landing page to S3 root
- `npm run deploy:beta` - Deploy React app to S3 /beta/ folder

## HTML Files Explained

### `index.html`
- **Purpose**: Landing page for root domain (`dealpop.co`)
- **Content**: "Coming Soon" page with blue background, "DealPop" branding, "Launching Fall 2025!"
- **Deployment**: Uploaded to S3 bucket root

### `beta-index.html`
- **Purpose**: Template for React app entry point
- **Content**: Contains `<div id="root"></div>` and script tags for React
- **Usage**: Used by Vite as template during build process
- **Deployment**: Built into `dist/index.html` and uploaded to S3 `/beta/` folder

### `landing.html`
- **Purpose**: Standalone backup of landing page
- **Content**: Same as `index.html` but separate file
- **Usage**: Backup/reference file

## Project Structure

```
dealpop-frontend/
├── src/
│   ├── components/           # React components
│   │   ├── ProductCard.tsx
│   │   ├── AlertCard.tsx
│   │   ├── CreateAlertModal.tsx
│   │   └── ui/              # Reusable UI components
│   ├── views/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Alerts.tsx
│   ├── services/            # API and service layer
│   │   ├── api.ts
│   │   ├── authAdapter.ts
│   │   └── chromeStorage.ts
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── AlertContext.tsx
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── index.html               # Landing page (root domain)
├── beta-index.html          # React app template
├── landing.html             # Backup landing page
├── vite.config.ts           # Vite configuration (base: '/beta/')
├── tailwind.config.cjs      # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Customization

### Theme Colors

The project uses a custom color palette defined in `tailwind.config.ts`:

- `bg`: Light blue background (#e6f6fb)
- `pink`: Light pink accent (#f9cfe4)
- `accent`: Bright pink (#ff0099)
- `grayText`: Gray text color (#666)

### Adding New Components

1. Create your component in the `src/components/` directory
2. Import and use it in `App.tsx` or other components
3. Style it using Tailwind CSS classes

## Technologies Used

- **Vite** - Build tool and development server
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **ESLint** - Code linting

## AWS S3 Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- S3 bucket created and configured for static website hosting
- CloudFront distribution (optional but recommended)

### Deployment Process

#### 1. Deploy Landing Page
```bash
npm run deploy:landing
```
- Uploads `index.html` to S3 bucket root
- Serves at `dealpop.co`

#### 2. Deploy Beta Application
```bash
npm run deploy:beta
```
- Builds React app with `/beta/` base path
- Uploads built files to S3 `/beta/` folder
- Serves at `dealpop.co/beta`

#### 3. Manual Deployment
```bash
# Build React app
npm run build:beta

# Upload landing page to root
aws s3 cp index.html s3://your-bucket-name/

# Upload React app to /beta/ folder
aws s3 sync dist/ s3://your-bucket-name/beta/ --delete
```

### S3 Bucket Structure
```
your-bucket-name/
├── index.html              # Landing page (dealpop.co)
├── icon.png                # Favicon
└── beta/
    ├── index.html          # React app (dealpop.co/beta)
    └── assets/             # React app assets
        ├── index-[hash].js
        ├── index-[hash].css
        └── icon-[hash].png
```

### CloudFront Cache Invalidation
After deployment, invalidate CloudFront cache:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Backend Integration

### API Configuration
The frontend connects to the backend API through:
- **Base URL**: `https://bzu99jbwnr.us-east-2.awsapprunner.com`
- **Authentication**: Firebase Auth tokens
- **Endpoints**: Product tracking, alerts, user management

### Environment Variables
Create `.env.production` for production builds:
```env
VITE_API_BASE_URL=https://bzu99jbwnr.us-east-2.awsapprunner.com
```

Create `.env.development` for local development:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Chrome Extension Integration

### Communication
- **Chrome Storage API**: Stores user preferences and tracked products
- **Message Passing**: Communicates with extension background scripts
- **Product Detection**: Extension detects products on shopping websites
- **Price Tracking**: Sends price data to backend for monitoring

### Key Services
- `chromeStorage.ts`: Chrome extension storage management
- `productExtractor.ts`: Product data extraction from web pages
- `alertService.ts`: Deal alert management

## Environment Variables

### Development
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_AUTH=true
```

### Production
```env
VITE_API_BASE_URL=https://bzu99jbwnr.us-east-2.awsapprunner.com
VITE_ENABLE_AUTH=true
```

### Firebase Configuration
Firebase configuration is handled through the Firebase SDK and environment variables for authentication and data storage.

## License

This project is licensed under the MIT License. 