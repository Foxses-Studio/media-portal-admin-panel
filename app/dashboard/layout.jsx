'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  FileText,
  Image,
  Settings,
  Users,
  Bell,
  LogOut,
  Layers,
  Loader2,
  CalendarDays,
  ImageUp,
} from 'lucide-react';

// All possible nav items in the dashboard
const ALL_NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    alwaysVisible: true,
    Icon: LayoutDashboard,
  },
  {
    name: 'Register User',
    href: '/dashboard/register',
    adminOnly: true,
    Icon: UserPlus,
  },
  {
    name: 'Events / Schools',
    href: '/dashboard/events',
    adminOnly: true,
    Icon: CalendarDays,
  },
  {
    name: 'Upload Photos',
    href: '/dashboard/events/upload',
    adminOnly: true,
    Icon: ImageUp,
  },
  {
    name: 'Manage Posts',
    href: '/posts',
    Icon: FileText,
  },
  {
    name: 'Media Library',
    href: '/media',
    Icon: Image,
  },
  {
    name: 'Settings',
    href: '/settings',
    Icon: Settings,
  },
  {
    name: 'Manage Users',
    href: '/users',
    Icon: Users,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');

    // 1. No token → redirect to login
    if (!token) {
      router.replace('/');
      return;
    }

    let user = null;
    if (stored) {
      try { user = JSON.parse(stored); } catch (_) {}
    }

    // 2. Role check: only admin and moderator can access dashboard
    const allowedRoles = ['admin', 'moderator'];
    if (!user || !allowedRoles.includes(user.role?.toLowerCase())) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/');
      return;
    }

    setAuthUser(user);
    setIsReady(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  // Build sidebar navigation based on role
  const getNavItems = () => {
    if (!authUser) return [];
    const role = authUser.role?.toLowerCase();

    if (role === 'admin') {
      return ALL_NAV_ITEMS; // Admin sees everything
    }

    if (role === 'moderator') {
      const accessiblePages = authUser.accessiblePages || [];
      return ALL_NAV_ITEMS.filter(item => {
        if (item.alwaysVisible) return true;
        if (item.adminOnly) return false;
        return accessiblePages.includes(item.href);
      });
    }

    return ALL_NAV_ITEMS.filter(item => item.alwaysVisible);
  };

  const navigation = getNavItems();

  // Loading screen while checking auth
  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  const isAdmin = authUser?.role?.toLowerCase() === 'admin';

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex md:flex-col">

        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-lg font-bold tracking-wide">Media Portal</span>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-3 bg-slate-950/40">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            isAdmin
              ? 'bg-purple-900/50 text-purple-300 border border-purple-700/40'
              : 'bg-orange-900/50 text-orange-300 border border-orange-700/40'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {authUser?.role}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
            Main Menu
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const { Icon } = item;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800 border border-slate-700">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase overflow-hidden shrink-0">
              {authUser?.image
                ? <img src={authUser.image} alt="" className="h-full w-full object-cover" />
                : (authUser?.name?.charAt(0) || 'A')}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-white truncate">{authUser?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{authUser?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800">
            {ALL_NAV_ITEMS.find(item =>
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            )?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
