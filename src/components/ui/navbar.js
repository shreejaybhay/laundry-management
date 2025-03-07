"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="w-full fixed top-0 z-50 transition-all duration-300">
      <div className={`w-full transition-all duration-300 ${
        scrolled ? 'bg-background border-b' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className={`text-xl font-bold transition-all duration-300 ${
                scrolled ? 'text-foreground' : 'text-white'
              }`}>
                LaundryHub
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/services" 
                className={`transition-all duration-300 ${
                  scrolled ? 'text-foreground hover:text-foreground/80' : 'text-white hover:text-white/80'
                }`}
              >
                Services
              </Link>
              <Link 
                href="/pricing" 
                className={`transition-all duration-300 ${
                  scrolled ? 'text-foreground hover:text-foreground/80' : 'text-white hover:text-white/80'
                }`}
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className={`transition-all duration-300 ${
                  scrolled ? 'text-foreground hover:text-foreground/80' : 'text-white hover:text-white/80'
                }`}
              >
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-all duration-300 ${
                    scrolled ? 'text-foreground hover:bg-accent' : 'text-white hover:bg-accent'
                  }`}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                asChild
                className={`transition-all duration-300 ${
                  scrolled 
                    ? 'text-foreground hover:text-black dark:hover:text-black' 
                    : 'text-white hover:text-black dark:hover:text-black'
                }`}
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button 
                variant="default"
                asChild
                className="bg-primary text-white hover:bg-primary/90 transition-all duration-300"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
