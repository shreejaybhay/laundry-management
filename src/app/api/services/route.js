import { apiResponse } from '@/lib/apiResponse';
import { adminAuth } from '@/middleware/adminAuth';
import Service from '@/models/Service';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

// GET all services
export async function GET() {
  try {
    await connectDB();
    
    const services = await Service.find({
      deletedAt: null // Only get non-deleted services
    });

    // Transform the services to handle Decimal128 and ensure proper boolean for isActive
    const transformedServices = services.map(service => ({
      _id: service._id,
      name: service.name,
      description: service.description,
      pricePerKg: service.pricePerKg.toString(), // Convert Decimal128 to string
      estimatedTime: service.estimatedTime,
      isActive: Boolean(service.isActive) // Ensure boolean
    }));

    return apiResponse({ services: transformedServices });
  } catch (error) {
    console.error('GET services error:', error);
    return apiResponse({ error: error.message }, { status: 500 });
  }
}

// POST new service (Admin only)
async function createService(req) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    // Ensure pricePerKg is present and valid
    if (!data.pricePerKg) {
      return apiResponse({ 
        error: 'Price per kg is required',
        details: { pricePerKg: 'Please provide a price per kg' }
      }, { status: 400 });
    }

    // Convert price to Decimal128
    data.pricePerKg = mongoose.Types.Decimal128.fromString(data.pricePerKg.toString());

    const newService = await Service.create(data);

    // Clean up the response
    const service = {
      _id: newService._id,
      name: newService.name,
      description: newService.description,
      pricePerKg: newService.pricePerKg.toString(),
      estimatedTime: newService.estimatedTime,
      isActive: Boolean(newService.isActive),
      createdAt: newService.createdAt
    };

    return apiResponse({ service }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return apiResponse({ 
      error: error.message || 'Failed to create service',
      details: error.errors
    }, { status: 400 });
  }
}

export const POST = adminAuth(createService);

