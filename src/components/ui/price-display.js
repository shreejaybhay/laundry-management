export function formatPrice(amount) {
  if (typeof amount !== 'number') {
    amount = Number(amount) || 0;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function PriceDisplay({ amount }) {
  return <span>{formatPrice(amount)}</span>;
}