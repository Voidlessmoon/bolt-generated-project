import { useState } from 'react';
import { Layout, Video, Users, Menu } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const adminMenuItems = [
  {
    label: 'Anime Management',
    icon: Layout,
    path: '/admin/anime',
  },
  {
    label: 'Episode Management',
    icon: Video,
    path: '/admin/episodes',
  },
  {
    label: 'User Management',
    icon: Users,
    path: '/admin/users',
  },
];

export default function Dashboard() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className={cn(
        "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75",
        "transform transition-transform duration-200 ease-in-out",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex h-full flex-col border-r border-gray-800">
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {adminMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        isSidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-950 p-8">
          <Outlet />
        </div>
      </div>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-purple-600 p-3 text-white shadow-lg hover:bg-purple-700"
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
