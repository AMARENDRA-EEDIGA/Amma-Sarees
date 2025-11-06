# Ama Sarees - Complete Saree Shop Management System

🚀 **Production-ready, full-stack saree shop management system** designed for textile businesses. Manage inventory, customers, orders, and payments with a beautiful, responsive interface.

## ✨ Key Features

### 🔐 **Authentication System**
- Role-based access control (Admin/Customer)
- Secure login with demo accounts
- Customer profile auto-creation
- Session management

### 📦 **Inventory Management**
- Complete saree catalog with categories (Silk, Cotton, Georgette, Designer)
- Real-time stock tracking and low-stock alerts
- Image management and product descriptions
- Advanced search and filtering
- WhatsApp sharing integration

### 👥 **Customer Management**
- Customer database with contact information
- Order history tracking
- Customer analytics and insights
- Customer registration and profile management

### 🛒 **Order Processing**
- Multi-item order creation
- Payment tracking (partial/full payments)
- Order status management (Pending, Partial, Paid, Cancelled)
- **Order cancellation with automatic stock restoration**
- PDF invoice generation
- Customer-specific order views

### 📊 **Business Analytics**
- Sales reports and revenue tracking
- Category-wise performance analysis
- Real-time dashboard with key metrics
- Customer analytics

### 📱 **Responsive Design**
- **Mobile-optimized** navigation and layouts
- **Tablet-friendly** interface adjustments
- **Desktop-first** experience with full features
- Progressive Web App (PWA) support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for backend)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup (Optional)
```bash
# Run setup script
setup_backend.bat

# Start Django server
cd backend
python manage.py runserver 8000
```

## 🛠 Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Context** for state management
- **jsPDF** for invoice generation
- **PWA** with service worker

### **Backend**
- **Django 5.1** REST API
- **Django REST Framework**
- **SQLite** database (PostgreSQL ready)
- **JWT Authentication**
- **CORS** enabled for frontend integration
- **Auto-deployment** ready

## 📱 Device Compatibility

✅ **Mobile (320px-768px)** - Bottom navigation, horizontal scroll tables, touch-optimized
✅ **Tablet (768px-1024px)** - Adaptive layouts, proper spacing
✅ **Desktop (1024px+)** - Full sidebar navigation, multi-column layouts

## 🚀 Deployment

### **Quick Deploy**
- **Backend**: Deploy to [Render](https://render.com) (Free tier available)
- **Frontend**: Deploy to [Vercel](https://vercel.com) (Free tier available)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repositories to Render (backend) and Vercel (frontend)
# 3. Set environment variables (see DEPLOYMENT.md)
# 4. Deploy automatically!
```

**📖 Full deployment guide**: See `DEPLOYMENT.md`

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔑 Demo Accounts

**Admin Access** (Full Management)
- Email: `admin@amarees.com`
- Password: `admin123`
- Features: Complete inventory, customer, and order management

**Customer Access** (Order & Profile Management)
- Email: `demo@customer.com`
- Password: `demo123`
- Features: View catalog, place orders, track order history

## 🎯 Production Ready

This application is **production-ready** with:
- ✅ Authentication & authorization system
- ✅ Complete CRUD operations
- ✅ Responsive design for all devices
- ✅ Order cancellation workflow
- ✅ Error handling and validation
- ✅ PDF invoice generation
- ✅ Real-time stock management
- ✅ Business analytics and reporting
- ✅ PWA support with offline capabilities

## 📁 Project Structure

```
ama-saree-suite/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Layout.tsx     # Main layout with navigation
│   │   └── ...
│   ├── pages/             # Route-level pages
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── Catalog.tsx    # Saree catalog
│   │   ├── Orders.tsx     # Order management
│   │   ├── Login.tsx      # Authentication
│   │   └── ...
│   ├── contexts/          # State management
│   │   ├── AppContext.tsx # Global app state
│   │   └── AuthContext.tsx# Authentication state
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── lib/               # Utilities
├── backend/               # Django REST API
│   ├── api/              # API endpoints
│   ├── models.py         # Database models
│   ├── views.py          # API views
│   └── setup_auth.py     # Authentication setup
├── public/               # Static assets & PWA
└── docs/                 # Documentation
```

## 📚 Documentation

- `ARCHITECTURE.md` - Technical architecture details
- `BACKEND_INTEGRATION.md` - API integration guide
- `backend/README.md` - Backend setup and deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for textile businesses worldwide**

