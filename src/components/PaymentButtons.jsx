'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export function PaymentButtons({ orderId, totalAmount, onPaymentComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (method) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`${BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          method
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to process ${method} payment`);
      }

      if (method === 'COD') {
        toast.success(data.message || 'Cash on Delivery payment registered successfully');
        if (onPaymentComplete) onPaymentComplete();
      } else if (method === 'ONLINE' && data.stripeSession?.url) {
        window.location.href = data.stripeSession.url;
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || `Failed to process payment`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={() => handlePayment('COD')}
        disabled={isProcessing}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Banknote className="w-4 h-4" />
        Cash on Delivery
      </Button>
      <Button
        onClick={() => handlePayment('ONLINE')}
        disabled={isProcessing}
        className="flex items-center gap-2"
      >
        <CreditCard className="w-4 h-4" />
        Pay Online
      </Button>
    </div>
  );
}
