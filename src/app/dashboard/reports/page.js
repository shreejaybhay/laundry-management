'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { WashingMachineLoader } from '@/components/ui/washing-machine-loader';

// Keep existing theme colors
const THEME_COLORS = {
  primary: '#0ea5e9',    // Blue
  secondary: '#f59e0b',  // Yellow
  tertiary: '#6366f1',   // Purple
  success: '#10b981',    // Green
  danger: '#f43f5e',     // Red
  violet: '#8b5cf6',     // Violet
};

function getStatusColor(status) {
  switch (status) {
    case 'completed':
      return THEME_COLORS.primary;
    case 'paid':
      return THEME_COLORS.secondary;
    case 'delivered':
      return THEME_COLORS.tertiary;
    default:
      return '#6b7280';
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true); // Add minimum loading state
  const [date, setDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState(30);

  // Add minimum loading time effect
  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setShowLoader(false);
    }, 1500); // 1.5 seconds minimum loading time

    return () => clearTimeout(minLoadingTime);
  }, []);

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toFixed(2);
  };

  const formatPercentage = (value) => {
    return parseFloat(value || 0).toFixed(1);
  };

  async function loadReportData() {
    try {
      setIsLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');

      console.log('Fetching data for date:', formattedDate);

      const [reportsResponse, trendsResponse] = await Promise.all([
        fetch(`/api/reports?date=${formattedDate}`),
        fetch(`/api/reports/trends?days=${timeRange}`)
      ]);

      console.log('API Response Status:', {
        reports: reportsResponse.status,
        trends: trendsResponse.status
      });

      const reportsData = await reportsResponse.json();
      const trendsData = await trendsResponse.json();

      if (!reportsResponse.ok) throw new Error(reportsData.error || 'Failed to fetch reports');
      if (!trendsResponse.ok) throw new Error(trendsData.error || 'Failed to fetch trends');

      if (!reportsData || typeof reportsData.totalRevenue === 'undefined') {
        console.error('Invalid reports data structure:', reportsData);
        throw new Error('Invalid reports data received');
      }

      setReportData(reportsData);
      setTrendData(trendsData);

    } catch (error) {
      console.error('Report data error:', error);
      toast.error(error.message || "Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReportData();
  }, [date, timeRange]);

  // Show loader while loading or during minimum loading time
  if (isLoading || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  // Debug render
  console.log('Rendering with state:', {
    reportData,
    trendData,
    isLoading,
    date: date.toISOString(),
    timeRange
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Reports</h2>
          <p className="text-muted-foreground mt-1">
            View and analyze business performance reports
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: THEME_COLORS.primary }}>
              ${isLoading ? '--' : formatCurrency(reportData?.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground" style={{ 
              color: reportData?.revenueChange >= 0 ? THEME_COLORS.success : THEME_COLORS.danger 
            }}>
              {isLoading ? '--' : formatPercentage(reportData?.revenueChange)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: THEME_COLORS.secondary }}>
              {isLoading ? '--' : (reportData?.completedOrders || 0)}
            </div>
            <p className="text-xs text-muted-foreground" style={{ 
              color: reportData?.orderChange >= 0 ? THEME_COLORS.success : THEME_COLORS.danger 
            }}>
              {isLoading ? '--' : formatPercentage(reportData?.orderChange)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: THEME_COLORS.tertiary }}>
              ${isLoading ? '--' : formatCurrency(reportData?.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? '--' : formatPercentage(reportData?.aovChange)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: THEME_COLORS.violet }}>
              {isLoading ? '--' : `${reportData?.satisfaction || '0.0'}/5.0`}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {isLoading ? '--' : (reportData?.totalReviews || 0)} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue and average order value</CardDescription>
            </div>
            
            <div className="w-[140px]">
              <Select 
                defaultValue={timeRange.toString()} 
                onValueChange={(value) => setTimeRange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      `$${formatCurrency(value)}`,
                      name === 'revenue' ? 'Daily Revenue' : 'Avg Order Value'
                    ]}
                    labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={THEME_COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: THEME_COLORS.primary, strokeWidth: 2, fill: 'white' }}
                    name="Daily Revenue"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgOrderValue"
                    stroke={THEME_COLORS.secondary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: THEME_COLORS.secondary, strokeWidth: 2, fill: 'white' }}
                    strokeDasharray="4 4"
                    name="Avg Order Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Average Daily Revenue
                </div>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.primary }}>
                  ${formatCurrency(
                    trendData?.reduce((acc, day) => acc + day.revenue, 0) / trendData?.length || 0
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Average Order Value
                </div>
                <div className="text-2xl font-bold" style={{ color: THEME_COLORS.secondary }}>
                  ${formatCurrency(
                    trendData?.reduce((acc, day) => acc + day.avgOrderValue, 0) / trendData?.length || 0
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Current order status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                reportData?.ordersByStatus?.map(status => {
                  const percentage = ((status.count / reportData.completedOrders) * 100).toFixed(1);
                  return (
                    <TableRow key={status._id}>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium capitalize" 
                          style={{ 
                            backgroundColor: `${getStatusColor(status._id)}20`,
                            color: getStatusColor(status._id)
                          }}>
                          {status._id}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{status.count}</TableCell>
                      <TableCell className="text-right font-medium" style={{ color: THEME_COLORS.primary }}>
                        {percentage}%
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
          <CardDescription>Revenue and orders by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg. Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                reportData?.services?.map(service => {
                  const avgOrderValue = service.revenue / service.orders;
                  return (
                    <TableRow key={service.name}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell className="text-right">{service.orders}</TableCell>
                      <TableCell className="text-right" style={{ color: THEME_COLORS.primary }}>
                        ${formatCurrency(service.revenue)}
                      </TableCell>
                      <TableCell className="text-right">${formatCurrency(avgOrderValue)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {!isLoading && reportData?.services && (
              <tfoot>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {reportData.services.reduce((sum, service) => sum + service.orders, 0)}
                  </TableCell>
                  <TableCell className="text-right font-bold" style={{ color: THEME_COLORS.primary }}>
                    ${formatCurrency(reportData.services.reduce((sum, service) => sum + service.revenue, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${formatCurrency(reportData.averageOrderValue)}
                  </TableCell>
                </TableRow>
              </tfoot>
            )}
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
