import { adminAuth } from '@/middleware/adminAuth';
import Service from '@/models/Service';
import connectDB from '@/lib/db';
import { apiResponse } from '@/lib/apiResponse';
import mongoose from 'mongoose';

// GET single service
export async function GET(request, context) {
  try {
    const { id } = context.params;
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiResponse({ error: 'Invalid service ID format' }, { status: 400 });
    }

    const service = await Service.findById(id);
    
    if (!service) {
      return apiResponse({ error: 'Service not found' }, { status: 404 });
    }

    const cleanService = {
      id: service._id,
      name: service.name,
      description: service.description,
      pricePerKg: service.pricePerKg.toString(),
      estimatedTime: service.estimatedTime,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    };

    return apiResponse({ service: cleanService });
  } catch (error) {
    console.error('GET service error:', error);
    return apiResponse({ error: error.message }, { status: 500 });
  }
}

// PUT update service
async function handleUpdateService(request, context) {
  try {
    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiResponse({ error: 'Invalid service ID format' }, { status: 400 });
    }

    const data = await request.json();
    await connectDB();

    const existingService = await Service.findById(id);
    if (!existingService) {
      return apiResponse({ error: 'Service not found' }, { status: 404 });
    }

    if (data.name && data.name !== existingService.name) {
      const duplicateName = await Service.findOne({ 
        name: data.name,
        _id: { $ne: id }
      });
      if (duplicateName) {
        return apiResponse({ error: 'Service name already exists' }, { status: 400 });
      }
    }

    if (data.pricePerKg !== undefined) {
      data.pricePerKg = mongoose.Types.Decimal128.fromString(data.pricePerKg.toString());
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    const cleanService = {
      id: updatedService._id,
      name: updatedService.name,
      description: updatedService.description,
      pricePerKg: updatedService.pricePerKg.toString(),
      estimatedTime: updatedService.estimatedTime,
      isActive: updatedService.isActive,
      updatedAt: updatedService.updatedAt
    };

    return apiResponse({ 
      message: 'Service updated successfully',
      service: cleanService 
    });
  } catch (error) {
    console.error('Update service error:', error);
    if (error.name === 'ValidationError') {
      return apiResponse({ 
        error: 'Validation error',
        details: error.message 
      }, { status: 400 });
    }
    return apiResponse({ 
      error: 'Failed to update service',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE service
async function handleDeleteService(request, context) {
  try {
    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiResponse({ error: 'Invalid service ID format' }, { status: 400 });
    }

    await connectDB();
    
    const existingService = await Service.findById(id);
    if (!existingService) {
      return apiResponse({ error: 'Service not found' }, { status: 404 });
    }

    await Service.findByIdAndDelete(id);

    return apiResponse({ 
      message: 'Service permanently deleted',
      id: id
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return apiResponse({ 
      error: 'Failed to delete service',
      details: error.message 
    }, { status: 500 });
  }
}

export const PUT = adminAuth(handleUpdateService);
export const DELETE = adminAuth(handleDeleteService);
