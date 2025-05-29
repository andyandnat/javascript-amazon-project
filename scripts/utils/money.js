export function formatCurrency(priceCents) {
  return (priceCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export default formatCurrency;