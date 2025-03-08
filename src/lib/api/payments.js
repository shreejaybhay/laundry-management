export async function processPayment(paymentData) {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error('Failed to process payment');
  return response.json();
}

export async function fetchPaymentById(orderId) {
  const response = await fetch(`/api/payments/${orderId}`);
  if (!response.ok) throw new Error('Failed to fetch payment');
  return response.json();
}

export async function updatePaymentStatus(orderId, status) {
  const response = await fetch(`/api/payments/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update payment status');
  }
  
  return response.json();
}

export async function fetchPaymentHistory(page = 1, limit = 10) {
  const response = await fetch(`/api/payments?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch payments');
  return response.json();
}

export async function initiateStripePayment(orderId) {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      method: 'ONLINE'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate payment');
  }

  const data = await response.json();
  return {
    stripeSession: {
      id: data.stripeSession.id,
      url: data.stripeSession.url
    }
  };
}
