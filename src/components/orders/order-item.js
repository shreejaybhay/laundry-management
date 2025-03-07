import { PriceDisplay } from '@/components/ui/price-display';

export function OrderItem({ order }) {
  return (
    <div>
      <h3>Order #{order.id}</h3>
      <p>Total: <PriceDisplay amount={order.total} /></p>
    </div>
  );
}