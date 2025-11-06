import React, { createContext, useContext, useState, useEffect, ReactNode, startTransition } from 'react';
import { useAuth } from './AuthContext';

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
  email?: string;
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
  cancelOrder: (orderId: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const createApi = (token: string | null) => ({
  async get(endpoint: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  async post(endpoint: string, data: unknown) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Details:', errorData);
      throw new Error(`API Error: ${response.statusText} - ${errorData}`);
    }
    return response.json();
  },
  async put(endpoint: string, data: unknown) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  async delete(endpoint: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE', headers });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  }
});

const transformApiData = {
  saree: (data: Record<string, unknown>): Saree => ({
    id: data.id as string,
    name: data.name as string,
    category: data.category as string,
    price: Number(data.price),
    stock: data.stock as number,
    notes: data.notes as string,
    image: data.image as string | undefined,
    description: (data.description as string) || (data.notes as string)
  }),
  customer: (data: Record<string, unknown>): Customer => ({
    id: data.id as string,
    name: data.name as string,
    phone: data.phone as string,
    address: data.address as string,
    email: data.email as string | undefined,
    notes: data.notes as string
  }),
  order: (data: Record<string, unknown>): Order => ({
    id: data.id as string,
    customerId: data.customer as string,
    items: (data.items as Record<string, unknown>[] || []).map((item: Record<string, unknown>) => ({
      sareeId: item.saree as string,
      quantity: item.quantity as number,
      price: Number(item.price)
    })),
    totalAmount: Number(data.total_amount),
    paidAmount: Number(data.paid_amount),
    dueAmount: Number(data.due_amount),
    payments: (data.payments as Record<string, unknown>[] || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      amount: Number(p.amount),
      method: p.method as 'Cash' | 'UPI' | 'Other',
      date: p.date as string,
      notes: p.notes as string | undefined
    })),
    status: data.status as 'Pending' | 'Partial' | 'Paid' | 'Cancelled',
    date: data.date as string,
    notes: data.notes as string | undefined
  })
};

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function AppProvider({ children }: { children: ReactNode }) {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = createApi(token);
        
        // Always try backend first for real business data
        try {
          const [sareesRes, customersRes, ordersRes] = await Promise.all([
            api.get('/sarees/'),
            api.get('/customers/'),
            api.get('/orders/')
          ]);
          
          const backendSarees = (sareesRes.results || sareesRes).map(transformApiData.saree);
          const backendCustomers = (customersRes.results || customersRes).map(transformApiData.customer);
          const backendOrders = (ordersRes.results || ordersRes).map(transformApiData.order);
          
          setSarees(backendSarees);
          setCustomers(backendCustomers);
          setOrders(backendOrders);
          
          console.log('Loaded orders:', backendOrders.length, 'for user:', user?.name, 'role:', user?.role);
          
        } catch (apiError) {
          console.log('Backend unavailable, using local fallback:', apiError);
          // Fallback to local data only if backend fails
          const sharedData = getSharedData();
          setSarees(sharedData.sarees);
          setCustomers(sharedData.customers);
          setOrders(sharedData.orders);
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token, isAuthenticated, user?.id]);

  // Shared data storage for all users
  const getSharedData = () => {
    const sharedSarees = JSON.parse(localStorage.getItem('sharedSarees') || '[]');
    const sharedCustomers = JSON.parse(localStorage.getItem('sharedCustomers') || '[]');
    const sharedOrders = JSON.parse(localStorage.getItem('sharedOrders') || '[]');
    
    // Initialize with mock data if empty
    if (sharedSarees.length === 0) {
      const mockSarees = [
        { id: '1', name: 'Silk Saree Red', category: 'Silk', price: 2500, stock: 10, notes: 'Beautiful red silk saree' },
        { id: '2', name: 'Cotton Saree Blue', category: 'Cotton', price: 800, stock: 15, notes: 'Comfortable cotton saree' },
        { id: '3', name: 'Designer Saree Gold', category: 'Designer', price: 4500, stock: 5, notes: 'Elegant gold designer saree' }
      ];
      localStorage.setItem('sharedSarees', JSON.stringify(mockSarees));
      return { sarees: mockSarees, customers: sharedCustomers, orders: sharedOrders };
    }
    
    return { sarees: sharedSarees, customers: sharedCustomers, orders: sharedOrders };
  };
  
  const saveSharedData = (type: 'sarees' | 'customers' | 'orders', data: any[]) => {
    localStorage.setItem(`shared${type.charAt(0).toUpperCase() + type.slice(1)}`, JSON.stringify(data));
  };

  const addSaree = async (sareeData: Omit<Saree, 'id'>) => {
    const api = createApi(token);
    const tempId = `temp-${Date.now()}`;
    const tempSaree = { ...sareeData, id: tempId, description: sareeData.notes };
    
    setSarees(prev => [...prev, tempSaree]);
    
    try {
      // Filter out empty image URLs to avoid validation errors
      const cleanSareeData = { ...sareeData };
      if (!cleanSareeData.image || cleanSareeData.image.trim() === '') {
        delete cleanSareeData.image;
      }
      const newSaree = await api.post('/sarees/', cleanSareeData);
      
      setSarees(prev => prev.map(s => s.id === tempId ? transformApiData.saree(newSaree) : s));
    } catch (error) {
      console.error('Error adding saree:', error);
      setSarees(prev => prev.filter(s => s.id !== tempId));
      throw error;
    }
  };

  const updateSaree = async (id: string, sareeData: Partial<Saree>) => {
    const api = createApi(token);
    const originalSaree = sarees.find(s => s.id === id);
    setSarees(prev => prev.map(saree => 
      saree.id === id ? { ...saree, ...sareeData } : saree
    ));
    
    try {
      const updatedSaree = await api.put(`/sarees/${id}/`, sareeData);
      setSarees(prev => prev.map(saree => 
        saree.id === id ? transformApiData.saree(updatedSaree) : saree
      ));
    } catch (error) {
      if (originalSaree) {
        setSarees(prev => prev.map(saree => 
          saree.id === id ? originalSaree : saree
        ));
      }
      throw error;
    }
  };

  const deleteSaree = async (id: string) => {
    const api = createApi(token);
    const originalSaree = sarees.find(s => s.id === id);
    setSarees(prev => prev.filter(saree => saree.id !== id));
    
    try {
      await api.delete(`/sarees/${id}/`);
    } catch (error) {
      if (originalSaree) {
        setSarees(prev => [...prev, originalSaree]);
      }
      throw error;
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const tempCustomer = { ...customerData, id: tempId };
    setCustomers(prev => [...prev, tempCustomer]);
    
    try {
      const api = createApi(token);
      
      // Clean customer data - remove invalid email
      const cleanCustomerData: any = {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        notes: customerData.notes
      };
      
      // Only add email if it's valid
      if (customerData.email && customerData.email.trim() && isValidEmail(customerData.email.trim())) {
        cleanCustomerData.email = customerData.email.trim();
      }
      
      console.log('Sending customer data:', cleanCustomerData);
      
      const newCustomer = await api.post('/customers/', cleanCustomerData);
      const backendCustomer = transformApiData.customer(newCustomer);
      setCustomers(prev => prev.map(c => c.id === tempId ? backendCustomer : c));
      
      // Refresh customers from backend
      const customersRes = await api.get('/customers/');
      setCustomers((customersRes.results || customersRes).map(transformApiData.customer));
    } catch (error) {
      console.error('Backend customer creation failed:', error);
      setCustomers(prev => prev.filter(c => c.id !== tempId));
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    const api = createApi(token);
    const originalCustomer = customers.find(c => c.id === id);
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...customerData } : customer
    ));
    
    try {
      const updatedCustomer = await api.put(`/customers/${id}/`, customerData);
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? transformApiData.customer(updatedCustomer) : customer
      ));
    } catch (error) {
      if (originalCustomer) {
        setCustomers(prev => prev.map(customer => 
          customer.id === id ? originalCustomer : customer
        ));
      }
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    const api = createApi(token);
    const originalCustomer = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    
    try {
      await api.delete(`/customers/${id}/`);
    } catch (error) {
      if (originalCustomer) {
        setCustomers(prev => [...prev, originalCustomer]);
      }
      throw error;
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const tempOrder = { ...orderData, id: tempId };
    
    // Optimistic UI update
    setOrders(prev => [...prev, tempOrder]);
    
    // Update stock optimistically
    const stockUpdates: Record<string, number> = {};
    orderData.items.forEach(item => {
      stockUpdates[item.sareeId] = (stockUpdates[item.sareeId] || 0) - item.quantity;
    });
    
    setSarees(prev => prev.map(s => 
      stockUpdates[s.id] ? { ...s, stock: s.stock + stockUpdates[s.id] } : s
    ));
    
    try {
      const api = createApi(token);
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
          price: item.price
        }))
      };
      
      const newOrder = await api.post('/orders/', apiOrderData);
      const backendOrder = transformApiData.order(newOrder);
      
      // Update with backend response
      setOrders(prev => prev.map(o => o.id === tempId ? backendOrder : o));
      
      // Send notification with backend order ID
      const customer = customers.find(c => c.id === orderData.customerId);
      const customerName = customer?.name || user?.name || 'Unknown Customer';
      const isCustomerOrder = user && user.role === 'customer';
      
      const adminNotifications = JSON.parse(localStorage.getItem('sharedNotifications') || '[]');
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'order',
        title: isCustomerOrder ? 'New Customer Order' : 'New Order Created',
        message: `${customerName} ${isCustomerOrder ? 'placed' : 'has'} an order worth ₹${orderData.totalAmount.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        read: false,
        orderId: backendOrder.id,
        customerId: orderData.customerId
      };
      adminNotifications.unshift(notification);
      localStorage.setItem('sharedNotifications', JSON.stringify(adminNotifications.slice(0, 50)));
      
      // Refresh ALL data from backend to ensure consistency
      const [sareesRes, ordersRes, customersRes] = await Promise.all([
        api.get('/sarees/'),
        api.get('/orders/'),
        api.get('/customers/')
      ]);
      setSarees((sareesRes.results || sareesRes).map(transformApiData.saree));
      setOrders((ordersRes.results || ordersRes).map(transformApiData.order));
      setCustomers((customersRes.results || customersRes).map(transformApiData.customer));
      
    } catch (error) {
      console.error('Backend order creation failed:', error);
      // Revert optimistic updates
      setOrders(prev => prev.filter(o => o.id !== tempId));
      setSarees(prev => prev.map(s => 
        stockUpdates[s.id] ? { ...s, stock: s.stock - stockUpdates[s.id] } : s
      ));
      throw error;
    }
  };

  const addPayment = async (orderId: string, paymentData: Omit<Payment, 'id'>) => {
    const api = createApi(token);
    const tempPayment = { ...paymentData, id: `temp-${Date.now()}` };
    
    // Wrap in transition to prevent UI freezing
    startTransition(() => {
      setOrders(prev => prev.map(order => {
        if (order.id !== orderId) return order;
        
        const updatedPayments = [...order.payments, tempPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const dueAmount = order.totalAmount - totalPaid;
        
        const status: Order['status'] = totalPaid >= order.totalAmount ? 'Paid' : 
                                       totalPaid > 0 ? 'Partial' : 'Pending';

        return { ...order, payments: updatedPayments, paidAmount: totalPaid, dueAmount, status };
      }));
    });
    
    try {
      await api.post(`/orders/${orderId}/add_payment/`, {
        order: orderId,
        amount: paymentData.amount,
        method: paymentData.method,
        notes: paymentData.notes
      });
      
      // Refresh orders to get accurate data
      const ordersRes = await api.get('/orders/');
      const updatedOrders = (ordersRes.results || ordersRes).map(transformApiData.order);
      setOrders(updatedOrders);
    } catch (error) {
      // Single revert update to prevent UI freezing
      setOrders(prev => prev.map(order => {
        if (order.id !== orderId) return order;
        
        const revertedPayments = order.payments.filter(p => p.id !== tempPayment.id);
        const totalPaid = revertedPayments.reduce((sum, p) => sum + p.amount, 0);
        const dueAmount = order.totalAmount - totalPaid;
        
        const status: Order['status'] = totalPaid >= order.totalAmount ? 'Paid' : 
                                       totalPaid > 0 ? 'Partial' : 'Pending';

        return { ...order, payments: revertedPayments, paidAmount: totalPaid, dueAmount, status };
      }));
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const api = createApi(token);
    const originalOrder = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    
    try {
      await api.put(`/orders/${orderId}/`, { status });
    } catch (error) {
      if (originalOrder) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? originalOrder : order
        ));
      }
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    const api = createApi(token);
    const originalOrder = orders.find(o => o.id === orderId);
    const originalSarees = [...sarees];
    
    if (!originalOrder) {
      throw new Error('Order not found');
    }
    
    if (originalOrder.paidAmount > 0) {
      throw new Error('Cannot cancel order with payments. Please refund payments first.');
    }
    
    // Batch state updates to prevent UI freezing
    const stockUpdates: Record<string, number> = {};
    originalOrder.items.forEach(item => {
      stockUpdates[item.sareeId] = (stockUpdates[item.sareeId] || 0) + item.quantity;
    });
    
    // Batch updates in transition to prevent UI blocking
    startTransition(() => {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'Cancelled' as const } : order
      ));
      
      setSarees(prev => prev.map(s => 
        stockUpdates[s.id] ? { ...s, stock: s.stock + stockUpdates[s.id] } : s
      ));
    });
    
    try {
      await api.post(`/orders/${orderId}/cancel_order/`, {});
      
      // Only refresh if needed - avoid unnecessary API calls
      // The optimistic updates should be sufficient
    } catch (error) {
      // Revert optimistic updates
      if (originalOrder) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? originalOrder : order
        ));
      }
      setSarees(originalSarees);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    const api = createApi(token);
    const originalOrder = orders.find(o => o.id === id);
    setOrders(prev => prev.filter(order => order.id !== id));
    
    try {
      await api.delete(`/orders/${id}/`);
    } catch (error) {
      if (originalOrder) {
        setOrders(prev => [...prev, originalOrder]);
      }
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
    cancelOrder,
    deleteOrder
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { AppProvider, useApp };