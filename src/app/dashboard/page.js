"use client";
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsChart, Pie, Cell
} from 'recharts';
import {
  ShoppingCart, DollarSign, Users, Clock, RefreshCcw,
  ArrowUpIcon, ArrowDownIcon, LineChart,
  PieChart as PieChartIcon,
  ShoppingBag,
  Activity,
  PackageCheck,
  Wallet,
  TrendingUp
} from "lucide-react";
import { WashingMachineLoader } from '@/components/ui/washing-machine-loader';
import { format, subDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const CHART_COLORS = {
  primary: '#0ea5e9', // Blue
  secondary: '#f59e0b', // Yellow
  tertiary: '#6366f1', // Optional third color if needed
};

const COLORS = [
  CHART_COLORS.primary,    // Blue
  CHART_COLORS.secondary,  // Yellow
  CHART_COLORS.tertiary,   // Purple
  '#10b981',              // Green
  '#f43f5e',              // Red
  '#8b5cf6',              // Violet
];

function StatsCard({ title, value, icon: Icon, percentage, loading, description }) {
  if (loading) {
    return (
      <div className="h-[100px] rounded-xl border border-border/50 bg-card/50">
        <div className="p-4 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-muted/60 rounded animate-pulse" />
            <div className="h-6 w-24 bg-muted/60 rounded animate-pulse" />
            <div className="h-2.5 w-28 bg-muted/60 rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted/60 animate-pulse" />
        </div>
      </div>
    );
  }

  const isPositive = percentage >= 0;
  const ArrowIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;
  const isMonetary = title.includes('Revenue') || title.includes('Spent');

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-4 flex justify-between items-center">
        {/* Left side content */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground/80 block">
            {title}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              {isMonetary ? (
                `$${Number(value).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`
              ) : Number(value).toLocaleString()}
            </span>
            {percentage !== undefined && (
              <div className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                isPositive 
                  ? 'text-emerald-500 bg-emerald-500/10' 
                  : 'text-amber-500 bg-amber-500/10'
              }`}>
                <ArrowIcon className="h-3 w-3" strokeWidth={2} />
                {Math.abs(percentage).toFixed(1)}%
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground/70">
            {description || 'Compared to last month'}
          </p>
        </div>

        {/* Right side icon */}
        <div className={`p-3 rounded-xl transition-colors duration-300 ${
          isPositive 
            ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/15' 
            : 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/15'
        }`}>
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </div>
      </div>
    </Card>
  );
}

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalOrders: 0,
      processing: 0,
      revenue: 0,
      activeUsers: 0
    },
    revenueData: [],
    serviceData: [] // Ensure this is initialized as an empty array
  });
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [revenueTimeRange, setRevenueTimeRange] = useState("30");

  const formatChartData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Get date range based on selected filter
    const today = new Date();
    const daysAgo = subDays(today, parseInt(revenueTimeRange));
    
    // Create a map of existing data
    const dataMap = new Map(
      data.map(item => [item.name, item.revenue])
    );
    
    // Fill in all dates for the selected range
    const chartData = [];
    for (let d = daysAgo; d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      chartData.push({
        name: dateStr,
        revenue: dataMap.get(dateStr) || 0
      });
    }
    
    return chartData;
  };

  const formatTotalRevenue = (data) => {
    if (!data || !Array.isArray(data)) return "0.00";
    const total = data.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateDailyAverage = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return "0.00";
    const total = data.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
    return (total / data.length).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setShowLoader(false);
    }, 1500); // 1.5 seconds minimum loading time

    return () => clearTimeout(minLoadingTime);
  }, []);

  useEffect(() => {
    // Only hide the loader when both minimum time has passed and loading is complete
    if (!initialLoading && !isAuthChecking && !showLoader) {
      setInitialLoading(false);
    }
  }, [initialLoading, isAuthChecking, showLoader]);

  const checkUserRole = async () => {
    try {
      setIsAuthChecking(true);
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      if (!data.user) {
        throw new Error('User data not found');
      }

      setIsAdmin(data.user.role === 'admin');
      return data.user.role === 'admin';
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      window.location.href = '/login';
      return false;
    } finally {
      setIsAuthChecking(false);
    }
  };

  const fetchDashboardData = async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);

      // First check authentication
      const isAdminUser = await checkUserRole();
      const endpoint = isAdminUser ? '/api/dashboard/stats' : '/api/dashboard/user-stats';
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();

      // Validate and sanitize the data
      const sanitizedData = {
        metrics: {
          totalOrders: data.metrics?.totalOrders || 0,
          processing: data.metrics?.processing || 0,  // Use the processing count from API
          revenue: data.metrics?.revenue || '0.00',
          activeUsers: data.metrics?.activeUsers || 0,
          orderGrowth: data.metrics?.orderGrowth || 0,
          revenueGrowth: data.metrics?.revenueGrowth || 0
        },
        orderHistory: Array.isArray(data.orderHistory) ? data.orderHistory : [],
        revenueData: Array.isArray(data.revenueData) ? data.revenueData : [],
        serviceData: Array.isArray(data.serviceData) ? data.serviceData : []
      };

      setDashboardData(sanitizedData);

      if (showToast) {
        toast.success("Dashboard data refreshed");
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if we know the user's role
    if (isAdmin !== null) {
      fetchDashboardData();
      // Refresh every 5 minutes
      const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]); // Add isAdmin as dependency

  const renderMetrics = () => {
    if (isAdmin) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Orders"
            value={dashboardData.metrics.totalOrders}
            icon={ShoppingCart}
            percentage={dashboardData.metrics.orderGrowth}
            loading={loading}
            description="Total orders this month"
          />
          <StatsCard
            title="Processing"
            value={dashboardData.metrics.processing}
            icon={Clock}
            loading={loading}
            description="Pending & processing orders" // Updated description
          />
          <StatsCard
            title="Revenue"
            value={dashboardData.metrics.revenue}
            icon={DollarSign}
            percentage={dashboardData.metrics.revenueGrowth}
            loading={loading}
            description="Monthly revenue"
          />
          <StatsCard
            title="Active Users"
            value={dashboardData.metrics.activeUsers}
            icon={Users}
            loading={loading}
            description="Users this month"
          />
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="My Orders"
          value={dashboardData.metrics.totalOrders}
          icon={ShoppingCart}
          percentage={dashboardData.metrics.orderGrowth}
          loading={loading}
          description="Your orders this month"
        />
        <StatsCard
          title="Processing"
          value={dashboardData.metrics.processing}
          icon={Clock}
          loading={loading}
          description="Your pending & processing orders" // Updated description
        />
        <StatsCard
          title="Total Spent"
          value={dashboardData.metrics.revenue}
          icon={DollarSign}
          percentage={dashboardData.metrics.revenueGrowth}
          loading={loading}
          description="Your spending this month"
        />
      </div>
    );
  };

  const renderUserOrderHistory = () => {
    if (isAdmin) return null;

    const hasOrderHistory = dashboardData.orderHistory && dashboardData.orderHistory.length > 0;
    const hasOrders = dashboardData.orderHistory?.some(day => day.orders > 0);

    // Calculate totals with proper type handling
    const totalOrders = dashboardData.orderHistory?.reduce((sum, day) => sum + (day.orders || 0), 0) || 0;
    const totalRevenue = dashboardData.orderHistory?.reduce((sum, day) => {
      const revenue = parseFloat(day.revenue || 0);
      return sum + (isNaN(revenue) ? 0 : revenue);
    }, 0) || 0;

    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="space-y-4 px-4 sm:px-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold">Order Analytics</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Track your orders and spending patterns
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="h-[250px] sm:h-[350px] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : !dashboardData.orderHistory?.length ? (
            <div className="h-[250px] sm:h-[350px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No order history available</p>
                <p className="text-sm">Start shopping to see your order trends here</p>
              </div>
            </div>
          ) : (
            <div className="h-[250px] sm:h-[350px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={dashboardData.orderHistory}
                  margin={{ 
                    top: 20, 
                    right: 10, 
                    left: 0, 
                    bottom: 0 
                  }}
                >
                  <defs>
                    <linearGradient id="orderHistoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke="hsl(var(--muted-foreground)/0.2)" 
                  />
                  
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => format(new Date(value), isMobile ? 'MM/dd' : 'MMM d')}
                    dy={8}
                  />
                  
                  <YAxis 
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    width={30}
                    dx={-8}
                  />
                  
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    width={40}
                    tickFormatter={(value) => `$${value}`}
                    dx={8}
                  />
                  
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const orders = parseInt(payload[0]?.value || 0);
                        const revenue = parseFloat(payload[1]?.value || 0);

                        return (
                          <div className="rounded-lg border bg-card px-3 py-2 shadow-xl">
                            <p className="text-xs sm:text-sm font-medium mb-1">
                              {format(new Date(payload[0].payload.displayDate), 'MMM d, yyyy')}
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
                                Orders: <span className="font-bold">{orders}</span>
                              </p>
                              <p className="text-xs sm:text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.secondary }} />
                                Total Spent: <span className="font-bold">${revenue.toFixed(2)}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#orderHistoryGradient)"
                    dot={false}
                    activeDot={{ 
                      r: isMobile ? 4 : 6, 
                      stroke: CHART_COLORS.primary,
                      strokeWidth: 2,
                      fill: 'hsl(var(--background))'
                    }}
                  />
                  
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{ 
                      r: isMobile ? 4 : 6, 
                      stroke: CHART_COLORS.secondary,
                      strokeWidth: 2,
                      fill: 'hsl(var(--background))'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Show loader within the layout during initial load
  if (initialLoading || isAuthChecking || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-red-600">Failed to load dashboard data</p>
        <Button
          onClick={() => fetchDashboardData()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Overview of your laundry business
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 hover:bg-accent"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {renderMetrics()}

      {!isAdmin && renderUserOrderHistory()}
      
      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-full lg:col-span-4 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="space-y-4 px-4 sm:px-6">
              {/* Header Section - More responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <LineChart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold">Revenue Overview</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      Daily revenue breakdown for the past 30 days
                    </CardDescription>
                  </div>
                </div>
                
                {/* Optional: Add date range selector here */}
                <Select 
                  value={revenueTimeRange} 
                  onValueChange={setRevenueTimeRange} 
                  className="w-[140px]"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats Cards - Improved responsive grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-base sm:text-lg font-bold text-primary">
                    ${formatTotalRevenue(dashboardData.revenueData)}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Average Daily</p>
                  <p className="text-base sm:text-lg font-bold text-primary">
                    ${calculateDailyAverage(dashboardData.revenueData)}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Growth</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-500">
                    {dashboardData.metrics?.revenueGrowth?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-2 sm:px-6">
              {loading ? (
                <div className="h-[250px] sm:h-[350px] flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : !dashboardData.revenueData?.length ? (
                <div className="h-[250px] sm:h-[350px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm sm:text-base">No revenue data available</p>
                  </div>
                </div>
              ) : (
                <div className="h-[250px] sm:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={formatChartData(dashboardData.revenueData)}
                      margin={{ 
                        top: 20, 
                        right: 10, 
                        left: 10, 
                        bottom: 0 
                      }}
                    >
                      <defs>
                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        horizontal={true}
                        vertical={false}
                        stroke="hsl(var(--border))" 
                        opacity={0.8} 
                      />
                      <XAxis
                        dataKey="name"
                        tickFormatter={(date) => format(new Date(date), isMobile ? 'MM/dd' : 'MMM d')}
                        stroke="hsl(var(--border))"
                        fontSize={12}
                        tickLine={true}
                        axisLine={true}
                        dy={10}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke="hsl(var(--border))"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                        tickLine={true}
                        axisLine={true}
                        dx={-10}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        width={45}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-card px-3 py-2 shadow-xl">
                                <div className="flex flex-col gap-1">
                                  <p className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                                    {format(new Date(label), 'MMMM d, yyyy')}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <p className="text-sm font-bold">
                                      ${Number(payload[0].value).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ stroke: 'hsl(var(--muted))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#revenue)"
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "hsl(var(--primary))",
                          stroke: "hsl(var(--background))",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Service Distribution
              </CardTitle>
              <CardDescription>Service usage breakdown for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-[200px] sm:h-[250px] sm:w-[250px] rounded-full mx-auto" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ) : dashboardData.serviceData && dashboardData.serviceData.length > 0 ? (
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                  {/* Pie Chart Container */}
                  <div className="w-full max-w-[200px] sm:max-w-[250px]">
                    <ResponsiveContainer width="100%" aspect={1}>
                      <RechartsChart>
                        <Pie
                          data={dashboardData.serviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius="60%"
                          outerRadius="80%"
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {dashboardData.serviceData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-card px-3 py-2 shadow-xl">
                                  <p className="text-sm font-medium">{payload[0].name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {payload[0].value} orders ({payload[0].payload.percentage}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RechartsChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="w-full">
                    <ScrollArea className="h-[150px] sm:h-[200px] pr-4">
                      <div className="space-y-2">
                        {dashboardData.serviceData.map((service, index) => (
                          <div
                            key={service.name}
                            className="flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors"
                            style={{ backgroundColor: `${COLORS[index % COLORS.length]}15` }}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <div
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm sm:text-base font-medium truncate">
                                {service.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                              <span className="text-xs sm:text-sm text-muted-foreground w-6 sm:w-8 text-right">
                                {service.value}
                              </span>
                              <span 
                                className="text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full min-w-[50px] sm:min-w-[60px] text-center"
                                style={{ 
                                  backgroundColor: `${COLORS[index % COLORS.length]}15`,
                                  color: COLORS[index % COLORS.length]
                                }}
                              >
                                {service.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] sm:h-[350px] text-muted-foreground">
                  No service data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
