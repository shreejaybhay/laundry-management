"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDecimal } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { THEME_COLORS } from '@/constants/theme';
import {
  Receipt, ArrowLeft, CheckCircle2, Clock, CreditCard, Calendar,
  User, Mail, Package, Download, Settings, Truck, MapPin,
  AlertCircle
} from 'lucide-react';
import { WashingMachineLoader } from '@/components/ui/washing-machine-loader';

const MINIMUM_LOADING_TIME = 1500; // Define constant for consistency

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function PaymentDetailsPage({ params }) {
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (params?.id) {
      console.log('Fetching details for ID:', params.id);
      fetchDetails();
    }
  }, [params?.id]);

  // Add minimum loading time effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, MINIMUM_LOADING_TIME);

    return () => clearTimeout(timer);
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const isOrderPayment = params.id.startsWith('order-');
      const actualId = isOrderPayment ? params.id.replace('order-', '') : params.id;

      if (isOrderPayment) {
        // Handle order-based payments
        const orderResponse = await fetch(`/api/orders/${actualId}`);
        if (!orderResponse.ok) throw new Error('Order not found');
        const orderData = await orderResponse.json();

        // Format order data as payment
        const formattedPayment = {
          id: `order-${orderData.order._id}`,
          amount: Number(orderData.order.totalPrice || 0).toFixed(2),
          status: (orderData.order.status || 'PENDING').toUpperCase(),
          method: 'CASH',
          createdAt: orderData.order.createdAt || new Date().toISOString(),
          customerName: orderData.order.userId?.name || 'N/A',
          customerEmail: orderData.order.userId?.email || 'N/A',
        };

        setPayment(formattedPayment);

        // Set order data
        setOrder({
          id: orderData.order._id,
          services: orderData.order.services || [],
          status: orderData.order.status,
          totalPrice: orderData.order.totalPrice,
          deliveryAddress: orderData.order.deliveryAddress || 'N/A',
          createdAt: orderData.order.createdAt
        });

      } else {
        // Handle regular payment IDs
        const response = await fetch(`/api/payments/${actualId}`);
        if (!response.ok) throw new Error('Payment not found');
        
        const data = await response.json();
        if (!data?.payment) throw new Error('Payment not found');

        // Format the payment data
        const formattedPayment = {
          ...data.payment,
          id: data.payment.id || data.payment._id,
          amount: Number(data.payment.amount || 0).toFixed(2),
          createdAt: new Date(data.payment.createdAt).toISOString(),
          status: (data.payment.status || 'PENDING').toUpperCase(),
          method: data.payment.method || 'CASH',
          customerName: data.payment.customerName || data.payment.orderDetails?.userId?.name || 'N/A',
          customerEmail: data.payment.customerEmail || data.payment.orderDetails?.userId?.email || 'N/A',
        };

        setPayment(formattedPayment);

        // Set order data if available
        if (data.payment.orderDetails) {
          setOrder({
            id: data.payment.orderId || data.payment.orderDetails._id,
            services: data.payment.orderDetails.services || [],
            status: data.payment.orderDetails.status,
            totalPrice: data.payment.orderDetails.totalPrice,
            deliveryAddress: data.payment.orderDetails.deliveryAddress || 'N/A',
            createdAt: data.payment.orderDetails.createdAt
          });
        } else if (data.payment.orderId) {
          // If we don't have orderDetails but have orderId, fetch the order separately
          const orderResponse = await fetch(`/api/orders/${data.payment.orderId}`);
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            setOrder({
              id: orderData.order._id,
              services: orderData.order.services || [],
              status: orderData.order.status,
              totalPrice: orderData.order.totalPrice,
              deliveryAddress: orderData.order.deliveryAddress || 'N/A',
              createdAt: orderData.order.createdAt
            });
          }
        }
      }

    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error(error.message || 'Failed to load payment details');
      setPayment(null);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading payment details...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find the payment details you're looking for.
            </p>
            <Button 
              onClick={() => router.push('/dashboard/payments')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return THEME_COLORS.success;
      case 'PENDING':
        return THEME_COLORS.secondary;
      case 'CANCELLED':
        return THEME_COLORS.danger;
      default:
        return THEME_COLORS.primary;
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return THEME_COLORS.success;
      case 'processing':
        return THEME_COLORS.primary;
      default:
        return THEME_COLORS.secondary;
    }
  };

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
            <div className="p-2 rounded-full" style={{ backgroundColor: `${THEME_COLORS.primary}15` }}>
              <Receipt className="w-8 h-8" style={{ color: THEME_COLORS.primary }} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
          </div>
          <p className="text-muted-foreground">
            Transaction #{payment?.id.slice(-8)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/payments')}
          className="gap-2 hover:shadow-md transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Button>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* Payment Summary Card */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="md:col-span-4"
        >
          <Card className="border-none bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardHeader className="border-b border-border/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-full"
                    style={{ 
                      backgroundColor: `${THEME_COLORS.primary}15`,
                      color: THEME_COLORS.primary 
                    }}
                  >
                    <Receipt className="w-6 h-6" />
                  </div>
                  <CardTitle>Payment Summary</CardTitle>
                </div>
                <div
                  className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: `${getStatusColor(payment.status)}15`,
                    color: getStatusColor(payment.status)
                  }}
                >
                  {payment.status === 'PAID' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                  {payment.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-baseline">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: THEME_COLORS.primary }}
                  >
                    ${formatDecimal(payment.amount)}
                  </span>
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ 
                      backgroundColor: `${THEME_COLORS.tertiary}15`,
                      color: THEME_COLORS.tertiary
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>

                <div className="grid gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ 
                        backgroundColor: `${THEME_COLORS.violet}15`,
                        color: THEME_COLORS.violet
                      }}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p 
                        className="font-medium"
                        style={{ color: THEME_COLORS.violet }}
                      >
                        {payment.method === 'ONLINE' ? 'Card Payment' : 'Cash on Delivery'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Details Card */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="md:col-span-2"
        >
          <Card className="h-full border-none bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-border/5">
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="p-2.5 rounded-full" 
                  style={{ 
                    backgroundColor: `${THEME_COLORS.violet}15`,
                    color: THEME_COLORS.violet 
                  }}
                >
                  <User className="w-6 h-6" />
                </div>
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{ backgroundColor: `${THEME_COLORS.primary}08` }}
                  >
                    <div 
                      className="p-2 rounded-full"
                      style={{ 
                        backgroundColor: `${THEME_COLORS.primary}15`,
                        color: THEME_COLORS.primary 
                      }}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p 
                        className="font-medium"
                        style={{ color: THEME_COLORS.primary }}
                      >
                        {payment.customerName}
                      </p>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{ backgroundColor: `${THEME_COLORS.tertiary}08` }}
                  >
                    <div 
                      className="p-2 rounded-full"
                      style={{ 
                        backgroundColor: `${THEME_COLORS.tertiary}15`,
                        color: THEME_COLORS.tertiary 
                      }}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p 
                        className="font-medium"
                        style={{ color: THEME_COLORS.tertiary }}
                      >
                        {payment.customerEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {payment.method === 'ONLINE' ? (
          // For ONLINE payments, keep original order
          <>
            {/* Payment Processing Details */}
            {payment.stripePaymentId && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeIn}
                className="md:col-span-3"
              >
                <Card className="h-full border-none bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="border-b border-border/5 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="p-2.5 rounded-full" 
                        style={{ 
                          backgroundColor: `${THEME_COLORS.secondary}15`,
                          color: THEME_COLORS.secondary 
                        }}
                      >
                        <CreditCard className="w-6 h-6" />
                      </div>
                      Payment Processing Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div 
                        className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 w-full gap-4"
                        style={{ backgroundColor: `${THEME_COLORS.tertiary}08` }}
                      >
                        <div className="flex items-center gap-2 shrink-0">
                          <div 
                            className="p-1.5 rounded-full"
                            style={{ 
                              backgroundColor: `${THEME_COLORS.tertiary}15`,
                              color: THEME_COLORS.tertiary 
                            }}
                          >
                            <Receipt className="w-4 h-4" />
                          </div>
                          <span className="text-muted-foreground whitespace-nowrap">Stripe Payment ID</span>
                        </div>
                        <span 
                          className="font-medium font-mono text-sm break-all text-right"
                          style={{ color: THEME_COLORS.tertiary }}
                        >
                          {payment.stripePaymentId}
                        </span>
                      </div>
                      {payment.cardLast4 && (
                        <div 
                          className="flex justify-between items-center p-3 rounded-lg transition-all duration-200"
                          style={{ backgroundColor: `${THEME_COLORS.violet}08` }}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-1.5 rounded-full"
                              style={{ 
                                backgroundColor: `${THEME_COLORS.violet}15`,
                                color: THEME_COLORS.violet 
                              }}
                            >
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <span className="text-muted-foreground">Card Number</span>
                          </div>
                          <span 
                            className="font-medium font-mono"
                            style={{ color: THEME_COLORS.violet }}
                          >
                            •••• {payment.cardLast4}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="md:col-span-3"
            >
              <Card className="h-full border-none bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="border-b border-border/5 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2.5 rounded-full" style={{ backgroundColor: `${THEME_COLORS.primary}15` }}>
                      <Settings className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 h-24  relative group overflow-hidden justify-center items-center"
                      onClick={() => router.push(`/dashboard/orders/${order?.id}`)}
                      style={{
                        borderColor: `${THEME_COLORS.tertiary}20`,
                        backgroundColor: `${THEME_COLORS.tertiary}05`,
                      }}
                    >
                      <Package 
                        className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" 
                        style={{ color: THEME_COLORS.tertiary }}
                      />
                      <span style={{ color: THEME_COLORS.tertiary }}>View Order</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        style={{ backgroundColor: THEME_COLORS.tertiary }}
                      />
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full gap-2 h-24  relative group overflow-hidden justify-center items-center"
                      style={{
                        borderColor: `${THEME_COLORS.violet}20`,
                        backgroundColor: `${THEME_COLORS.violet}05`,
                      }}
                    >
                      <Download 
                        className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" 
                        style={{ color: THEME_COLORS.violet }}
                      />
                      <span style={{ color: THEME_COLORS.violet }}>Download Invoice</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        style={{ backgroundColor: THEME_COLORS.violet }}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Details */}
            {order && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeIn}
                className="md:col-span-6"
              >
                <Card className="h-full border-none bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="border-b border-border/5 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2.5 rounded-full" style={{ backgroundColor: `${THEME_COLORS.tertiary}15` }}>
                        <Package className="w-6 h-6" style={{ color: THEME_COLORS.tertiary }} />
                      </div>
                      Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div 
                        className="p-4 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: `${THEME_COLORS.primary}08` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: `${THEME_COLORS.primary}15`,
                              color: THEME_COLORS.primary 
                            }}
                          >
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Order ID</p>
                            <p className="font-medium" style={{ color: THEME_COLORS.primary }}>
                              #{(order.id || payment.id || '').toString().slice(-8)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: `${THEME_COLORS.violet}08` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: `${THEME_COLORS.violet}15`,
                              color: THEME_COLORS.violet 
                            }}
                          >
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Service</p>
                            <p className="font-medium" style={{ color: THEME_COLORS.violet }}>
                              {order.services[0]?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: `${THEME_COLORS.tertiary}08` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: `${THEME_COLORS.tertiary}15`,
                              color: THEME_COLORS.tertiary 
                            }}
                          >
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Delivery Address</p>
                            <p className="font-medium text-sm" style={{ color: THEME_COLORS.tertiary }}>
                              {order.deliveryAddress || 'No delivery address provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full gap-2 mt-6 relative group overflow-hidden"
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      style={{
                        borderColor: `${THEME_COLORS.primary}20`,
                        backgroundColor: `${THEME_COLORS.primary}05`,
                      }}
                    >
                      <Package 
                        className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
                        style={{ color: THEME_COLORS.primary }}
                      />
                      <span style={{ color: THEME_COLORS.primary }}>View Order Details</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        style={{ backgroundColor: THEME_COLORS.primary }}
                      />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        ) : (
          // For pending/cancelled payments, show Order Details before Quick Actions
          <>
            {/* Order Details */}
            {order && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeIn}
                className="md:col-span-6"
              >
                <Card className="h-full border-none bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="border-b border-border/5 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2.5 rounded-full" style={{ backgroundColor: `${THEME_COLORS.tertiary}15` }}>
                        <Package className="w-6 h-6" style={{ color: THEME_COLORS.tertiary }} />
                      </div>
                      Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div 
                        className="p-4 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: `${THEME_COLORS.primary}08` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: `${THEME_COLORS.primary}15`,
                              color: THEME_COLORS.primary 
                            }}
                          >
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Order ID</p>
                            <p className="font-medium" style={{ color: THEME_COLORS.primary }}>
                              #{(order.id || payment.id || '').toString().slice(-8)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: `${THEME_COLORS.violet}08` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: `${THEME_COLORS.violet}15`,
                              color: THEME_COLORS.violet 
                            }}
                          >
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Service</p>
                            <p className="font-medium" style={{ color: THEME_COLORS.violet }}>
                              {order.services[0]?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: `${THEME_COLORS.tertiary}08` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: `${THEME_COLORS.tertiary}15`,
                              color: THEME_COLORS.tertiary 
                            }}
                          >
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Delivery Address</p>
                            <p className="font-medium text-sm" style={{ color: THEME_COLORS.tertiary }}>
                              {order.deliveryAddress || 'No delivery address provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full gap-2 mt-6 relative group overflow-hidden"
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      style={{
                        borderColor: `${THEME_COLORS.primary}20`,
                        backgroundColor: `${THEME_COLORS.primary}05`,
                      }}
                    >
                      <Package 
                        className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
                        style={{ color: THEME_COLORS.primary }}
                      />
                      <span style={{ color: THEME_COLORS.primary }}>View Order Details</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        style={{ backgroundColor: THEME_COLORS.primary }}
                      />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="md:col-span-6"
            >
              <Card className="h-full border-none bg-gradient-to-br from-card to-muted/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="border-b border-border/5 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2.5 rounded-full" style={{ backgroundColor: `${THEME_COLORS.primary}15` }}>
                      <Settings className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 h-24  relative group overflow-hidden justify-center items-center"
                      onClick={() => router.push(`/dashboard/orders/${order?.id}`)}
                      style={{
                        borderColor: `${THEME_COLORS.tertiary}20`,
                        backgroundColor: `${THEME_COLORS.tertiary}05`,
                      }}
                    >
                      <Package 
                        className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" 
                        style={{ color: THEME_COLORS.tertiary }}
                      />
                      <span style={{ color: THEME_COLORS.tertiary }}>View Order</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        style={{ backgroundColor: THEME_COLORS.tertiary }}
                      />
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full gap-2 h-24  relative group overflow-hidden justify-center items-center"
                      style={{
                        borderColor: `${THEME_COLORS.violet}20`,
                        backgroundColor: `${THEME_COLORS.violet}05`,
                      }}
                    >
                      <Download 
                        className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" 
                        style={{ color: THEME_COLORS.violet }}
                      />
                      <span style={{ color: THEME_COLORS.violet }}>Download Invoice</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        style={{ backgroundColor: THEME_COLORS.violet }}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
