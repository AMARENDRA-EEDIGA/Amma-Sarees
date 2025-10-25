import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addSaree: (saree: Omit<Saree, 'id'>) => void;
  updateSaree: (id: string, saree: Partial<Saree>) => void;
  deleteSaree: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  addPayment: (orderId: string, payment: Omit<Payment, 'id'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial mock data
const initialSarees: Saree[] = [
  {
    id: '1',
    name: 'Banarasi Silk Saree',
    category: 'Silk',
    price: 12500,
    stock: 3,
    notes: 'Pure Banarasi silk with golden zari work',
    description: 'Pure Banarasi silk with golden zari work',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=400&fit=crop'
  },
  {
    id: '2',
    name: 'Cotton Handloom Saree',
    category: 'Cotton',
    price: 2800,
    stock: 8,
    notes: 'Handwoven cotton with traditional motifs',
    description: 'Handwoven cotton with traditional motifs',
    image: 'https://images.unsplash.com/photo-1606513103960-b8a0e50da64a?w=300&h=400&fit=crop'
  },
  {
    id: '3',
    name: 'Designer Party Wear',
    category: 'Partywear',
    price: 8900,
    stock: 2,
    notes: 'Elegant designer saree for special occasions',
    description: 'Elegant designer saree for special occasions',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop'
  }
];

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    address: 'Krishna Nagar, Delhi',
    notes: 'Prefers silk sarees'
  },
  {
    id: '2',
    name: 'Anita Patel',
    phone: '+91 87654 32109',
    address: 'Satellite, Ahmedabad',
    notes: 'Regular customer'
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sarees, setSarees] = useState<Saree[]>(initialSarees);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>([]);

  const addSaree = (sareeData: Omit<Saree, 'id'>) => {
    const newSaree: Saree = {
      ...sareeData,
      id: generateId(),
      description: sareeData.notes
    };
    setSarees(prev => [...prev, newSaree]);
  };

  const updateSaree = (id: string, sareeData: Partial<Saree>) => {
    setSarees(prev => prev.map(saree => 
      saree.id === id ? { ...saree, ...sareeData } : saree
    ));
  };

  const deleteSaree = (id: string) => {
    setSarees(prev => prev.filter(saree => saree.id !== id));
  };

  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: generateId()
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...customerData } : customer
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const addOrder = (orderData: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...orderData,
      id: generateId()
    };
    
    // Update stock quantities
    orderData.items.forEach(item => {
      updateSaree(item.sareeId, {
        stock: sarees.find(s => s.id === item.sareeId)!.stock - item.quantity
      });
    });
    
    setOrders(prev => [...prev, newOrder]);
  };

  const addPayment = (orderId: string, paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: generateId()
    };

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedPayments = [...order.payments, newPayment];
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
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const value: AppContextType = {
    sarees,
    customers,
    orders,
    addSaree,
    updateSaree,
    deleteSaree,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    addPayment,
    updateOrderStatus
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