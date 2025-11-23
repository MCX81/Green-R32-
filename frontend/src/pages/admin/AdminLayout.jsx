import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderTree,
  MessageSquare,
  LogOut,
  Home
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, loading, isAuthenticated } = useAuth();

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Not logged in at all - redirect to admin login
      navigate('/admin/login');
    } else if (!loading && isAuthenticated && !isAdmin()) {
      // Logged in but not admin - redirect to admin login
      logout();
      navigate('/admin/login');
    }
  }, [isAdmin, isAuthenticated, navigate, loading, logout]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Se încarcă...</p>
      </div>
    );
  }

  // If not authenticated or not admin, don't render
  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Produse' },
    { path: '/admin/categories', icon: FolderTree, label: 'Categorii' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Comenzi' },
    { path: '/admin/users', icon: Users, label: 'Utilizatori' },
    { path: '/admin/reviews', icon: MessageSquare, label: 'Review-uri' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-gradient-to-br from-green-600 to-green-500 text-white font-bold text-xl px-3 py-2 rounded-xl">
              R32
            </div>
            <span className="font-bold text-lg">Admin</span>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-600 text-white text-xs rounded-lg">
              Administrator
            </span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-gray-100">
                  <Home className="h-5 w-5 mr-3" />
                  Înapoi la Site
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start rounded-xl hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Deconectare
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-bold text-gray-900">Panou de Administrare</h1>
        </div>
        <div className="p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
