import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  cancelOrder: (orderId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  }
};

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
    notes: data.notes as string
  }),
  order: (data: Record<string, unknown>): Order => ({
    id: data.id as string,
    customerId: data.customer as string,
    items: (data.items as Record<string, unknown>[]).map((item: Record<string, unknown>) => ({
      sareeId: item.saree as string,
      quantity: item.quantity as number,
      price: Number(item.price)
    })),
    totalAmount: Number(data.total_amount),
    paidAmount: Number(data.paid_amount),
    dueAmount: Number(data.due_amount),
    payments: (data.payments as Record<string, unknown>[]).map((p: Record<string, unknown>) => ({
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from Django API...');
        const [sareesRes, customersRes, ordersRes] = await Promise.all([
          api.get('/sarees/'),
          api.get('/customers/'),
          api.get('/orders/')
        ]);
        console.log('API Response - Sarees:', sareesRes);
        console.log('API Response - Customers:', customersRes);
        console.log('API Response - Orders:', ordersRes);
        setSarees((sareesRes.results || sareesRes).map(transformApiData.saree));
        setCustomers((customersRes.results || customersRes).map(transformApiData.customer));
        setOrders((ordersRes.results || ordersRes).map(transformApiData.order));
        console.log('Data loaded successfully');
      } catch (error) {
        console.error('Failed to fetch data from Django API:', error);
        console.log('Make sure Django server is running on http://localhost:8000');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addSaree = async (sareeData: Omit<Saree, 'id'>) => {
    console.log('🔵 Adding saree:', sareeData);
    const tempId = `temp-${Date.now()}`;
    const tempSaree = { ...sareeData, id: tempId, description: sareeData.notes };
    
    setSarees(prev => {
      console.log('🟡 Current sarees before adding:', prev.length);
      console.log('🟡 Adding temp saree:', tempSaree);
      const newState = [...prev, tempSaree];
      console.log('🟡 New sarees count:', newState.length);
      return newState;
    });
    
    try {
      console.log('🔵 Calling API to create saree...');
      // Filter out empty image URLs to avoid validation errors
      const cleanSareeData = { ...sareeData };
      if (!cleanSareeData.image || cleanSareeData.image.trim() === '') {
        delete cleanSareeData.image;
      }
      console.log('🔵 Cleaned saree data:', cleanSareeData);
      const newSaree = await api.post('/sarees/', cleanSareeData);
      console.log('🟢 API response for new saree:', newSaree);
      console.log('🟢 Transformed saree:', transformApiData.saree(newSaree));
      
      setSarees(prev => {
        console.log('🟡 Replacing temp saree with real saree');
        console.log('🟡 Looking for tempId:', tempId);
        const updated = prev.map(s => {
          console.log('🟡 Checking saree:', s.id, s.id === tempId ? '(MATCH)' : '');
          return s.id === tempId ? transformApiData.saree(newSaree) : s;
        });
        console.log('🟢 Final updated sarees:', updated.length, updated);
        return updated;
      });
    } catch (error) {
      console.error('🔴 Error adding saree:', error);
      setSarees(prev => prev.filter(s => s.id !== tempId));
      throw error;
    }
  };

  const updateSaree = async (id: string, sareeData: Partial<Saree>) => {
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
      const newCustomer = await api.post('/customers/', customerData);
      setCustomers(prev => prev.map(c => c.id === tempId ? transformApiData.customer(newCustomer) : c));
    } catch (error) {
      setCustomers(prev => prev.filter(c => c.id !== tempId));
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
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
    setOrders(prev => [...prev, tempOrder]);
    
    // Optimistically update stock
    orderData.items.forEach(item => {
      setSarees(prev => prev.map(s => 
        s.id === item.sareeId ? { ...s, stock: s.stock - item.quantity } : s
      ));
    });
    
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
          price: item.price
        }))
      };
      const newOrder = await api.post('/orders/', apiOrderData);
      setOrders(prev => prev.map(o => o.id === tempId ? transformApiData.order(newOrder) : o));
      
      // Refresh sarees to get accurate stock
      const sareesRes = await api.get('/sarees/');
      setSarees(sareesRes.results.map(transformApiData.saree));
    } catch (error) {
      setOrders(prev => prev.filter(o => o.id !== tempId));
      // Revert stock changes
      orderData.items.forEach(item => {
        setSarees(prev => prev.map(s => 
          s.id === item.sareeId ? { ...s, stock: s.stock + item.quantity } : s
        ));
      });
      throw error;
    }
  };

  const addPayment = async (orderId: string, paymentData: Omit<Payment, 'id'>) => {
    const tempPayment = { ...paymentData, id: `temp-${Date.now()}` };
    
    // Optimistically update order
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedPayments = [...order.payments, tempPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const dueAmount = order.totalAmount - totalPaid;
        
        let status: Order['status'] = 'Pending';
        if (totalPaid >= order.totalAmount) {
          status = 'Paid';
        } else if (totalPaid > 0) {
          status = 'Partial';
        }

        return {
          ...order,
          payments: updatedPayments,
          paidAmount: totalPaid,
          dueAmount: dueAmount,
          status
        };
      }
      return order;
    }));
    
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
      // Revert optimistic update
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const revertedPayments = order.payments.filter(p => p.id !== tempPayment.id);
          const totalPaid = revertedPayments.reduce((sum, p) => sum + p.amount, 0);
          const dueAmount = order.totalAmount - totalPaid;
          
          let status: Order['status'] = 'Pending';
          if (totalPaid >= order.totalAmount) {
            status = 'Paid';
          } else if (totalPaid > 0) {
            status = 'Partial';
          }

          return {
            ...order,
            payments: revertedPayments,
            paidAmount: totalPaid,
            dueAmount: dueAmount,
            status
          };
        }
        return order;
      }));
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
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
    const originalOrder = orders.find(o => o.id === orderId);
    const originalSarees = [...sarees];
    
    if (!originalOrder) {
      throw new Error('Order not found');
    }
    
    if (originalOrder.paidAmount > 0) {
      throw new Error('Cannot cancel order with payments. Please refund payments first.');
    }
    
    // Optimistically update order status
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'Cancelled' as const } : order
    ));
    
    // Optimistically restore stock
    originalOrder.items.forEach(item => {
      setSarees(prev => prev.map(s => 
        s.id === item.sareeId ? { ...s, stock: s.stock + item.quantity } : s
      ));
    });
    
    try {
      await api.post(`/orders/${orderId}/cancel_order/`, {});
      
      // Refresh data to ensure consistency
      const [sareesRes, ordersRes] = await Promise.all([
        api.get('/sarees/'),
        api.get('/orders/')
      ]);
      setSarees((sareesRes.results || sareesRes).map(transformApiData.saree));
      setOrders((ordersRes.results || ordersRes).map(transformApiData.order));
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
    cancelOrder
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