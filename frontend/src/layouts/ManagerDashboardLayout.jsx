import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Database, 
  FileText, 
  Server,
  RefreshCcw,
  Gamepad2,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Info,
  LifeBuoy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import UndoToast from '../components/UndoToast';
import NotificationBell from '../components/NotificationBell';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-600 text-white' 
        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const ManagerDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useApp();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/manager/dashboard' },
    { icon: Database, label: 'Token Storage', to: '/manager/storage' },
    { icon: RefreshCcw, label: 'Refunds', to: '/manager/refunds' },
    { icon: Gamepad2, label: 'Machines', to: '/manager/machines' },
    { icon: FileText, label: 'Logs', to: '/manager/logs' },
    { icon: Server, label: 'System Status', to: '/manager/status' },
    { icon: Info, label: 'About', to: '/manager/about' },
    { icon: LifeBuoy, label: 'Support', to: '/manager/support' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white w-64 flex-shrink-0 transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-64 absolute h-full z-20'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider">Arcade System</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
          <div className="text-xs text-gray-500 text-center">v1.2.0 Admin Build</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900 text-white shadow-md h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="mr-4 text-gray-300 hover:text-white"
              >
                <Menu size={24} />
              </button>
            )}
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>

          <div className="flex items-center space-x-6">
            <NotificationBell />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{user?.username || 'Admin'}</span>
              <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold">ADMIN</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-green-400 font-medium">System Health: OK</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
      <UndoToast />
    </div>
  );
};

export default ManagerDashboardLayout;
