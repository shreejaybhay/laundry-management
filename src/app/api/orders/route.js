import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Order from '@/models/Order';
import Service from '@/models/Service';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

// GET: Fetch orders with pagination
async function getOrders(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    if (req.user.role !== 'admin') {
      // Regular users can only see their own orders
      query.userId = req.user.id;
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform orders for response
    const transformedOrders = orders.map(order => ({
      id: order._id,
      services: order.services.map(s => ({
        id: s.serviceId,
        name: s.name,
        pricePerKg: s.pricePerKg.toString(),
        weight: s.weight.toString(),
        subtotal: s.subtotal.toString()
      })),
      totalPrice: order.totalPrice.toString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      createdAt: order.createdAt
    }));

    return apiResponse({
      orders: transformedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GET orders error:', error);
    return apiResponse({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST: Create new order
async function createOrder(req) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    // Validate request body
    if (!data.services || !Array.isArray(data.services) || data.services.length === 0) {
      return apiResponse({ error: 'Order must include at least one service' }, { status: 400 });
    }

    if (!data.pickupAddress || !data.deliveryAddress) {
      return apiResponse({ error: 'Pickup and delivery addresses are required' }, { status: 400 });
    }

    // Validate and process each service
    let totalPrice = new mongoose.Types.Decimal128('0');
    const processedServices = [];
    let maxProcessingTime = 0;

    for (const item of data.services) {
      if (!item.serviceId || !item.weight) {
        return apiResponse({ error: 'Each service must include serviceId and weight' }, { status: 400 });
      }

      // Validate serviceId
      if (!mongoose.Types.ObjectId.isValid(item.serviceId)) {
        return apiResponse({ error: 'Invalid service ID format' }, { status: 400 });
      }

      // Get service details
      const service = await Service.findById(item.serviceId);
      if (!service || !service.isActive) {
        return apiResponse({ error: `Service ${item.serviceId} not found or inactive` }, { status: 400 });
      }

      // Calculate subtotal
      const weight = new mongoose.Types.Decimal128(item.weight.toString());
      const subtotal = new mongoose.Types.Decimal128(
        (parseFloat(service.pricePerKg.toString()) * parseFloat(weight.toString())).toFixed(2)
      );

      processedServices.push({
        serviceId: service._id,
        name: service.name,
        pricePerKg: service.pricePerKg,
        weight,
        subtotal
      });

      totalPrice = new mongoose.Types.Decimal128(
        (parseFloat(totalPrice.toString()) + parseFloat(subtotal.toString())).toFixed(2)
      );

      // Track maximum processing time
      maxProcessingTime = Math.max(maxProcessingTime, service.estimatedTime);
    }

    // Calculate estimated delivery date based on processing time
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setHours(estimatedDeliveryDate.getHours() + maxProcessingTime);

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      services: processedServices,
      totalPrice,
      estimatedDeliveryDate,
      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes
    });

    // Clean up response
    const cleanOrder = {
      id: order._id,
      services: order.services.map(s => ({
        id: s.serviceId,
        name: s.name,
        pricePerKg: s.pricePerKg.toString(),
        weight: s.weight.toString(),
        subtotal: s.subtotal.toString()
      })),
      totalPrice: order.totalPrice.toString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      createdAt: order.createdAt
    };

    return apiResponse({ 
      message: 'Order created successfully',
      order: cleanOrder 
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return apiResponse({ error: 'Failed to create order' }, { status: 500 });
  }
}

export const GET = auth(getOrders);
export const POST = auth(createOrder);
