'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDecimal } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CheckCircle2, Clock, CreditCard, Banknote, ArrowLeft, MapPin,
  Package, Calendar, AlertCircle, Receipt, User, Truck, Settings, StickyNote,
  Info, Boxes, Home, XCircle, Building2, Wallet,
  Check,
  X
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { WashingMachineLoader } from "@/components/ui/washing-machine-loader";
import { motion } from "framer-motion";
import { THEME_COLORS } from '@/constants/theme';

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const getStatusColor = (status) => {
  const statusColors = {
    'pending': {
      bg: `${THEME_COLORS.secondary}15`,
      text: THEME_COLORS.secondary,
      icon: Clock
    },
    'paid': {
      bg: `${THEME_COLORS.success}15`,
      text: THEME_COLORS.success,
      icon: CreditCard
    },
    'processing': {
      bg: `${THEME_COLORS.primary}15`,
      text: THEME_COLORS.primary,
      icon: Clock
    },
    'completed': {
      bg: `${THEME_COLORS.success}15`,
      text: THEME_COLORS.success,
      icon: CheckCircle2
    },
    'cancelled': {
      bg: `${THEME_COLORS.danger}15`,
      text: THEME_COLORS.danger,
      icon: XCircle
    },
    'delivered': {
      bg: `${THEME_COLORS.violet}15`,
      text: THEME_COLORS.violet,
      icon: Truck
    }
  };

  return statusColors[status?.toLowerCase()] || {
    bg: `${THEME_COLORS.secondary}15`,
    text: THEME_COLORS.secondary,
    icon: Info
  };
};

const StatusIcon = ({ status, className }) => {
  const statusConfig = getStatusColor(status);
  const IconComponent = statusConfig.icon;
  return <IconComponent className={className} style={{ color: statusConfig.text }} />;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);

  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setShowLoader(false);
    }, 600); // 0.6 seconds minimum loading time

    return () => clearTimeout(minLoadingTime);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        // First get the user role
        const roleResponse = await fetch(`${BASE_URL}/api/auth/me`);
        if (!roleResponse.ok) {
          throw new Error('Failed to fetch user role');
        }
        const roleData = await roleResponse.json();
        setUserRole(roleData.user.role);
        console.log('User Role:', roleData.user.role); // Debug log

        // Then load order details
        await loadOrderDetails();
      } catch (error) {
        console.error('Error during initialization:', error);
        toast.error('Failed to initialize page');
      }
    };

    initialize();
  }, []);

  async function loadOrderDetails() {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data.order);
      
      // Use the correct endpoint for fetching payment by order ID
      if (data.order?._id) {
        const paymentResponse = await fetch(`${BASE_URL}/api/payments/by-order/${data.order._id}`);
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          setPayment(paymentData.payment);
        }
      }
    } catch (error) {
      console.error('Error loading details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  if (loading || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading orders details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find the order you're looking for.
            </p>
            <Button
              onClick={() => router.push('/dashboard/orders')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Current state:', { userRole, payment }); // Debug log

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-3 rounded-full bg-[${THEME_COLORS.primary}]/10`}>
              <Package className={`w-8 h-8 text-[${THEME_COLORS.primary}]`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Order</span>
                <span
                  className="px-2 py-0.5 rounded bg-primary/10 text-primary"
                  style={{
                    backgroundColor: `${THEME_COLORS.primary}15`,
                    color: THEME_COLORS.primary
                  }}
                >
                  #{order.id.slice(-8)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/orders')}
          className="gap-2 hover:shadow-md transition-all duration-200"
        >
          <ArrowLeft className={`w-4 h-4 text-[${THEME_COLORS.secondary}]`} />
          Back to Orders
        </Button>
      </motion.div>

      {/* Modern Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* Order Summary Card - Spans 4 columns */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="md:col-span-4"
        >
          <Card
            className="h-full shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, 
                ${THEME_COLORS.primary}05 0%, 
                ${THEME_COLORS.secondary}05 50%,
                ${THEME_COLORS.tertiary}05 100%
              )`
            }}
          >
            <CardHeader className="border-b border-border/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-full"
                    style={{
                      backgroundColor: order.status?.toLowerCase() === 'cancelled' ? 'rgb(239 68 68 / 0.15)' : `${THEME_COLORS.primary}15`,
                      color: order.status?.toLowerCase() === 'cancelled' ? 'rgb(239 68 68)' : THEME_COLORS.primary
                    }}
                  >
                    {order.status?.toLowerCase() === 'cancelled' ? (
                      <XCircle className="w-6 h-6" />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Order Summary</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                      <Calendar className="w-4 h-4" style={{ color: THEME_COLORS.primary }} />
                      <span className="font-medium">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                      <span className="text-xs opacity-50">•</span>
                      <span>{format(new Date(order.createdAt), 'pp')}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  className="px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: getStatusColor(order.status).bg,
                    color: getStatusColor(order.status).text
                  }}
                >
                  <StatusIcon status={order.status} className="w-4 h-4" />
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {order.status?.toLowerCase() === 'cancelled' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-destructive/20">
                        <XCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-destructive">Order Cancelled</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.updatedAt
                            ? `Order was cancelled on ${format(new Date(order.updatedAt), 'PPP')}`
                            : 'Order was cancelled'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Show original order details even if cancelled */}
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Original Order Details</h3>
                    <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Service Type</span>
                          <span className="text-sm font-medium">{order.services[0]?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Quantity</span>
                          <span className="text-sm font-medium">{formatDecimal(order.services[0]?.weight)}qty</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Price per qty</span>
                          <span className="text-sm font-medium">${formatDecimal(order.services[0]?.pricePerKg)}/qty</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-destructive/20">
                          <span className="text-sm font-medium text-muted-foreground">Total Amount (Cancelled)</span>
                          <span className="text-sm font-bold text-destructive">${formatDecimal(order.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Your existing content for non-cancelled orders
                <div className="space-y-8">
                  {/* Price and Service Type Banner */}
                  <div
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 rounded-xl"
                    style={{ backgroundColor: `${THEME_COLORS.primary}15` }}
                  >
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4" style={{ color: THEME_COLORS.primary }} />
                        Total Amount
                      </p>
                      <span
                        className="text-4xl font-bold tracking-tight"
                        style={{ color: THEME_COLORS.primary }}
                      >
                        ${formatDecimal(order.totalPrice)}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-4 px-5 py-4 rounded-xl"
                      style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}
                    >
                      <div
                        className="p-2.5 rounded-full"
                        style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}
                      >
                        <Package className="w-5 h-5" style={{ color: THEME_COLORS.secondary }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: THEME_COLORS.secondary }}>{order.services[0]?.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Boxes className="w-3 h-3" style={{ color: THEME_COLORS.secondary }} />
                          <span className="font-medium">{formatDecimal(order.services[0]?.weight)}qty</span>
                          <span className="opacity-50">total quantity</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: THEME_COLORS.tertiary }} />
                      Order Timeline
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          icon: Receipt,
                          title: "Order Placed",
                          date: format(new Date(order.createdAt), 'PPP'),
                          time: format(new Date(order.createdAt), 'pp'),
                          color: THEME_COLORS.primary,
                          active: true
                        },
                        {
                          icon: Settings,
                          title: "Processing Time",
                          date: "24-48 hours",
                          time: "Estimated",
                          color: THEME_COLORS.secondary,
                          active: ['processing', 'completed', 'delivered', 'paid'].includes(order.status.toLowerCase())
                        },
                        {
                          icon: Truck,
                          title: "Expected Delivery",
                          date: format(new Date(new Date(order.createdAt).getTime() + (48 * 60 * 60 * 1000)), 'PPP'),
                          time: "By end of day",
                          color: THEME_COLORS.tertiary,
                          active: ['delivered'].includes(order.status.toLowerCase())
                        }
                      ].map((step, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border transition-all duration-200`}
                          style={{
                            backgroundColor: step.active ? `${step.color}15` : 'transparent',
                            borderColor: step.active ? `${step.color}20` : '#e2e8f0'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <step.icon
                              className="w-4 h-4"
                              style={{
                                color: step.active ? step.color : '#94a3b8'
                              }}
                            />
                            <p
                              className="text-xs font-medium"
                              style={{
                                color: step.active ? step.color : '#64748b'
                              }}
                            >
                              {step.title}
                            </p>
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: step.active ? step.color : '#64748b'
                            }}
                          >
                            {step.date}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{step.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4" style={{ color: THEME_COLORS.violet }} />
                      Service Breakdown
                    </h3>
                    <div className="space-y-3">
                      {order.services && order.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/40 transition-all duration-200"
                          style={{ backgroundColor: `${THEME_COLORS.violet}15` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full" style={{ backgroundColor: `${THEME_COLORS.violet}15` }}>
                              <Package className="w-4 h-4" style={{ color: THEME_COLORS.violet }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: THEME_COLORS.violet }}>{service.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span className="font-medium">{formatDecimal(service.weight)}qty</span>
                                <span className="opacity-50">•</span>
                                <span>${formatDecimal(service.pricePerKg)}/qty</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold" style={{ color: THEME_COLORS.violet }}>${formatDecimal(service.subtotal)}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Total for service
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Section */}
                    <div className="mt-6 pt-4 border-t border-border/10">
                      <div
                        className="flex justify-between items-center p-4 rounded-lg"
                        style={{ backgroundColor: `${THEME_COLORS.success}15` }}
                      >
                        <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                        <span className="text-lg font-bold" style={{ color: THEME_COLORS.success }}>${formatDecimal(order.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Status Card - Spans 2 columns */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="md:col-span-2"
        >
          <Card className="h-full bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Receipt className={`w-6 h-6 text-[${THEME_COLORS.tertiary}]`} />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Remove the first occurrence of the COD payment section */}

              {/* Keep existing conditions for other status */}
              {order.status?.toLowerCase() === 'cancelled' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 opacity-75">
                      <div className="p-2 rounded-full bg-muted">
                        <Receipt className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Payment Information</p>
                        <p className="text-sm text-muted-foreground/75 mt-1">
                          Original Amount: ${formatDecimal(order.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : ['paid', 'processing', 'completed', 'delivered'].includes(order.status?.toLowerCase()) ? (
                <div className="space-y-6">
                  {/* Large Success Status Card */}
                  <div className="flex flex-col items-center text-center p-8 rounded-xl bg-[#10b981]/10 border-2 border-[#10b981]/20 backdrop-blur-sm"> {/* Added backdrop blur */}
                    <div className="p-4 rounded-full bg-[#10b981]/20 mb-4 animate-pulse"> {/* Added subtle animation */}
                      <CheckCircle2 className="h-10 w-10 text-[#10b981]" /> {/* Larger success icon */}
                    </div>
                    <h3 className="text-2xl font-bold text-[#10b981] mb-2 tracking-tight">
                      Payment {userRole === 'admin' ? 'Status' : 'Successful'}
                    </h3>
                    <p className="text-muted-foreground max-w-md"> {/* Added max width for better readability */}
                      {userRole === 'admin'
                        ? 'Customer payment has been processed and verified'
                        : 'Thank you! Your payment has been processed successfully'
                      }
                    </p>

                    {/* Payment Amount */}
                    <div className="mt-8 mb-6"> {/* Increased spacing */}
                      <p className="text-sm text-muted-foreground mb-2">
                        {userRole === 'admin' ? 'Payment Amount' : 'Amount Paid'}
                      </p>
                      <p className="text-4xl font-bold text-[#10b981] tracking-tight"> {/* Larger amount text */}
                        ${formatDecimal(order.totalPrice)}
                      </p>
                    </div>

                    {/* Payment Details */}
                    <div className="w-full max-w-sm mt-6 space-y-3">
                      {/* Added hover effects and transitions to detail rows */}
                      <div className="flex justify-between items-center p-3.5 rounded-lg bg-[#10b981]/5 hover:bg-[#10b981]/10 transition-colors duration-200">
                        <span className="text-sm font-medium text-muted-foreground">Payment ID</span>
                        <code className="text-sm font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded">
                          {order.id.slice(-8)}
                        </code>
                      </div>
                      <div className="flex justify-between items-center p-3.5 rounded-lg bg-[#10b981]/5 hover:bg-[#10b981]/10 transition-colors duration-200">
                        <span className="text-sm font-medium text-muted-foreground">Date</span>
                        <span className="text-sm font-medium">
                          {format(new Date(order.createdAt), 'PPP')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3.5 rounded-lg bg-[#10b981]/5 hover:bg-[#10b981]/10 transition-colors duration-200">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <span className="text-sm font-medium bg-[#10b981]/20 text-[#10b981] px-2 py-1 rounded-full"> {/* Added pill style */}
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      {userRole === 'admin' && (
                        <div className="flex justify-between items-center p-3.5 rounded-lg bg-[#10b981]/5 hover:bg-[#10b981]/10 transition-colors duration-200">
                          <span className="text-sm font-medium text-muted-foreground">Customer</span>
                          <span className="text-sm font-medium">
                            {order.userId?.name || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Only show Payment Status Banner if NOT COD */}
                  {(!existingPayment || existingPayment.method !== 'COD') && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg bg-[${THEME_COLORS.secondary}]/10 border border-[${THEME_COLORS.secondary}]/20`}>
                      <Clock className={`w-5 h-5 text-[${THEME_COLORS.secondary}] animate-pulse`} />
                      <div>
                        <p className={`text-base font-medium text-[${THEME_COLORS.secondary}]`}>
                          Payment Pending
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Complete payment to process order
                        </p>
                      </div>
                    </div>
                  )}

                  {/* COD Payment Status section */}
                  {existingPayment && existingPayment.method === 'COD' && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Method</span>
                          <span className="text-sm font-medium">Cash on Delivery</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Amount</span>
                          <span className="text-lg font-bold" style={{ color: THEME_COLORS.primary }}>
                            ${formatDecimal(order.totalPrice)}
                          </span>
                        </div>
                      </div>

                      {userRole === 'admin' && (
                        <PaymentButtons
                          orderId={order.id}
                          totalAmount={order.totalPrice}
                          payment={existingPayment}
                          userRole={userRole}
                          onPaymentComplete={() => router.refresh()}
                        />
                      )}
                    </div>
                  )}

                  {/* Payment Buttons for non-admin users or when no payment exists */}
                  {(!existingPayment || userRole !== 'admin') && (
                    <PaymentButtons
                      orderId={order.id}
                      totalAmount={order.totalPrice}
                      payment={existingPayment}
                      userRole={userRole}
                      onPaymentComplete={() => router.refresh()}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Delivery Information Card */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="md:col-span-3"
        >
          <Card className="h-full bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="py-2 border-b border-border/5">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" style={{ color: THEME_COLORS.tertiary }} />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {order.status.toLowerCase() === 'cancelled' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 opacity-75">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryAddress || 'No delivery address provided'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Pickup Information */}
                  <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.primary}08` }}>
                    <Building2 className="w-4 h-4 shrink-0" style={{ color: THEME_COLORS.primary }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm truncate" style={{ color: THEME_COLORS.primary }}>
                        {order.pickupAddress || 'No pickup address provided'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(order.createdAt), 'hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.secondary}08` }}>
                    <Home className="w-4 h-4 shrink-0" style={{ color: THEME_COLORS.secondary }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="text-sm truncate" style={{ color: THEME_COLORS.secondary }}>
                        {order.deliveryAddress || 'No delivery address provided'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.status.toLowerCase() === 'pending' ? 'Pending' :
                            format(new Date(new Date(order.createdAt).getTime() + (42 * 60 * 60 * 1000)), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {order.status.toLowerCase() === 'pending' ? 'TBD' :
                            format(new Date(new Date(order.createdAt).getTime() + (42 * 60 * 60 * 1000)), 'hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.tertiary}08` }}>
                    <Info className="w-4 h-4 shrink-0" style={{ color: THEME_COLORS.tertiary }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm" style={{ color: THEME_COLORS.tertiary }}>
                        {order.status === 'pending' ? 'Awaiting Processing' : 
                         order.status === 'paid' ? 'Payment Received' :
                         `Order ${order.status}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.status === 'pending' ? 'Will be processed soon' :
                         order.status === 'paid' ? 'Order is confirmed and will be processed soon' :
                         order.status === 'processing' ? 'Being processed' :
                         order.status === 'completed' ? 'Order completed' :
                         order.status === 'delivered' ? 'Order delivered' :
                         order.status === 'cancelled' ? 'Order cancelled' : 
                         'Processing order'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Details Card */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="md:col-span-3"
        >
          <Card className="h-full bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="py-1 border-b border-border/5">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-full" style={{ backgroundColor: `${THEME_COLORS.tertiary}15` }}>
                  <Settings className="w-4 h-4" style={{ color: THEME_COLORS.tertiary }} />
                </div>
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Additional Details
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1.5">
              {order.status.toLowerCase() === 'cancelled' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 opacity-75">
                      <Info className="w-5 h-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Original service: {order.services[0]?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  {/* Service Type */}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${THEME_COLORS.primary}08` }}>
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" style={{ color: THEME_COLORS.primary }} />
                      <div>
                        <p className="text-xs text-muted-foreground">Service Type</p>
                        <p className="text-sm font-medium mt-0.5" style={{ color: THEME_COLORS.primary }}>
                          {order.services?.[0]?.name || 'Standard Service'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${THEME_COLORS.secondary}08` }}>
                    <div className="flex items-center gap-3">
                      <Boxes className="w-4 h-4" style={{ color: THEME_COLORS.secondary }} />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Quantity</p>
                        <p className="text-sm font-medium mt-0.5" style={{ color: THEME_COLORS.secondary }}>
                          {formatDecimal(order.services?.[0]?.weight || 0)} qty
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Per Qty */}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${THEME_COLORS.tertiary}08` }}>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4" style={{ color: THEME_COLORS.tertiary }} />
                      <div>
                        <p className="text-xs text-muted-foreground">Price Per Qty</p>
                        <p className="text-sm font-medium mt-0.5" style={{ color: THEME_COLORS.tertiary }}>
                          ${formatDecimal(order.services?.[0]?.pricePerKg || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {order.notes && (
                    <div className="p-3 rounded-xl mt-2" style={{ backgroundColor: `${THEME_COLORS.violet}08` }}>
                      <div className="flex items-center gap-3">
                        <StickyNote className="w-4 h-4" style={{ color: THEME_COLORS.violet }} />
                        <div>
                          <p className="text-xs text-muted-foreground">Order Notes</p>
                          <p className="text-sm font-medium mt-0.5" style={{ color: THEME_COLORS.violet }}>
                            {order.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

async function handleCashOnDelivery(orderId) {
  try {
    const response = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        method: 'COD'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to set up cash on delivery');
    }

    toast.success('Cash on delivery set up successfully');
    window.location.reload();
  } catch (error) {
    toast.error(error.message || 'Failed to set up cash on delivery');
  }
}

// Separate PaymentButtons component
function PaymentButtons({ orderId, totalAmount, onPaymentComplete, payment: initialPayment, userRole: initialUserRole }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [payment, setPayment] = useState(initialPayment);
  const [userRole, setUserRole] = useState(initialUserRole);

  // Add handleOnlinePayment function
  const handleOnlinePayment = async (orderId, amount) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`${BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          method: 'ONLINE'
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Redirect to Stripe checkout
      if (data.stripeSession?.url) {
        window.location.href = data.stripeSession.url;
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error) {
      toast.error(error.message || 'Failed to process online payment');
      setIsProcessing(false);
    }
  };

  // Fetch payment if not provided initially
  useEffect(() => {
    const fetchPayment = async () => {
      if (!orderId || payment) return;

      try {
        const response = await fetch(`${BASE_URL}/api/payments/by-order/${orderId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.payment) {
            setPayment(data.payment);
          }
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
      }
    };

    fetchPayment();
  }, [orderId, payment]);

  // Update payment state when initialPayment changes
  useEffect(() => {
    if (initialPayment) {
      setPayment(initialPayment);
    }
  }, [initialPayment]);

  // Update userRole state when initialUserRole changes
  useEffect(() => {
    if (initialUserRole) {
      setUserRole(initialUserRole);
    }
  }, [initialUserRole]);

  const handleCODPayment = async (orderId) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`${BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          method: 'COD'
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setPayment(data.payment);
      toast.success('Cash on delivery set up successfully');
      if (onPaymentComplete) onPaymentComplete();
    } catch (error) {
      toast.error(error.message || 'Failed to set up cash on delivery');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentStatus = () => {
    if (!payment) return null;

    return (
      <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
        <div className="flex items-center gap-3 mb-2">
          {payment.method === 'COD' ? (
            <Banknote className="h-5 w-5 text-orange-600" />
          ) : (
            <CreditCard className="h-5 w-5 text-orange-600" />
          )}
          <p className="font-medium text-orange-600">
            {payment.method === 'COD' ? 'Cash on Delivery Payment' : 'Online Payment'}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Payment Status: {' '}
            <Badge
              variant="outline"
              className={payment.status === 'PAID' 
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-orange-50 text-orange-600 border-orange-200'
              }
            >
              {payment.status}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            Amount: ${payment.amount}
          </p>
        </div>
      </div>
    );
  };

  const renderPaymentButtons = () => {
    // Don't show payment buttons for admin or if payment exists
    if (userRole === 'admin' || payment) return null;

    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={() => handleCODPayment(orderId)}
          disabled={isProcessing}
          className="w-full h-auto py-4"
        >
          <div className="flex flex-col items-center gap-1">
            <Banknote className="h-5 w-5" />
            <span>Pay with Cash on Delivery</span>
          </div>
        </Button>
        <Button
          onClick={() => handleOnlinePayment(orderId, totalAmount)}
          disabled={isProcessing}
          className="w-full h-auto py-4"
        >
          <div className="flex flex-col items-center gap-1">
            <CreditCard className="h-5 w-5" />
            <span>Pay Online</span>
          </div>
        </Button>
      </div>
    );
  };

  const renderAdminControls = () => {
    if (!payment || userRole !== 'admin' || payment.method !== 'COD') return null;

    return (
      <AdminCODControls 
        payment={{
          _id: payment.id,
          status: payment.status,
          method: payment.method,
          amount: payment.amount,
          orderId: payment.orderId
        }}
        onStatusUpdate={async () => {
          const response = await fetch(`${BASE_URL}/api/payments/${orderId}`, {
            credentials: 'include'
          });
          const data = await response.json();
          if (response.ok && data.payment) {
            setPayment(data.payment);
          }
          if (onPaymentComplete) onPaymentComplete();
        }} 
      />
    );
  };

  return (
    <div className="space-y-4">
      {renderPaymentStatus()}
      {renderPaymentButtons()}
      {renderAdminControls()}
    </div>
  );
}

const updatePaymentStatus = async (orderId, status) => {
  const response = await fetch(`${BASE_URL}/api/payments/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update payment status');
  }
  return data;
};

function AdminCODControls({ payment, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      await updatePaymentStatus(payment.orderId, newStatus);
      toast.success('Payment status updated successfully');
      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col gap-2">
        {payment.status !== 'PAID' && (
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('PAID')}
            disabled={isUpdating}
            className="w-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Mark as Paid</span>
            </div>
          </Button>
        )}
        {payment.status !== 'PENDING' && (
          <Button
            variant="outline"
            onClick={async () => {
              await handleStatusUpdate('PENDING');
              window.location.reload(); // Force page reload after status update
            }}
            disabled={isUpdating}
            className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Mark as Pending</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}




