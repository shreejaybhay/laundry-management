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
  Package,
  Calendar,
  CreditCard,
  Scale,
  Search,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDecimal } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const THEME_COLORS = {
  primary: '#0ea5e9',    // Blue
  secondary: '#f59e0b',  // Yellow
  tertiary: '#6366f1',   // Purple
  success: '#10b981',    // Green
  danger: '#f43f5e',     // Red
  violet: '#8b5cf6',     // Violet
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
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
    if (!search.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    setOrder(null);

    try {
      const response = await fetch(`${BASE_URL}/api/orders/${search.trim()}/track`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }
      
      setOrder(data.order);
      toast.success('Order found!');
      setLoading(false);
      
    } catch (error) {
      toast.error(error.message || 'No order found with this ID');
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Track Orders</h2>
          <p className="text-muted-foreground mt-1">
            Track and monitor your laundry orders in real-time
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="flex justify-center">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: `${THEME_COLORS.primary}15` }}
            >
              <Package
                className="w-8 h-8"
                style={{ color: THEME_COLORS.primary }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter your order ID to track your laundry status
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearch}
          className="flex gap-3"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter Order ID (e.g., d82e888d)"
            className="flex-1"
            disabled={showLoader}
          />
          <Button 
            type="submit" 
            className="gap-2" 
            disabled={showLoader}
          >
            {showLoader ? (
              <>Searching...</>
            ) : (
              <>Track Order <Search className="w-4 h-4" /></>
            )}
          </Button>
        </motion.form>

        {/* Only show order details when not loading */}
        {!showLoader && order && (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <Card className="bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-border/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-full"
                      style={{ backgroundColor: `${THEME_COLORS.primary}15` }}
                    >
                      <Receipt
                        className="w-6 h-6"
                        style={{ color: THEME_COLORS.primary }}
                      />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>Order</span>
                        <span 
                          className="px-2 py-0.5 rounded text-sm"
                          style={{ 
                            backgroundColor: `${THEME_COLORS.primary}15`,
                            color: THEME_COLORS.primary 
                          }}
                        >
                          #{order.id.slice(-8)}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={getStatusColor(order.paymentStatus)}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 p-6">
                {/* Order Date */}
                <div className="flex items-center gap-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}
                  >
                    <Calendar
                      className="w-5 h-5"
                      style={{ color: THEME_COLORS.secondary }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {format(new Date(order.createdAt), 'MMMM do, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex items-center gap-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${THEME_COLORS.tertiary}15` }}
                  >
                    <CreditCard
                      className="w-5 h-5"
                      style={{ color: THEME_COLORS.tertiary }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium">${formatDecimal(order.totalPrice)}</p>
                  </div>
                </div>

                {/* Service Details */}
                {order.services.map((service, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${THEME_COLORS.violet}15` }}
                      >
                        <Package
                          className="w-5 h-5"
                          style={{ color: THEME_COLORS.violet }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Service Type</p>
                        <p className="font-medium">{service.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${THEME_COLORS.success}15` }}
                      >
                        <Scale
                          className="w-5 h-5"
                          style={{ color: THEME_COLORS.success }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-medium">{service.weight} kg</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Notes if any */}
                {order.notes && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}











