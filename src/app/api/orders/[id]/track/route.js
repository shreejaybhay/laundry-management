import { apiResponse } from '@/lib/apiResponse';
import Order from '@/models/Order';
import connectDB from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    await connectDB();
    
    // Get orders from the last 30 days for better performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const order = orders.find(order => 
      order._id.toString().endsWith(id)
    );
    
    if (!order) {
      return apiResponse({ error: 'Order not found' }, { status: 404 });
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
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes || '',
      specialInstructions: order.specialInstructions || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    return apiResponse({ order: cleanOrder });

  } catch (error) {
    console.error('Track order error:', error);
    return apiResponse({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
