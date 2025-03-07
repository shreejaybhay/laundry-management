import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
    maxLength: [50, 'Name cannot be more than 50 characters'],
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxLength: [200, 'Description cannot be more than 200 characters']
  },
  pricePerKg: {
    type: mongoose.Types.Decimal128,
    required: [true, 'Please provide a price per kg'],
    min: [0, 'Price cannot be negative']
  },  
  estimatedTime: {
    type: Number,
    required: [true, 'Please provide estimated time in hours'],
    min: [1, 'Estimated time must be at least 1 hour']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Add compound index for soft delete queries
serviceSchema.index({ isActive: 1, deletedAt: 1 });

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
