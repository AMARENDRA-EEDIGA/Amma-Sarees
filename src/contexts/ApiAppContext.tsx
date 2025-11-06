import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, ApiSaree, ApiCustomer, ApiOrder, ApiPayment } from '../services/api';

export interface Saree {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  notes: string;
  image?: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface OrderItem {
  sareeId: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Other';
  date: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  payments: Payment[];
  status: 'Pending' | 'Partial' | 'Paid' | 'Cancelled';
  date: string;
  notes?: string;
}

interface AppContextType {
  sarees: Saree[];
  customers: Customer[];
  orders: Order[];
  loading: boolean;
  addSaree: (saree: Omit<Saree, 'id'>) => Promise<void>;
  updateSaree: (id: string, saree: Partial<Saree>) => Promise<void>;
  deleteSaree: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  addPayment: (orderId: string, payment: Omit<Payment, 'id'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  cancelOrder?: (orderId: string) => Promise<void>;
  deleteOrder?: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Transform API data to frontend format
const transformSaree = (apiSaree: ApiSaree): Saree => ({
  id: apiSaree.id,
  name: apiSaree.name,
  category: apiSaree.category,
  price: apiSaree.price,
  stock: apiSaree.stock,
  notes: apiSaree.notes,
  image: apiSaree.image,
  description: apiSaree.description || apiSaree.notes,
});

const transformCustomer = (apiCustomer: ApiCustomer): Customer => ({
  id: apiCustomer.id,
  name: apiCustomer.name,
  phone: apiCustomer.phone,
  address: apiCustomer.address,
  notes: apiCustomer.notes,
});

const transformOrder = (apiOrder: ApiOrder): Order => ({
  id: apiOrder.id,
  customerId: apiOrder.customer,
  items: apiOrder.items.map(item => ({
    sareeId: item.saree,
    quantity: item.quantity,
    price: item.price,
  })),
  totalAmount: apiOrder.total_amount,
  paidAmount: apiOrder.paid_amount,
  dueAmount: apiOrder.due_amount,
  payments: apiOrder.payments.map(payment => ({
    id: payment.id,
    amount: payment.amount,
    method: payment.method,
    date: payment.date,
    notes: payment.notes,
  })),
  status: apiOrder.status,
  date: apiOrder.date,
  notes: apiOrder.notes,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Fetch sarees
      try {
        const sareesResponse = await apiService.getSarees();
        const sareesData = sareesResponse?.results || sareesResponse || [];
        setSarees(Array.isArray(sareesData) ? sareesData.map(transformSaree) : []);
      } catch (error) {
        console.error('Error fetching sarees:', error);
        setSarees([]);
      }
      
      // Fetch customers
      try {
        const customersResponse = await apiService.getCustomers();
        const customersData = customersResponse?.results || customersResponse || [];
        setCustomers(Array.isArray(customersData) ? customersData.map(transformCustomer) : []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      }
      
      // Fetch orders
      try {
        const ordersResponse = await apiService.getOrders();
        const ordersData = ordersResponse?.results || ordersResponse || [];
        setOrders(Array.isArray(ordersData) ? ordersData.map(transformOrder) : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addSaree = async (sareeData: Omit<Saree, 'id'>) => {
    try {
      const newSaree = await apiService.createSaree(sareeData);
      setSarees(prev => [...prev, transformSaree(newSaree)]);
    } catch (error) {
      console.error('Error adding saree:', error);
      throw error;
    }
  };

  const updateSaree = async (id: string, sareeData: Partial<Saree>) => {
    try {
      const updatedSaree = await apiService.updateSaree(id, sareeData);
      setSarees(prev => prev.map(saree => 
        saree.id === id ? transformSaree(updatedSaree) : saree
      ));
    } catch (error) {
      console.error('Error updating saree:', error);
      throw error;
    }
  };

  const deleteSaree = async (id: string) => {
    try {
      await apiService.deleteSaree(id);
      setSarees(prev => prev.filter(saree => saree.id !== id));
    } catch (error) {
      console.error('Error deleting saree:', error);
      throw error;
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await apiService.createCustomer(customerData);
      setCustomers(prev => [...prev, transformCustomer(newCustomer)]);
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const updatedCustomer = await apiService.updateCustomer(id, customerData);
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? transformCustomer(updatedCustomer) : customer
      ));
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await apiService.deleteCustomer(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      const apiOrderData = {
        customer: orderData.customerId,
        total_amount: orderData.totalAmount,
        paid_amount: orderData.paidAmount,
        due_amount: orderData.dueAmount,
        status: orderData.status,
        notes: orderData.notes,
        items: orderData.items.map(item => ({
          saree: item.sareeId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const newOrder = await apiService.createOrder(apiOrderData);
      setOrders(prev => [...prev, transformOrder(newOrder)]);
      
      // Refresh sarees to get updated stock
      const sareesResponse = await apiService.getSarees();
      setSarees(sareesResponse.results.map(transformSaree));
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const addPayment = async (orderId: string, paymentData: Omit<Payment, 'id'>) => {
    try {
      await apiService.addPayment(orderId, {
        amount: paymentData.amount,
        method: paymentData.method,
        notes: paymentData.notes,
      });
      
      // Refresh orders to get updated payment info
      const ordersResponse = await apiService.getOrders();
      setOrders(ordersResponse.results.map(transformOrder));
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await apiService.cancelOrder(orderId);
      await refreshData();
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await apiService.deleteOrder(id);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    sarees,
    customers,
    orders,
    loading,
    addSaree,
    updateSaree,
    deleteSaree,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    addPayment,
    updateOrderStatus,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};