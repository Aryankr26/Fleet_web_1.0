'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  Truck,
  Droplet,
  MessageSquare,
  FileText,
  Building2,
  User,
} from 'lucide-react';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export type DashboardUserRole = 'owner' | 'supervisor';

export interface DashboardUser {
  name: string;
  role: DashboardUserRole;
  notificationsCount?: number;
}

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface DashboardLayoutProps {
  children: ReactNode;
  user: DashboardUser;
  navItems?: DashboardNavItem[];
  onLogout?: () => void;
}

const defaultNavItems: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports/Data', icon: FileText },
  { href: '/routes', label: 'Company Routes', icon: Building2 },
  { href: '/geofencing', label: 'Geofencing', icon: Truck },
  { href: '/fuel', label: 'Fuel Reports', icon: Droplet },
  { href: '/complaints', label: 'Complaints', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function DashboardLayout({ children, user, navItems = defaultNavItems, onLogout }: DashboardLayoutProps) {
  const pathname = usePathname() || '/';
  const notificationsCount = user.notificationsCount ?? 0;

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-72 bg-slate-950 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="tracking-tight">FleetMaster Pro</h1>
              <p className="text-xs text-slate-400">Transport Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Main navigation">
          <p className="text-xs text-slate-400 px-4 mb-3">MAIN MENU</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ' +
                  (active
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white')
                }
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <div className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5 text-slate-400" />
              {notificationsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px]">
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </Badge>
              )}
            </div>
          </div>

          {onLogout && (
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
