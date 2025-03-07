import mongoose from 'mongoose';

const orderServiceSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  name: String,
  pricePerKg: mongoose.Types.Decimal128,
  weight: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: [0.1, 'Weight must be at least 0.1 kg']
  },
  subtotal: mongoose.Types.Decimal128
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  services: [orderServiceSchema],
  totalPrice: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'completed', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentId: {
    type: String,
    sparse: true
  },
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  },
  estimatedDeliveryDate: {
    type: Date,
    required: true
  },
  pickupAddress: {
    type: String,
    required: [true, 'Pickup address is required'],
    maxLength: [200, 'Pickup address cannot exceed 200 characters']
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required'],
    maxLength: [200, 'Delivery address cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Add compound index for user orders queries
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
