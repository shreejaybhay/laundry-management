"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Bell, User, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { WashingMachineLoader } from "@/components/ui/washing-machine-loader";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const TopBarSkeleton = () => (
  <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="flex h-14 items-center border-b border-border px-4">
      <WashingMachineLoader className="h-10" />
    </div>
  </header>
);

export default function TopBar({ onMenuClick }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMenuClick) onMenuClick();
  }, [onMenuClick]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const handleBellClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Bell clicked");
  }, []);

  const handleProfileClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/dashboard/profile');
  }, [router]);

  const handleSettingsClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/dashboard/settings');
  }, [router]);

  const handleLogout = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  }, [router]);

  if (!mounted) {
    return <TopBarSkeleton />;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2 hover:bg-accent hover:text-accent-foreground border-0"
          onClick={handleMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent hover:text-accent-foreground border-0"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className="relative hover:bg-accent hover:text-accent-foreground border-0"
            onClick={handleBellClick}
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative hover:bg-accent hover:text-accent-foreground border-0"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 z-50"
                sideOffset={5}
                alignOffset={0}
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleSettingsClick}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
