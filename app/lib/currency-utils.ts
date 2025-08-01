// Currency utilities for multi-country support

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  THB: {
    code: "THB",
    symbol: "฿",
    name: "Thai Baht",
    decimals: 2
  },
  KRW: {
    code: "KRW", 
    symbol: "₩",
    name: "Korean Won",
    decimals: 0 // Korean Won doesn't use decimals
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar", 
    decimals: 2
  }
};

/**
 * Format price with proper currency symbol and decimals
 */
export function formatPrice(amount: number | string, currency: string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.THB;
  
  // Format with appropriate decimals
  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  });
  
  return `${config.symbol}${formatted}`;
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_CONFIG[currency]?.symbol || "฿";
}

/**
 * Get currency name by code
 */
export function getCurrencyName(currency: string): string {
  return CURRENCY_CONFIG[currency]?.name || "Thai Baht";
}

/**
 * Convert currency amount (placeholder for future exchange rate API)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // For now, return original amount
  // In the future, this would integrate with exchange rate API
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Placeholder conversion rates (would be fetched from API)
  const mockRates: Record<string, Record<string, number>> = {
    THB: { KRW: 38.5, USD: 0.029 },
    KRW: { THB: 0.026, USD: 0.00075 },
    USD: { THB: 34.5, KRW: 1330 }
  };
  
  const rate = mockRates[fromCurrency]?.[toCurrency] || 1;
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimals
}

/**
 * Parse price string to number (handles different currency formats)
 */
export function parsePrice(priceString: string): number {
  // Remove currency symbols and formatting
  const cleaned = priceString.replace(/[฿₩$,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Validate price for currency (check decimal places)
 */
export function validatePriceForCurrency(price: number, currency: string): boolean {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.THB;
  
  if (config.decimals === 0) {
    // Currency doesn't use decimals (like KRW)
    return price === Math.floor(price);
  }
  
  return true; // THB and USD allow decimals
}