'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { formatDecimal } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Filter,
  Search,
  Package,
  CreditCard,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { WashingMachineLoader } from "@/components/ui/washing-machine-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const THEME_COLORS = {
  primary: '#0ea5e9',    // Blue
  secondary: '#f59e0b',  // Yellow
  tertiary: '#6366f1',   // Purple
  success: '#10b981',    // Green
  danger: '#f43f5e',     // Red
  violet: '#8b5cf6',     // Violet
};

const ITEMS_PER_PAGE = 5; // Changed to 5 items per page

const formatServiceName = (payment) => {
  if (payment.orderDetails?.services) {
    return payment.orderDetails.services
      .map(service => service.name)
      .join(', ');
  }
  return 'Laundry Service'; // Default fallback
};

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

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
    successRate: 100
  });
  
  // New state for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate total pages
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : payment.status === statusFilter;
    
    let matchesDate = true;
    const paymentDate = new Date(payment.createdAt);
    const now = new Date();
    
    switch(dateFilter) {
      case 'today':
        matchesDate = paymentDate.toDateString() === now.toDateString();
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = paymentDate >= weekAgo;
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = paymentDate >= monthAgo;
        break;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching payments data...');
        const response = await fetch('/api/payments?limit=1000&admin=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Add if you're using token auth
          },
          credentials: 'include'
        });

        if (response.status === 401) {
          toast.error('Not authorized to view revenue data');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch payments: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw API response:', data); // Debug log

        if (!data.payments || !Array.isArray(data.payments)) {
          throw new Error('Invalid payment data received');
        }

        // Only process PAID payments for revenue calculations
        const formattedPayments = data.payments
          .filter(payment => payment.status === 'PAID')
          .map(payment => ({
            id: payment.id || payment._id,
            amount: typeof payment.amount === 'string' ? 
              parseFloat(payment.amount.replace(/[^0-9.-]+/g, '')) : 
              parseFloat(payment.amount) || 0,
            status: payment.status,
            method: payment.method || 'ONLINE',
            createdAt: new Date(payment.createdAt),
            serviceName: formatServiceName(payment),
            orderDetails: payment.orderDetails || null
          }));

        console.log('Formatted payments:', formattedPayments);
        setPayments(formattedPayments);
        
        const calculatedStats = calculateStats(formattedPayments);
        console.log('Calculated stats:', calculatedStats);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        toast.error("Failed to load payment data");
      } finally {
        setTimeout(() => {
          setLoading(false);
          setShowLoader(false);
        }, 1500);
      }
    };

    loadData();
  }, []);

  const calculateStats = (payments) => {
    // Add debug logging
    console.log('Raw payments data:', payments);
    
    if (!Array.isArray(payments) || payments.length === 0) {
      console.log('No payments to calculate stats from');
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        monthlyGrowth: 0,
        successRate: 100
      };
    }

    // Filter successful payments with more lenient status check
    const successfulPayments = payments.filter(p => 
      ['PAID', 'SUCCESSFUL', 'COMPLETED'].includes(p.status?.toUpperCase())
    );

    console.log('Successful payments:', successfulPayments);

    // Calculate total revenue
    const totalRevenue = successfulPayments.reduce((sum, p) => {
      const amount = typeof p.amount === 'number' ? p.amount : 0;
      return sum + amount;
    }, 0);

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate this month's revenue
    const thisMonthPayments = successfulPayments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    });

    const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => 
      sum + (typeof p.amount === 'number' ? p.amount : 0), 0
    );

    // Calculate last month's revenue
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const lastMonthPayments = successfulPayments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return paymentDate.getMonth() === lastMonth && 
             paymentDate.getFullYear() === lastMonthYear;
    });

    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => 
      sum + (typeof p.amount === 'number' ? p.amount : 0), 0
    );

    // Calculate monthly growth
    const monthlyGrowth = lastMonthRevenue === 0 
      ? (thisMonthRevenue > 0 ? 100 : 0)
      : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // Calculate success rate
    const successRate = payments.length > 0 
      ? (successfulPayments.length / payments.length) * 100
      : 100;

    const stats = {
      totalRevenue,
      monthlyRevenue: thisMonthRevenue,
      monthlyGrowth,
      successRate
    };

    console.log('Final calculated stats:', stats);
    return stats;
  };

  const handleExport = () => {
    // Implementation for exporting data
    toast.success('Exporting payment data...');
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  if (loading || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Revenue Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Detailed analysis of your business revenue
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid gap-4 md:grid-cols-4"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        {/* Revenue Card */}
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.secondary }}>
                  ${formatDecimal(732.10)}
                </div>
              </div>
              <div 
                className="p-3 rounded-lg" 
                style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}
              >
                <Wallet className="w-5 h-5" style={{ color: THEME_COLORS.secondary }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Monthly earnings</p>
          </CardContent>
        </Card>

        {/* Monthly Revenue Card */}
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.secondary }}>
                  ${formatDecimal(stats.monthlyRevenue)}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.secondary}15` }}>
                <DollarSign className="w-5 h-5" style={{ color: THEME_COLORS.secondary }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">This month</p>
          </CardContent>
        </Card>

        {/* Monthly Growth Card */}
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly Growth</p>
                <div className="text-2xl font-bold" style={{ color: stats.monthlyGrowth >= 0 ? THEME_COLORS.success : THEME_COLORS.danger }}>
                  {stats.monthlyGrowth.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: stats.monthlyGrowth >= 0 ? `${THEME_COLORS.success}15` : `${THEME_COLORS.danger}15` }}>
                {stats.monthlyGrowth >= 0 ? (
                  <TrendingUp className="w-5 h-5" style={{ color: THEME_COLORS.success }} />
                ) : (
                  <TrendingDown className="w-5 h-5" style={{ color: THEME_COLORS.danger }} />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">From last month</p>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.tertiary }}>
                  {stats.successRate.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${THEME_COLORS.tertiary}15` }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: THEME_COLORS.tertiary }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Payment success rate</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Card */}
      <motion.div 
        className="rounded-xl border bg-card shadow-sm"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by ID or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border border-input bg-background hover:border-muted-foreground/25 transition-colors"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px] border border-input bg-background hover:border-muted-foreground/25 transition-colors">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              className="gap-2 hover:bg-muted/50 border border-input hover:border-muted-foreground/25 transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/70">
                  <TableHead className="w-[300px]">Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow 
                    key={payment.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        {payment.serviceName}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.id.slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${formatDecimal(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {payment.method === 'ONLINE' ? (
                          <CreditCard className="w-4 h-4 text-primary" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-primary" />
                        )}
                        <span className="capitalize">{payment.method.toLowerCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: payment.status.toLowerCase() === 'completed' 
                            ? `${THEME_COLORS.success}15` 
                            : `${THEME_COLORS.primary}15`,
                          color: payment.status.toLowerCase() === 'completed'
                            ? THEME_COLORS.success
                            : THEME_COLORS.primary
                        }}
                      >
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
