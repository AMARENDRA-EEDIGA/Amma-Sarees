from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from .models import Saree, Customer, Order, OrderItem, Payment
from .serializers import (
    SareeSerializer, CustomerSerializer, OrderSerializer, 
    OrderCreateSerializer, OrderItemSerializer, PaymentSerializer
)

class SareeViewSet(viewsets.ModelViewSet):
    queryset = Saree.objects.all()
    serializer_class = SareeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'category', 'notes']
    ordering_fields = ['name', 'price', 'stock', 'created_at']
    ordering = ['-created_at']

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'phone', 'address']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('customer').prefetch_related('items', 'payments')
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'customer']
    ordering_fields = ['date', 'total_amount']
    ordering = ['-date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        order = self.get_object()
        serializer = PaymentSerializer(data=request.data)
        
        if serializer.is_valid():
            payment = serializer.save(order=order)
            
            # Update order amounts and status
            order.paid_amount += payment.amount
            order.due_amount = order.total_amount - order.paid_amount
            
            if order.paid_amount >= order.total_amount:
                order.status = 'Paid'
            elif order.paid_amount > 0:
                order.status = 'Partial'
            
            order.save()
            
            return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        
        if order.status == 'Cancelled':
            return Response({'error': 'Order is already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        
        if order.paid_amount > 0:
            return Response({'error': 'Cannot cancel order with payments. Please refund payments first.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Restore stock for all items in the order
        for item in order.items.all():
            saree = item.saree
            saree.stock += item.quantity
            saree.save()
        
        # Update order status
        order.status = 'Cancelled'
        order.save()
        
        return Response({'message': 'Order cancelled successfully'}, status=status.HTTP_200_OK)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['method', 'order']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']