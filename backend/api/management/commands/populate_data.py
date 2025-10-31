from django.core.management.base import BaseCommand
from api.models import Saree, Customer

class Command(BaseCommand):
    help = 'Populate initial data'

    def handle(self, *args, **options):
        # Create initial sarees
        sarees_data = [
            {
                'name': 'Banarasi Silk Saree',
                'category': 'Silk',
                'price': 12500,
                'stock': 3,
                'notes': 'Pure Banarasi silk with golden zari work',
                'description': 'Pure Banarasi silk with golden zari work',
                'image': 'https://plus.unsplash.com/premium_photo-1669977749819-d8737b4408f7?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmFuYXJhc2klMjBzYXJlZXxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000'
            },
            {
                'name': 'Cotton Handloom Saree',
                'category': 'Cotton',
                'price': 2800,
                'stock': 8,
                'notes': 'Handwoven cotton with traditional motifs',
                'description': 'Handwoven cotton with traditional motifs',
                'image': 'https://images.unsplash.com/photo-1610030469668-8e9f641aaf27?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNhcmVlc3xlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000'
            },
            {
                'name': 'Designer Party Wear',
                'category': 'Partywear',
                'price': 8900,
                'stock': 2,
                'notes': 'Elegant designer saree for special occasions',
                'description': 'Elegant designer saree for special occasions',
                'image': 'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2VkZGluZyUyMHNhcmVlfGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=60&w=3000'
            }
        ]

        for saree_data in sarees_data:
            saree, created = Saree.objects.get_or_create(
                name=saree_data['name'],
                defaults=saree_data
            )
            if created:
                self.stdout.write(f'Created saree: {saree.name}')

        # Create initial customers
        customers_data = [
            {
                'name': 'Priya Sharma',
                'phone': '+91 98765 43210',
                'address': 'Krishna Nagar, Delhi',
                'notes': 'Prefers silk sarees'
            },
            {
                'name': 'Anita Patel',
                'phone': '+91 87654 32109',
                'address': 'Satellite, Ahmedabad',
                'notes': 'Regular customer'
            }
        ]

        for customer_data in customers_data:
            customer, created = Customer.objects.get_or_create(
                name=customer_data['name'],
                defaults=customer_data
            )
            if created:
                self.stdout.write(f'Created customer: {customer.name}')

        self.stdout.write(self.style.SUCCESS('Successfully populated initial data'))