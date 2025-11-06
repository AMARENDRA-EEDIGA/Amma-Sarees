import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  customerId?: string; // Link to customer profile
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  token: string | null;
  ensureCustomerProfile: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ensureCustomerProfile = async (): Promise<string | null> => {
    if (!user || user.role === 'admin') return null;

    try {
      const api = createApi(token);
      // Always try to find existing customer by email
      const customersRes = await api.get('/customers/');
      const customers = customersRes.results || customersRes;
      const existingCustomer = customers.find((c: any) => c.email === user.email);
      
      if (existingCustomer) {
        // Link existing customer and update login credentials
        const updatedUser = { ...user, customerId: existingCustomer.id };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update customerLogins with correct customerId
        const customerLogins = JSON.parse(localStorage.getItem('customerLogins') || '[]');
        const loginIndex = customerLogins.findIndex((login: any) => login.email === user.email);
        if (loginIndex !== -1) {
          customerLogins[loginIndex].customerId = existingCustomer.id;
          localStorage.setItem('customerLogins', JSON.stringify(customerLogins));
        }
        
        return existingCustomer.id;
      }
      
      // Create customer profile in backend
      const newCustomer = await api.post('/customers/', {
        name: user.name,
        email: user.email,
        phone: '',
        address: '',
        notes: 'Auto-created customer profile'
      });
      
      const updatedUser = { ...user, customerId: newCustomer.id };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return newCustomer.id;
    } catch (error) {
      console.error('Failed to create customer profile:', error);
      return null;
    }
  };

  const createApi = (token: string | null) => ({
    async get(endpoint: string) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    },
    async post(endpoint: string, data: unknown) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    }
  });

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        
        // For customer users, ensure customerId is set
        if (userData.role === 'customer' && !userData.customerId) {
          setTimeout(() => ensureCustomerProfile(), 100);
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Check customer logins first
    const customerLogins = JSON.parse(localStorage.getItem('customerLogins') || '[]');
    const customerLogin = customerLogins.find((login: any) => 
      login.email === email && login.password === password
    );
    
    if (customerLogin) {
      // First get the correct customerId from backend
      try {
        const api = createApi(null);
        const customersRes = await api.get('/customers/');
        const customers = customersRes.results || customersRes;
        const backendCustomer = customers.find((c: any) => c.email === email);
        
        const correctCustomerId = backendCustomer ? backendCustomer.id : customerLogin.customerId;
        
        const userData = {
          id: correctCustomerId,
          name: customerLogin.name,
          email: customerLogin.email,
          role: 'customer' as const,
          customerId: correctCustomerId
        };
        
        setUser(userData);
        const mockToken = 'customer-token-' + Date.now();
        setToken(mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', mockToken);
        
        // Update login credentials with correct ID
        if (backendCustomer && customerLogin.customerId !== backendCustomer.id) {
          customerLogin.customerId = backendCustomer.id;
          localStorage.setItem('customerLogins', JSON.stringify(customerLogins));
        }
        
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error('Failed to get backend customer:', error);
        // Fallback to original login
        const userData = {
          id: customerLogin.customerId || `customer-${Date.now()}`,
          name: customerLogin.name,
          email: customerLogin.email,
          role: 'customer' as const,
          customerId: customerLogin.customerId
        };
        
        setUser(userData);
        const mockToken = 'customer-token-' + Date.now();
        setToken(mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', mockToken);
        
        setIsLoading(false);
        return true;
      }
    }
    
    // Try backend authentication for admin
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user.id,
          name: data.user.name || data.user.username,
          email: data.user.email,
          role: data.user.is_staff ? 'admin' : 'customer'
        };
        
        setUser(userData);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        
        // Auto-create customer profile for non-admin users
        if (userData.role === 'customer') {
          setTimeout(() => ensureCustomerProfile(), 100);
        }
        
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.log('Backend auth failed, trying mock auth:', error);
    }
    
    // Fallback to mock authentication for admin
    const mockUsers = [
      { id: '1', name: 'Admin User', email: 'admin@amarees.com', password: 'admin123', role: 'admin' as const },
      { id: '2', name: 'Demo Customer', email: 'demo@customer.com', password: 'demo123', role: 'customer' as const }
    ];
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      const mockToken = 'mock-token-' + Date.now();
      
      setUser(userWithoutPassword);
      setToken(mockToken);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('token', mockToken);
      
      // Auto-create customer profile for non-admin users
      if (userWithoutPassword.role === 'customer') {
        setTimeout(() => ensureCustomerProfile(), 100);
      }
      
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    token,
    ensureCustomerProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };