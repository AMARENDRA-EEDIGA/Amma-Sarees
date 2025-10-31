const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ApiSaree {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  notes: string;
  image?: string;
  description?: string;
}

export interface ApiCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface ApiOrderItem {
  id?: string;
  saree: string;
  saree_name?: string;
  quantity: number;
  price: number;
}

export interface ApiPayment {
  id: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Other';
  date: string;
  notes?: string;
}

export interface ApiOrder {
  id: string;
  customer: string;
  customer_name?: string;
  items: ApiOrderItem[];
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payments: ApiPayment[];
  status: 'Pending' | 'Partial' | 'Paid' | 'Cancelled';
  date: string;
  notes?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Sarees
  async getSarees(params?: { category?: string; search?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    
    const query = searchParams.toString();
    return this.request<{ results: ApiSaree[]; count: number }>(`/sarees/${query ? `?${query}` : ''}`);
  }

  async createSaree(saree: Omit<ApiSaree, 'id'>) {
    return this.request<ApiSaree>('/sarees/', {
      method: 'POST',
      body: JSON.stringify(saree),
    });
  }

  async updateSaree(id: string, saree: Partial<ApiSaree>) {
    return this.request<ApiSaree>(`/sarees/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(saree),
    });
  }

  async deleteSaree(id: string) {
    return this.request(`/sarees/${id}/`, { method: 'DELETE' });
  }

  // Customers
  async getCustomers() {
    return this.request<{ results: ApiCustomer[] }>('/customers/');
  }

  async createCustomer(customer: Omit<ApiCustomer, 'id'>) {
    return this.request<ApiCustomer>('/customers/', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: string, customer: Partial<ApiCustomer>) {
    return this.request<ApiCustomer>(`/customers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}/`, { method: 'DELETE' });
  }

  // Orders
  async getOrders() {
    return this.request<{ results: ApiOrder[] }>('/orders/');
  }

  async createOrder(order: { customer: string; total_amount: number; paid_amount: number; due_amount: number; status: string; notes?: string; items: Omit<ApiOrderItem, 'id'>[] }) {
    return this.request<ApiOrder>('/orders/', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async addPayment(orderId: string, payment: { amount: number; method: string; notes?: string }) {
    return this.request<ApiPayment>(`/orders/${orderId}/add_payment/`, {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<ApiOrder>(`/orders/${orderId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiService = new ApiService();