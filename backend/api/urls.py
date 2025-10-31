from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SareeViewSet, CustomerViewSet, OrderViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'sarees', SareeViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]