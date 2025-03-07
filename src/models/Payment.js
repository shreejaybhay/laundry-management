import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  method: {
    type: String,
    enum: ['COD', 'ONLINE'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  stripePaymentId: {
    type: String,
    sparse: true,
    index: true
  },
  stripeSessionId: {
    type: String,
    sparse: true
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure indexes are created
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1, status: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
