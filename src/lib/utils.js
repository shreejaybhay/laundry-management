import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDecimal(value) {
  if (!value) return "0.00";
  
  // Handle Decimal128 from MongoDB
  if (value.$numberDecimal) {
    return Number(value.$numberDecimal).toFixed(2);
  }
  
  // Handle regular numbers
  return Number(value).toFixed(2);
}

export function formatPrice(price) {
  const num = Number(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

export function transformMongoObject(data) {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => transformMongoObject(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const transformed = { ...data };
    
    // Convert _id to string if it exists
    if (transformed._id) {
      transformed.id = transformed._id.toString();
    }

    // Remove MongoDB-specific fields
    delete transformed.__v;
    
    // Transform nested objects and arrays
    Object.keys(transformed).forEach(key => {
      if (typeof transformed[key] === 'object' && transformed[key] !== null) {
        transformed[key] = transformMongoObject(transformed[key]);
      }
    });

    return transformed;
  }

  return data;
}
