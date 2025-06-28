# DealPop Frontend

A modern React application built with Vite, TypeScript, and Tailwind CSS for displaying product deals and tracking prices.

## Features

- 🚀 Built with Vite for fast development and building
- ⚛️ React 18 with TypeScript for type safety
- 🎨 Tailwind CSS for styling with custom theme
- 📱 Responsive design with mobile-first approach
- 🔄 Hot module replacement for development

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dealpop-frontend-styled
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
dealpop-frontend-styled/
├── src/
│   ├── components/
│   │   └── ProductCard.tsx    # Product card component
│   ├── styles/
│   │   └── theme.css         # Custom CSS variables
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles with Tailwind
├── tailwind.config.ts        # Tailwind CSS configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
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

## Environment Variables

To enable Auth0 authentication, create a `.env` file in the project root with the following variables:

```env
VITE_ENABLE_AUTH=true
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_API_IDENTIFIER=your-auth0-api-identifier
```

- Replace the values with your actual Auth0 credentials.
- After updating the `.env` file, restart the development server.

If you set `VITE_ENABLE_AUTH=false`, authentication will be disabled.

## License

This project is licensed under the MIT License. 