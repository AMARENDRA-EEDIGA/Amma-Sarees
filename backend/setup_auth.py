#!/usr/bin/env python
"""
Setup script for Ama Sarees authentication system
This script creates the necessary database migrations and sets up initial admin user
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ama_saree_backend.settings')

# Setup Django
django.setup()

def setup_auth():
    """Setup authentication system"""
    print("🔧 Setting up Ama Sarees authentication system...")
    
    # Create migrations
    print("📝 Creating migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    # Apply migrations
    print("🔄 Applying migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create superuser
    print("👤 Creating admin user...")
    from api.models import User
    
    # Check if admin user already exists
    if not User.objects.filter(email='admin@amarees.com').exists():
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@amarees.com',
            password='admin123',
            name='Admin User',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"✅ Admin user created: {admin_user.email}")
    else:
        print("ℹ️  Admin user already exists")
    
    # Create sample customer user
    if not User.objects.filter(email='customer@example.com').exists():
        customer_user = User.objects.create_user(
            username='customer',
            email='customer@example.com',
            password='customer123',
            name='Customer User',
            role='customer'
        )
        print(f"✅ Customer user created: {customer_user.email}")
    else:
        print("ℹ️  Customer user already exists")
    
    print("\n🎉 Authentication setup complete!")
    print("\n📋 Login Credentials:")
    print("Admin: admin@amarees.com / admin123")
    print("Customer: customer@example.com / customer123")

if __name__ == '__main__':
    setup_auth()