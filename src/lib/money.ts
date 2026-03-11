/**
 * Money calculation utilities to handle precise decimal arithmetic
 * Avoids floating-point precision errors by working with integers (cents)
 */

// Convert currency amount to cents (integer) with proper rounding
function toCents(amount: number): number {
  return Math.round(amount * 100);
}

// Convert cents back to currency amount
function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

// Add two money amounts with precision
export function addMoney(a: number, b: number): number {
  return fromCents(toCents(a) + toCents(b));
}

// Subtract two money amounts with precision
export function subtractMoney(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b));
}

// Multiply money amount by a rate/percentage with precision
export function multiplyMoney(amount: number, multiplier: number): number {
  return fromCents(Math.round(toCents(amount) * multiplier));
}

// Calculate percentage of an amount with precision
export function calculatePercentage(amount: number, percentage: number): number {
  return multiplyMoney(amount, percentage / 100);
}

// Round money to 2 decimal places
export function roundMoney(amount: number): number {
  return fromCents(toCents(amount));
}

// Calculate line item total with precision
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return multiplyMoney(unitPrice, quantity);
}

// Calculate document totals with precision
export function calculateDocumentTotals(
  items: Array<{ quantity: number; unitPrice: number; amount: number }>,
  discountRate: number,
  taxRate: number
) {
  // Calculate subtotal by summing line totals
  let subtotalCents = 0;
  for (const item of items) {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    subtotalCents += toCents(lineTotal);
  }
  const subtotal = fromCents(subtotalCents);

  // Calculate discount
  const discountCents = Math.round(subtotalCents * (discountRate / 100));
  const discount = fromCents(discountCents);
  
  // Calculate discounted amount
  const discountedAmountCents = subtotalCents - discountCents;
  const discountedAmount = fromCents(discountedAmountCents);
  
  // Calculate tax on discounted amount
  const taxCents = Math.round(discountedAmountCents * (taxRate / 100));
  const tax = fromCents(taxCents);
  
  // Calculate final total
  const totalCents = discountedAmountCents + taxCents;
  const total = fromCents(totalCents);

  return {
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    discountedAmount: roundMoney(discountedAmount),
    tax: roundMoney(tax),
    total: roundMoney(total)
  };
}