import { Package, Users, IndianRupee, TrendingUp, Plus, Eye, ShoppingCart, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '@/components/StatsCard';
import QuickActionCard from '@/components/QuickActionCard';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import heroSarees from '@/assets/hero-sarees.jpg';

const Dashboard = () => {
  const navigate = useNavigate();
  const { sarees, customers, orders, loading } = useApp();
  const { user, isAdmin } = useAuth();

  const showSkeletons = loading && sarees.length === 0;

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

  // Customer-specific stats - filter orders properly
  const customerOrders = !isAdmin && user?.customerId 
    ? orders.filter(order => order.customerId === user.customerId)
    : orders;
  const customerTotalSpent = customerOrders.reduce((sum, order) => sum + order.paidAmount, 0);
  const customerPendingOrders = customerOrders.filter(order => order.status === 'Pending').length;

  const stats = isAdmin ? [
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
  ] : [
    {
      title: 'Available Sarees',
      value: sarees.filter(s => s.stock > 0).length,
      icon: <Package size={24} />,
      trend: `${totalSarees} total collection`,
      color: 'primary' as const,
    },
    {
      title: 'My Orders',
      value: customerOrders.length,
      icon: <ShoppingCart size={24} />,
      trend: customerPendingOrders > 0 ? `${customerPendingOrders} pending` : 'All orders processed',
      color: 'accent' as const,
    },
    {
      title: 'Total Spent',
      value: `₹${customerTotalSpent.toLocaleString()}`,
      icon: <IndianRupee size={24} />,
      trend: customerTotalSpent > 0 ? 'Thank you for shopping!' : 'Start shopping today',
      color: 'secondary' as const,
    },
  ];

  const quickActions = isAdmin ? [
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
  ] : [
    {
      title: 'Browse Catalog',
      description: 'View our beautiful saree collection',
      icon: <Eye size={24} />,
      onClick: () => navigate('/catalog'),
      variant: 'default' as const,
    },
    {
      title: 'My Orders',
      description: 'View your order history',
      icon: <ShoppingCart size={24} />,
      onClick: () => navigate('/orders'),
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
              Welcome to Ama Sarees{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-lg opacity-95 mb-6">
              {isAdmin 
                ? 'Manage your beautiful saree collection with elegance and efficiency. Track inventory, customers, and orders all in one place.'
                : 'Discover our exquisite collection of traditional and designer sarees. Browse, order, and track your purchases with ease.'
              }
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
      {showSkeletons ? (
        <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto'}`}>
          {[1,2,3,4].slice(0, isAdmin ? 4 : 3).map(i => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto'}`}>
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
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-elegant text-2xl font-semibold mb-6 text-primary text-center">
          Quick Actions
        </h2>
        <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'}`}>
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
          {/* Recent Orders - Show for both admin and customers */}
          {customerOrders.slice(0, 3).map((order) => {
            const customer = customers.find(c => c.id === order.customerId);
            const timeAgo = Math.floor((Date.now() - new Date(order.date).getTime()) / (1000 * 60 * 60));
            return (
              <div key={order.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">{isAdmin ? `Order from ${customer?.name || 'Unknown'}` : 'Your order'}</p>
                  <p className="text-sm text-muted-foreground">{order.items.length} items • ₹{order.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Status: {order.status}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {timeAgo < 1 ? 'Just now' : timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo/24)}d ago`}
                </span>
              </div>
            );
          })}
          
          {/* Admin-only stock alerts */}
          {isAdmin && sarees.filter(s => s.stock <= 2 && s.stock > 0).slice(0, 2).map((saree) => (
            <div key={saree.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Low stock alert</p>
                <p className="text-sm text-muted-foreground">{saree.name} - {saree.stock} piece{saree.stock !== 1 ? 's' : ''} left</p>
              </div>
              <span className="text-xs text-yellow-600 font-medium">Action needed</span>
            </div>
          ))}
          
          {isAdmin && sarees.filter(s => s.stock === 0).slice(0, 1).map((saree) => (
            <div key={saree.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Out of stock</p>
                <p className="text-sm text-muted-foreground">{saree.name} - Restock needed</p>
              </div>
              <span className="text-xs text-red-600 font-medium">Urgent</span>
            </div>
          ))}
          
          {customerOrders.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">{isAdmin ? 'No recent orders' : 'No orders yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;