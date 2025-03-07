import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Order from '@/models/Order';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

// GET: Get single order
async function getOrder(req) {
  try {
    const id = req.url.split('/').pop();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiResponse({ error: 'Invalid order ID format' }, { status: 400 });
    }

    await connectDB();
    
    const order = await Order.findById(id)
      .populate('userId', 'name email phone address')
      .lean();
    
    if (!order) {
      return apiResponse({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is authorized to view this order
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return apiResponse({ error: 'Not authorized to view this order' }, { status: 403 });
    }

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
      pickupAddress: order.pickupAddress || 'N/A',
      deliveryAddress: order.deliveryAddress || 'N/A',
      notes: order.notes || '',
      specialInstructions: order.specialInstructions || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      userId: {
        name: order.userId?.name || 'N/A',
        email: order.userId?.email || 'N/A',
        phone: order.userId?.phone || 'N/A',
        address: order.userId?.address || 'N/A'
      }
    };

    return apiResponse({ order: cleanOrder });

  } catch (error) {
    console.error('Get order error:', error);
    return apiResponse({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const order = await Order.findById(id)
      .populate('userId', 'name email phone address')
      .lean();

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Transform the order data
    const transformedOrder = {
      order: {
        _id: order._id.toString(),
        id: order._id.toString(),
        // Ensure totalPrice is a valid number
        totalPrice: Number(order.totalPrice || 0).toFixed(2),
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        createdAt: order.createdAt || new Date().toISOString(),
        services: (order.services || []).map(service => ({
          ...service,
          price: Number(service.price || 0).toFixed(2),
          totalPrice: Number(service.totalPrice || 0).toFixed(2)
        })),
        // User details
        user: order.userId || {},
        userId: order.userId || {},
        // Additional order details
        pickupAddress: order.pickupAddress || '',
        deliveryAddress: order.deliveryAddress || '',
        notes: order.notes || '',
        weight: order.weight || 0
      }
    };

    return Response.json(transformedOrder);
  } catch (error) {
    console.error('Get order error:', error);
    return Response.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
