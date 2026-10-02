const amountFormatter = new Intl.NumberFormat('fr-DZ', {
  maximumFractionDigits: 2,
});

export const CURRENCY_SYMBOL = 'د.ج';

export const formatCurrency = (amount: number): string =>
  `${amountFormatter.format(amount)} ${CURRENCY_SYMBOL}`;
