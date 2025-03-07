'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";

export function PaymentButtons({ orderId, totalAmount, onPaymentComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCODPayment = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          method: 'COD',
          amount: totalAmount
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Cash on Delivery payment registered successfully');
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to register COD payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          method: 'ONLINE',
          amount: totalAmount
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (data.stripeSession?.url) {
        window.location.href = data.stripeSession.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to initiate online payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={handleCODPayment}
        disabled={isProcessing}
        className="w-full h-auto py-4"
      >
        <div className="flex flex-col items-center gap-1">
          <Banknote className="h-5 w-5" />
          <span>Pay with Cash on Delivery</span>
        </div>
      </Button>
      <Button
        onClick={handleOnlinePayment}
        disabled={isProcessing}
        className="w-full h-auto py-4"
      >
        <div className="flex flex-col items-center gap-1">
          <CreditCard className="h-5 w-5" />
          <span>Pay Online</span>
        </div>
      </Button>
    </div>
  );
}
