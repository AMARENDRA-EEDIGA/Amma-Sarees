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

# 3. Load sample data (optional)
python manage.py populate_data

# 4. Start server
python manage.py runserver 8000
```

**🌐 API Base URL:** `http://localhost:8000`

## API Endpoints

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

- **CORS enabled** for frontend integration
- **Pagination** (20 items per page)
- **Advanced filtering & search** on all endpoints
- **Automatic stock management** (deduct on order, restore on cancel)
- **Payment tracking** with order status automation
- **UUID primary keys** for enhanced security
- **Real-time order cancellation** with stock restoration
- **Input validation** and error handling

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
- Ready-to-test environment