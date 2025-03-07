"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function HistoryPage() {
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Mock data - replace with actual API call
  const mockOrders = [
    {
      id: "ORD001",
      date: new Date(),
      services: "Wash & Fold",
      items: 5,
      total: 25.99,
      status: "completed"
    },
    // Add more mock orders as needed
  ];

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.services.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || order.status === status;
    const matchesDate = !date || format(order.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Mobile Order Card Component
  const OrderCard = ({ order }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-medium">{order.id}</p>
            <p className="text-sm text-muted-foreground">
              {format(order.date, "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">${order.total.toFixed(2)}</p>
            {getStatusBadge(order.status)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Services</span>
            <span className="text-sm">{order.services}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Items</span>
            <span className="text-sm">{order.items}</span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="w-full mt-4">
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
        
        {/* Filter reset button - only show if filters are active */}
        {(search || status !== "all" || date) && (
          <Button
            variant="ghost"
            onClick={() => {
              setDate(null);
              setStatus("all");
              setSearch("");
            }}
            className="self-start"
          >
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filters Section */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{format(order.date, "MMM d, yyyy")}</TableCell>
                  <TableCell>{order.services}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6 text-muted-foreground">
              No orders found
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
