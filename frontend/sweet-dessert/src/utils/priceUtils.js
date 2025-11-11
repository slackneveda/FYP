// Utility functions for price formatting

/**
 * Format price for Pakistani Rupees - no decimal places for whole numbers
 * @param {number|string} price - The price to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // For Pakistani Rupees, we typically don't show decimals for whole numbers
  if (numPrice % 1 === 0) {
    return numPrice.toString();
  } else {
    return numPrice.toFixed(2);
  }
};

/**
 * Format price with currency symbol for display
 * @param {number|string} price - The price to format
 * @returns {string} - Formatted price with RS symbol
 */
export const formatPriceWithCurrency = (price) => {
  return `RS ${formatPrice(price)}`;
};

/**
 * Calculate total price for cart items
 * @param {Array} items - Array of cart items
 * @returns {number} - Total price
 */
export const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
};

/**
 * Calculate delivery fee based on total amount
 * @param {number} total - Total cart amount
 * @returns {number} - Delivery fee
 */
export const calculateDeliveryFee = (total) => {
  return total > 2500 ? 0 : 499;
};

/**
 * Calculate tax (8% GST)
 * @param {number} subtotal - Subtotal amount
 * @returns {number} - Tax amount
 */
export const calculateTax = (subtotal) => {
  return Math.round(subtotal * 0.08);
};