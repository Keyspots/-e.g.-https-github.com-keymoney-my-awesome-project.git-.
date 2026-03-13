'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Link2,
  Settings,
  ChevronRight,
  Menu,
  X,
  Bell,
  LogOut,
  Leaf,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  directorOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'My Dashboard',    href: '/dashboard/agent',    icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Community',    href: '/dashboard/agent',    icon: <Users className="w-5 h-5" /> },
  { label: 'My Link',         href: '/dashboard/agent',    icon: <Link2 className="w-5 h-5" /> },
  { label: 'Settings',        href: '/dashboard/agent',    icon: <Settings className="w-5 h-5" /> },
  { label: 'Team Overview',   href: '/dashboard/director', icon: <BarChart3 className="w-5 h-5" />, directorOnly: true },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isDirector = pathname.startsWith('/dashboard/director');

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 flex flex-col',
          'bg-green-deep text-white shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-green-mid/40">
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-deep" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Agara Life</p>
            <p className="text-green-light text-xs">Distributor Hub</p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !item.directorOnly || isDirector)
            .map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-green-pale/80 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {item.icon}
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
                </Link>
              );
            })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-green-mid/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-mid flex items-center justify-center text-sm font-bold text-white">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Sarah Jones</p>
              <p className="text-xs text-green-light truncate">Oahu Ohana</p>
            </div>
            <button className="text-green-pale/60 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-border shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-foreground">Good morning, Sarah 🌴</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">Your community is growing. Keep sharing your story.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-green-deep flex items-center justify-center text-sm font-bold text-white">
              S
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
