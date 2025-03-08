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
    sparse: true,
    index: true // Added index for faster lookups
  },
  metadata: {
    type: Map,
    of: String,
    default: () => new Map()
  },
  lastProcessedAt: { // Added to track processing
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Ensure indexes are created
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ stripeSessionId: 1, status: 1 }); // Added compound index

// Add a method to safely update stripe payment status
paymentSchema.statics.updateStripePayment = async function(sessionId, paymentIntentId, status) {
  return this.findOneAndUpdate(
    { stripeSessionId: sessionId },
    {
      status: status,
      stripePaymentId: paymentIntentId,
      lastProcessedAt: new Date(),
      $set: {
        'metadata.stripeSessionId': sessionId,
        'metadata.paymentCompleted': new Date().toISOString()
      }
    },
    { new: true }
  );
};

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
