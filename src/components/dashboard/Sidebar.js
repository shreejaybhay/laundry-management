
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Home,
  ShoppingBag,
  Wrench,
  BarChart,
  Settings,
  LayoutDashboard,
  CreditCard,
  History,
  Clock,
  Users,
  Plus
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

// Add theme colors at the top of the file
const THEME_COLORS = {
  primary: '#0ea5e9',    // Blue
  tertiary: '#6366f1',   // Purple
  success: '#10b981',    // Green
  danger: '#f43f5e',     // Red
  violet: '#8b5cf6',     // Violet
};

const SidebarSkeleton = () => (
  <div className="space-y-2 py-2 px-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-10 bg-accent/10 rounded-md animate-pulse" />
    ))}
  </div>
);

const SidebarContent = ({ pathname, isAdmin }) => {
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Services', href: '/dashboard/services', icon: Wrench },
    { name: 'Payments', href: '/dashboard/revenue', icon: CreditCard },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Track Orders', href: '/dashboard/track', icon: Clock },
    { name: 'Payment History', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navigation.map((item) => {
        // Special handling for dashboard path
        const isActive = item.href === '/dashboard' 
          ? pathname === '/dashboard'
          : pathname.startsWith(`${item.href}`);
        
        return (
          <Link key={item.name} href={item.href} className="w-full">
            <Button
              variant="ghost"
              className={cn(
                "w-full",
                "flex items-center",
                "text-sm font-medium",
                "transition-colors duration-200",
                "rounded-md",
                "px-3 py-2",
                "justify-start",
                isActive 
                  ? `bg-[${THEME_COLORS.primary}]/10 text-[${THEME_COLORS.primary}] hover:bg-[${THEME_COLORS.primary}]/20` 
                  : "hover:bg-accent/50 hover:text-accent-foreground",
                "relative",
              )}
            >
              <div className="flex items-center text-left w-full">
                <item.icon className="h-4 w-4 mr-3 shrink-0" aria-hidden="true" />
                <span className="text-left truncate">{item.name}</span>
              </div>
              {isActive && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[${THEME_COLORS.primary}] rounded-l-full`} />
              )}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkUserRole = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`);
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.user.role === 'admin');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (!mounted) return null;

  const sidebarContent = isLoading ? (
    <SidebarSkeleton />
  ) : (
    <SidebarContent pathname={pathname} isAdmin={isAdmin} />
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center border-b border-border px-4">
            <h2 className="text-lg font-semibold">LaundryHub</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            {sidebarContent}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b border-border px-4">
            <h2 className="text-lg font-semibold">LaundryHub</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
