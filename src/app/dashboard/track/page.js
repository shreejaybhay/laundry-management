"use client";

import { useState, useEffect } from 'react';
import { WashingMachineLoader } from '@/components/ui/washing-machine-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Package, Calendar, CreditCard, Scale, Search,
  Receipt, ArrowRight, MapPin, Clock, CheckCircle2, XCircle,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatDecimal } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

// Consistent color palette
const THEME_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  border: 'hsl(var(--border))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  success: 'hsl(142.1 76.2% 36.3%)',
  danger: 'hsl(var(--destructive))',
};

// Consistent glass effect
const GLASS_EFFECT = {
  backgroundColor: 'hsl(var(--background))',
  backdropFilter: 'blur(10px)',
  border: '1px solid hsl(var(--border))',
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export default function TrackPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);  // Initialize as true
  const [order, setOrder] = useState(null);

  // Add initial page load effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500); // 1.5 seconds minimum loading time

    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  // Show loader while loading or during minimum loading time
  if (showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading track...</p>
      </div>
    );
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Clean up the search input - remove spaces and get last 8 characters
    const searchId = search.trim().replace(/\s+/g, '').slice(-8);
    
    if (!searchId) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    setOrder(null);

    try {
      const response = await fetch(`${BASE_URL}/api/orders/${searchId}/track`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }
      
      setOrder(data.order);
      toast.success('Order found!');
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'No order found with this ID');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'paid': `bg-[${THEME_COLORS.success}]/10 text-[${THEME_COLORS.success}]`,
      'unpaid': `bg-[${THEME_COLORS.danger}]/10 text-[${THEME_COLORS.danger}]`,
      'processing': `bg-[${THEME_COLORS.primary}]/10 text-[${THEME_COLORS.primary}]`,
      'completed': `bg-[${THEME_COLORS.success}]/10 text-[${THEME_COLORS.success}]`,
      'cancelled': `bg-[${THEME_COLORS.danger}]/10 text-[${THEME_COLORS.danger}]`,
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Modern Header */}
      <motion.div 
        className="max-w-3xl mx-auto text-center space-y-6"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="inline-flex p-2 rounded-2xl bg-card shadow-lg border border-border/50">
          <div className="p-4 rounded-xl bg-primary/10">
            <Package className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Track Your Order
          </h1>
          <p className="text-lg text-muted-foreground mt-3">
            Enter your order ID to track your laundry status in real-time
          </p>
        </div>
      </motion.div>

      {/* Search Form */}
      <motion.div
        className="max-w-2xl mx-auto"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <form
          onSubmit={handleSearch}
          className="relative flex gap-3 p-2 rounded-2xl bg-card border border-border/50 shadow-lg"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter Order ID (e.g., d82e888d)"
            className="flex-1 text-lg h-12 bg-background/50"
            disabled={loading}
          />
          <Button 
            type="submit" 
            className="h-12 px-6 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 animate-spin" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Track Order
                <Search className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Order Details Card */}
      {!loading && order && (
        <motion.div
          className="max-w-3xl mx-auto"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Card className="overflow-hidden border border-border/50">
            <CardHeader className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Order #{order.id.slice(-8)}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <Badge variant={order.status.toLowerCase() === 'paid' ? 'success' : 'destructive'}>
                  {order.status.toLowerCase() === 'paid' ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PAID
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      UNPAID
                    </span>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 p-6">
              {/* Status Timeline */}
              <div className="bg-card/50 rounded-xl p-6 border border-border/50">
                <h3 className="font-medium text-sm text-muted-foreground mb-4">ORDER STATUS</h3>
                {order.status.toLowerCase() === 'cancelled' ? (
                  <div className="relative">
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-destructive/20" />
                    <div className="relative flex flex-col items-center z-10">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-destructive">
                        <XCircle className="w-5 h-5 text-destructive-foreground" />
                      </div>
                      <div className="mt-3 flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-destructive">CANCELLED</span>
                        <span className="text-xs text-muted-foreground">
                          {order.updatedAt ? format(new Date(order.updatedAt), 'MMM dd, yyyy') : 'Order was cancelled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />
                    <div className="relative grid grid-cols-4 gap-0">
                      {['Pending', 'Processing', 'Completed', 'Delivered'].map((status, index) => {
                        const isActive = index <= ['pending', 'processing', 'completed', 'delivered']
                          .indexOf(order.status.toLowerCase());
                        const isCurrentStatus = order.status.toLowerCase() === status.toLowerCase();
                        
                        return (
                          <div key={status} className="relative flex flex-col items-center z-10">
                            <div 
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                                isActive ? "bg-primary" : "bg-muted",
                                isCurrentStatus && "ring-4 ring-primary/20"
                              )}
                            >
                              {isActive ? (
                                <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                              )}
                            </div>
                            
                            <div className="mt-3 flex flex-col items-center gap-1">
                              <span className={cn(
                                "text-sm font-medium",
                                isCurrentStatus ? "text-primary" : 
                                isActive ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {status}
                              </span>
                              {isCurrentStatus && (
                                <span className="text-xs text-muted-foreground">
                                  Current Status
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="grid md:grid-cols-2 gap-4">
                {order.services.map((service, index) => (
                  <div 
                    key={index}
                    className="bg-card/50 rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          ${formatDecimal(service.pricePerKg)}/kg
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{service.weight} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <p className="font-semibold text-lg text-foreground">
                          ${formatDecimal(service.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="mt-6 p-6 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <p className="text-3xl font-bold text-primary">
                      ${formatDecimal(order.totalPrice)}
                    </p>
                  </div>
                  {/* Removed Pay Now button */}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-6 p-6 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">Additional Notes</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

