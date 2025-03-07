'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { formatDecimal } from "@/lib/utils";
import { 
  CreditCard, 
  Clock, 
  ArrowUpDown,
  DollarSign, 
  CalendarDays,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WashingMachineLoader } from '@/components/ui/washing-machine-loader';
import { THEME_COLORS } from '@/constants/theme';
import { motion } from "framer-motion";

const MINIMUM_LOADING_TIME = 1500; // Define constant for consistency
const ITEMS_PER_PAGE = 5;
const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingPayments: 0,
    successfulPayments: 0,
    cancelledPayments: 0,  // Changed from failedPayments
    recentTrend: '0%'
  });

  // First define the filtered payments
  const filteredPayments = payments
    .filter(payment => 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(payment => 
      filterStatus === 'all' ? true : payment.status === filterStatus
    );

  // Then use it for pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Define calculateAndSetStats first
  const calculateAndSetStats = (payments) => {
    if (!Array.isArray(payments)) {
      console.error('Invalid payments data for stats calculation');
      return;
    }

    const stats = {
      totalSpent: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      cancelledPayments: 0,  // Changed from failedPayments
      recentTrend: '0%'
    };

    payments.forEach(payment => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      
      // Check both payment status and order status for cancellation
      const isCancelled = 
        payment.status === 'CANCELLED' || 
        payment.orderDetails?.status === 'cancelled';

      if (isCancelled) {
        stats.cancelledPayments++;
      } else if (payment.status === 'PENDING') {
        stats.pendingPayments++;
      } else if (payment.status === 'PAID') {
        stats.totalSpent += amount;
        stats.successfulPayments++;
      }
    });

    console.log('Final calculated stats:', stats);
    setStats(stats);
  };

  // Then define fetchPaymentsData
  const fetchPaymentsData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching payments and orders data...');
      
      // Fetch both payments and orders in parallel
      const [paymentsResponse, ordersResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/payments`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          credentials: 'include'
        }),
        fetch(`${BASE_URL}/api/orders`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          credentials: 'include'
        })
      ]);

      if (!paymentsResponse.ok || !ordersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [paymentsData, ordersData] = await Promise.all([
        paymentsResponse.json(),
        ordersResponse.json()
      ]);

      console.log('Raw payments data:', paymentsData);
      console.log('Raw orders data:', ordersData);

      // Get all orders that are either pending or cancelled
      const relevantOrders = ordersData.orders.filter(order => 
        order.paymentStatus === 'pending' || 
        order.status === 'pending' ||
        order.status === 'cancelled' ||  // Add this condition
        order.paymentStatus === 'cancelled'  // Add this condition
      );

      // Convert orders to payment format
      const orderPayments = relevantOrders.map(order => ({
        id: `order-${order.id}`, // Ensure consistent ID format
        amount: order.totalPrice,
        status: order.status === 'cancelled' ? 'CANCELLED' : 'PENDING',  // Handle cancelled status
        date: new Date(order.createdAt),
        description: order.services.map(service => service.name).join(', '),
        method: order.status === 'cancelled' ? 'CANCELLED' : 'PENDING',
        orderDetails: {
          services: order.services,
          weight: order.weight,
          totalPrice: order.totalPrice,
          status: order.status
        }
      }));

      // Combine existing payments with order payments
      const formattedPayments = [
        ...paymentsData.payments.map(payment => ({
          id: payment.id,
          amount: parseFloat(payment.amount),
          status: payment.status.toUpperCase(),
          date: new Date(payment.createdAt),
          description: payment.orderDetails?.services?.map(service => service.name).join(', ') || 'Laundry Service',
          method: payment.method,
          orderDetails: payment.orderDetails
        })),
        ...orderPayments
      ];

      // Log the payments that have CANCELLED status
      console.log('Cancelled payments:', formattedPayments.filter(p => p.status === 'CANCELLED'));

      console.log('Combined formatted payments:', formattedPayments);
      setPayments(formattedPayments);
      calculateAndSetStats(formattedPayments);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  // Add minimum loading time effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, MINIMUM_LOADING_TIME);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  // Add effect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return THEME_COLORS.success;
      case 'PENDING':
        return THEME_COLORS.secondary;
      case 'CANCELLED':  // Changed from FAILED
        return THEME_COLORS.danger;
      default:
        return THEME_COLORS.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CANCELLED':  // Changed from FAILED
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatPaymentDescription = (payment) => {
    if (!payment.orderDetails?.services || payment.orderDetails.services.length === 0) {
      return 'Laundry Service';
    }
    return payment.orderDetails.services.join(', ');
  };

  // Show loading spinner while fetching data or during minimum loading time
  if (isLoading || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading payments...</p>
      </div>
    );
  }

  const renderPaymentMethod = (method) => {
    return (
      <div className="flex items-center gap-2">
        {method === 'ONLINE' ? (
          <CreditCard className="w-4 h-4 text-primary" />
        ) : (
          <DollarSign className="w-4 h-4 text-primary" />
        )}
        <span className="capitalize">{method.toLowerCase()}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Payments</h2>
          <p className="text-muted-foreground mt-1">
            View and manage your payment history
          </p>
        </div>
      </div>

      <motion.div 
        className="grid gap-4 md:grid-cols-4"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <div className="text-2xl font-bold">${formatDecimal(stats.totalSpent)}</div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Successful</p>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.success }}>
                  {stats.successfulPayments}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.success}15` }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: THEME_COLORS.success }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending</p>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.secondary }}>
                  {stats.pendingPayments}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}>
                <Clock className="w-5 h-5" style={{ color: THEME_COLORS.secondary }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.danger }}>
                  {stats.cancelledPayments}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.danger}15` }}>
                <AlertCircle className="w-5 h-5" style={{ color: THEME_COLORS.danger }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Cancelled transactions</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        className="rounded-xl border bg-card shadow-sm"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by description or payment method..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border border-input bg-background hover:border-muted-foreground/25 transition-colors"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] border border-input bg-background hover:border-muted-foreground/25 transition-colors">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="PAID">Successful</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 hover:bg-muted/50 border border-input hover:border-muted-foreground/25 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/70">
                  <TableHead className="w-[300px]">Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow 
                    key={payment.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      // Ensure we're using the correct ID format
                      const paymentId = payment.id.startsWith('order-') ? payment.id : payment.id;
                      router.push(`/dashboard/payments/${paymentId}`);
                    }}
                  >
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        {payment.description}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(payment.date, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${formatDecimal(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {renderPaymentMethod(payment.method)}
                    </TableCell>
                    <TableCell>
                      <span 
                        className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getStatusColor(payment.status)}15`,
                          color: getStatusColor(payment.status)
                        }}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="hover:bg-muted/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="hover:bg-muted/50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
