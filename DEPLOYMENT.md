# GitHub Pages Deployment Guide

This guide explains how to deploy the DealPop frontend to GitHub Pages for static hosting.

## Overview

The app has been configured to work in static mode for GitHub Pages deployment. When deployed, it will:

- Use mock data instead of requiring a backend API
- Use mock authentication instead of Firebase
- Display a demo banner to indicate it's running in demo mode
- Provide a fully functional UI for feedback and testing

## Features in Static Mode

### ✅ Working Features
- Product listing and filtering
- Search functionality
- Alert creation and management
- Responsive design
- All UI components and interactions

### ⚠️ Demo Features
- Mock product data (12 sample products)
- Mock alerts (8 sample alerts)
- Mock authentication (auto-login as demo user)
- No real backend API calls
- No real Firebase authentication

## Deployment Steps

### 1. Build the Project

```bash
npm run build
```

This will create a `dist` folder with the static files.

### 2. Configure GitHub Pages

1. Go to your GitHub repository
2. Navigate to Settings > Pages
3. Set the source to "Deploy from a branch"
4. Select the `main` branch (or your preferred branch)
5. Set the folder to `/docs` or `/dist`
6. Click Save

### 3. Deploy to GitHub Pages

#### Option A: Using GitHub Actions (Recommended)

Create a GitHub Actions workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### Option B: Manual Deployment

1. Build the project: `npm run build`
2. Copy the contents of the `dist` folder to a `docs` folder in your repository
3. Commit and push the changes
4. GitHub Pages will automatically deploy from the `docs` folder

### 4. Configure Base URL

If your repository name is not `dealpop-frontend`, update the base URL in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/', // Update this
  // ... rest of config
})
```

## Configuration

### Static Mode Settings

The static mode is controlled by `src/config/staticMode.ts`:

```typescript
export const STATIC_MODE_CONFIG = {
  ENABLE_STATIC_MODE: true,
  FORCE_MOCK_DATA: true,
  DISABLE_FIREBASE_AUTH: true,
  // ... other settings
};
```

### Mock Data

Mock data is located in:
- `src/data/mockProducts.ts` - Sample products
- `src/data/mockAlerts.ts` - Sample alerts
- `src/data/mockUserData.ts` - User preferences and settings

### Customizing Mock Data

To customize the demo data:

1. Edit the mock data files in `src/data/`
2. Update product information, prices, vendors, etc.
3. Add more products or alerts as needed
4. Rebuild and redeploy

## Testing the Deployment

After deployment, you can test:

1. **Product Listing**: View all 12 sample products
2. **Search & Filter**: Test search functionality and filters
3. **Alert Creation**: Create alerts for demo products
4. **Responsive Design**: Test on different screen sizes
5. **Demo Authentication**: Auto-login as demo user

## Troubleshooting

### Common Issues

1. **404 Errors**: Check that the base URL is correctly configured
2. **Build Failures**: Ensure all dependencies are installed
3. **Missing Images**: Verify that image paths are correct for the deployed URL

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your build process.

## Switching Back to Full Mode

To switch back to full backend mode:

1. Set `ENABLE_STATIC_MODE: false` in `src/config/staticMode.ts`
2. Ensure your backend API is running
3. Configure Firebase authentication
4. Rebuild and deploy

## Support

For issues with the deployment:

1. Check the GitHub Actions logs for build errors
2. Verify the repository settings for GitHub Pages
3. Test locally with `npm run preview` before deploying
