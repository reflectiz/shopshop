/**
 * Currency formatting, replacing the `$${x.toFixed(2)}` pattern scattered through the retail
 * pages. Money on the bank site needs thousands separators and signed amounts, which
 * toFixed alone does not give.
 */
export const formatCurrency = (amount: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

/** Credits are shown with an explicit +, debits keep the minus sign from the amount. */
export const formatSignedCurrency = (amount: number, currency = 'USD'): string =>
  `${amount > 0 ? '+' : ''}${formatCurrency(amount, currency)}`;

/** 2026-08-08 -> "8 Aug 2026" */
export const formatDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};
