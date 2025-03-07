import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Hash } from 'lucide-react';
import { format } from 'date-fns';

export function PaymentDetails({ payment }) {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Payment Details</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Status</span>
          <Badge className={getStatusColor(payment.status)}>
            {payment.status}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Amount</span>
          <span className="font-semibold">${payment.amount}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Payment Method</span>
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {payment.method === 'ONLINE' ? 'Card Payment' : 'Cash on Delivery'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Date</span>
          <span>{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</span>
        </div>

        {payment.method === 'ONLINE' && payment.stripeSessionId && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Transaction ID</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {payment.stripeSessionId}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
