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
  Receipt, ArrowRight, MapPin, Clock, CheckCircle2, XCircle, Settings, Truck,
  Boxes
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDecimal } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const THEME_COLORS = {
  primary: '#0ea5e9',    // Blue
  secondary: '#f59e0b',  // Yellow
  tertiary: '#6366f1',   // Purple
  success: '#10b981',    // Green
  danger: '#f43f5e',     // Red
  violet: '#8b5cf6',     // Violet
};

const GLASS_EFFECT = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
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
    <div className="flex-1 space-y-6 p-4 sm:p-8 pt-6 min-h-screen">
      {/* Modern Header */}
      <motion.div 
        className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 px-2"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="inline-flex p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 shadow-xl" style={GLASS_EFFECT}>
          <div
            className="p-3 sm:p-4 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${THEME_COLORS.primary}15, ${THEME_COLORS.primary}25)`,
              boxShadow: `0 4px 12px ${THEME_COLORS.primary}15`
            }}
          >
            <Package className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: THEME_COLORS.primary }} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Track Your Order
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2 sm:mt-3 px-4">
            Enter your order ID to track your laundry status in real-time
          </p>
        </div>
      </motion.div>

      {/* Search Form */}
      <motion.div
        className="max-w-2xl mx-auto px-2"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <form
          onSubmit={handleSearch}
          className="relative flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 rounded-2xl bg-slate-100/80 shadow-lg dark:bg-slate-900"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter Order ID (e.g., d82e888d)"
            className="flex-1 text-base sm:text-lg h-12 border-none placeholder:text-muted-foreground/50"
            disabled={showLoader}
          />
          <Button 
            type="submit" 
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-all duration-200 w-full sm:w-auto" 
            disabled={showLoader}
          >
            {showLoader ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 animate-spin" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Track Order
                <Search className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Order Details Card */}
      {!showLoader && order && (
        <motion.div
          className="max-w-3xl mx-auto px-2"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Card className="overflow-hidden shadow-xl dark:bg-slate-800/50">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${THEME_COLORS.primary}10`,
                    }}
                  >
                    <Receipt className="w-5 h-5" style={{ color: THEME_COLORS.primary }} />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-semibold">
                      Order #{order.id.slice(-8)}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <Badge 
                  className="px-2.5 py-1 rounded-full text-xs font-medium w-fit"
                  style={{
                    backgroundColor: `${THEME_COLORS[['paid', 'processing', 'completed', 'delivered'].includes(order.status.toLowerCase()) ? 'success' : 'danger']}15`,
                    color: THEME_COLORS[['paid', 'processing', 'completed', 'delivered'].includes(order.status.toLowerCase()) ? 'success' : 'danger']
                  }}
                >
                  {['paid', 'processing', 'completed', 'delivered'].includes(order.status.toLowerCase()) ? (
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

            <CardContent className="grid gap-4 sm:gap-6 p-4 sm:p-6">
              {/* Status Timeline */}
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm overflow-x-auto">
                <h3 className="font-medium text-sm text-muted-foreground mb-4">ORDER STATUS</h3>
                {order.status.toLowerCase() === 'cancelled' ? (
                  // Cancelled Order Status
                  <div className="relative">
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-destructive/20" />
                    <div className="relative flex flex-col items-center z-10">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-destructive shadow-lg shadow-destructive/25">
                        <XCircle className="w-5 h-5 text-white" />
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
                  // Normal Order Status Timeline
                  <div className="relative min-w-[600px]">
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 dark:bg-slate-700" />
                    <div className="relative grid grid-cols-5 gap-0">
                      {[
                        {
                          status: 'Pending',
                          icon: Clock,
                          color: THEME_COLORS.primary,
                          isCompleted: ['pending', 'paid', 'processing', 'completed', 'delivered'].includes(order.status.toLowerCase())
                        },
                        {
                          status: 'Payment',
                          icon: CreditCard,
                          color: THEME_COLORS.success,
                          isCompleted: ['paid', 'processing', 'completed', 'delivered'].includes(order.status.toLowerCase())
                        },
                        {
                          status: 'Processing',
                          icon: Settings,
                          color: THEME_COLORS.secondary,
                          isCompleted: ['processing', 'completed', 'delivered'].includes(order.status.toLowerCase())
                        },
                        {
                          status: 'Completed',
                          icon: CheckCircle2,
                          color: THEME_COLORS.tertiary,
                          isCompleted: ['completed', 'delivered'].includes(order.status.toLowerCase())
                        },
                        {
                          status: 'Delivered',
                          icon: Truck,
                          color: THEME_COLORS.success,
                          isCompleted: ['delivered'].includes(order.status.toLowerCase())
                        }
                      ].map((step, index) => {
                        const isCurrentStatus = order.status.toLowerCase() === step.status.toLowerCase() ||
                          (step.status === 'Payment' && order.status.toLowerCase() === 'paid');
                        const IconComponent = step.icon;
                        
                        return (
                          <div key={step.status} className="relative flex flex-col items-center z-10">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                step.isCompleted 
                                  ? 'shadow-lg' 
                                  : 'bg-slate-100 dark:bg-slate-700'
                              } ${
                                isCurrentStatus 
                                  ? 'ring-4 ring-opacity-20'
                                  : ''
                              }`}
                              style={{
                                backgroundColor: step.isCompleted ? `${step.color}15` : '',
                                boxShadow: step.isCompleted ? `0 8px 16px -4px ${step.color}25` : '',
                                borderColor: step.color,
                                ...(isCurrentStatus && { ringColor: step.color })
                              }}
                            >
                              <IconComponent 
                                className={`w-5 h-5 ${
                                  step.isCompleted ? '' : 'text-slate-400'
                                }`}
                                style={{ color: step.isCompleted ? step.color : undefined }}
                              />
                            </div>
                            
                            <div className="mt-3 flex flex-col items-center gap-1">
                              <span className={`text-sm font-medium ${
                                isCurrentStatus 
                                  ? 'text-primary' 
                                  : step.isCompleted 
                                    ? 'text-slate-900 dark:text-slate-100' 
                                    : 'text-slate-500 dark:text-slate-400'
                              }`}
                              style={{ color: isCurrentStatus ? step.color : undefined }}>
                                {step.status}
                              </span>
                              {isCurrentStatus && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(), 'MMM dd, yyyy')}
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

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Services */}
                {order.services.map((service, index) => (
                  <div 
                    key={index}
                    className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 sm:space-y-4"
                    style={GLASS_EFFECT}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${THEME_COLORS.violet}15, ${THEME_COLORS.violet}25)`,
                        }}
                      >
                        <Package className="w-5 h-5" style={{ color: THEME_COLORS.violet }} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{service.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          ${formatDecimal(service.pricePerKg)} per qty
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      <span>{service.quantity} qty</span>
                      <span className="text-muted-foreground">•</span>
                      <span>${formatDecimal(service.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="mt-2 sm:mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-medium">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    ${formatDecimal(order.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Notes if any */}
              {order.notes && (
                <div className="mt-2 sm:mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-sm sm:text-base mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}



