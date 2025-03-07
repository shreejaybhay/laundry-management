import { transformMongoObject } from '@/lib/utils';

export async function createOrder(orderData) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  const data = await response.json();
  return transformMongoObject(data.order);
}

export async function fetchOrders(page = 1, limit = 10) {
  const response = await fetch(`/api/orders?page=${page}&limit=${limit}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch orders');
  }
  
  const data = await response.json();
  return {
    orders: data.orders.map(order => ({
      id: order.id,
      createdAt: order.createdAt,
      services: order.services || [],
      totalPrice: order.totalPrice,
      status: order.status,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      notes: order.notes,
      paymentStatus: order.paymentStatus
    })),
    pagination: data.pagination
  };
}

export async function fetchOrderById(orderId) {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch order');
  }
  
  const data = await response.json();
  return transformMongoObject(data.order);
}

export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order status');
  }

  const data = await response.json();
  return transformMongoObject(data.order);
}

export async function cancelOrder(orderId) {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to cancel order');
  const data = await response.json();
  return transformMongoObject(data);
}

