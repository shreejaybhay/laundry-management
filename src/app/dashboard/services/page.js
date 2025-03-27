"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, MoreVertical, Pencil, Trash2, Search, Package, RefreshCcw } from "lucide-react";
import { WashingMachineLoader } from "@/components/ui/washing-machine-loader";
import { updateService, createService } from "@/lib/api/services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { THEME_COLORS } from '@/constants/theme';
import { cn } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const formatPrice = (price) => {
  if (!price) return '0.00';
  if (typeof price === 'object' && price.$numberDecimal) {
    return parseFloat(price.$numberDecimal).toFixed(2);
  }
  return parseFloat(price).toFixed(2);
};

export default function ServicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Add new state for sorting and filtering
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Add minimum loading time
  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setShowLoader(false);
    }, 1500); // 0.6 seconds minimum loading time

    return () => clearTimeout(minLoadingTime);
  }, []);

  useEffect(() => {
    const fetchServicesData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/services`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const transformedServices = data.services.map(service => ({
          ...service,
          isActive: Boolean(service.isActive)
        }));

        setServices(transformedServices);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        toast.error("Failed to load services");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  // Show loader while loading or during minimum loading time
  if (isLoading || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  // Enhanced filtering logic
  const getFilteredServices = () => {
    return services
      .filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            service.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' ? true : 
                            filterStatus === 'active' ? service.isActive : !service.isActive;
        const matchesPrice = (!priceRange.min || service.pricePerKg >= parseFloat(priceRange.min)) &&
                           (!priceRange.max || service.pricePerKg <= parseFloat(priceRange.max));
        return matchesSearch && matchesStatus && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return parseFloat(a.pricePerKg) - parseFloat(b.pricePerKg);
          case 'time':
            return a.estimatedTime - b.estimatedTime;
          default:
            return a.name.localeCompare(b.name);
        }
      });
  };

  const handleCreateService = async (formData) => {
    setIsSubmitting(true);
    try {
      // Use the createService function from your API client
      const response = await createService(formData);

      // Update local state with the returned data
      setServices(prevServices => [...prevServices, response.service]);

      toast.success("Service created successfully");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.message || "Failed to create service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateService = async (serviceId, formData) => {
    setIsSubmitting(true);
    
    // Store the current services state before update
    const previousServices = services;
    
    // Optimistically update the UI
    setServices(prevServices =>
      prevServices.map(service =>
        service._id === serviceId
          ? { ...service, ...formData }
          : service
      )
    );

    try {
      if (!serviceId) throw new Error('Service ID is required');

      const updatedData = {
        ...formData,
        pricePerKg: parseFloat(formData.pricePerKg),
        estimatedTime: parseInt(formData.estimatedTime),
        isActive: formData.isActive
      };

      const response = await updateService(serviceId, updatedData);

      // Update with the server response
      setServices(prevServices =>
        prevServices.map(service =>
          service._id === serviceId
            ? { ...response.service, isActive: formData.isActive }
            : service
        )
      );

      toast.success("Service updated successfully");
      setEditingService(null);
    } catch (error) {
      // Revert to previous state if there's an error
      setServices(previousServices);
      console.error('Update error:', error);
      toast.error(error.message || "Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id) => {
    // Add confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this service? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`${BASE_URL}/api/services/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setServices(services.filter(service => service._id !== id));
      toast.success("Service deleted successfully");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || "Failed to delete service");
    }
  };

  const ServiceForm = ({ service, onSubmit, mode = "create", isSubmitting }) => {
    // Keep a reference to the initial state
    const [formData, setFormData] = useState({
      name: service?.name || "",
      description: service?.description || "",
      pricePerQty: service?.pricePerKg?.$numberDecimal || service?.pricePerKg || "",
      estimatedTime: service?.estimatedTime || "",
      isActive: service?.isActive ?? true,
    });
    const [error, setError] = useState(null);

    const validatePrice = (price) => {
      const priceRegex = /^\d+(\.\d{0,2})?$/;
      return priceRegex.test(price);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      try {
        // Validate required fields
        if (!formData.name.trim()) throw new Error("Service name is required");
        if (!formData.description.trim()) throw new Error("Description is required");
        if (!formData.pricePerQty || formData.pricePerQty <= 0) throw new Error("Price must be greater than 0");
        if (!formData.estimatedTime || formData.estimatedTime < 1) throw new Error("Estimated time must be at least 1 hour");
        if (!validatePrice(formData.pricePerQty)) throw new Error("Price must be a valid number with maximum 2 decimal places");

        // Send the exact formData without any transformations
        await onSubmit(formData);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter service name"
            maxLength={50}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter service description"
            maxLength={200}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerQty">Price per qty</Label>
          <Input
            id="pricePerQty"
            type="number"
            step="0.01"
            min="0"
            value={formData.pricePerQty}
            onChange={(e) => setFormData({ ...formData, pricePerQty: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
          <Input
            id="estimatedTime"
            type="number"
            min="1"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            placeholder="Enter estimated time in hours"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            disabled={isSubmitting}
          />
          <Label 
            htmlFor="isActive" 
            className={cn(
              formData.isActive ? "text-[#10b981]" : "",
              isSubmitting && "opacity-50"
            )}
          >
            {formData.isActive ? "Active" : "Inactive"}
          </Label>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>{mode === "create" ? "Creating..." : "Updating..."}</span>
              </div>
            ) : (
              mode === "create" ? "Create Service" : "Update Service"
            )}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Services Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your laundry service offerings
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service to your laundry offerings
              </DialogDescription>
            </DialogHeader>
            <ServiceForm 
              onSubmit={handleCreateService} 
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getFilteredServices().map((service) => (
          <Card 
            key={service._id || service.id} 
            className="relative group hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2">
                    {service.name}
                    <Badge 
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium",
                        service.isActive 
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      )}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 absolute top-3 right-3 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 bg-muted/40 hover:bg-muted/60 transition-all duration-200"
                    >
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-[200px]"
                    sideOffset={5}
                  >
                    <DropdownMenuItem 
                      onClick={() => setEditingService(service)}
                      className="cursor-pointer flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit Service</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteService(service._id || service.id)}
                      className="cursor-pointer flex items-center text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete Service</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price per qty</span>
                  <span className="font-medium text-primary">
                    ${formatPrice(service.pricePerKg)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Est. Time</span>
                  <span className="font-medium">
                    {service.estimatedTime} hours
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {getFilteredServices().length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No services found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Edit Service Dialog */}
      <Dialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Make changes to the service details
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              service={editingService}
              onSubmit={(formData) => handleUpdateService(editingService._id || editingService.id, formData)}
              mode="edit"
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

