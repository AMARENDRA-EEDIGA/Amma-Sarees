# Ama Saree - Technical Architecture Documentation

## Project Overview

Ama Saree is a comprehensive saree shop management system designed to streamline inventory management, customer tracking, and order processing. The application provides an intuitive interface for managing saree collections, tracking customer information, processing orders with payment tracking, and generating business reports.

**Key Highlights:**
- Full-stack application with React frontend and Django backend
- Role-based authentication (Admin/Customer)
- Real-time inventory management with stock tracking
- Complete order lifecycle management
- PWA support for mobile experience
- Production-ready deployment configuration

## Technology Stack

### Core Technologies
- **React 18.3.1** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe development with improved developer experience
- **Vite** - Next-generation frontend tooling for fast development and optimized builds
- **React Router DOM 6.30.1** - Client-side routing for single-page application navigation

### UI Framework & Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality, accessible component library built on Radix UI
- **Radix UI Primitives** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful & consistent icon library
- **class-variance-authority** - Type-safe component variants

### State Management & Data
- **React Context API** - Global state management for sarees, customers, and orders
- **AuthContext** - Authentication and user session management
- **TanStack Query (React Query)** - Server state management and caching (ready for future API integration)
- **LocalStorage** - Persistent storage for demo data and user sessions

### Data Visualization & Reporting
- **Recharts 2.15.4** - Composable charting library for reports and analytics
- **date-fns 3.6.0** - Modern date utility library

### Form Handling & Validation
- **React Hook Form 7.61.1** - Performant form management with minimal re-renders
- **Zod 3.25.76** - TypeScript-first schema validation

### Additional Features
- **jsPDF 3.0.1** - Client-side PDF generation for reports and invoices
- **Sonner** - Beautiful toast notifications
- **Embla Carousel** - Touch-friendly carousel component
- **PWA Support** - Service worker for offline capabilities
- **WhatsApp Integration** - Direct sharing of product catalogs

## Architecture Design

### Application Architecture Pattern

The project follows a **Component-Based Architecture** with **Context-Driven State Management**:

```
┌─────────────────────────────────────────────────────────┐
│                     Application Layer                    │
│  (App.tsx - Routing, Providers, Global Configuration)   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Context    │    │   Layout     │    │   Routing    │
│   Providers  │    │  Components  │    │   System     │
│  (AppContext)│    │  (Layout)    │    │ (React Router)│
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
        ┌─────────────────────────────────────┐
        │         Page Components             │
        │  (Dashboard, Catalog, Orders, etc.) │
        └─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Feature    │    │  UI/Shared   │    │   Utilities  │
│  Components  │    │  Components  │    │   & Hooks    │
│(Cards, Forms)│    │  (shadcn/ui) │    │  (lib/utils) │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interaction                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Page Components                         │
│            (Dashboard, Orders, Catalog)                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   useApp() Hook                          │
│          (Consumes AppContext for state & actions)       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   AppContext Provider                    │
│  - State: sarees[], customers[], orders[]                │
│  - Actions: addSaree, updateOrder, deleteCustomer, etc.  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Local State (useState)                  │
│           (Currently mock data, ready for API)           │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
ama-saree/
├── public/                      # Static assets served directly
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO crawler instructions
│   └── service-worker.js       # PWA service worker
│
├── src/
│   ├── assets/                 # Image and media assets
│   │   ├── hero-sarees.jpg     # Hero image for landing
│   │   └── paisley-logo.png    # Brand logo
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components (35+ components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── Layout.tsx          # Main layout with sidebar navigation
│   │   ├── QuickActionCard.tsx # Dashboard action cards
│   │   └── StatsCard.tsx       # Dashboard statistics cards
│   │
│   ├── contexts/               # React Context for state management
│   │   └── AppContext.tsx      # Global app state and actions
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx      # Responsive mobile detection
│   │   └── use-toast.ts        # Toast notification hook
│   │
│   ├── lib/                    # Utility functions
│   │   └── utils.ts            # Helper functions (cn, etc.)
│   │
│   ├── pages/                  # Route-level page components
│   │   ├── Dashboard.tsx       # Main dashboard with stats
│   │   ├── Catalog.tsx         # Saree catalog listing
│   │   ├── AddSaree.tsx        # Add/edit saree form
│   │   ├── Customers.tsx       # Customer management
│   │   ├── Orders.tsx          # Order processing
│   │   ├── Reports.tsx         # Business analytics
│   │   ├── Index.tsx           # Landing page
│   │   └── NotFound.tsx        # 404 error page
│   │
│   ├── App.tsx                 # Root component with providers
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global styles and design tokens
│   └── vite-env.d.ts           # Vite TypeScript declarations
│
├── ARCHITECTURE.md             # This file
├── README.md                   # Project documentation
├── tailwind.config.ts          # Tailwind CSS configuration
├── vite.config.ts              # Vite build configuration
└── tsconfig.json               # TypeScript configuration
```

## Core Components & Responsibilities

### 1. Application Layer (`App.tsx`)
**Responsibility**: Application initialization, provider setup, routing configuration

```typescript
- QueryClientProvider: TanStack Query setup
- TooltipProvider: Global tooltip context
- AppProvider: Global state management
- BrowserRouter: Client-side routing
- Layout: Application shell with navigation
```

### 2. Context Layer (`AppContext.tsx`)
**Responsibility**: Centralized state management for business entities

**State Managed**:
- `sarees[]`: Saree inventory with details (name, category, price, stock, images)
- `customers[]`: Customer database with contact and address information
- `orders[]`: Order tracking with items, payments, and status

**Actions Provided**:
- Saree Management: `addSaree`, `updateSaree`, `deleteSaree`
- Customer Management: `addCustomer`, `updateCustomer`, `deleteCustomer`
- Order Management: `addOrder`, `updateOrder`, `deleteOrder`, `addPayment`

### 3. Layout Component (`Layout.tsx`)
**Responsibility**: Application shell with navigation and responsive design

Features:
- Collapsible sidebar with navigation links
- Mobile-responsive with sheet overlay
- Persistent navigation state
- Theme-aware styling

### 4. Page Components

#### Dashboard (`Dashboard.tsx`)
- Overview statistics (total sarees, customers, orders, revenue)
- Quick action cards (Add Saree, New Order, View Catalog)
- Recent activity summary

#### Catalog (`Catalog.tsx`)
- Searchable saree listing
- Category filtering (Silk, Cotton, Georgette, Designer)
- Stock status indicators
- WhatsApp sharing integration
- Responsive grid layout

#### AddSaree (`AddSaree.tsx`)
- Form-based saree entry
- Image upload and preview
- Category and stock management
- Form validation with React Hook Form + Zod

#### Customers (`Customers.tsx`)
- Customer database table
- CRUD operations
- Search and filter capabilities
- Contact information management

#### Orders (`Orders.tsx`)
- Order creation and tracking
- Multi-item order support
- Payment tracking (partial/full)
- Order status management
- PDF generation for invoices

#### Reports (`Reports.tsx`)
- Sales analytics with charts
- Revenue tracking
- Category-wise performance
- Date range filtering
- Data visualization with Recharts

### 5. UI Component Library (`components/ui/`)
**Responsibility**: Reusable, accessible, themed components

Built on **shadcn/ui** + **Radix UI** foundation:
- Form controls: Button, Input, Select, Checkbox, Radio, Switch
- Data display: Table, Card, Badge, Avatar, Separator
- Overlays: Dialog, Sheet, Popover, Tooltip, Dropdown Menu
- Feedback: Toast, Alert, Progress, Skeleton
- Navigation: Tabs, Accordion, Breadcrumb, Navigation Menu
- Advanced: Calendar, Carousel, Chart, Command Palette

## Design System Architecture

### Color System (HSL-based)
Defined in `index.css` with CSS custom properties:

```css
:root {
  --background: [primary background]
  --foreground: [primary text]
  --card: [card background]
  --primary: [brand color]
  --secondary: [secondary actions]
  --accent: [highlights]
  --destructive: [errors/warnings]
  --muted: [subtle elements]
  --border: [dividers]
  --ring: [focus indicators]
}
```

### Component Variants
Using `class-variance-authority` for type-safe variants:

```typescript
buttonVariants = cva("base-styles", {
  variants: {
    variant: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    size: ["default", "sm", "lg", "icon"]
  }
})
```

### Responsive Design
Mobile-first approach with Tailwind breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## State Management Strategy

### Current Implementation: Context API
**Why Context API?**
- Simple, built-in React solution
- Sufficient for current app size
- No external dependencies for state
- Easy to understand and maintain

**Structure**:
```typescript
interface AppContextType {
  // State
  sarees: Saree[];
  customers: Customer[];
  orders: Order[];
  
  // Actions
  addSaree: (saree: Omit<Saree, "id">) => void;
  updateSaree: (id: string, updates: Partial<Saree>) => void;
  // ... more actions
}
```

### Future Scalability
As the app grows, consider:
1. **TanStack Query** - Already installed, ready for API integration
2. **Zustand** - For more complex client state
3. **Redux Toolkit** - If enterprise-level state management needed

## Routing Architecture

### Route Structure
```
/                    → Dashboard (overview, stats, quick actions)
/catalog             → Saree catalog (browse, search, filter)
/add-saree           → Add new saree form
/customers           → Customer management
/orders              → Order processing
/reports             → Business analytics
*                    → 404 Not Found
```

### Navigation Flow
```
Landing/Dashboard ──┬─→ Catalog ──→ Add Saree
                    ├─→ Customers
                    ├─→ Orders
                    └─→ Reports
```

## Data Models

### Saree Entity
```typescript
interface Saree {
  id: string;
  name: string;
  description: string;
  category: "Silk" | "Cotton" | "Georgette" | "Designer";
  price: number;
  stock: number;
  image?: string;
}
```

### Customer Entity
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}
```

### Order Entity
```typescript
interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  date: string;
  status: "pending" | "completed" | "cancelled";
  payments: Payment[];
}
```

## Development Workflow

### Development Server
```bash
npm run dev      # Start Vite dev server on port 8080
```

### Build Process
```bash
npm run build    # TypeScript compilation + Vite production build
npm run preview  # Preview production build
```

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting (configured)
- **Vite HMR**: Hot module replacement for instant updates

## Performance Considerations

### Current Optimizations
1. **Code Splitting**: React Router lazy loading ready
2. **Component Memoization**: Using React.memo where beneficial
3. **Image Optimization**: Vite asset handling
4. **Tree Shaking**: Vite automatically removes unused code
5. **CSS Purging**: Tailwind purges unused styles in production

### Future Optimizations
1. **Virtual Scrolling**: For large lists (react-window)
2. **Image CDN**: For saree images
3. **Service Worker**: PWA already configured
4. **Bundle Analysis**: Use Vite bundle analyzer

## Security Considerations

### Current Implementation
- Client-side only (no backend yet)
- Input validation with Zod schemas
- XSS protection via React's escaping
- Type safety via TypeScript

### Future Backend Integration
When integrating Lovable Cloud or external backend:
1. **Authentication**: JWT or session-based auth
2. **Authorization**: Role-based access control
3. **Data Validation**: Server-side validation
4. **HTTPS Only**: Secure communication
5. **CORS Configuration**: Proper origin whitelisting
6. **Rate Limiting**: API throttling
7. **SQL Injection Prevention**: Parameterized queries

## Testing Strategy

### Recommended Testing Approach
```
1. Unit Tests (Vitest)
   - Utils functions
   - Custom hooks
   - Context logic

2. Component Tests (React Testing Library)
   - UI component behavior
   - User interactions
   - Form validation

3. Integration Tests
   - Page workflows
   - Context + Component integration

4. E2E Tests (Playwright/Cypress)
   - Critical user journeys
   - Order creation flow
   - Report generation
```

## Deployment Architecture

### Current Deployment: Lovable Platform
- One-click deployment via Lovable
- Automatic builds on push
- Staging environment: `*.lovable.app`
- Custom domain support available

### Alternative Deployment Options
1. **Vercel**: Optimal for React/Vite apps
2. **Netlify**: Simple, built-in forms
3. **AWS S3 + CloudFront**: Scalable, cost-effective
4. **GitHub Pages**: Free for public repos

## Future Enhancements Roadmap

### Phase 1: Backend Integration
- [ ] Enable Lovable Cloud
- [ ] Migrate to database storage
- [ ] User authentication system
- [ ] API endpoints for CRUD operations

### Phase 2: Advanced Features
- [ ] Real-time inventory updates
- [ ] Email notifications
- [ ] SMS integration
- [ ] Payment gateway integration (Stripe/Razorpay)

### Phase 3: Analytics & Optimization
- [ ] Advanced reporting dashboard
- [ ] Predictive analytics
- [ ] Customer segmentation
- [ ] A/B testing framework

### Phase 4: Mobile Experience
- [ ] PWA enhancements
- [ ] Offline support
- [ ] Push notifications
- [ ] Mobile-specific optimizations

### Phase 5: Multi-tenant Support
- [ ] Multiple shop support
- [ ] Role-based permissions
- [ ] Shop analytics
- [ ] Inter-shop inventory transfer

## Developer Guidelines

### Code Style
- **Functional Components**: Use function declarations
- **TypeScript**: Explicit types, avoid `any`
- **Naming**: PascalCase for components, camelCase for functions
- **File Organization**: One component per file
- **Imports**: Absolute imports with `@/` alias

### Component Creation Pattern
```typescript
// 1. Import dependencies
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Define types
interface ComponentProps {
  // props
}

// 3. Component function
const Component = ({ prop }: ComponentProps) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleAction = () => {};
  
  // 6. Render
  return <div>...</div>;
};

// 7. Export
export default Component;
```

### Context Usage Pattern
```typescript
// In component:
import { useApp } from "@/contexts/AppContext";

const Component = () => {
  const { sarees, addSaree } = useApp();
  // Use state and actions
};
```

## Troubleshooting Guide

### Common Issues

**Build Errors**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

**Styling Issues**
- Verify Tailwind config includes all content paths
- Check CSS custom property definitions in `index.css`
- Ensure design tokens match between light/dark modes

**Routing Issues**
- Verify route order (specific before wildcard)
- Check `BrowserRouter` vs `HashRouter` for deployment
- Ensure `index.html` base tag is correct

## Conclusion

The Ama Saree project is built with modern, scalable technologies and follows best practices for React application development. The architecture is designed to:

1. **Scale**: From prototype to production with minimal refactoring
2. **Maintain**: Clear separation of concerns and modular structure
3. **Extend**: Easy to add new features and integrate backend services
4. **Perform**: Optimized build process and runtime performance
5. **Develop**: Excellent developer experience with TypeScript and HMR

The current implementation focuses on a solid frontend foundation, ready for backend integration when needed. The component-based architecture and context-driven state management provide flexibility for future enhancements while maintaining code quality and maintainability.
