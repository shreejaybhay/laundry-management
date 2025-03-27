'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from "framer-motion";
import { WashingMachineLoader } from "@/components/ui/washing-machine-loader";
import { formatDecimal } from '@/lib/utils';
import { THEME_COLORS } from '@/constants/theme';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowLeft,
  Package,
  Calendar,
  Receipt,
  User,
  DollarSign,
  Building2,
  AlertCircle,
  MapPin,
  Truck,
  Mail,
  Settings,
  Download,
  Banknote,
  XCircle
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const MINIMUM_LOADING_TIME = 1500 // Define constant for consistency

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function PaymentDetailsPage({ params }) {
  const router = useRouter()
  const [payment, setPayment] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (params?.id) {
      console.log("Fetching details for ID:", params.id)
      fetchDetails()
    }
  }, [params?.id])

  // Add minimum loading time effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, MINIMUM_LOADING_TIME)

    return () => clearTimeout(timer)
  }, [])

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const isOrderPayment = params.id.startsWith("order-")
      const actualId = isOrderPayment ? params.id.replace("order-", "") : params.id

      if (isOrderPayment) {
        // Handle order-based payments
        const orderResponse = await fetch(`${BASE_URL}/api/orders/${actualId}`)
        if (!orderResponse.ok) throw new Error("Order not found")
        const orderData = await orderResponse.json()

        // Format order data as payment
        const formattedPayment = {
          id: `order-${orderData.order._id}`,
          amount: Number(orderData.order.totalPrice || 0).toFixed(2),
          status: (orderData.order.status || "PENDING").toUpperCase(),
          method: "CASH",
          createdAt: orderData.order.createdAt || new Date().toISOString(),
          customerName: orderData.order.userId?.name || "N/A",
          customerEmail: orderData.order.userId?.email || "N/A",
        }

        setPayment(formattedPayment)

        // Set order data
        setOrder({
          id: orderData.order._id,
          services: orderData.order.services || [],
          status: orderData.order.status,
          totalPrice: orderData.order.totalPrice,
          deliveryAddress: orderData.order.deliveryAddress || "N/A",
          createdAt: orderData.order.createdAt,
        })
      } else {
        // Handle regular payment IDs
        const response = await fetch(`${BASE_URL}/api/payments/${actualId}`)
        if (!response.ok) throw new Error("Payment not found")

        const data = await response.json()
        if (!data?.payment) throw new Error("Payment not found")

        // Format the payment data
        const formattedPayment = {
          ...data.payment,
          id: data.payment.id || data.payment._id,
          amount: Number(data.payment.amount || 0).toFixed(2),
          createdAt: new Date(data.payment.createdAt).toISOString(),
          status: (data.payment.status || "PENDING").toUpperCase(),
          method: data.payment.method || "CASH",
          customerName: data.payment.customerName || data.payment.orderDetails?.userId?.name || "N/A",
          customerEmail: data.payment.customerEmail || data.payment.orderDetails?.userId?.email || "N/A",
        }

        setPayment(formattedPayment)

        // Set order data if available
        if (data.payment.orderDetails) {
          setOrder({
            id: data.payment.orderId || data.payment.orderDetails._id,
            services: data.payment.orderDetails.services || [],
            status: data.payment.orderDetails.status,
            totalPrice: data.payment.orderDetails.totalPrice,
            deliveryAddress: data.payment.orderDetails.deliveryAddress || "N/A",
            createdAt: data.payment.orderDetails.createdAt,
          })
        } else if (data.payment.orderId) {
          // If we don't have orderDetails but have orderId, fetch the order separately
          const orderResponse = await fetch(`${BASE_URL}/api/orders/${data.payment.orderId}`);
          if (!orderResponse.ok) {
            console.error('Failed to fetch order details:', await orderResponse.text());
            return; // Skip setting order if fetch failed
          }

          try {
            const orderData = await orderResponse.json();
            if (!orderData?.order) {
              console.error('Invalid order data received');
              return;
            }
            
            setOrder({
              id: orderData.order._id,
              services: orderData.order.services || [],
              status: orderData.order.status,
              totalPrice: orderData.order.totalPrice,
              deliveryAddress: orderData.order.deliveryAddress || "N/A",
              createdAt: orderData.order.createdAt,
            });
          } catch (error) {
            console.error('Error parsing order data:', error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching payment details:", error)
      toast.error(error.message || "Failed to load payment details")
      setPayment(null)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading payment details...</p>
      </div>
    )
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
            <p className="text-muted-foreground mb-4">We couldn't find the payment details you're looking for.</p>
            <Button onClick={() => router.push("/dashboard/payments")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return THEME_COLORS.success
      case "PENDING":
        return THEME_COLORS.secondary
      case "CANCELLED":
        return THEME_COLORS.danger
      default:
        return THEME_COLORS.primary
    }
  }

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return THEME_COLORS.success
      case "processing":
        return THEME_COLORS.primary
      default:
        return THEME_COLORS.secondary
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <motion.div className="flex items-center justify-between" initial="initial" animate="animate" variants={fadeIn}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-full" style={{ backgroundColor: `${THEME_COLORS.primary}15` }}>
              <Receipt className="w-8 h-8" style={{ color: THEME_COLORS.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Transaction</span>
                <span
                  className="px-2 py-0.5 rounded bg-primary/10 text-primary"
                  style={{
                    backgroundColor: `${THEME_COLORS.primary}15`,
                    color: THEME_COLORS.primary,
                  }}
                >
                  #{payment?.id.slice(-8)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/payments")}
          className="gap-2 hover:shadow-md transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Button>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* Payment Summary Card */}
        <motion.div initial="initial" animate="animate" variants={fadeIn} className="md:col-span-4">
          <Card
            className="h-full shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, 
                ${THEME_COLORS.primary}05 0%, 
                ${THEME_COLORS.secondary}05 50%,
                ${THEME_COLORS.tertiary}05 100%
              )`,
            }}
          >
            <CardHeader className="border-b border-border/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-full"
                    style={{
                      backgroundColor: `${THEME_COLORS.primary}15`,
                      color: THEME_COLORS.primary,
                    }}
                  >
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Payment Summary</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                      <Calendar className="w-4 h-4" style={{ color: THEME_COLORS.primary }} />
                      <span className="font-medium">{format(new Date(payment.createdAt), "MMM dd, yyyy")}</span>
                      <span className="text-xs opacity-50">•</span>
                      <span>{format(new Date(payment.createdAt), "pp")}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: `${getStatusColor(payment.status)}15`,
                    color: getStatusColor(payment.status),
                  }}
                >
                  {payment.status === "PAID" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4 animate-pulse" />
                  )}
                  {payment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Price and Payment Method Banner */}
                <div
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 rounded-xl"
                  style={{ backgroundColor: `${THEME_COLORS.primary}15` }}
                >
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4" style={{ color: THEME_COLORS.primary }} />
                      Total Amount
                    </p>
                    <span className="text-4xl font-bold tracking-tight" style={{ color: THEME_COLORS.primary }}>
                      ${formatDecimal(payment.amount)}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-4 px-5 py-4 rounded-xl"
                    style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}
                  >
                    <div className="p-2.5 rounded-full" style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}>
                      {payment.method === "ONLINE" ? (
                        <CreditCard className="w-5 h-5" style={{ color: THEME_COLORS.secondary }} />
                      ) : (
                        <Banknote className="w-5 h-5" style={{ color: THEME_COLORS.secondary }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: THEME_COLORS.secondary }}>
                        {payment.method === "ONLINE" ? "Card Payment" : "Cash on Delivery"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" style={{ color: THEME_COLORS.secondary }} />
                        <span className="font-medium">{format(new Date(payment.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Timeline */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: THEME_COLORS.tertiary }} />
                    Payment Timeline
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        icon: Receipt,
                        title: "Payment Initiated",
                        date: format(new Date(payment.createdAt), "PPP"),
                        time: format(new Date(payment.createdAt), "pp"),
                        color: THEME_COLORS.primary,
                        active: true,
                      },
                      {
                        icon: CreditCard,
                        title: "Payment Method",
                        date: payment.method === "ONLINE" ? "Card Payment" : "Cash on Delivery",
                        time: "Selected",
                        color: THEME_COLORS.secondary,
                        active: true,
                      },
                      {
                        icon: CheckCircle2,
                        title: "Payment Status",
                        date: payment.status,
                        time: payment.status === "PAID" ? "Completed" : "Pending",
                        color: THEME_COLORS.tertiary,
                        active: payment.status === "PAID",
                      },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all duration-200`}
                        style={{
                          backgroundColor: step.active ? `${step.color}15` : "transparent",
                          borderColor: step.active ? `${step.color}20` : "#e2e8f0",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <step.icon
                            className="w-4 h-4"
                            style={{
                              color: step.active ? step.color : "#94a3b8",
                            }}
                          />
                          <p
                            className="text-xs font-medium"
                            style={{
                              color: step.active ? step.color : "#64748b",
                            }}
                          >
                            {step.title}
                          </p>
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: step.active ? step.color : "#64748b",
                          }}
                        >
                          {step.date}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{step.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                {payment.method === "ONLINE" && payment.stripePaymentId && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4" style={{ color: THEME_COLORS.violet }} />
                      Payment Processing Details
                    </h3>
                    <div className="space-y-3">
                      <div
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/40 transition-all duration-200"
                        style={{ backgroundColor: `${THEME_COLORS.violet}15` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full" style={{ backgroundColor: `${THEME_COLORS.violet}15` }}>
                            <Receipt className="w-4 h-4" style={{ color: THEME_COLORS.violet }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: THEME_COLORS.violet }}>
                              Stripe Payment ID
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono" style={{ color: THEME_COLORS.violet }}>
                            {payment.stripePaymentId}
                          </span>
                        </div>
                      </div>

                      {payment.cardLast4 && (
                        <div
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/40 transition-all duration-200"
                          style={{ backgroundColor: `${THEME_COLORS.tertiary}15` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full" style={{ backgroundColor: `${THEME_COLORS.tertiary}15` }}>
                              <CreditCard className="w-4 h-4" style={{ color: THEME_COLORS.tertiary }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: THEME_COLORS.tertiary }}>
                                Card Number
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-mono" style={{ color: THEME_COLORS.tertiary }}>
                              •••• {payment.cardLast4}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Details Card */}
        <motion.div initial="initial" animate="animate" variants={fadeIn} className="md:col-span-2">
          <Card
            className="h-full shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, 
                ${THEME_COLORS.tertiary}05 0%, 
                ${THEME_COLORS.violet}05 100%
              )`,
            }}
          >
            <CardHeader className="border-b border-border/5">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div
                  className="p-2.5 rounded-full"
                  style={{
                    backgroundColor: `${THEME_COLORS.violet}15`,
                    color: THEME_COLORS.violet,
                  }}
                >
                  <User className="w-6 h-6" />
                </div>
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 p-4 rounded-lg transition-all duration-200"
                  style={{ backgroundColor: `${THEME_COLORS.primary}08` }}
                >
                  <div
                    className="p-2.5 rounded-full"
                    style={{
                      backgroundColor: `${THEME_COLORS.primary}15`,
                      color: THEME_COLORS.primary,
                    }}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium" style={{ color: THEME_COLORS.primary }}>
                      {payment.customerName}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 p-4 rounded-lg transition-all duration-200"
                  style={{ backgroundColor: `${THEME_COLORS.tertiary}08` }}
                >
                  <div
                    className="p-2.5 rounded-full"
                    style={{
                      backgroundColor: `${THEME_COLORS.tertiary}15`,
                      color: THEME_COLORS.tertiary,
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Email</p>
                    <p className="font-medium" style={{ color: THEME_COLORS.tertiary }}>
                      {payment.customerEmail}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 mt-4 border-t border-border/10">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" style={{ color: THEME_COLORS.secondary }} />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {order && (
                      <Button
                        variant="outline"
                        className="w-full gap-2 relative group overflow-hidden"
                        onClick={() => router.push(`/dashboard/orders/${order?.id}`)}
                        style={{
                          borderColor: `${THEME_COLORS.tertiary}20`,
                          backgroundColor: `${THEME_COLORS.tertiary}05`,
                        }}
                      >
                        <Package
                          className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                          style={{ color: THEME_COLORS.tertiary }}
                        />
                        <span style={{ color: THEME_COLORS.tertiary }}>View Order Details</span>
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                          style={{ backgroundColor: THEME_COLORS.tertiary }}
                        />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full gap-2 relative group overflow-hidden"
                      style={{
                        borderColor: `${THEME_COLORS.violet}20`,
                        backgroundColor: `${THEME_COLORS.violet}05`,
                      }}
                    >
                      <Download
                        className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                        style={{ color: THEME_COLORS.violet }}
                      />
                      <span style={{ color: THEME_COLORS.violet }}>Download Invoice</span>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                        style={{ backgroundColor: THEME_COLORS.violet }}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Details */}
        {order && (
          <motion.div initial="initial" animate="animate" variants={fadeIn} className="md:col-span-6">
            <Card
              className="shadow-xl hover:shadow-2xl transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, 
                  ${THEME_COLORS.secondary}05 0%, 
                  ${THEME_COLORS.primary}05 100%
                )`,
              }}
            >
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
                          color: THEME_COLORS.primary,
                        }}
                      >
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-medium" style={{ color: THEME_COLORS.primary }}>
                          #{(order.id || "").toString().slice(-8)}
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
                          color: THEME_COLORS.violet,
                        }}
                      >
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-medium" style={{ color: THEME_COLORS.violet }}>
                          {order.services[0]?.name || "Standard Service"}
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
                          color: THEME_COLORS.tertiary,
                        }}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Address</p>
                        <p className="font-medium text-sm" style={{ color: THEME_COLORS.tertiary }}>
                          {order.deliveryAddress || "No delivery address provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div
                    className="p-4 rounded-lg transition-all duration-200"
                    style={{ backgroundColor: `${THEME_COLORS.secondary}08` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: `${THEME_COLORS.secondary}15`,
                          color: THEME_COLORS.secondary,
                        }}
                      >
                        {/* Dynamic icon based on status */}
                        {(() => {
                          switch (order.status?.toLowerCase()) {
                            case 'completed':
                              return <CheckCircle2 className="w-5 h-5" />;
                            case 'processing':
                              return <Settings className="w-5 h-5 animate-spin" />;
                            case 'delivered':
                              return <Truck className="w-5 h-5" />;
                            case 'cancelled':
                              return <XCircle className="w-5 h-5" />;
                            case 'pending':
                              return <Clock className="w-5 h-5" />;
                            case 'paid':
                              return <Package className="w-5 h-5" />;
                            default:
                              return <AlertCircle className="w-5 h-5" />;
                          }
                        })()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: THEME_COLORS.secondary }}>
                          Order Status
                        </p>
                      </div>
                    </div>
                    <div
                      className="px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2"
                      style={{
                        backgroundColor: `${getOrderStatusColor(order.status)}15`,
                        color: getOrderStatusColor(order.status),
                      }}
                    >
                      {/* Dynamic icon based on status */}
                      {(() => {
                        switch (order.status?.toLowerCase()) {
                          case 'completed':
                            return <CheckCircle2 className="w-4 h-4" />;
                          case 'processing':
                            return <Settings className="w-4 h-4 animate-spin" />;
                          case 'delivered':
                            return <Truck className="w-4 h-4" />;
                          case 'cancelled':
                            return <XCircle className="w-4 h-4" />;
                          case 'pending':
                            return <Clock className="w-4 h-4" />;
                          case 'paid':
                            return <Package className="w-4 h-4" />;
                          default:
                            return <AlertCircle className="w-4 h-4" />;
                        }
                      })()}
                      {order.status.toUpperCase()}
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg transition-all duration-200"
                    style={{ backgroundColor: `${THEME_COLORS.primary}08` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: `${THEME_COLORS.primary}15`,
                          color: THEME_COLORS.primary,
                        }}
                      >
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: THEME_COLORS.primary }}>
                          Order Date
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">
                      {format(new Date(order.createdAt), "PPP")} at {format(new Date(order.createdAt), "p")}
                    </p>
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
                  <span style={{ color: THEME_COLORS.primary }}>View Complete Order Details</span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                    style={{ backgroundColor: THEME_COLORS.primary }}
                  />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}












