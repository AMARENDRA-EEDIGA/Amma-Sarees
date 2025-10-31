import { Package, Users, IndianRupee, TrendingUp, Plus, Eye, ShoppingCart, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '@/components/StatsCard';
import QuickActionCard from '@/components/QuickActionCard';
import { useApp } from '@/contexts/AppContext';
import heroSarees from '@/assets/hero-sarees.jpg';

const Dashboard = () => {
  const navigate = useNavigate();
  const { sarees, customers, orders, loading } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading data from Django API...</p>
          <p className="text-sm text-muted-foreground mt-2">Make sure Django server is running on port 8000</p>
        </div>
      </div>
    );
  }

  // Calculate real-time stats
  const totalSarees = sarees.length;
  const totalCustomers = customers.length;
  const todaysSales = orders
    .filter(order => {
      const today = new Date().toDateString();
      return new Date(order.date).toDateString() === today;
    })
    .reduce((sum, order) => sum + order.paidAmount, 0);

  const lowStockCount = sarees.filter(saree => saree.stock <= 2 && saree.stock > 0).length;

  const stats = [
    {
      title: 'Total Sarees',
      value: totalSarees,
      icon: <Package size={24} />,
      trend: `${sarees.filter(s => s.stock > 0).length} in stock`,
      color: 'primary' as const,
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: <Users size={24} />,
      trend: totalCustomers > 0 ? `${customers.length} customers` : 'No customers yet',
      color: 'accent' as const,
    },
    {
      title: 'Today\'s Sales',
      value: `₹${todaysSales.toLocaleString()}`,
      icon: <IndianRupee size={24} />,
      trend: todaysSales > 0 ? 'Great progress!' : 'No sales today',
      color: 'secondary' as const,
    },
    {
      title: 'Low Stock Alert',
      value: lowStockCount,
      icon: <TrendingUp size={24} />,
      trend: lowStockCount > 0 ? 'Items need restocking' : 'All items well stocked',
      color: 'secondary' as const,
    },
  ];

  const quickActions = [
    {
      title: 'Add Saree',
      description: 'Add new saree to your catalog',
      icon: <Plus size={24} />,
      onClick: () => navigate('/add-saree'),
      variant: 'default' as const,
    },
    {
      title: 'New Order',
      description: 'Create a new customer order',
      icon: <ShoppingCart size={24} />,
      onClick: () => navigate('/orders'),
      variant: 'secondary' as const,
    },
    {
      title: 'View Catalog',
      description: 'Browse your saree collection',
      icon: <Eye size={24} />,
      onClick: () => navigate('/catalog'),
      variant: 'outline' as const,
    },
    {
      title: 'Add Customer',
      description: 'Add new customer details',
      icon: <UserPlus size={24} />,
      onClick: () => navigate('/customers'),
      variant: 'secondary' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-warm">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroSarees} 
            alt="Beautiful sarees collection" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative p-8">
          <div className="max-w-2xl">
            <h1 className="font-elegant text-3xl md:text-4xl font-bold mb-4 text-shadow-soft">
              Welcome to Ama Sarees
            </h1>
            <p className="text-lg opacity-95 mb-6">
              Manage your beautiful saree collection with elegance and efficiency. 
              Track inventory, customers, and orders all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/catalog')}
                className="px-6 py-3 bg-primary-foreground text-primary rounded-lg font-medium hover:shadow-soft transition-all"
              >
                View Catalog
              </button>
              <button 
                onClick={() => navigate('/orders')}
                className="px-6 py-3 border border-primary-foreground/30 text-primary-foreground rounded-lg font-medium hover:bg-primary-foreground/10 transition-all"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-elegant text-2xl font-semibold mb-6 text-primary">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              variant={action.variant}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl p-6 shadow-soft">
        <h2 className="font-elegant text-xl font-semibold mb-4 text-primary">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {/* Recent Orders */}
          {orders.slice(0, 2).map((order) => {
            const customer = customers.find(c => c.id === order.customerId);
            const timeAgo = Math.floor((Date.now() - new Date(order.date).getTime()) / (1000 * 60 * 60));
            return (
              <div key={order.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">New order from {customer?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{order.items.length} items • ₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {timeAgo < 1 ? 'Just now' : timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo/24)}d ago`}
                </span>
              </div>
            );
          })}
          
          {/* Low Stock Alerts */}
          {sarees.filter(s => s.stock <= 2 && s.stock > 0).slice(0, 2).map((saree) => (
            <div key={saree.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Low stock alert</p>
                <p className="text-sm text-muted-foreground">{saree.name} - {saree.stock} piece{saree.stock !== 1 ? 's' : ''} left</p>
              </div>
              <span className="text-xs text-yellow-600 font-medium">Action needed</span>
            </div>
          ))}
          
          {/* Out of Stock Alerts */}
          {sarees.filter(s => s.stock === 0).slice(0, 1).map((saree) => (
            <div key={saree.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Out of stock</p>
                <p className="text-sm text-muted-foreground">{saree.name} - Restock needed</p>
              </div>
              <span className="text-xs text-red-600 font-medium">Urgent</span>
            </div>
          ))}
          
          {orders.length === 0 && sarees.filter(s => s.stock <= 2).length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;