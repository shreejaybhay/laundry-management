import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, Wallet } from 'lucide-react';

export function PaymentDialog({ order, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          method: method
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      if (method === 'ONLINE' && data.stripeSession?.url) {
        window.location.href = data.stripeSession.url;
      } else {
        toast.success('Cash on delivery payment registered successfully');
        setIsOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Pay Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-4">
              Order Total: ${order.totalPrice}
            </div>
            <RadioGroup
              defaultValue={method}
              onValueChange={setMethod}
              className="space-y-4"
            >
              <div className="flex items-center space-x-4 border rounded-md p-4">
                <RadioGroupItem value="ONLINE" id="online" />
                <Label htmlFor="online" className="flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>Pay with Card</span>
                </Label>
              </div>
              <div className="flex items-center space-x-4 border rounded-md p-4">
                <RadioGroupItem value="COD" id="cod" />
                <Label htmlFor="cod" className="flex items-center space-x-2 cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  <span>Cash on Delivery</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button 
            className="w-full" 
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}