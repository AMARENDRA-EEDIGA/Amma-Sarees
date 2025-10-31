# Ama Sarees - Complete Saree Shop Management System

🚀 **Production-ready, full-stack saree shop management system** designed for textile businesses. Manage inventory, customers, orders, and payments with a beautiful, responsive interface.

## ✨ Key Features

### 📦 **Inventory Management**
- Complete saree catalog with categories (Silk, Cotton, Georgette, Designer)
- Real-time stock tracking and low-stock alerts
- Image management and product descriptions
- Advanced search and filtering

### 👥 **Customer Management**
- Customer database with contact information
- Order history tracking
- Customer analytics and insights

### 🛒 **Order Processing**
- Multi-item order creation
- Payment tracking (partial/full payments)
- Order status management (Pending, Partial, Paid, Cancelled)
- **Order cancellation with automatic stock restoration**
- PDF invoice generation

### 📊 **Business Analytics**
- Sales reports and revenue tracking
- Category-wise performance analysis
- Real-time dashboard with key metrics

### 📱 **Responsive Design**
- **Mobile-optimized** navigation and layouts
- **Tablet-friendly** interface adjustments
- **Desktop-first** experience with full features

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
- **jsPDF** for invoice generation

### **Backend**
- **Django 5.1** REST API
- **Django REST Framework**
- **SQLite** database
- **CORS** enabled for frontend integration

## 📱 Device Compatibility

✅ **Mobile (320px-768px)** - Bottom navigation, horizontal scroll tables, touch-optimized
✅ **Tablet (768px-1024px)** - Adaptive layouts, proper spacing
✅ **Desktop (1024px+)** - Full sidebar navigation, multi-column layouts

## 🚀 Deployment

### **Frontend**
```bash
npm run build
# Deploy to Vercel, Netlify, or any static hosting
```

### **Backend**
```bash
# Deploy to Railway, Heroku, or DigitalOcean
# See backend/README.md for detailed instructions
```

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎯 Production Ready

This application is **production-ready** with:
- ✅ Complete CRUD operations
- ✅ Responsive design for all devices
- ✅ Order cancellation workflow
- ✅ Error handling and validation
- ✅ PDF invoice generation
- ✅ Real-time stock management
- ✅ Business analytics and reporting

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
│   │   └── ...
│   ├── contexts/          # State management
│   │   └── AppContext.tsx # Global app state
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities
├── backend/               # Django REST API
│   ├── api/              # API endpoints
│   ├── models.py         # Database models
│   └── views.py          # API views
├── public/               # Static assets
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

