from rest_framework import serializers
from .models import Saree, Customer, Order, OrderItem, Payment

class SareeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Saree
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    saree_name = serializers.CharField(source='saree.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'saree', 'saree_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['customer', 'total_amount', 'paid_amount', 'due_amount', 'status', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            # Update saree stock
            saree = item_data['saree']
            saree.stock -= item_data['quantity']
            saree.save()
        
        return order