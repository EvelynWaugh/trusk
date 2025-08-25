import type { Room, Tariff, BookingPeriod } from '@/types';

/**
 * Get the minimum price from room tariffs
 */
export const getMinPrice = (room: Room): number => {
  const prices: number[] = [];

  if (room.tariff && Array.isArray(room.tariff)) {
    room.tariff.forEach((tariff: Tariff) => {
      if (tariff.booking_period && Array.isArray(tariff.booking_period)) {
        tariff.booking_period.forEach((period: BookingPeriod) => {
          if (period.price_for_adult) {
            Object.values(period.price_for_adult).forEach(price => {
              const numPrice = parseFloat(price);
              if (!isNaN(numPrice) && numPrice > 0) {
                prices.push(numPrice);
              }
            });
          }
        });
      }
    });
  }

  return prices.length > 0 ? Math.min(...prices) : 0;
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

/**
 * Format price with currency
 */
export const formatPrice = (
  price: number | string,
  currency = 'грн'
): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '-';
  return `${numPrice} ${currency}`;
};

/**
 * Check if date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove empty values from object
 */
export const removeEmptyValues = (
  obj: Record<string, any>
): Record<string, any> => {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleaned = removeEmptyValues(value);
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      } else if (Array.isArray(value) && value.length > 0) {
        result[key] = value;
      } else if (typeof value !== 'object') {
        result[key] = value;
      }
    }
  });

  return result;
};
