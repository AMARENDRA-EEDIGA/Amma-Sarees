import { ReactNode } from 'react';
import { Palette, Home, Package, Users, ShoppingCart, BarChart3, LogOut, User, UserCog } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import paisleyLogo from '@/assets/paisley-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/NotificationBell';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  const navigationItems = isAdmin ? [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/catalog', icon: Package, label: 'Catalog' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/reports', icon: BarChart3, label: 'Reports' }
  ] : [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/catalog', icon: Package, label: 'Browse Sarees' },
    { path: '/orders', icon: ShoppingCart, label: 'My Orders' }
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
            <div className="flex items-center gap-4">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.name && (
                        <p className="font-medium">{user.name}</p>
                      )}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Role: {user?.role}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut size={16} className="mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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