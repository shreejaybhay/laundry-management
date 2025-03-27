'use client';

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X, Plus, Filter, Clock, Shirt, Scale, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { fetchOrders } from "@/lib/api/orders";
import { useRouter } from "next/navigation";
import { WashingMachineLoader } from '@/components/ui/washing-machine-loader';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  primary: '#0ea5e9', // Blue
  secondary: '#f59e0b', // Yellow
  tertiary: '#6366f1', // Optional third color if needed
};

const ORDER_STATUSES = {
  completed: {
    color: "bg-[#0ea5e9]/10 text-[#0ea5e9]",
    label: "Completed"
  },
  delivered: {
    color: "bg-[#0ea5e9]/10 text-[#0ea5e9]",
    label: "Delivered"
  },
  processing: {
    color: "bg-[#0ea5e9]/20 text-[#0ea5e9]",
    label: "Processing"
  },
  pending: {
    color: "bg-[#f59e0b]/10 text-[#f59e0b]",
    label: "Pending"
  },
  paid: {
    color: "bg-[#6366f1]/10 text-[#6366f1]",
    label: "Paid"
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    label: "Cancelled"
  }
};

const formatPrice = (price) => {
  if (!price) return '0.00';
  // Handle Decimal128 type from MongoDB
  if (typeof price === 'object' && price.$numberDecimal) {
    return parseFloat(price.$numberDecimal).toFixed(2);
  }
  // Handle string values
  if (typeof price === 'string') {
    return parseFloat(price).toFixed(2);
  }
  // Handle regular number
  if (typeof price === 'number') {
    return price.toFixed(2);
  }
  return '0.00';
};

function formatRelativeTime(date) {
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return `${Math.round(diffInHours)} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) { // 7 days
    return `${Math.round(diffInHours / 24)} days ago`;
  } else {
    return format(date, "MMM d, yyyy");
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export default function OrdersPage() {
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [services, setServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const router = useRouter();

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const getStatusBadge = (status) => {
    const statusConfig = ORDER_STATUSES[status.toLowerCase()] || ORDER_STATUSES.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  // Add function to get user role
  async function getUserRole() {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUserRole(data.user.role);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setUserRole('user'); // Default to user role if fetch fails
    }
  }

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const { orders: fetchedOrders, pagination: paginationData } = await fetchOrders(
        pagination.page,
        pagination.limit
      );
      setOrders(fetchedOrders);
      setPagination(prev => ({
        ...prev,
        ...paginationData
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setShowLoader(false);
    }, 1500); // 1.5 seconds minimum loading time

    return () => clearTimeout(minLoadingTime);
  }, []);

  useEffect(() => {
    // Only hide the loader when both minimum time has passed and loading is complete
    if (!isLoading && !showLoader) {
      setShowLoader(false);
    }
  }, [isLoading, showLoader]);

  useEffect(() => {
    getUserRole();
    loadOrders();
    fetchAvailableServices();
  }, [pagination.page, pagination.limit]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      toast.success('Order status updated successfully');
      loadOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  // Add this helper function to validate status before update
  const isValidStatus = (status) => {
    const validStatuses = ['pending', 'paid', 'processing', 'completed', 'delivered', 'cancelled'];
    return validStatuses.includes(status.toLowerCase());
  };

  // Update the status change handler
  const handleStatusChange = (orderId, newStatus) => {
    if (!isValidStatus(newStatus)) {
      toast.error(`Invalid status. Must be one of: pending, paid, processing, completed, delivered, cancelled`);
      return;
    }
    updateOrderStatus(orderId, newStatus);
  };

  // Add function to create order
  async function createOrder(formData) {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast.success('Order created successfully');
      loadOrders(); // Refresh the orders list
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order');
    }
  }

  // Add this function to fetch available services
  const fetchAvailableServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/services`);
      const data = await response.json();
      // Filter only active services
      const activeServices = data.services.filter(service => service.isActive);
      setServices(activeServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    }
  };

  // Add form submission handler
  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.target);
      const serviceId = formData.get('serviceId');
      const weight = parseFloat(formData.get('weight'));
      const pickupAddress = formData.get('pickupAddress');
      const deliveryAddress = formData.get('deliveryAddress');
      const notes = formData.get('notes');

      if (!serviceId || !weight || !pickupAddress || !deliveryAddress) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Get service details for price calculation
      const service = services.find(s => s._id === serviceId);
      if (!service) {
        toast.error('Selected service not found');
        return;
      }

      const orderData = {
        services: [{
          serviceId,
          weight
        }],
        pickupAddress,
        deliveryAddress,
        notes
      };

      await createOrder(orderData);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      (order.services[0]?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || order.status === status;
    const matchesDate = !date || format(new Date(order.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Add this function for admin actions
  // Update the AdminActions component
  const AdminActions = ({ order }) => (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="w-[120px] shrink-0">
        <Select
          defaultValue={order.status}
          onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
        >
          <SelectTrigger className="w-full border-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-[120px] hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9] transition-colors"
        onClick={() => router.push(`/dashboard/orders/${order.id}`)}
      >
        View Details
      </Button>
    </div>
  );

  // Update the UserActions component to match width
  const UserActions = ({ order }) => (
    <div className="flex justify-start">
      <Button
        variant="outline"
        size="sm"
        className="w-[160px] whitespace-nowrap"
        onClick={() => viewOrderDetails(order.id)}
      >
        View Details
      </Button>
    </div>
  );

  // Add this function to handle order cancellation
  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      toast.success('Order cancelled successfully');
      loadOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  // Add this function to handle viewing order details
  const viewOrderDetails = (orderId) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  // Mobile Order Card Component
  const OrderCard = ({ order }) => (
    <Card className="mb-4 !bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-medium">#{order.id.slice(-8)}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.createdAt), "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">${formatPrice(order.totalPrice)}</p>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="space-y-2 bg-white rounded-lg p-3 border border-blue-100/50">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Services</span>
            <span className="text-sm font-medium">{order.services[0]?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Weight</span>
            <span className="text-sm font-medium">{order.services[0]?.weight}qty</span>
          </div>
        </div>

        <div className="mt-4">
          {userRole === 'admin' ? (
            <AdminActions order={order} />
          ) : (
            <UserActions order={order} />
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Add pagination handlers
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1 // Reset to first page when changing limit
    }));
  };

  if (showLoader || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="space-y-6"
      >
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {userRole === 'admin' ? 'Orders Management' : 'My Orders'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {userRole === 'admin' ? 'Manage and track all customer orders' : 'View and manage your orders'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {userRole === 'user' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto justify-center">
                    <Plus className="mr-2 h-4 w-4" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to create a new order.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateOrder} className="space-y-4 pb-2">
                    <div className="space-y-2">
                      <Label htmlFor="serviceId">Service</Label>
                      <Select name="serviceId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service._id} value={service._id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (qty)</Label>
                      <Input
                        type="number"
                        id="weight"
                        name="weight"
                        min="0.1"
                        step="0.1"
                        required
                        placeholder="Enter weight in qty"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress">Pickup Address</Label>
                      <Input
                        type="text"
                        id="pickupAddress"
                        name="pickupAddress"
                        required
                        placeholder="Enter pickup address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Delivery Address</Label>
                      <Input
                        type="text"
                        id="deliveryAddress"
                        name="deliveryAddress"
                        required
                        placeholder="Enter delivery address"
                        className="placeholder:leading-[1.6] min-h-[40px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Add any special instructions or notes"
                        className="placeholder:leading-[1.6] min-h-[80px]"
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Order"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {(search || status !== "all" || date) && (
              <Button
                variant="outline"
                onClick={() => {
                  setDate(null);
                  setStatus("all");
                  setSearch("");
                }}
                className="w-full sm:w-auto justify-center border-dashed hover:border-solid transition-all duration-200"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="w-[160px] shrink-0">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[160px] shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "MMMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                    {date && (
                      <div className="p-3 border-t border-border">
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-xs"
                          onClick={() => setDate(null)}
                        >
                          <X className="mr-2 h-3 w-3" />
                          Clear date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">#{order.id.slice(-8)}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{order.services[0]?.name}</TableCell>
                    <TableCell>{order.services[0]?.weight}qty</TableCell>
                    <TableCell>${formatPrice(order.totalPrice)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {userRole === 'admin' ? (
                        <AdminActions order={order} />
                      ) : (
                        <UserActions order={order} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="grid gap-3 md:hidden">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Header Section */}
              <div className="p-4 bg-muted/10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono tracking-tight">
                        #{order.id.slice(-8)}
                      </span>
                      <div className="scale-90 origin-left">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                      {formatRelativeTime(new Date(order.createdAt))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      ${formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shirt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Service</span>
                      <p className="text-sm font-medium">{order.services[0]?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Weight</span>
                      <p className="text-sm font-medium">{order.services[0]?.weight}qty</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="px-4 py-3 bg-muted/10 border-t">
                <div className="flex gap-2">
                  {userRole === 'admin' ? (
                    <AdminActions
                      order={order}
                      className="w-full [&>button]:py-2.5 [&>button]:justify-center"
                    />
                  ) : (
                    <UserActions
                      order={order}
                      className="w-full [&>button]:py-2.5 [&>button]:justify-center"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {Math.min(pagination.limit, filteredOrders.length)} of {pagination.total} orders
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="hover:bg-muted/50 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1 hidden sm:inline-block" />
              Previous
            </Button>
            <div className="px-3 py-1 rounded-md bg-card border text-sm font-medium min-w-[90px] text-center">
              Page {pagination.page}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="hover:bg-muted/50 transition-all duration-200"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1 hidden sm:inline-block" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper function for order status styling
function getStatusStyle(status) {
  return ORDER_STATUSES[status.toLowerCase()]?.color || ORDER_STATUSES.pending.color;
}






