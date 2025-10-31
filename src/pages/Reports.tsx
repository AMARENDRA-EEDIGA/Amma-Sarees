import { useState } from 'react';
import { TrendingUp, Package, Users, IndianRupee, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';

const Reports = () => {
  const { orders, customers, sarees } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days

  // Calculate date range
  const now = new Date();
  const periodStart = new Date(now.getTime() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000);

  // Filter orders by selected period
  const filteredOrders = orders.filter(order => 
    new Date(order.date) >= periodStart
  );

  // Calculate stats
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.paidAmount, 0);
  const totalOrders = filteredOrders.length;
  const totalDue = filteredOrders.reduce((sum, order) => sum + order.dueAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Low stock sarees (stock <= 2)
  const lowStockSarees = sarees.filter(saree => saree.stock <= 2 && saree.stock > 0);
  const outOfStockSarees = sarees.filter(saree => saree.stock === 0);

  // Sales by category
  const salesByCategory = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const saree = sarees.find(s => s.id === item.sareeId);
      if (saree) {
        const category = saree.category;
        acc[category] = (acc[category] || 0) + (item.price * item.quantity);
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Payment status distribution
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent customers (customers with orders in selected period)
  const recentCustomers = customers.filter(customer =>
    filteredOrders.some(order => order.customerId === customer.id)
  );

  // Top selling sarees
  const sareesSold = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const saree = sarees.find(s => s.id === item.sareeId);
      if (saree) {
        if (!acc[saree.id]) {
          acc[saree.id] = { saree, quantity: 0, revenue: 0 };
        }
        acc[saree.id].quantity += item.quantity;
        acc[saree.id].revenue += item.price * item.quantity;
      }
    });
    return acc;
  }, {} as Record<string, { saree: any; quantity: number; revenue: number }>);

  const topSellingSarees = Object.values(sareesSold)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">Reports</h1>
          <p className="text-muted-foreground">Business insights and analytics</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <IndianRupee size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{filteredOrders.length} orders
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(averageOrderValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              per order
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <AlertTriangle size={16} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{totalDue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              pending payments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              in selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(salesByCategory).map(([category, amount]) => {
                const percentage = totalSales > 0 ? (amount / totalSales) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{category}</span>
                      <span className="text-sm text-muted-foreground text-right whitespace-nowrap">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{Object.values(sareesSold).filter(item => item.saree.category === category).reduce((sum, item) => sum + item.quantity, 0)} sarees sold</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(ordersByStatus).map(([status, count]) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'Paid': return 'bg-green-500';
                    case 'Partial': return 'bg-yellow-500';
                    case 'Cancelled': return 'bg-red-500';
                    default: return 'bg-gray-500';
                  }
                };

                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                      <span className="font-medium">{status}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockSarees.length > 0 ? (
              <div className="space-y-2">
                {lowStockSarees.map((saree) => (
                  <div key={saree.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium">{saree.name}</p>
                      <p className="text-sm text-muted-foreground">{saree.category}</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {saree.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">All sarees are well stocked!</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={16} className="text-red-500" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outOfStockSarees.length > 0 ? (
              <div className="space-y-2">
                {outOfStockSarees.map((saree) => (
                  <div key={saree.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <div>
                      <p className="font-medium">{saree.name}</p>
                      <p className="text-sm text-muted-foreground">{saree.category}</p>
                    </div>
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No out of stock items!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Sarees */}
      {topSellingSarees.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Top Selling Sarees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSellingSarees.map((item, index) => (
                <div key={item.saree.id} className="flex items-center justify-between p-3 bg-secondary rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.saree.name}</p>
                      <p className="text-sm text-muted-foreground">{item.saree.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.quantity} sold</p>
                    <p className="text-sm text-muted-foreground">₹{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;