import { transformMongoObject } from '@/lib/utils';

export async function fetchServices() {
  const response = await fetch('/api/services');
  if (!response.ok) throw new Error('Failed to fetch services');
  const data = await response.json();
  // Ensure we return an array of services, even if wrapped in a data object
  if (data.services) {
    return transformMongoObject(data.services);
  }
  return transformMongoObject(data);
}

export async function createService(serviceData) {
  const response = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create service');
  }

  const data = await response.json();
  return data; // This should contain { service: { ... } }
}

export async function updateService(serviceId, serviceData) {
  // Ensure isActive is boolean before sending to API
  const updatedData = {
    ...serviceData,
    isActive: Boolean(serviceData.isActive)
  };

  const response = await fetch(`/api/services/${serviceId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update service');
  }

  const data = await response.json();
  return transformMongoObject(data);
}

export async function deleteService(serviceId) {
  const response = await fetch(`/api/services/${serviceId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete service');
  return response.json();
}

export async function fetchServiceById(serviceId) {
  const response = await fetch(`/api/services/${serviceId}`);
  if (!response.ok) throw new Error('Failed to fetch service');
  const data = await response.json();
  return transformMongoObject(data);
}
