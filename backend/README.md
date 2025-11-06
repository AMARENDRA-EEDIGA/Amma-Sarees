# Ama Sarees - Backend API

🚀 **Production-ready Django REST API** for saree shop management system.

## 🏃‍♂️ Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup database
python manage.py migrate

# 3. Setup authentication
python setup_auth.py

# 4. Load sample data (optional)
python manage.py populate_data

# 5. Start server
python manage.py runserver 8000
```

**🌐 API Base URL:** `http://localhost:8000`

## 🔑 Demo Accounts

**Admin User:**
- Email: `admin@amarees.com`
- Password: `admin123`
- Access: Full API access

**Customer User:**
- Email: `demo@customer.com`
- Password: `demo123`
- Access: Limited to customer operations

## API Endpoints

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `GET /auth/user/` - Get current user info

### Sarees
- `GET /sarees/` - List all sarees (with pagination, filtering, search)
- `POST /sarees/` - Create new saree
- `GET /sarees/{id}/` - Get saree details
- `PUT /sarees/{id}/` - Update saree
- `DELETE /sarees/{id}/` - Delete saree

**Filters:** `?category=Silk&search=banarasi&ordering=-price`

### Customers
- `GET /customers/` - List all customers
- `POST /customers/` - Create new customer
- `GET /customers/{id}/` - Get customer details
- `PUT /customers/{id}/` - Update customer
- `DELETE /customers/{id}/` - Delete customer

### Orders
- `GET /orders/` - List all orders
- `POST /orders/` - Create new order
- `GET /orders/{id}/` - Get order details
- `PUT /orders/{id}/` - Update order
- `DELETE /orders/{id}/` - Delete order
- `POST /orders/{id}/add_payment/` - Add payment to order
- `POST /orders/{id}/cancel_order/` - Cancel order (restores stock)

### Payments
- `GET /payments/` - List all payments
- `POST /payments/` - Create new payment
- `GET /payments/{id}/` - Get payment details
- `PUT /payments/{id}/` - Update payment
- `DELETE /payments/{id}/` - Delete payment

## ✨ Key Features

- **JWT Authentication** with role-based access control
- **CORS enabled** for frontend integration
- **Pagination** (20 items per page)
- **Advanced filtering & search** on all endpoints
- **Automatic stock management** (deduct on order, restore on cancel)
- **Payment tracking** with order status automation
- **UUID primary keys** for enhanced security
- **Real-time order cancellation** with stock restoration
- **Input validation** and error handling
- **Customer profile auto-creation**
- **Demo data population**

## 🚀 Production Deployment

### Environment Variables
```bash
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=your-database-url
```

## 📊 Sample Data

The `populate_data` command creates:
- 3 sample sarees (different categories)
- 2 sample customers
- Demo user accounts (admin and customer)
- Ready-to-test environment

The `setup_auth.py` script creates:
- Admin user: admin@amarees.com / admin123
- Demo customer: demo@customer.com / demo123
- Proper authentication setup