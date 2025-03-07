"use client";

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        setIsAdmin(data.user.role === 'admin');
        setMounted(true);

        // Redirect non-admin users trying to access admin routes
        if (!data.user.role === 'admin' && window.location.pathname.includes('/dashboard/services')) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        router.push('/login');
      }
    };

    checkUserRole();
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
      />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)}
          isAdmin={isAdmin}
        />
        
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
