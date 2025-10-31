import { ReactNode } from 'react';
import { Palette, Home, Package, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import paisleyLogo from '@/assets/paisley-logo.png';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const navigationItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/catalog', icon: Package, label: 'Catalog' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background paisley-pattern">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={paisleyLogo} alt="Ama Sarees" className="w-8 h-8" />
              <div>
                <h1 className="font-elegant text-2xl font-bold text-primary text-shadow-soft">
                  Ama Sarees
                </h1>
                <p className="text-sm text-muted-foreground">Elegant Textiles at Home</p>
              </div>
            </div>
            
            {/* Tablet and Desktop navigation */}
            <nav className="hidden md:flex space-x-2 lg:space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="text-sm lg:text-base">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-warm">
        <div className="flex items-center justify-around py-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-0.5 px-1 py-1.5 rounded-md transition-colors min-w-0 flex-1 ${
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[10px] leading-tight truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;