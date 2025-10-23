# Contributing to DealPop

## Welcome!

Thank you for your interest in contributing to DealPop! This guide will help you get started with development, understand our processes, and make your first contribution.

## What is DealPop?

DealPop is a comprehensive price tracking and deal discovery platform that helps users monitor product prices across multiple retailers and get notified when prices drop. The system consists of four main components:

- **Frontend Dashboard** (React) - User interface for managing tracked products
- **Backend API** (Node.js) - REST API for data management and business logic
- **Chrome Extension** (Manifest V3) - Product scraping and browser integration
- **Price Checker Service** (Node.js) - Automated price monitoring and alerting

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - JavaScript runtime
- **npm or yarn** - Package manager
- **Git** - Version control
- **Docker** - For containerized deployments (optional)
- **AWS CLI** - For deployment (optional)
- **Chrome Browser** - For extension testing

### Development Environment Setup

#### 1. Clone the Repositories

```bash
# Clone the frontend repository (this repo)
git clone https://github.com/your-username/dealpop-frontend.git
cd dealpop-frontend

# Clone other repositories
git clone https://github.com/your-username/deal-pop.git
cd deal-pop
```

#### 2. Set Up Frontend Development

```bash
# Navigate to frontend directory
cd dealpop-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

#### 3. Set Up Backend Development

```bash
# Navigate to backend directory
cd deal-pop/backend-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

#### 4. Set Up Chrome Extension Development

```bash
# Navigate to extension directory
cd deal-pop/chrome-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome (see Chrome Extension docs for details)
```

#### 5. Set Up Price Checker Development

```bash
# Navigate to price checker directory
cd deal-pop/puppeteer-scraper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Required Services

To run the complete system locally, you'll need:

1. **Firebase Project** - For authentication
2. **PostgreSQL Database** - For data storage
3. **SendGrid Account** - For email notifications (optional)
4. **Twilio Account** - For SMS notifications (optional)

See the individual component documentation for detailed setup instructions.

## Development Workflow

### Git Workflow

We use a **feature branch workflow** with the following conventions:

#### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Commit Messages
We follow the **Conventional Commits** specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add Google OAuth integration
fix(api): resolve product creation validation error
docs(readme): update installation instructions
refactor(components): extract reusable modal component
```

### Pull Request Process

#### 1. Create a Feature Branch
```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code changes ...

# Commit your changes
git add .
git commit -m "feat(component): add new feature"
```

#### 2. Push and Create Pull Request
```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# Include detailed description of changes
```

#### 3. Pull Request Requirements

**Required Information:**
- **Description**: What changes were made and why
- **Testing**: How the changes were tested
- **Screenshots**: For UI changes
- **Breaking Changes**: Any breaking changes and migration steps
- **Related Issues**: Link to related GitHub issues

**Pull Request Template:**
```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

#### 4. Code Review Process

**Review Criteria:**
- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?
- **Testing**: Is the code properly tested?
- **Documentation**: Is the code properly documented?

**Review Process:**
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Peer Review**: At least one team member reviews the code
3. **Testing**: Reviewer tests the changes locally
4. **Approval**: Code is approved and merged

### Code Style Guidelines

#### TypeScript/JavaScript

**General Rules:**
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Prefer const over let, avoid var

**Example:**
```typescript
/**
 * Calculates the price difference between current and target price
 * @param currentPrice - The current product price
 * @param targetPrice - The user's target price
 * @returns The price difference and percentage
 */
export const calculatePriceDifference = (
  currentPrice: number,
  targetPrice: number
): { difference: number; percentage: number } => {
  const difference = currentPrice - targetPrice;
  const percentage = (difference / currentPrice) * 100;
  
  return { difference, percentage };
};
```

#### React Components

**Component Structure:**
```typescript
import React, { useState, useEffect } from 'react';
import { ComponentProps } from './types';

interface Props {
  // Define props interface
}

export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState<StateType>(initialValue);
  
  // Event handlers
  const handleEvent = (event: EventType) => {
    // Handle event
  };
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};
```

#### CSS/Styling

**Tailwind CSS Guidelines:**
- Use Tailwind utility classes
- Create custom components for repeated patterns
- Use CSS variables for theme values
- Follow mobile-first responsive design

**Example:**
```typescript
// Good: Using Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">Product Title</h2>
  <span className="text-sm text-gray-500">$99.99</span>
</div>

// Good: Custom component for repeated patterns
const ProductCard = ({ product }: { product: Product }) => (
  <div className="product-card">
    {/* Card content */}
  </div>
);
```

### Testing Guidelines

#### Frontend Testing

**Unit Tests:**
```typescript
// Example unit test
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('displays product information correctly', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 99.99,
      targetPrice: 79.99
    };
    
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    const mockProduct = { id: '1', name: 'Test Product' };
    
    render(<ProductCard product={mockProduct} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
  });
});
```

**Integration Tests:**
```typescript
// Example integration test
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { apiService } from '../services/api';

jest.mock('../services/api');

describe('Dashboard Integration', () => {
  it('loads and displays products from API', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 99.99 },
      { id: '2', name: 'Product 2', price: 149.99 }
    ];
    
    (apiService.getProducts as jest.Mock).mockResolvedValue(mockProducts);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
});
```

#### Backend Testing

**API Tests:**
```typescript
// Example API test
import request from 'supertest';
import { app } from '../app';

describe('Products API', () => {
  it('GET /api/products returns user products', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
    
    expect(response.body).toHaveProperty('products');
    expect(Array.isArray(response.body.products)).toBe(true);
  });
  
  it('POST /api/products creates new product', async () => {
    const newProduct = {
      url: 'https://example.com/product',
      title: 'Test Product',
      priceGoal: 99.99
    };
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer valid-token')
      .send(newProduct)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Product');
  });
});
```

### Common Development Gotchas

#### Frontend Gotchas

**1. Chrome Extension Integration**
```typescript
// ❌ Wrong: Direct Chrome API usage without checks
chrome.runtime.sendMessage(extensionId, message);

// ✅ Correct: Check if Chrome APIs are available
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.sendMessage(extensionId, message);
}
```

**2. API Error Handling**
```typescript
// ❌ Wrong: No error handling
const products = await apiService.getProducts();

// ✅ Correct: Proper error handling
try {
  const products = await apiService.getProducts();
  setProducts(products);
} catch (error) {
  console.error('Failed to load products:', error);
  setError('Failed to load products. Please try again.');
}
```

**3. State Management**
```typescript
// ❌ Wrong: Mutating state directly
const updateProduct = (id: string, updates: Partial<Product>) => {
  products.find(p => p.id === id)!.status = updates.status;
  setProducts(products);
};

// ✅ Correct: Immutable state updates
const updateProduct = (id: string, updates: Partial<Product>) => {
  setProducts(prevProducts =>
    prevProducts.map(product =>
      product.id === id ? { ...product, ...updates } : product
    )
  );
};
```

#### Backend Gotchas

**1. Database Connection Handling**
```typescript
// ❌ Wrong: Not handling connection errors
const result = await db.query('SELECT * FROM products');

// ✅ Correct: Proper error handling
try {
  const result = await db.query('SELECT * FROM products');
  return result.rows;
} catch (error) {
  console.error('Database query failed:', error);
  throw new Error('Failed to fetch products');
}
```

**2. Authentication Middleware**
```typescript
// ❌ Wrong: Not validating token properly
const user = await verifyToken(req.headers.authorization);

// ✅ Correct: Comprehensive token validation
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'No valid token provided' });
}

try {
  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token);
  req.user = user;
  next();
} catch (error) {
  return res.status(401).json({ error: 'Invalid token' });
}
```

#### Chrome Extension Gotchas

**1. Manifest V3 Service Worker**
```typescript
// ❌ Wrong: Using background pages (Manifest V2)
chrome.backgroundPage.onMessage.addListener(callback);

// ✅ Correct: Using service workers (Manifest V3)
chrome.runtime.onMessage.addListener(callback);
```

**2. Content Script Injection**
```typescript
// ❌ Wrong: Not checking if script is already injected
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content.js']
});

// ✅ Correct: Check if script is already injected
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content.js']
}).catch(() => {
  // Script already injected or injection failed
});
```

### Performance Guidelines

#### Frontend Performance

**1. Code Splitting**
```typescript
// ✅ Correct: Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

**2. Memoization**
```typescript
// ✅ Correct: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return products.reduce((sum, product) => sum + product.price, 0);
}, [products]);

// ✅ Correct: Memoize callbacks
const handleProductUpdate = useCallback((id: string, updates: Partial<Product>) => {
  updateProduct(id, updates);
}, [updateProduct]);
```

**3. Image Optimization**
```typescript
// ✅ Correct: Lazy load images
<img 
  src={product.imageUrl} 
  alt={product.name}
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = '/placeholder-image.png';
  }}
/>
```

#### Backend Performance

**1. Database Query Optimization**
```typescript
// ❌ Wrong: N+1 query problem
const products = await db.query('SELECT * FROM products WHERE user_id = $1', [userId]);
for (const product of products.rows) {
  const alerts = await db.query('SELECT * FROM alerts WHERE product_id = $1', [product.id]);
  product.alerts = alerts.rows;
}

// ✅ Correct: Single query with JOIN
const result = await db.query(`
  SELECT p.*, a.id as alert_id, a.target_price, a.status as alert_status
  FROM products p
  LEFT JOIN alerts a ON p.id = a.product_id
  WHERE p.user_id = $1
`, [userId]);
```

**2. Caching**
```typescript
// ✅ Correct: Implement caching for expensive operations
const getCachedProducts = async (userId: string) => {
  const cacheKey = `products:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const products = await db.query('SELECT * FROM products WHERE user_id = $1', [userId]);
  await redis.setex(cacheKey, 300, JSON.stringify(products.rows)); // 5 min cache
  
  return products.rows;
};
```

### Security Guidelines

#### Frontend Security

**1. Input Validation**
```typescript
// ✅ Correct: Validate user input
const validateProductData = (data: any): ProductData => {
  if (!data.url || typeof data.url !== 'string') {
    throw new Error('Valid URL is required');
  }
  
  if (!data.title || typeof data.title !== 'string' || data.title.length > 255) {
    throw new Error('Valid title is required (max 255 characters)');
  }
  
  if (typeof data.priceGoal !== 'number' || data.priceGoal <= 0) {
    throw new Error('Valid price goal is required');
  }
  
  return data;
};
```

**2. XSS Prevention**
```typescript
// ✅ Correct: Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

// Use in components
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
```

#### Backend Security

**1. SQL Injection Prevention**
```typescript
// ❌ Wrong: String concatenation (SQL injection risk)
const query = `SELECT * FROM products WHERE user_id = ${userId}`;

// ✅ Correct: Parameterized queries
const query = 'SELECT * FROM products WHERE user_id = $1';
const result = await db.query(query, [userId]);
```

**2. Rate Limiting**
```typescript
// ✅ Correct: Implement rate limiting
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', apiLimiter);
```

### Documentation Guidelines

#### Code Documentation

**1. Function Documentation**
```typescript
/**
 * Calculates the total savings for a user based on their tracked products
 * @param products - Array of tracked products with price history
 * @param targetPrices - User's target prices for each product
 * @returns Object containing total savings amount and percentage
 * @throws {Error} When products array is empty or invalid
 * @example
 * const savings = calculateTotalSavings(products, targetPrices);
 * console.log(`You've saved $${savings.amount} (${savings.percentage}%)`);
 */
export const calculateTotalSavings = (
  products: Product[],
  targetPrices: Record<string, number>
): { amount: number; percentage: number } => {
  // Implementation
};
```

**2. Component Documentation**
```typescript
/**
 * ProductCard component displays product information and actions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Product} props.product - Product data to display
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {boolean} props.isLoading - Whether the component is in loading state
 * 
 * @example
 * <ProductCard
 *   product={product}
 *   onEdit={(product) => handleEdit(product)}
 *   onDelete={(id) => handleDelete(id)}
 *   isLoading={false}
 * />
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  isLoading
}) => {
  // Component implementation
};
```

#### README Documentation

**1. Component README**
```markdown
# ProductCard Component

## Overview
The ProductCard component displays product information in a card format with action buttons.

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| product | Product | Yes | Product data to display |
| onEdit | Function | Yes | Callback when edit button is clicked |
| onDelete | Function | Yes | Callback when delete button is clicked |
| isLoading | boolean | No | Whether the component is in loading state |

## Usage
```typescript
import { ProductCard } from './ProductCard';

<ProductCard
  product={product}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Styling
The component uses Tailwind CSS classes and can be customized via CSS variables.
```

### Getting Help

#### Resources

- **Documentation**: Check the individual component documentation
- **GitHub Issues**: Search existing issues or create new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Ask questions during the pull request review process

#### Contact

- **Maintainers**: @username1, @username2
- **Email**: dev@dealpop.co
- **Discord**: [DealPop Discord Server](https://discord.gg/dealpop)

### Recognition

Contributors are recognized in:
- **README**: Listed in the contributors section
- **Release Notes**: Mentioned in release announcements
- **GitHub**: Shown in the contributors graph

Thank you for contributing to DealPop! 🎉
